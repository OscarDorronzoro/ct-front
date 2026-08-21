import { useState } from 'react';
import { Search, X } from 'lucide-react'
import SearchResults from './SearchResults';

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
  results = [],
  onSelect,
  border = true,
}) {
  const [focused, setFocused] = useState(false);

  const showResults = focused && value && results.length > 0;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',

          width: '100%',
          height: 36,

          padding: '0 12px',

          borderRadius: 999,

          background: '#ffffff',

          border: border
            ? focused
              ? '2px solid #3a4744'
              : '1px solid #d5d5d5'
            : 'none',

          transition: 'all .15s ease',

          boxSizing: 'border-box',

          position: 'relative',
          zIndex: 2,
        }}
      >
        <span
          style={{
            marginRight: 8,
            opacity: 0.6,
            userSelect: 'none',
            fontSize: 25,
            lineHeight: 1,
          }}
        >
          <Search size={20} color='black'/>
        </span>

        <input
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onChange('');
            }
          }}
          style={{
            flex: 1,

            border: 'none',
            outline: 'none',

            color: 'black',
            background: 'transparent',

            fontSize: 16,
          }}
        />

        {value && (
          <button
            onClick={() => onChange('')}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'black',

              cursor: 'pointer',

              fontSize: 18,

              opacity: 0.5,

              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <SearchResults
          results={results}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}
