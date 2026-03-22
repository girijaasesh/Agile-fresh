export const dynamic = 'force-dynamic';

const { pool } = require('../../../../lib/db');

export async function GET(req, { params }) {
  const { code } = params;
  
  console.log('Resolving quick link:', code);

  try {
    const result = await pool.query(
      `SELECT * FROM quick_links WHERE short_code = $1`,
      [code]
    );

    console.log('Query result:', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log('Quick link not found:', code);
      return Response.json({ error: 'Quick link not found' }, { status: 404 });
    }

    const quickLink = result.rows[0];
    console.log('Found quick link:', quickLink);

    // Increment click count
    try {
      await pool.query(
        `UPDATE quick_links SET clicks = clicks + 1, last_clicked = NOW() WHERE id = $1`,
        [quickLink.id]
      );
    } catch (updateErr) {
      console.error('Error updating click count:', updateErr);
    }

    // Return quicklink data for the checkout page to use directly
    return Response.json({ quickLink });
  } catch (err) {
    console.error('Error resolving quick link:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
