import { pool } from '../../../lib/db';
import CouponsClient from './CouponsClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';

export default async function CouponsPage() {
  await verifyAdminAuth();

  const result = await pool.query(`SELECT * FROM coupons ORDER BY created_at DESC`);
  return <CouponsClient coupons={result.rows} />;
}