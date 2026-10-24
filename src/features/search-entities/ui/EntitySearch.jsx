import { useEffect, useState } from 'react';
import {
  SatelliteDish, Users, UserRound, LandPlot,
} from 'lucide-react';
import { SearchBox } from '@/shared/ui/search-box';
import { CowIcon } from '@/shared/ui/icons';
import { logger } from '@/shared/lib/logger';
import { searchEntities } from '../api/searchApi';

const DEBOUNCE = 300;

const ICONS = {
  cow: CowIcon,
  collar: SatelliteDish,
  group: Users,
  user: UserRound,
  zone: LandPlot,
};

// Search of cows and collars. onSelect(result): { type, id, label, description }
export default function EntitySearch({ onSelect, ...boxProps }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const found = await searchEntities(query);
        setResults(found.map((result) => ({ ...result, icon: ICONS[result.type] ?? SatelliteDish })));
      } catch (error) {
        logger.error('Search error:', error);
        setResults([]);
      }
    }, DEBOUNCE);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <SearchBox
      {...boxProps}
      value={query}
      onChange={setQuery}
      results={results}
      onSelect={(result) => {
        setQuery(result.label);
        onSelect?.(result);
      }}
    />
  );
}
