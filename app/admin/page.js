import AdminClient from './AdminClient';
import { verifyAdminAuth } from '../../lib/adminAuth';

export default async function AdminPage() {
  await verifyAdminAuth();
  return <AdminClient />;
}