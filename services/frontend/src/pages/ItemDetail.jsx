import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getById, update, remove } from '../api/tracker.js';
import PosterImage from '../components/PosterImage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import StarRating  from '../components/StarRating.jsx';
import styles from './ItemDetail.module.css';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getById(id).then(data => {
      setItem(data);
      setNotes(data.notes || '');
    }).catch(() => navigate('/library'));
  }, [id]);

  if (!item) return <p className={styles.loading}>Loading...</p>;

  const save = async (patch) => {
    setSaving(true);
    try {
      const updated = await update(id, patch);
      setItem(updated);
      setNotes(updated.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await remove(id);
    navigate('/library');
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <PosterImage src={item.poster_url} title={item.title} className={styles.poster} />
      </div>

      <div className={styles.right}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>{item.title}</h1>
            <div className={styles.meta}>
              <span>{item.type === 'movie' ? '🎬 Movie' : '📺 Show'}</span>
              {item.year && <span>{item.year}</span>}
              {item.genre_name && <span>{item.genre_name}</span>}
              {item.director && <span>Dir. {item.director}</span>}
            </div>
          </div>
          <button className={styles.deleteBtn} onClick={handleDelete}>🗑 Delete</button>
        </div>

        {item.description && <p className={styles.description}>{item.description}</p>}

        {item.type === 'show' && (item.total_seasons || item.total_episodes) && (
          <p className={styles.showInfo}>
            {item.total_seasons && `${item.total_seasons} seasons`}
            {item.total_seasons && item.total_episodes && ' · '}
            {item.total_episodes && `${item.total_episodes} episodes`}
          </p>
        )}

        <div className={styles.section}>
          <h3>Status</h3>
          <div className={styles.statusBtns}>
            {['plan', 'watching', 'watched'].map(s => (
              <button
                key={s}
                className={`${styles.statusBtn} ${item.status === s ? styles.activeStatus : ''}`}
                onClick={() => save({ status: s })}
                disabled={saving}
              >
                {s === 'plan' ? '🔵 Plan' : s === 'watching' ? '🟡 Watching' : '🟢 Watched'}
              </button>
            ))}
          </div>
        </div>

        {item.type === 'show' && item.status === 'watching' && (
          <div className={styles.section}>
            <h3>Progress</h3>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Season</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={item.current_season || 1}
                  onBlur={e => save({ current_season: Number(e.target.value) })}
                />
              </div>
              <div className={styles.field}>
                <label>Episode</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={item.current_episode || 1}
                  onBlur={e => save({ current_episode: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        )}

        {item.status === 'watched' && (
          <div className={styles.section}>
            <h3>Rating</h3>
            <StarRating value={item.rating} onChange={r => save({ rating: r })} />
          </div>
        )}

        <div className={styles.section}>
          <h3>Notes</h3>
          <textarea
            rows={4}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            onBlur={() => save({ notes })}
            placeholder="Your thoughts..."
            className={styles.notes}
          />
        </div>

        <p className={styles.updated}>
          Last updated: {new Date(item.updated_at).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
