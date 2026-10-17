import {
  SatelliteDish, Users, UserRound, LandPlot,
} from 'lucide-react';

import CowIcon from '../icons/CowIcon';
import styles from './Search.module.css';

const ICONS = {
  cow: CowIcon,
  collar: SatelliteDish,
  group: Users,
  user: UserRound,
  zone: LandPlot,
};

export default function SearchResultItem({
  result,
  onSelect,
}) {
  const { type, label, description } = result;
  const Icon = ICONS[type] ?? SatelliteDish;

  return (
    <button
      type="button"
      role="option"
      // mousedown: before the input blur hides the results
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect?.(result);
      }}
      className={styles.item}
    >
      <span className={styles.itemIcon}>
        <Icon size={18} />
      </span>

      <span className={styles.itemText}>
        <span className={styles.itemLabel}>{label}</span>

        {description && (
          <span className={styles.itemDescription}>{description}</span>
        )}
      </span>
    </button>
  );
}
