import { useMemo, useState } from 'react';

import { normalizeSearchText } from '../utils/search';

const MAX_RESULTS = 8;

// Search over a loaded list.
// fields: (item) => [texts to match]. toResult: (item) => { type, id, label, description }.
export default function useListSearch(items, { fields, toResult }) {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    const query = normalizeSearchText(search);

    return items
      .filter(item => fields(item).some(text => normalizeSearchText(text).includes(query)))
      .slice(0, MAX_RESULTS)
      .map(toResult);
  }, [items, search, fields, toResult]);

  return { search, setSearch, results };
}
