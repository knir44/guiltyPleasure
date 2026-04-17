import React, { useEffect, useState } from 'react';
import { getAll, getGenres } from '../api/tracker.js';
import ContentCard from '../components/ContentCard.jsx';
import styles from './Library.module.css';

export default function Library() {
  const [items,  setItems]  = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', type: '', genre_id: '' });
  const [sort, setSort] = useState('updated_at');
  const [order, setOrder] = useState('desc');

  useEffect(() => { getGenres().then(setGenres).catch(() => {}); }, []);

  useEffect(() => {
    const params = { sort, order };
    if (filters.status)   params.status   = filters.status;
    if (filters.type)     params.type     = filters.type;
    if (filters.genre_id) params.genre_id = filters.genre_id;
    getAll(params).then(setItems).catch(() => {});
  }, [filters, sort, order]);

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <input
          placeholder="Search titles..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.search}
        />

        <div className={styles.filterGroup}>
          <label>Status</label>
          {['', 'plan', 'watching', 'watched'].map(s => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filters.status === s ? styles.active : ''}`}
              onClick={() => setFilter('status', s)}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <label>Type</label>
          {['', 'movie', 'show'].map(t => (
            <button
              key={t}
              className={`${styles.filterBtn} ${filters.type === t ? styles.active : ''}`}
              onClick={() => setFilter('type', t)}
            >
              {t || 'All'}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <label>Genre</label>
          <select value={filters.genre_id} onChange={e => setFilter('genre_id', e.target.value)}>
            <option value="">All</option>
            {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>Sort by</label>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="updated_at">Date Updated</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
            <option value="rating">Rating</option>
          </select>
          <select value={order} onChange={e => setOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        <p className={styles.count}>{filtered.length} items</p>
        {filtered.length === 0
          ? <p className={styles.empty}>No items found.</p>
          : (
            <div className={styles.grid}>
              {filtered.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          )
        }
      </div>
    </div>
  );
}
