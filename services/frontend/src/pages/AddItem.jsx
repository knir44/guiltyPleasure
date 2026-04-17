import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { create, getGenres } from '../api/tracker.js';
import PosterImage from '../components/PosterImage.jsx';
import styles from './AddItem.module.css';

export default function AddItem() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [form, setForm] = useState({
    title: '', type: 'movie', genre_id: '', year: '', director: '',
    description: '', poster_url: '', total_seasons: '', total_episodes: '',
    status: 'plan', notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getGenres().then(setGenres).catch(() => {}); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      ['year', 'genre_id', 'total_seasons', 'total_episodes'].forEach(k => {
        if (payload[k] === '') payload[k] = undefined;
        else payload[k] = Number(payload[k]);
      });
      const item = await create(payload);
      navigate(`/item/${item.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Add New Item</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.columns}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label>Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Enter title..." />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="movie">Movie</option>
                  <option value="show">TV Show</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Genre</label>
                <select value={form.genre_id} onChange={e => set('genre_id', e.target.value)}>
                  <option value="">Select genre</option>
                  {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label>Year</label>
                <input type="number" value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" min="1900" max="2099" />
              </div>
              <div className={styles.field}>
                <label>Director</label>
                <input value={form.director} onChange={e => set('director', e.target.value)} placeholder="Director name" />
              </div>
            </div>

            {form.type === 'show' && (
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Total Seasons</label>
                  <input type="number" value={form.total_seasons} onChange={e => set('total_seasons', e.target.value)} min="1" />
                </div>
                <div className={styles.field}>
                  <label>Total Episodes</label>
                  <input type="number" value={form.total_episodes} onChange={e => set('total_episodes', e.target.value)} min="1" />
                </div>
              </div>
            )}

            <div className={styles.field}>
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description..." />
            </div>

            <div className={styles.field}>
              <label>Poster URL</label>
              <input value={form.poster_url} onChange={e => set('poster_url', e.target.value)} placeholder="https://..." />
            </div>

            <div className={styles.field}>
              <label>Status</label>
              <div className={styles.statusBtns}>
                {['plan', 'watching', 'watched'].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.statusBtn} ${form.status === s ? styles.activeStatus : ''}`}
                    onClick={() => set('status', s)}
                  >
                    {s === 'plan' ? '🔵 Plan' : s === 'watching' ? '🟡 Watching' : '🟢 Watched'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label>Notes</label>
              <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Personal notes..." />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Adding...' : 'Add to Library'}
            </button>
          </div>

          <div className={styles.preview}>
            <p className={styles.previewLabel}>Poster Preview</p>
            <PosterImage src={form.poster_url} title={form.title || 'No title'} className={styles.poster} />
          </div>
        </div>
      </form>
    </div>
  );
}
