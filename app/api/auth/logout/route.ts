import { NextRequest, NextResponse } from 'next/server';
import { removeAuthCookie, revokeToken } from '@/lib/token';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
        await revokeToken(token);
    }
    removeAuthCookie();
    return NextResponse.json({ success: true });
}
