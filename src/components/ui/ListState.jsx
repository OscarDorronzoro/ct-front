import { AlertCircle, RotateCw } from 'lucide-react';

import Button from './Button';
import styles from './ListState.module.css';

export function SkeletonRows({ count = 4 }) {
  return (
    <div aria-busy="true" aria-label="Cargando">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={styles.skeletonRow}>
          <div className={styles.skeletonAvatar} />
          <div className={styles.skeletonLines}>
            <div className={styles.skeletonLine} style={{ width: `${45 + (i % 3) * 12}%` }} />
            <div className={styles.skeletonLine} style={{ width: `${30 + (i % 2) * 15}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty or informative state, with an optional icon and action
export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className={styles.state}>
      {Icon && (
        <div className={styles.icon}>
          <Icon size={24} aria-hidden="true" />
        </div>
      )}
      {title && <div className={styles.title}>{title}</div>}
      {message && <div className={styles.message}>{message}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

// Error while loading data, with retry
export function ErrorState({ title, error, onRetry }) {
  return (
    <div className={styles.state} role="alert">
      <div className={`${styles.icon} ${styles.iconDanger}`}>
        <AlertCircle size={24} aria-hidden="true" />
      </div>
      <div className={styles.title}>{title}</div>
      {error?.name === 'ApiError' && error.message && (
        <div className={styles.message}>Motivo: {error.message}</div>
      )}
      {onRetry && (
        <div className={styles.action}>
          <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
