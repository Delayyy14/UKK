import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, isValidPassword, isValidEmail } from '@/lib/auth';
import { logActivity } from '@/lib/activityLog';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    const { username, password, nama, email, role } = await request.json();

    // Validasi
    if (!username || !password || !nama || !email) {
      return NextResponse.json(
        { error: 'Username, password, nama, dan email wajib diisi' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password tidak aman: minimal 8 karakter, harus mengandung huruf, angka, dan karakter spesial (seperti !, @, #, $, %, dll).' },
        { status: 400 }
      );
    }

    // Hanya bisa register sebagai peminjam
    const userRole = role === 'peminjam' ? 'peminjam' : 'peminjam';

    // Check if username already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      const isEmail = existingUser.rows.some((u: any) => u.email === email);
      return NextResponse.json(
        { error: isEmail ? 'Email sudah digunakan' : 'Username sudah digunakan' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user (is_verified defaults to false)
    const result = await pool.query(
      'INSERT INTO users (username, password, nama, email, role, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, nama, email, role',
      [username, hashedPassword, nama, email, userRole, false]
    );

    const user = result.rows[0];

    // Generate and Send OTP
    const otp = await generateOTP(user.id, email);
    const emailSent = await sendOTPEmail(email, otp);

    // Log activity
    const ipAddress = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    await logActivity(
      user.id,
      'REGISTER',
      'users',
      user.id,
      { username, role: userRole, emailSent: emailSent.success },
      ipAddress
    );

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil. Silakan cek email Anda untuk kode verifikasi.',
      requireVerification: true,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Username atau Email sudah digunakan' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    );
  }
}
