import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectWithRetry } from './config/mongo.js';
import { requestLogger } from './middleware/logger.js';
import insightsRouter from './routes/insights.js';
import eventsRouter from './routes/events.js';

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/insights',   insightsRouter);
app.use('/internal/events', eventsRouter);

app.get('/health', (req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    res.json({ status: 'ok', service: 'insights-service', db: 'connected' });
  } else {
    res.status(503).json({ status: 'error', service: 'insights-service', db: 'disconnected' });
  }
});

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await connectWithRetry();
  app.listen(PORT, () => console.log(`[Insights] running on port ${PORT}`));
}

start();
