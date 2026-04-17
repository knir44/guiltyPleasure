import pool from '../config/db.js';

const INSIGHTS_URL = process.env.INSIGHTS_SERVICE_URL || 'http://insights-service:3002';

async function notifyInsights(data) {
  try {
    await fetch(`${INSIGHTS_URL}/internal/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content_id:    data.id,
        title:         data.title,
        type:          data.type,
        genre:         data.genre_name,
        rating:        data.rating,
        finished_date: data.finished_date || new Date(),
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.error('[Tracker] insights notification failed:', err.message);
  }
}

export async function getAll(req, res) {
  try {
    const { status, type, genre_id, year, sort = 'updated_at', order = 'desc' } = req.query;

    const allowed_sort  = ['title', 'year', 'rating', 'updated_at'];
    const allowed_order = ['asc', 'desc'];
    const sortCol  = allowed_sort.includes(sort)   ? sort  : 'updated_at';
    const sortDir  = allowed_order.includes(order) ? order : 'desc';

    const conditions = [];
    const values = [];
    let idx = 1;

    if (status)   { conditions.push(`w.status = $${idx++}`);   values.push(status); }
    if (type)     { conditions.push(`c.type = $${idx++}`);     values.push(type); }
    if (genre_id) { conditions.push(`c.genre_id = $${idx++}`); values.push(genre_id); }
    if (year)     { conditions.push(`c.year = $${idx++}`);     values.push(year); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const sortExpr = sortCol === 'rating' || sortCol === 'updated_at'
      ? `w.${sortCol}` : `c.${sortCol}`;

    const sql = `
      SELECT c.*, w.id AS watchlog_id, w.status, w.rating, w.notes,
             w.current_season, w.current_episode,
             w.started_date, w.finished_date, w.updated_at,
             g.name AS genre_name
      FROM content c
      JOIN watchlog w ON w.content_id = c.id
      LEFT JOIN genres g ON g.id = c.genre_id
      ${where}
      ORDER BY ${sortExpr} ${sortDir.toUpperCase()}
    `;
    const { rows } = await pool.query(sql, values);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getById(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, w.id AS watchlog_id, w.status, w.rating, w.notes,
             w.current_season, w.current_episode,
             w.started_date, w.finished_date, w.updated_at,
             g.name AS genre_name
      FROM content c
      JOIN watchlog w ON w.content_id = c.id
      LEFT JOIN genres g ON g.id = c.genre_id
      WHERE c.id = $1
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function create(req, res) {
  const {
    title, type, genre_id, year, director, description,
    poster_url, total_seasons, total_episodes,
    status = 'plan', notes, rating,
    started_date, finished_date,
    current_season, current_episode,
  } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'title and type are required' });
  }
  if (!['movie', 'show'].includes(type)) {
    return res.status(400).json({ error: 'type must be movie or show' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [content] } = await client.query(
      `INSERT INTO content (title, type, genre_id, year, director, description, poster_url, total_seasons, total_episodes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [title, type, genre_id || null, year || null, director || null, description || null,
       poster_url || null, total_seasons || null, total_episodes || null]
    );

    const { rows: [watchlog] } = await client.query(
      `INSERT INTO watchlog (content_id, status, notes, rating, current_season, current_episode, started_date, finished_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [content.id, status, notes || null, rating || null,
       current_season || null, current_episode || null,
       started_date || null, finished_date || null]
    );

    await client.query('COMMIT');

    const result = { ...content, ...watchlog, watchlog_id: watchlog.id, id: content.id };

    if (status === 'watched') {
      const { rows: [g] } = await pool.query('SELECT name FROM genres WHERE id=$1', [genre_id]);
      notifyInsights({ ...result, genre_name: g?.name });
    }

    res.status(201).json(result);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

export async function update(req, res) {
  const { id } = req.params;
  const {
    title, type, genre_id, year, director, description, poster_url, total_seasons, total_episodes,
    status, rating, notes, current_season, current_episode, started_date, finished_date,
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const contentFields = [];
    const contentVals = [];
    let ci = 1;
    if (title !== undefined)          { contentFields.push(`title=$${ci++}`);          contentVals.push(title); }
    if (type !== undefined)           { contentFields.push(`type=$${ci++}`);           contentVals.push(type); }
    if (genre_id !== undefined)       { contentFields.push(`genre_id=$${ci++}`);       contentVals.push(genre_id); }
    if (year !== undefined)           { contentFields.push(`year=$${ci++}`);           contentVals.push(year); }
    if (director !== undefined)       { contentFields.push(`director=$${ci++}`);       contentVals.push(director); }
    if (description !== undefined)    { contentFields.push(`description=$${ci++}`);    contentVals.push(description); }
    if (poster_url !== undefined)     { contentFields.push(`poster_url=$${ci++}`);     contentVals.push(poster_url); }
    if (total_seasons !== undefined)  { contentFields.push(`total_seasons=$${ci++}`);  contentVals.push(total_seasons); }
    if (total_episodes !== undefined) { contentFields.push(`total_episodes=$${ci++}`); contentVals.push(total_episodes); }

    if (contentFields.length) {
      contentVals.push(id);
      await client.query(
        `UPDATE content SET ${contentFields.join(',')} WHERE id=$${ci}`,
        contentVals
      );
    }

    const wlogFields = ['updated_at=NOW()'];
    const wlogVals = [];
    let wi = 1;
    if (status !== undefined)          { wlogFields.push(`status=$${wi++}`);          wlogVals.push(status); }
    if (rating !== undefined)          { wlogFields.push(`rating=$${wi++}`);          wlogVals.push(rating); }
    if (notes !== undefined)           { wlogFields.push(`notes=$${wi++}`);           wlogVals.push(notes); }
    if (current_season !== undefined)  { wlogFields.push(`current_season=$${wi++}`);  wlogVals.push(current_season); }
    if (current_episode !== undefined) { wlogFields.push(`current_episode=$${wi++}`); wlogVals.push(current_episode); }
    if (started_date !== undefined)    { wlogFields.push(`started_date=$${wi++}`);    wlogVals.push(started_date); }
    if (finished_date !== undefined)   { wlogFields.push(`finished_date=$${wi++}`);   wlogVals.push(finished_date); }

    wlogVals.push(id);
    await client.query(
      `UPDATE watchlog SET ${wlogFields.join(',')} WHERE content_id=$${wi}`,
      wlogVals
    );

    await client.query('COMMIT');

    const { rows } = await pool.query(`
      SELECT c.*, w.id AS watchlog_id, w.status, w.rating, w.notes,
             w.current_season, w.current_episode,
             w.started_date, w.finished_date, w.updated_at,
             g.name AS genre_name
      FROM content c
      JOIN watchlog w ON w.content_id = c.id
      LEFT JOIN genres g ON g.id = c.genre_id
      WHERE c.id = $1
    `, [id]);

    if (!rows.length) return res.status(404).json({ error: 'Not found' });

    if (status === 'watched') {
      notifyInsights(rows[0]);
    }

    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

export async function remove(req, res) {
  try {
    const { rowCount } = await pool.query('DELETE FROM content WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getGenres(req, res) {
  try {
    const { rows } = await pool.query('SELECT * FROM genres ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNowWatching(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, w.id AS watchlog_id, w.status, w.rating, w.notes,
             w.current_season, w.current_episode,
             w.started_date, w.finished_date, w.updated_at,
             g.name AS genre_name
      FROM content c
      JOIN watchlog w ON w.content_id = c.id
      LEFT JOIN genres g ON g.id = c.genre_id
      WHERE w.status = 'watching'
      ORDER BY w.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getNext(req, res) {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, w.id AS watchlog_id, w.status, w.rating, w.notes,
             w.current_season, w.current_episode,
             w.started_date, w.finished_date, w.updated_at,
             g.name AS genre_name
      FROM content c
      JOIN watchlog w ON w.content_id = c.id
      LEFT JOIN genres g ON g.id = c.genre_id
      WHERE w.status = 'plan'
      ORDER BY c.created_at ASC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
