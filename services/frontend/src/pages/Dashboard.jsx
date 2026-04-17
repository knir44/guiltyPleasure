import React, { useEffect, useState } from 'react';
import { getNowWatching, getNext } from '../api/tracker.js';
import { getSummary } from '../api/insights.js';
import ContentCard from '../components/ContentCard.jsx';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [nowWatching, setNowWatching] = useState([]);
  const [upNext,      setUpNext]      = useState([]);
  const [summary,     setSummary]     = useState(null);

  useEffect(() => {
    getNowWatching().then(setNowWatching).catch(() => {});
    getNext().then(data => setUpNext(data.slice(0, 5))).catch(() => {});
    getSummary().then(setSummary).catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      {summary && (
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>{summary.total_watched}</span>
            <span className={styles.statLabel}>Total Watched</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{summary.avg_rating ?? '—'}</span>
            <span className={styles.statLabel}>Avg Rating</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{summary.this_month_count}</span>
            <span className={styles.statLabel}>This Month</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{summary.total_movies}</span>
            <span className={styles.statLabel}>Movies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{summary.total_shows}</span>
            <span className={styles.statLabel}>Shows</span>
          </div>
        </div>
      )}

      <section>
        <h2 className={styles.sectionTitle}>Now Watching</h2>
        {nowWatching.length === 0
          ? <p className={styles.empty}>Nothing in progress. Start something!</p>
          : (
            <div className={styles.grid}>
              {nowWatching.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          )
        }
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Up Next</h2>
        {upNext.length === 0
          ? <p className={styles.empty}>Your watchlist is empty.</p>
          : (
            <div className={styles.grid}>
              {upNext.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          )
        }
      </section>
    </div>
  );
}
