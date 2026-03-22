export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    const { pool } = require('../../../lib/db');
    const result = await pool.query(`
      SELECT s.id, s.certification_id, c.title as course_title, c.code, s.session_date, s.format, s.max_seats, s.is_active, c.price, c.early_bird_price, s.timezone
      FROM sessions s
      JOIN certifications c ON s.certification_id = c.id
      WHERE s.session_date >= CURRENT_DATE
      AND s.is_active = true
      ORDER BY s.session_date ASC
    `)
    return Response.json(result.rows);
  } catch (error) {
    return Response.json({
      error: error.message,
      code: error.code,
      detail: error.toString()
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    const { pool } = require('../../../lib/db');
    const { id, session_date, format, max_seats, is_active } = await request.json();

    const result = await pool.query(`
      UPDATE sessions
      SET session_date = $1, format = $2, max_seats = $3, is_active = $4
      WHERE id = $5
      RETURNING *
    `, [session_date, format, max_seats, is_active, id]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    return Response.json({
      error: error.message,
      code: error.code,
      detail: error.toString()
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    const { pool } = require('../../../lib/db');
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const result = await pool.query('DELETE FROM sessions WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({
      error: error.message,
      code: error.code,
      detail: error.toString()
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ error: 'DATABASE_URL is not set' }, { status: 500 });
    }
    const { pool } = require('../../../lib/db');
    const { certification_id, session_date, format, max_seats, timezone } = await request.json();

    // Validate required fields
    if (!certification_id || !session_date || !format || !max_seats || !timezone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertResult = await pool.query(`
      INSERT INTO sessions (certification_id, session_date, format, max_seats, timezone, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [certification_id, session_date, format, max_seats, timezone, true]);

    if (insertResult.rows.length === 0) {
      return Response.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Fetch the newly created session with join data
    const sessionId = insertResult.rows[0].id;
    const selectResult = await pool.query(`
      SELECT s.id, s.certification_id, c.title as course_title, c.code, s.session_date, s.format, s.max_seats, s.is_active, c.price, c.early_bird_price, s.timezone
      FROM sessions s
      JOIN certifications c ON s.certification_id = c.id
      WHERE s.id = $1
    `, [sessionId])

    if (selectResult.rows.length === 0) {
      return Response.json({ error: 'Failed to retrieve created session' }, { status: 500 });
    }

    return Response.json(selectResult.rows[0], { status: 201 });
  } catch (error) {
    return Response.json({
      error: error.message,
      code: error.code,
      detail: error.toString()
    }, { status: 500 });
  }
}