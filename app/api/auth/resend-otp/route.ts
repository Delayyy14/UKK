import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mail';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email wajib diisi' },
                { status: 400 }
            );
        }

        // Check if user exists and is not verified
        const userResult = await pool.query(
            'SELECT id, is_verified FROM users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json(
                { error: 'Email tidak terdaftar' },
                { status: 404 }
            );
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return NextResponse.json(
                { error: 'Email sudah terverifikasi' },
                { status: 400 }
            );
        }

        // Check rate limiting for resend (optional but good)
        const otpResult = await pool.query(
            'SELECT last_sent_at FROM otps WHERE email = $1',
            [email]
        );

        if (otpResult.rows.length > 0) {
            const lastSentAt = new Date(otpResult.rows[0].last_sent_at);
            const now = new Date();
            const diffSeconds = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);

            if (diffSeconds < 60) {
                return NextResponse.json(
                    { error: `Harap tunggu ${60 - diffSeconds} detik sebelum mengirim ulang` },
                    { status: 429 }
                );
            }
        }

        // Generate and Send new OTP
        const otp = await generateOTP(user.id, email);
        const emailSent = await sendOTPEmail(email, otp);

        if (!emailSent.success) {
            return NextResponse.json(
                { error: 'Gagal mengirim email verifikasi' },
                { status: 500 }
            );
        }

        // Log activity
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        await logActivity(
            user.id,
            'RESEND_OTP',
            'users',
            user.id,
            { email },
            ipAddress
        );

        return NextResponse.json({
            success: true,
            message: 'Kode OTP baru telah dikirim ke email Anda',
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat mengirim ulang kode OTP' },
            { status: 500 }
        );
    }
}
