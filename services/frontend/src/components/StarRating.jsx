import React from 'react';
import styles from './StarRating.module.css';

export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className={styles.stars}>
      {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= (value || 0) ? styles.filled : ''}`}
          onClick={() => !readOnly && onChange && onChange(n)}
          disabled={readOnly}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
      {value && <span className={styles.label}>{value}/10</span>}
    </div>
  );
}
