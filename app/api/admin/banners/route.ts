import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/activityLog';

// Fetch all banners
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT * FROM banners 
      ORDER BY order_index ASC, created_at DESC
    `);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data banner' },
      { status: 500 }
    );
  }
}

// Create new banner(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');
    
    // Handle bulk insertion
    if (Array.isArray(body)) {
      const results = [];
      for (const item of body) {
        if (!item.title || !item.background_url) continue;
        
        const res = await pool.query(
          `INSERT INTO banners (title, paragraph, background_url, order_index, is_active) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING *`,
          [item.title, item.paragraph || null, item.background_url, item.order_index || 0, item.is_active ?? true]
        );
        results.push(res.rows[0]);
      }
      
      await logActivity(
        userId ? parseInt(userId) : null,
        'CREATE_BULK',
        'banners',
        null,
        { count: results.length }
      );
      
      return NextResponse.json(results, { status: 201 });
    }

    // Handle single insertion
    const { title, paragraph, background_url, order_index, is_active } = body;

    if (!title || !background_url) {
      return NextResponse.json({ error: 'Judul dan URL gambar wajib diisi' }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO banners (title, paragraph, background_url, order_index, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, paragraph || null, background_url, order_index || 0, is_active ?? true]
    );

    const banner = result.rows[0];

    await logActivity(
      userId ? parseInt(userId) : null,
      'CREATE',
      'banners',
      null, 
      { title, order_index }
    );

    return NextResponse.json(banner, { status: 201 });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { error: `Gagal menambahkan banner: ${error.message}` },
      { status: 500 }
    );
  }
}

