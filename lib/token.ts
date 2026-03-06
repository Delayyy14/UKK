import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import pool from './db';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'gfsd879v8n7v9873m4987v3m784v98m7'
);

export async function createToken(payload: any) {
    const jti = globalThis.crypto.randomUUID();
    return await new SignJWT({ ...payload, jti })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(SECRET_KEY);
}

export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);

        // Fix Finding 16: Check if token is revoked
        if (payload.jti) {
            const result = await pool.query('SELECT id FROM revoked_tokens WHERE jti = $1', [payload.jti]);
            if (result.rows.length > 0) return null;
        }

        return payload;
    } catch (error) {
        return null;
    }
}

export async function revokeToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload.jti) {
            await pool.query(
                'INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
                [payload.jti, payload.exp]
            );
        }
    } catch (error) {
        console.error('Error revoking token:', error);
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
