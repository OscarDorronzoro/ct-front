import {
  AlertCircle, AlertTriangle, CheckCircle2, Info, X,
} from 'lucide-react';
import styles from './Alert.module.css';

const ICONS = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

// tone: danger | warning | success | info. onClose makes it dismissible.
export default function Alert({ tone = 'danger', onClose, children }) {
  const Icon = ICONS[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`${styles.alert} ${styles[tone]}`}
    >
      <Icon size={18} className={styles.icon} aria-hidden="true" />

      <div className={styles.message}>
        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mensaje"
          className={styles.close}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
