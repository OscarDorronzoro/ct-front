import { useState, useEffect } from 'react';
import SearchBox from '@/components/search/SearchBox';
import UserMenu from './UserMenu';
import { useIsMobile } from '@/shared/lib/media';
import { search as searchEntities } from '@/services/search';
import { logger } from '@/shared/lib/logger';

const DEBOUNCE = 300;

// onSelect(result): a search result was picked (centered on the map by the page)
export default function MapTopBar({ onSelect }) {
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const results = await searchEntities(search);
        setSearchResults(results);
      } catch (error) {
        logger.error('Search error:', error);
        setSearchResults([]);
      }
    }, DEBOUNCE);

    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 12,

          ...(isMobile
            ? {
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 24px)',
              }
            : {
                left: 16,
                width: 400,
              }
          ),

          // Above the other map overlays (history range picker): its results drop over them
          zIndex: 'calc(var(--z-map-controls) + 10)',

          display: 'flex',
          alignItems: 'center',
          gap: 5,

          padding: '4px',

          background: '#fff',
          border: '1px solid #d5d5d5',
          borderRadius: 999,

          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Search */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Buscar vaca o collar..."
            border={false}
            results={searchResults}
            onSelect={(result) => {
              setSearch(result.label);
              onSelect?.(result);
            }}
          />
        </div>

        {/* User menu - mobile */}
        {isMobile && (
          <UserMenu />
        )}
      </div>

    </>
  );
}
