import { Search } from 'lucide-react';
import styles from './Search.module.css';

// result: { label, description, icon } (icon: component, optional)
export default function SearchResultItem({
  result,
  onSelect,
}) {
  const { label, description, icon: Icon = Search } = result;

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
