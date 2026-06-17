import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { name, phone, email, company, message } = await req.json();

    // Validation
    if (!name || !phone || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await pool.query(
      `INSERT INTO messages (name, phone, email, company, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [name, phone, email, company || null, message]
    );

    return new Response(
      JSON.stringify({
        success: true,
        id: result.rows[0].id,
        created_at: result.rows[0].created_at,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error saving message:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to save message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
