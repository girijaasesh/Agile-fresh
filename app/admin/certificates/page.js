import { pool } from '../../../lib/db';
import CertificatesClient from './CertificatesClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';

export default async function CertificatesPage() {
  await verifyAdminAuth();

  const result = await pool.query(`SELECT * FROM certificates ORDER BY issued_at DESC`);
  return <CertificatesClient certificates={result.rows} />;
}