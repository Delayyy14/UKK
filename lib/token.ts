import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'gfsd879v8n7v9873m4987v3m784v98m7'
);

/**
 * Signature-only verification for Edge Runtime compatibility (Middleware)
 */
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload; // Returns payload if signature is valid, does NOT check revocation
    } catch (error) {
        return null;
    }
}

export async function createToken(payload: any) {
    const jti = globalThis.crypto.randomUUID();
    return await new SignJWT({ ...payload, jti })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(SECRET_KEY);
}

export async function setAuthCookie(user: any) {
    const token = await createToken({
        id: user.id,
        role: user.role,
        username: user.username
    });

    cookies().set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
    });
}

export function removeAuthCookie() {
    cookies().delete('auth_token');
}
