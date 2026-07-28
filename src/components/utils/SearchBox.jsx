import { useState } from 'react';

export default function SearchBox({
  value,
  onChange,
  placeholder = 'Buscar...',
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',

        width: '100%',
        height: 42,

        padding: '0 12px',

        borderRadius: 999,

        background: '#ffffff',

        border: focused
          ? '2px solid #3a4744'
          : '1px solid #d5d5d5',

        transition: 'all .15s ease',

        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          marginRight: 8,
          opacity: 0.6,
          userSelect: 'none',
        }}
      >
        🔍
      </span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,

          border: 'none',
          outline: 'none',

          color: 'black',
          background: 'transparent',

          fontSize: 15,
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
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
