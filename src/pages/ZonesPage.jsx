export default function ZonesPage() {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
      }}
    >

      {/* Header */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          background: '#ffffff',
          borderBottom: '1px solid #ddd',
          gap: '12px',
        }}
      >
        <div
          style={{
            fontWeight: 'bold',
            color: '#5e3b2c',
            margin: '0 auto',
            fontSize: 18,
          }}
        >
          <h2>Zonas</h2>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          marginTop: '10px',
          background: '#fff',
          height: '100%',
          flex: 1,
          padding: 16,
          overflow: 'auto',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: '#777',
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: '#3a4744',
              marginBottom: 6,
            }}
          >
            Próximamente
          </div>

          <div
            style={{
              fontSize: 14,
              color: '#888',
            }}
          >
            La gestión de zonas estará disponible próximamente.
          </div>
        </div>
      </div>

    </div>
  );
}
