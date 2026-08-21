import { useState } from 'react';
import { SatelliteDish } from 'lucide-react';
import CowIcon from '../icons/CowIcon';

export default function SearchResultItem({
  result,
  onSelect,
}) {
  const [hover, setHover] = useState(false);

  const { type, label, description } = result;

  const icon = {
    cow: <CowIcon size={22} />,
    collar: <SatelliteDish size={22} />,
  }[type];

  if (!icon) {
    return null;
  }

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(result);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',

        display: 'flex',
        alignItems: 'center',

        gap: 12,

        padding: '10px 14px',

        border: 'none',
        background: hover ? '#f3f5f4' : 'transparent',

        textAlign: 'left',

        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          flexShrink: 0,

          color: '#5e3b2c',
        }}
      >
        {icon}
      </span>

      <div
        style={{
          minWidth: 0,

          display: 'flex',
          flexDirection: 'column',
        }}
      >

        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: '#222',

            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>

        {description && (
          <span
            style={{
              fontSize: 12,
              color: '#777',

              marginTop: 2,

              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </span>
        )}

      </div>
    </button>
  );
}
