/**
 * extract-urls.js
 * Queries the Neon PostgreSQL database and prints all published article URLs
 * for use in sitemap generation or auditing.
 *
 * Usage:
 *   node extract-urls.js
 *   node extract-urls.js --format=xml   # output sitemap <url> blocks
 *   node extract-urls.js --format=txt   # one URL per line (default)
 */

// Load DATABASE_URL from .env.local if not already set
if (!process.env.DATABASE_URL) {
  const fs = require('fs');
  try {
    const env = fs.readFileSync('.env.local', 'utf8');
    const match = env.match(/^DATABASE_URL=(.+)$/m);
    if (match) process.env.DATABASE_URL = match[1].trim();
  } catch {}
}
const { Pool } = require('pg');

const BASE_URL = 'https://www.optim-soln.com';
const FORMAT = process.argv.find(a => a.startsWith('--format='))?.split('=')[1] ?? 'txt';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

  const { rows } = await pool.query(`
    SELECT slug, published_at, updated_at
    FROM articles
    WHERE is_published = true
    ORDER BY published_at DESC
  `);

  await pool.end();

  if (FORMAT === 'xml') {
    console.log('<?xml version="1.0" encoding="UTF-8"?>');
    console.log('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const row of rows) {
      const lastmod = (row.updated_at ?? row.published_at).toISOString().slice(0, 10);
      console.log(`  <url>`);
      console.log(`    <loc>${BASE_URL}/articles/${row.slug}</loc>`);
      console.log(`    <lastmod>${lastmod}</lastmod>`);
      console.log(`    <changefreq>monthly</changefreq>`);
      console.log(`    <priority>0.7</priority>`);
      console.log(`  </url>`);
    }
    console.log('</urlset>');
  } else {
    for (const row of rows) {
      console.log(`${BASE_URL}/articles/${row.slug}`);
    }
  }

  console.error(`\n✓ ${rows.length} published articles`);
}

main().catch(err => { console.error(err); process.exit(1); });
