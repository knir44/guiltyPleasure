import fs from 'fs';
import path from 'path';

export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const date = new Date().toISOString().slice(0, 10);
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const line = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms\n`;
    fs.appendFileSync(path.join(logDir, `${date}.txt`), line);
  });
  next();
}
