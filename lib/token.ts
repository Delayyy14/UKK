import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'gfsd879v8n7v9873m4987v3m784v98m7'
);

export async function createToken(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch (error) {
        return null;
    }
}

export async function setAuthCookie(user: any) {
    const token = await createToken({
        id: user.id,
        role: user.role,
        username: user.username
    });

    cookies().set('auth_token', token, {
        httpOnly: true, // Tidak bisa diakses JavaScript (Mencegah XSS)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2, // 2 jam
        path: '/',
    });
}

export function removeAuthCookie() {
    cookies().delete('auth_token');
}
