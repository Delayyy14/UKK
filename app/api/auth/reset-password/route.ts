import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
    try {
        const { email, code, newPassword } = await request.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: 'Email, kode OTP, dan password baru wajib diisi' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password minimal 6 karakter' },
                { status: 400 }
            );
        }

        // 1. Verify OTP for the email
        const otpResult = await pool.query(
            'SELECT id, user_id, expires_at, code FROM otps WHERE email = $1',
            [email]
        );

        if (otpResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Kode OTP tidak ditemukan atau sudah kadaluwarsa' },
                { status: 400 }
            );
        }

        const otpRecord = otpResult.rows[0];
        const MAX_ATTEMPTS = 5;

        // Check if expired
        if (new Date() > new Date(otpRecord.expires_at)) {
            await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);
            return NextResponse.json(
                { error: 'Kode OTP sudah kadaluwarsa' },
                { status: 400 }
            );
        }

        // Check attempts
        if (otpRecord.attempts >= MAX_ATTEMPTS) {
            await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);
            return NextResponse.json(
                { error: 'Terlalu banyak percobaan. Kode OTP telah dinonaktifkan.' },
                { status: 400 }
            );
        }

        // Check code
        if (otpRecord.code !== code) {
            const newAttempts = (otpRecord.attempts || 0) + 1;
            await pool.query(
                'UPDATE otps SET attempts = $1 WHERE id = $2',
                [newAttempts, otpRecord.id]
            );

            const remaining = MAX_ATTEMPTS - newAttempts;
            if (remaining <= 0) {
                await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);
                return NextResponse.json(
                    { error: 'Terlalu banyak percobaan. Kode OTP telah dinonaktifkan.' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: `Kode OTP salah. Sisa percobaan: ${remaining}` },
                { status: 400 }
            );
        }

        // 2. Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // 3. Update User's password
        await pool.query(
            'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, otpRecord.user_id]
        );

        // Log the activity
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        await logActivity(
            otpRecord.user_id,
            'RESET_PASSWORD',
            'users',
            otpRecord.user_id,
            { email },
            ipAddress
        );

        // 4. Delete OTP after successful verification
        await pool.query('DELETE FROM otps WHERE id = $1', [otpRecord.id]);

        return NextResponse.json({
            success: true,
            message: 'Password Anda telah berhasil direset. Silakan login kembali.',
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mereset password.' },
            { status: 500 }
        );
    }
}
