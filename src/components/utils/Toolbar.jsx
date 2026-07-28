import React from 'react';
import useIsMobile from '../../hooks/useIsMobile';
import SearchBox from './SearchBox';

export default function Toolbar({label, onAdd}) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <button
          onClick={onAdd}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 72,
            width: 56,
            height: 56,
            borderRadius: '50%',
          }}
        >
          +
        </button>
      </>
    );
  }
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center',
    }}>
      <button onClick={onAdd}>+ {label}</button>
    </div>
  );
}
