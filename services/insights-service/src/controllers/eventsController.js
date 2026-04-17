import WatchEvent from '../models/WatchEvent.js';

export async function createEvent(req, res) {
  try {
    const { content_id, title, type, genre, rating, finished_date } = req.body;
    if (!content_id || !title) {
      return res.status(400).json({ error: 'content_id and title are required' });
    }
    const event = await WatchEvent.create({ content_id, title, type, genre, rating, finished_date });
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
