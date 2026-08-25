import { useNavigate } from 'react-router';
import { Pencil, Trash2, SatelliteDish } from 'lucide-react';

export default function CollarRow({
  collar,
  selected,
  onDelete,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/settings/collars/${collar.id}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/settings/collars/${collar.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete?.(collar);
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
      {/* Icono */}
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,

          borderRadius: '50%',

          background: '#f1f3f2',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          color: '#4c625d',
        }}
      >
        <SatelliteDish size={30} />
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
        {/* ID */}
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
          Collar {collar.id}
        </div>

        {/* Datos */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '4px 14px',

            fontSize: 13,
            color: '#666',
          }}
        >
          {collar.description && (
            <span>
              {collar.description}
            </span>
          )}

          <span>
            Firmware: {collar.firmwareVersion || 'S/N'}
          </span>
        </div>
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
          aria-label="Editar collar"
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
          aria-label="Eliminar collar"
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
