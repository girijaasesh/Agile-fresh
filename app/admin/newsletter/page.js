export const dynamic = 'force-dynamic';

import { verifyAdminAuth } from '../../../lib/adminAuth';
import { pool } from '../../../lib/db';
import NewsletterClient from './NewsletterClient';

async function getNewsletterData() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_sends (
      id SERIAL PRIMARY KEY, article_id INTEGER NOT NULL,
      sent_at TIMESTAMPTZ DEFAULT NOW(), recipient_count INTEGER DEFAULT 0
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_unsubscribes (
      id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE,
      unsubscribed_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  const [sends, pending, subCount, unsubCount] = await Promise.all([
    pool.query(`
      SELECT ns.id, ns.sent_at, ns.recipient_count, a.title, a.slug
      FROM newsletter_sends ns
      JOIN articles a ON a.id = ns.article_id
      ORDER BY ns.sent_at DESC
      LIMIT 20
    `),
    pool.query(`
      SELECT id, title, slug, published_at, cover_image_url, summary
      FROM articles
      WHERE is_published = true
        AND id NOT IN (SELECT article_id FROM newsletter_sends)
      ORDER BY published_at ASC
    `),
    pool.query(`
      SELECT COUNT(DISTINCT lower(email)) FROM (
        SELECT email FROM users         WHERE email IS NOT NULL
        UNION ALL
        SELECT email FROM registrations WHERE email IS NOT NULL
      ) all_emails
      WHERE lower(email) NOT IN (SELECT lower(email) FROM newsletter_unsubscribes)
    `),
    pool.query('SELECT COUNT(*) FROM newsletter_unsubscribes'),
  ]);

  return {
    sends:          sends.rows,
    pending:        pending.rows,
    subscriberCount: Number(subCount.rows[0].count),
    unsubCount:     Number(unsubCount.rows[0].count),
  };
}

export default async function AdminNewsletterPage() {
  await verifyAdminAuth();
  const data = await getNewsletterData();
  return <NewsletterClient {...data} />;
}
