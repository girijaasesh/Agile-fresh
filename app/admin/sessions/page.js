import SessionsClient from './SessionsClient';
import { verifyAdminAuth } from '../../../lib/adminAuth';

export default async function SessionsPage() {
  await verifyAdminAuth();

  // Fetch sessions from database
  let sessions = [];
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sessions`, {
      cache: 'no-store'
    });
    if (response.ok) {
      sessions = await response.json();
    } else {
      console.error('Failed to fetch sessions:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }

  return <SessionsClient sessions={sessions} />;
}