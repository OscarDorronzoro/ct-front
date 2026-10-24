import { Link } from 'react-router';
import styles from './Fab.module.css';

export default function Fab({ icon: Icon, label, to }) {
  return (
    <Link to={to} className={styles.fab} aria-label={label} title={label}>
      <Icon size={24} strokeWidth={2.2} aria-hidden="true" />
    </Link>
  );
}
