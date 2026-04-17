import express from 'express';
import cors from 'cors';
import pool, { connectWithRetry } from './config/db.js';
import { requestLogger } from './middleware/logger.js';
import contentRouter from './routes/content.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/tracker', contentRouter);

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'tracker-service', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'tracker-service', db: 'disconnected' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await connectWithRetry();
  app.listen(PORT, () => console.log(`[Tracker] running on port ${PORT}`));
}

start();
