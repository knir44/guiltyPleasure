import React from 'react';
import { Link } from 'react-router-dom';
import PosterImage from './PosterImage.jsx';
import StatusBadge from './StatusBadge.jsx';
import StarRating  from './StarRating.jsx';
import styles from './ContentCard.module.css';

export default function ContentCard({ item }) {
  return (
    <Link to={`/item/${item.id}`} className={styles.card}>
      <PosterImage src={item.poster_url} title={item.title} className={styles.poster} />
      <div className={styles.info}>
        <h3 className={styles.title}>{item.title}</h3>
        <div className={styles.meta}>
          <span className={styles.type}>{item.type === 'movie' ? '🎬 Movie' : '📺 Show'}</span>
          {item.year && <span>{item.year}</span>}
          {item.genre_name && <span>{item.genre_name}</span>}
        </div>
        <StatusBadge status={item.status} />
        {item.status === 'watching' && (item.current_season || item.current_episode) && (
          <p className={styles.progress}>
            S{String(item.current_season || 1).padStart(2,'0')}E{String(item.current_episode || 1).padStart(2,'0')}
          </p>
        )}
        {item.status === 'watched' && item.rating && (
          <StarRating value={item.rating} readOnly />
        )}
      </div>
    </Link>
  );
}
