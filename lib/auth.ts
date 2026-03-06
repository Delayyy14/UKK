import bcrypt from 'bcryptjs';
import pool from './db';
import { NextResponse } from 'next/server';

export interface User {
  id: number;
  username: string;
  nama: string;
  email: string;
  foto?: string;
  role: 'admin' | 'petugas' | 'peminjam';
  is_verified: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, nama, email, foto, role, is_verified FROM users WHERE username = $1',
    [username]
  );
  return result.rows[0] || null;
}

export function isValidPassword(password: string): boolean {
  // at least 8 characters, one letter, one number, and one special character
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function verifyUser(username: string, password: string): Promise<User | null> {
  const result = await pool.query(
    'SELECT id, username, password, nama, email, foto, role, is_verified FROM users WHERE username = $1',
    [username]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    nama: user.nama,
    email: user.email,
    foto: user.foto,
    role: user.role,
    is_verified: !!user.is_verified,
  };
}
