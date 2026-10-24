import styles from './Toolbar.module.css';

// The first child grows (search); the rest keep their size
export default function Toolbar({ children }) {
  return (
    <div className={styles.toolbar}>
      {children}
    </div>
  );
}
