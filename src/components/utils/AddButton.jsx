import React from 'react';
import { useNavigate } from 'react-router';
import useIsMobile from '../../hooks/useIsMobile';

export default function AddButton({label, path}) {
const isMobile = useIsMobile();
const navigate = useNavigate();

const onClick = () => {
  navigate(`${path}/new`);
};

  if (isMobile) {
    return (
      <>
        <button
          onClick={onClick}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 12,
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
    <button
      onClick={onClick}
      style={{
        minWidth: 100,
        borderRadius: 20,
      }}
    >
      + {label}
    </button>
  );
}
