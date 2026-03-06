import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { sendForgotPasswordEmail } from '@/lib/mail';
import { isValidEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Email tidak valid' },
                { status: 400 }
            );
        }

        // Check if user exists with this email
        const result = await pool.query(
            'SELECT id, nama FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // For security, still return success to prevent email enumeration
            // but don't send any email.
            return NextResponse.json({
                success: true,
                message: 'Jika email terdaftar, kode OTP telah dikirim.',
            });
        }

        const user = result.rows[0];

        // Generate and Send Forgot Password OTP
        const otp = await generateOTP(user.id, email);
        const emailRes = await sendForgotPasswordEmail(email, otp);

        if (!emailRes.success) {
            return NextResponse.json(
                { error: 'Gagal mengirim email reset password.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Kode OTP telah dikirim ke email Anda.',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan internal.' },
            { status: 500 }
        );
    }
}
