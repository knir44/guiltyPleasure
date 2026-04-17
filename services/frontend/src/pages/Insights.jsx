import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getSummary, getByGenre, getMonthly, getTopRated } from '../api/insights.js';
import styles from './Insights.module.css';

export default function Insights() {
  const [summary,   setSummary]   = useState(null);
  const [byGenre,   setByGenre]   = useState([]);
  const [monthly,   setMonthly]   = useState([]);
  const [topRated,  setTopRated]  = useState([]);

  useEffect(() => {
    getSummary().then(setSummary).catch(() => {});
    getByGenre().then(setByGenre).catch(() => {});
    getMonthly(12).then(setMonthly).catch(() => {});
    getTopRated(10).then(setTopRated).catch(() => {});
  }, []);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Insights</h1>

      {summary && (
        <div className={styles.summaryCards}>
          {[
            { label: 'Total Watched', value: summary.total_watched },
            { label: 'Movies',        value: summary.total_movies },
            { label: 'Shows',         value: summary.total_shows },
            { label: 'Avg Rating',    value: summary.avg_rating ?? '—' },
            { label: 'This Month',    value: summary.this_month_count },
          ].map(card => (
            <div key={card.label} className={styles.card}>
              <span className={styles.cardNum}>{card.value}</span>
              <span className={styles.cardLabel}>{card.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.charts}>
        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>By Genre</h2>
          {byGenre.length === 0
            ? <p className={styles.empty}>No data yet</p>
            : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={byGenre} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                  <XAxis dataKey="genre" tick={{ fill: '#8888aa', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8888aa', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#eaeaea' }} />
                  <Bar dataKey="count" fill="#e94560" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        <div className={styles.chart}>
          <h2 className={styles.chartTitle}>Monthly Activity</h2>
          {monthly.length === 0
            ? <p className={styles.empty}>No data yet</p>
            : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthly} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a4a" />
                  <XAxis dataKey="month" tick={{ fill: '#8888aa', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#8888aa', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#eaeaea' }} />
                  <Line type="monotone" dataKey="count" stroke="#e94560" strokeWidth={2} dot={{ fill: '#e94560' }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      <div className={styles.topRated}>
        <h2 className={styles.chartTitle}>Top Rated</h2>
        {topRated.length === 0
          ? <p className={styles.empty}>Mark something as watched and rate it!</p>
          : (
            <div className={styles.topList}>
              {topRated.map((item, i) => (
                <div key={item._id} className={styles.topItem}>
                  <span className={styles.rank}>#{i + 1}</span>
                  <div className={styles.topInfo}>
                    <span className={styles.topTitle}>{item.title}</span>
                    <span className={styles.topMeta}>{item.type} · {item.genre}</span>
                  </div>
                  <span className={styles.topRating}>★ {item.rating}/10</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}
