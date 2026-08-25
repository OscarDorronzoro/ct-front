import { useNavigate } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';

import CowIcon from '../icons/CowIcon';

export default function CowRow({
  cow,
  selected,
  onDelete,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/settings/cows/${cow.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/settings/cows/${cow.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(cow);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        cursor: 'pointer',

        background: selected
          ? '#e8f0ee'
          : '#ffffff',

        borderBottom: '1px solid #e5e5e5',

        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {/* Imagen */}
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,

          borderRadius: '50%',
          overflow: 'hidden',

          background: '#f1f3f2',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {cow.imageUrl ? (
          <img
            src={cow.imageUrl}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <CowIcon size={32} />
        )}
      </div>

      {/* Información */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          width: 0,

          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {/* Alias */}
        <div
          style={{
            fontWeight: 600,
            color: '#3a4744',
            fontSize: 16,

            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
          }}
        >
          {cow.alias || `Vaca ${cow.id}`}
        </div>

        {/* Datos principales */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px 14px',

            fontSize: 13,
            color: '#666',
          }}
        >
          <span>
            Caravana: {cow.earTag || 'S/N'}
          </span>

          <span>
            Collar: {cow.currentCollarId ?? 'Sin asignar'}
          </span>

          <span>
            {cow.breed?.name || ''}
          </span>
        </div>

        {/* Grupos */}
        {cow.groups?.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 5,
              marginTop: 2,
            }}
          >
            {cow.groups.map(group => (
              <span
                key={group.id}
                style={{
                  padding: '2px 7px',

                  borderRadius: 999,

                  background: '#eef3f1',
                  color: '#4c625d',

                  fontSize: 11,
                  lineHeight: 1.4,
                }}
              >
                {group.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          aria-label="Editar vaca"
          onClick={handleEdit}
          style={{
            width: 34,
            height: 34,
            padding: 0,

            border: 'none',
            borderRadius: '50%',

            background: 'transparent',
            color: '#777',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f1f3f2';
            e.currentTarget.style.color = '#3a4744';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#777';
          }}
        >
          <Pencil size={17} />
        </button>

        <button
          type="button"
          aria-label="Eliminar vaca"
          onClick={handleDelete}
          style={{
            width: 34,
            height: 34,
            padding: 0,

            border: 'none',
            borderRadius: '50%',

            background: 'transparent',
            color: '#999',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.color = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#999';
          }}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
}
