import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otp';
import { logActivity } from '@/lib/activityLog';

export async function POST(request: NextRequest) {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email dan kode OTP wajib diisi' },
                { status: 400 }
            );
        }

        const result = await verifyOTP(email, code);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 400 }
            );
        }

        // Log activity for verification
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        if (result.userId) {
            await logActivity(
                result.userId,
                'VERIFY_OTP',
                'users',
                result.userId,
                { email, status: 'success' },
                ipAddress
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email berhasil diverifikasi. Silakan login.',
        });
    } catch (error) {
        console.error('Verify OTP API error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan saat verifikasi' },
            { status: 500 }
        );
    }
}
