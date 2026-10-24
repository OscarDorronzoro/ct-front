import { Spinner } from '@/shared/ui/spinner';
import styles from './LoadingScreen.module.css';

// While the code of a lazy route loads on the first page load (the zone editor, the explorer)
export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      <Spinner size={32} />
    </div>
  );
}
