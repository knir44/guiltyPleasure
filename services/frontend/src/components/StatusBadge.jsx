import React from 'react';
import styles from './StatusBadge.module.css';

const CONFIG = {
  plan:     { label: 'Plan to Watch', dot: '🔵' },
  watching: { label: 'Watching',      dot: '🟡' },
  watched:  { label: 'Watched',       dot: '🟢' },
};

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || CONFIG.plan;
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {cfg.dot} {cfg.label}
    </span>
  );
}
