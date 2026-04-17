import React, { useState } from 'react';
import styles from './PosterImage.module.css';

export default function PosterImage({ src, title, className = '' }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`${styles.placeholder} ${className}`}>
        <span className={styles.icon}>🎬</span>
        <span className={styles.title}>{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      className={`${styles.img} ${className}`}
      onError={() => setError(true)}
    />
  );
}
