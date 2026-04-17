import WatchEvent from '../models/WatchEvent.js';

export async function getSummary(req, res) {
  try {
    const total_watched = await WatchEvent.countDocuments();
    const total_movies  = await WatchEvent.countDocuments({ type: 'movie' });
    const total_shows   = await WatchEvent.countDocuments({ type: 'show' });

    const [ratingAgg] = await WatchEvent.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const this_month_count = await WatchEvent.countDocuments({ created_at: { $gte: startOfMonth } });

    res.json({
      total_watched,
      total_movies,
      total_shows,
      avg_rating: ratingAgg ? Math.round(ratingAgg.avg * 10) / 10 : null,
      this_month_count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getByGenre(req, res) {
  try {
    const data = await WatchEvent.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 }, avg_rating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, genre: '$_id', count: 1, avg_rating: { $round: ['$avg_rating', 1] } } },
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getByType(req, res) {
  try {
    const data = await WatchEvent.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avg_rating: { $avg: '$rating' } } },
    ]);
    const result = { movies: { count: 0, avg_rating: null }, shows: { count: 0, avg_rating: null } };
    for (const item of data) {
      const key = item._id === 'movie' ? 'movies' : 'shows';
      result[key] = { count: item.count, avg_rating: Math.round(item.avg_rating * 10) / 10 };
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getMonthly(req, res) {
  try {
    const months = parseInt(req.query.months) || 12;
    const since = new Date();
    since.setMonth(since.getMonth() - months + 1);
    since.setDate(1);
    since.setHours(0, 0, 0, 0);

    const data = await WatchEvent.aggregate([
      { $match: { created_at: { $gte: since } } },
      {
        $group: {
          _id: { year: { $year: '$created_at' }, month: { $month: '$created_at' } },
          count: { $sum: 1 },
          avg_rating: { $avg: '$rating' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' }, '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
            ],
          },
          count: 1,
          avg_rating: { $round: ['$avg_rating', 1] },
        },
      },
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTopRated(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data = await WatchEvent.find({ rating: { $exists: true } })
      .sort({ rating: -1 })
      .limit(limit)
      .lean();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
