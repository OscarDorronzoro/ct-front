import styles from './Badge.module.css';

// tone: neutral | primary | accent | success | warning | danger
export default function Badge({ tone = 'neutral', icon: Icon, children }) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      {Icon && <Icon size={12} strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </span>
  );
}
