import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie } from '@/lib/token';
import { revokeToken } from '@/lib/token-server';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
        await revokeToken(token);
    }
    removeAuthCookie();
    return NextResponse.json({ success: true });
}
