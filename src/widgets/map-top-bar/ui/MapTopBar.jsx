import { EntitySearch } from '@/features/search-entities';
import { UserMenu } from '@/features/user-menu';
import { useIsMobile } from '@/shared/lib/media';
import styles from './MapTopBar.module.css';

// onSelect(result): a search result was picked (centered on the map by the page)
export default function MapTopBar({ onSelect }) {
  const isMobile = useIsMobile();

  return (
    <div className={styles.bar}>
      <div className={styles.search}>
        <EntitySearch
          placeholder="Buscar vaca o collar..."
          border={false}
          onSelect={onSelect}
        />
      </div>

      {/* Phones: the user menu is here (no sidebar) */}
      {isMobile && <UserMenu />}
    </div>
  );
}
