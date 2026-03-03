import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('authorization')?.replace('Bearer ', '');

    // Get user role
    let userRole = 'peminjam';
    if (userId) {
      const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length > 0) {
        userRole = userResult.rows[0].role;
      }
    }

    if (userRole === 'admin') {
      // Admin stats
      const [
        usersResult,
        alatResult,
        peminjamanResult,
        pendingResult,
        kategoriResult,
        pengembalianResult,
        alatTersediaResult,
        alatRusakResult,
        recentPeminjamanResult,
        recentActivityResult,
        monthlyPeminjamanResult,
        peminjamanByStatusResult,
        topOrderedAlatResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM users'),
        pool.query('SELECT COUNT(*) FROM alat'),
        pool.query('SELECT COUNT(*) FROM peminjaman'),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'pending'"),
        pool.query('SELECT COUNT(*) FROM kategori'),
        pool.query('SELECT COUNT(*) FROM pengembalian'),
        pool.query("SELECT COUNT(*) FROM alat WHERE status = 'tersedia' AND jumlah_tersedia > 0"),
        pool.query("SELECT COUNT(*) FROM alat WHERE status = 'rusak'"),
        pool.query(`
          SELECT p.*, u.nama as user_nama, a.nama as alat_nama 
          FROM peminjaman p
          JOIN users u ON p.user_id = u.id
          JOIN alat a ON p.alat_id = a.id
          ORDER BY p.created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT al.*, u.nama as user_nama
          FROM activity_log al
          LEFT JOIN users u ON al.user_id = u.id
          ORDER BY al.created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT TO_CHAR(created_at, 'Month') as month, COUNT(*) as count 
          FROM peminjaman 
          WHERE created_at >= NOW() - INTERVAL '6 months' 
          GROUP BY TO_CHAR(created_at, 'Month'), EXTRACT(MONTH FROM created_at) 
          ORDER BY EXTRACT(MONTH FROM created_at)
        `),
        pool.query(`
           SELECT status, COUNT(*) as count FROM peminjaman GROUP BY status
        `),
        pool.query(`
          SELECT a.id, a.nama, a.foto, SUM(p.jumlah) as total_ordered
          FROM peminjaman p
          JOIN alat a ON p.alat_id = a.id
          GROUP BY a.id, a.nama, a.foto
          ORDER BY total_ordered DESC
          LIMIT 5
        `)
      ]);

      return NextResponse.json({
        role: 'admin',
        stats: {
          totalUsers: parseInt(usersResult.rows[0].count),
          totalAlat: parseInt(alatResult.rows[0].count),
          totalPeminjaman: parseInt(peminjamanResult.rows[0].count),
          pendingPeminjaman: parseInt(pendingResult.rows[0].count),
          totalKategori: parseInt(kategoriResult.rows[0].count),
          totalPengembalian: parseInt(pengembalianResult.rows[0].count),
          alatTersedia: parseInt(alatTersediaResult.rows[0].count),
          alatRusak: parseInt(alatRusakResult.rows[0].count),
        },
        recentPeminjaman: recentPeminjamanResult.rows,
        recentActivity: recentActivityResult.rows,
        topOrderedAlat: topOrderedAlatResult.rows,
        charts: {
          monthlyPeminjaman: monthlyPeminjamanResult.rows.map(row => ({ name: row.month.trim(), total: parseInt(row.count) })),
          peminjamanByStatus: peminjamanByStatusResult.rows.map(row => ({ name: row.status, value: parseInt(row.count) }))
        }
      });
    } else if (userRole === 'petugas') {
      // Petugas stats
      const [
        pendingResult,
        aktifResult,
        disetujuiResult,
        ditolakResult,
        pengembalianResult,
        recentPeminjamanResult,
        recentPengembalianResult,
        monthlyPeminjamanResult
      ] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'pending'"),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE status IN ('disetujui', 'sedang_dipinjam')"),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'disetujui'"),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE status = 'ditolak'"),
        pool.query('SELECT COUNT(*) FROM pengembalian'),
        pool.query(`
          SELECT p.*, u.nama as user_nama, a.nama as alat_nama 
          FROM peminjaman p
          JOIN users u ON p.user_id = u.id
          JOIN alat a ON p.alat_id = a.id
          WHERE p.status = 'pending'
          ORDER BY p.created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT pg.*, p.jumlah, u.nama as user_nama, a.nama as alat_nama
          FROM pengembalian pg
          JOIN peminjaman p ON pg.peminjaman_id = p.id
          JOIN users u ON p.user_id = u.id
          JOIN alat a ON p.alat_id = a.id
          ORDER BY pg.created_at DESC
          LIMIT 5
        `),
        pool.query(`
          SELECT TO_CHAR(created_at, 'Month') as month, COUNT(*) as count 
          FROM peminjaman 
          WHERE created_at >= NOW() - INTERVAL '6 months' 
          GROUP BY TO_CHAR(created_at, 'Month'), EXTRACT(MONTH FROM created_at) 
          ORDER BY EXTRACT(MONTH FROM created_at)
        `)
      ]);

      return NextResponse.json({
        role: 'petugas',
        stats: {
          pendingPeminjaman: parseInt(pendingResult.rows[0].count),
          peminjamanAktif: parseInt(aktifResult.rows[0].count),
          disetujui: parseInt(disetujuiResult.rows[0].count),
          ditolak: parseInt(ditolakResult.rows[0].count),
          totalPengembalian: parseInt(pengembalianResult.rows[0].count),
        },
        recentPeminjaman: recentPeminjamanResult.rows,
        recentPengembalian: recentPengembalianResult.rows,
        charts: {
          monthlyPeminjaman: monthlyPeminjamanResult.rows.map(row => ({ name: row.month.trim(), total: parseInt(row.count) }))
        }
      });
    } else {
      // Peminjam stats
      const userIdNum = userId ? parseInt(userId) : null;
      const [
        myPeminjamanResult,
        pendingResult,
        aktifResult,
        selesaiResult,
        alatTersediaResult,
        recentPeminjamanResult,
        myStatusDistributionResult
      ] = await Promise.all([
        pool.query('SELECT COUNT(*) FROM peminjaman WHERE user_id = $1', [userIdNum]),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE user_id = $1 AND status = 'pending'", [userIdNum]),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE user_id = $1 AND status IN ('disetujui', 'sedang_dipinjam')", [userIdNum]),
        pool.query("SELECT COUNT(*) FROM peminjaman WHERE user_id = $1 AND status = 'selesai'", [userIdNum]),
        pool.query("SELECT COUNT(*) FROM alat WHERE status = 'tersedia' AND jumlah_tersedia > 0"),
        pool.query(`
          SELECT p.*, a.nama as alat_nama, a.foto
          FROM peminjaman p
          JOIN alat a ON p.alat_id = a.id
          WHERE p.user_id = $1
          ORDER BY p.created_at DESC
          LIMIT 5
        `, [userIdNum]),
        pool.query(`
            SELECT status, COUNT(*) as count FROM peminjaman WHERE user_id = $1 GROUP BY status
         `, [userIdNum])
      ]);

      return NextResponse.json({
        role: 'peminjam',
        stats: {
          totalPeminjaman: parseInt(myPeminjamanResult.rows[0].count),
          pendingPeminjaman: parseInt(pendingResult.rows[0].count),
          peminjamanAktif: parseInt(aktifResult.rows[0].count),
          selesai: parseInt(selesaiResult.rows[0].count),
          alatTersedia: parseInt(alatTersediaResult.rows[0].count),
        },
        recentPeminjaman: recentPeminjamanResult.rows,
        charts: {
          peminjamanByStatus: myStatusDistributionResult.rows.map(row => ({ name: row.status, value: parseInt(row.count) }))
        }
      });
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error fetching statistics' },
      { status: 500 }
    );
  }
}