import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';
import SearchResults from './SearchResults';
import styles from './Search.module.css';

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
  results = [],
  onSelect,
  border = true,
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const showResults = focused && value && results.length > 0;

  return (
    <div className={styles.box}>
      <div className={`${styles.field} ${border ? '' : styles.plain}`}>
        <Search size={18} className={styles.icon} aria-hidden="true" />

        <input
          ref={inputRef}
          type="search"
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onChange('');
            }
          }}
          className={styles.input}
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Limpiar búsqueda"
            className={styles.clear}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <SearchResults
          results={results}
          onSelect={(result) => {
            // Close the results (and the mobile keyboard)
            inputRef.current?.blur();
            onSelect?.(result);
          }}
        />
      )}
    </div>
  );
}
