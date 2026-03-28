import { pool } from '../../../lib/db';
import { verifyAdminAuth } from '../../../lib/adminAuth';
import MaterialsClient from './MaterialsClient';

export default async function MaterialsPage() {
  await verifyAdminAuth();

  const [materials, certs, permissions] = await Promise.all([
    pool.query(`SELECT m.*, c.title as cert_title, c.code as cert_code
                FROM course_materials m
                JOIN certifications c ON m.certification_id = c.id
                ORDER BY c.code, m.created_at DESC`),
    pool.query(`SELECT id, title, code FROM certifications ORDER BY code`),
    pool.query(`SELECT p.*, c.title as cert_title, c.code as cert_code
                FROM material_permissions p
                JOIN certifications c ON p.certification_id = c.id
                ORDER BY p.created_at DESC`),
  ]);

  return (
    <MaterialsClient
      materials={materials.rows}
      certifications={certs.rows}
      permissions={permissions.rows}
    />
  );
}
