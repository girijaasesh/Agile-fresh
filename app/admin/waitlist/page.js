import { pool } from '../../../lib/db';
import WaitlistClient from './WaitlistClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';

export default async function WaitlistPage() {
  await verifyAdminAuth();

  const result = await pool.query(`SELECT * FROM waitlist ORDER BY created_at DESC`);
  return <WaitlistClient waitlist={result.rows} />;
}