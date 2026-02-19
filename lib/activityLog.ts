import pool from './db';

export async function logActivity(
  userId: number | null,
  action: string,
  tableName: string | null = null,
  recordId: number | null = null,
  details: any = null,
  ipAddress: string | null = null
) {
  try {
    await pool.query(
      `INSERT INTO activity_log (user_id, action, table_name, record_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, tableName, recordId, details ? JSON.stringify(details) : null, ipAddress]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}