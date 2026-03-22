import { pool } from '../../../lib/db';
import RegistrationsClient from './RegistrationsClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';

export default async function RegistrationsPage() {
  await verifyAdminAuth();

  const result = await pool.query(`
    SELECT r.*, s.session_date, c.title as course_title
    FROM registrations r
    LEFT JOIN sessions s ON r.session_id = s.id
    LEFT JOIN certifications c ON s.certification_id = c.id
    ORDER BY r.created_at DESC
  `);

  return <RegistrationsClient registrations={result.rows} />;
}