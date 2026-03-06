import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/token';

// Rate Limiting (In-memory)
const rateLimitMap = new Map<string, { count: number, lastRequest: number }>();
const RATE_LIMIT_THRESHOLD = 60; // Max 60 request per menit
const RATE_LIMIT_WINDOW = 60 * 1000;

export async function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const now = Date.now();

    // --- 1. RATE LIMITING ---
    const userRateData = rateLimitMap.get(ip);
    if (userRateData) {
        if (now - userRateData.lastRequest < RATE_LIMIT_WINDOW) {
            if (userRateData.count >= RATE_LIMIT_THRESHOLD) {
                return new NextResponse('Too many requests. Please try again in a minute.', { status: 429 });
            }
            userRateData.count += 1;
        } else {
            userRateData.count = 1;
            userRateData.lastRequest = now;
        }
    } else {
        rateLimitMap.set(ip, { count: 1, lastRequest: now });
    }

    // --- 2. AUTH & RBAC (Role Based Access Control) ---
    const path = request.nextUrl.pathname;
    const token = request.cookies.get('auth_token')?.value;

    // Verifikasi JWT token secara aman di sisi server
    const payload: any = token ? await verifyToken(token) : null;

    // Proteksi Halaman Dashboard Admin
    if (path.startsWith('/admin')) {
        if (!payload || payload.role !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Proteksi Halaman Petugas
    if (path.startsWith('/petugas')) {
        if (!payload || (payload.role !== 'petugas' && payload.role !== 'admin')) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // --- API PROTECTION ---

    // Proteksi API Admin
    if (path.startsWith('/api/admin')) {
        if (!payload || payload.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 401 });
        }
    }

    // Proteksi API Petugas
    if (path.startsWith('/api/petugas')) {
        if (!payload || (payload.role !== 'petugas' && payload.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized: Petugas role required' }, { status: 401 });
        }
    }

    // Proteksi API Peminjam, Profile, & Dashboard
    if (path.startsWith('/api/peminjam') || path.startsWith('/api/profile') || path.startsWith('/api/dashboard')) {
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized: Login required' }, { status: 401 });
        }
    }

    // Proteksi API Messages (Restricted to Admin/Petugas)
    if (path.startsWith('/api/messages')) {
        if (!payload || (payload.role !== 'admin' && payload.role !== 'petugas')) {
            return NextResponse.json({ error: 'Unauthorized: Access denied' }, { status: 403 });
        }
    }

    // Proteksi API Setup (Disable in production/public)
    if (path.startsWith('/api/setup')) {
        return NextResponse.json({ error: 'Forbidden: Setup endpoints are disabled' }, { status: 403 });
    }

    // Safe injection of user info for route handlers
    const requestHeaders = new Headers(request.headers);
    if (payload) {
        requestHeaders.set('x-user-id', payload.id.toString());
        requestHeaders.set('x-user-role', payload.role);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

}

export const config = {
    matcher: [
        '/api/:path*',
        '/admin/:path*',
        '/petugas/:path*',
        '/peminjam/:path*',
    ],
};
