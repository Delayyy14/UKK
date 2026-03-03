import pool from './db';
import crypto from 'crypto';

export async function generateOTP(userId: number, email: string) {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set expiry to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Use UPSERT logic for OTP
    // Check if OTP record already exists for this email
    const existingOTP = await pool.query(
        'SELECT id FROM otps WHERE email = $1',
        [email]
    );

    if (existingOTP.rows.length > 0) {
        // Update existing
        await pool.query(
            'UPDATE otps SET code = $1, expires_at = $2, attempts = 0, last_sent_at = CURRENT_TIMESTAMP WHERE email = $3',
            [otp, expiresAt, email]
        );
    } else {
        // Insert new
        await pool.query(
            'INSERT INTO otps (user_id, email, code, expires_at) VALUES ($1, $2, $3, $4)',
            [userId, email, otp, expiresAt]
        );
    }

    return otp;
}

export async function verifyOTP(email: string, code: string) {
    try {
        const result = await pool.query(
            'SELECT * FROM otps WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return { success: false, message: 'Kode OTP tidak ditemukan atau sudah kadaluwarsa' };
        }

        const otpRecord = result.rows[0];

        // Check if expired
        if (new Date() > new Date(otpRecord.expires_at)) {
            return { success: false, message: 'Kode OTP sudah kadaluwarsa' };
        }

        // Check code
        if (otpRecord.code !== code) {
            // Increment attempts
            await pool.query(
                'UPDATE otps SET attempts = attempts + 1 WHERE id = $1',
                [otpRecord.id]
            );
            return { success: false, message: 'Kode OTP salah' };
        }

        // Success - mark user as verified and delete OTP
        await pool.query(
            'UPDATE users SET is_verified = TRUE WHERE id = $1',
            [otpRecord.user_id]
        );

        // Delete OTP after successful verification
        await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);

        return { success: true, message: 'Verifikasi berhasil', userId: otpRecord.user_id };
    } catch (error) {
        console.error('Verify OTP error:', error);
        return { success: false, message: 'Terjadi kesalahan saat verifikasi' };
    }
}
