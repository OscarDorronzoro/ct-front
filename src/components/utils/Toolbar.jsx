import React from 'react';
import useIsMobile from '../../hooks/useIsMobile';

export default function Toolbar({children}) {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 12,
        alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}
