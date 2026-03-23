import SessionsClient from './SessionsClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';
const { pool } = require('../../../lib/db');

export default async function SessionsPage() {
  await verifyAdminAuth();

  let sessions = [];
  try {
    const result = await pool.query(`
      SELECT s.id, s.certification_id, c.title as course_title, c.code, s.session_date, s.format, s.max_seats, s.is_active, c.price, c.early_bird_price, s.timezone
      FROM sessions s
      JOIN certifications c ON s.certification_id = c.id
      ORDER BY s.session_date ASC
    `);
    sessions = result.rows;
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }

  return <SessionsClient sessions={sessions} />;
}