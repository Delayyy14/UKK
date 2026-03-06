import { jwtVerify } from 'jose';
import pool from './db';

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || 'gfsd879v8n7v9873m4987v3m784v98m7'
);

/**
 * Full verification including database-backed revocation check.
 * Use this in API routes (Node.js runtime).
 */
export async function verifyTokenFull(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);

        // Finding 16: Check if token is revoked in DB
        if (payload.jti) {
            const result = await pool.query('SELECT id FROM revoked_tokens WHERE jti = $1', [payload.jti]);
            if (result.rows.length > 0) {
                return null; // Token is revoked
            }
        }

        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Revoke a token by adding its JTI to the database.
 */
export async function revokeToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        if (payload.jti) {
            await pool.query(
                'INSERT INTO revoked_tokens (jti, expires_at) VALUES ($1, to_timestamp($2)) ON CONFLICT DO NOTHING',
                [payload.jti, payload.exp]
            );
            return true;
        }
    } catch (error) {
        console.error('Error revoking token:', error);
    }
    return false;
}
