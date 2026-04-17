import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.POSTGRES_HOST,
  port:     Number(process.env.POSTGRES_PORT) || 5432,
  database: process.env.POSTGRES_DB,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('[DB] Connected to PostgreSQL');
      return;
    } catch (err) {
      console.error(`[DB] Connection attempt ${i}/${retries} failed: ${err.message}`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

export default pool;
