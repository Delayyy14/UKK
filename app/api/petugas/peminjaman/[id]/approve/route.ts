import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { approved, approved_by } = await request.json();

    const status = approved ? 'disetujui' : 'ditolak';

    const result = await pool.query(
      `UPDATE peminjaman 
       SET status = $1, approved_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 
       RETURNING *`,
      [status, approved_by, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Peminjaman not found' },
        { status: 404 }
      );
    }

    const peminjaman = result.rows[0];

    // If approved, update alat availability
    if (approved) {
      await pool.query(
        `UPDATE alat 
         SET jumlah_tersedia = jumlah_tersedia - $1
         WHERE id = $2`,
        [peminjaman.jumlah, peminjaman.alat_id]
      );
    }

    await logActivity(
      approved_by,
      'APPROVE',
      'peminjaman',
      id,
      { status, approved_by }
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error approving peminjaman:', error);
    return NextResponse.json(
      { error: 'Error approving peminjaman' },
      { status: 500 }
    );
  }
}