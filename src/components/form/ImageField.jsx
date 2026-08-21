import { useRef, useState, useEffect } from 'react';

// Iconos SVG inline como componentes
const RefreshIcon = ({ size = 18, color = '#333333' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const XIcon = ({ size = 18, color = '#d32f2f' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = ({ size = 32, color = '#666666' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'block' }}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function ImageField({
  initialImage = '',
  onChange,
  label = 'Imagen',
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [hasLocalImage, setHasLocalImage] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const normalizedInitialImage = initialImage
    ? (initialImage.startsWith('http') ? initialImage : `${window.location.origin}${initialImage}`)
    : '';

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }

    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    setPreview(url);
    setHasLocalImage(true);
    onChange(file);
  };

  const handleRemove = () => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }

    setPreview(null);
    setHasLocalImage(false);
    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleChangeImage = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const displayImage = hasLocalImage ? preview : normalizedInitialImage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontWeight: 500, textAlign: 'left' }}>
        {label}
      </label>

      <div
        style={{
          width: 180,
          height: 180,
          border: '1px dashed #cfcfcf',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#fafafa',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {displayImage ? (
          <>
            {/* Imagen de fondo */}
            <img
              src={displayImage}
              alt="Vista previa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />

            {/* Overlay oscuro */}
            {isHovering && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                  zIndex: 10,
                }}
              >
                {/* Botón cambiar imagen */}
                <button
                  type="button"
                  onClick={handleChangeImage}
                  style={{
                    width: 40,
                    height: 40,
                    border: 'none',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Cambiar imagen"
                >
                  <RefreshIcon size={20} color="#333333" />
                </button>

                {/* Botón eliminar imagen */}
                <button
                  type="button"
                  onClick={handleRemove}
                  style={{
                    width: 40,
                    height: 40,
                    border: 'none',
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title="Eliminar imagen"
                >
                  <XIcon size={20} color="#d32f2f" />
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={handleChangeImage}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <UploadIcon size={32} color="#666666" />
            <span style={{ color: '#666666', fontSize: 14 }}>
              Agregar imagen
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Debug info */}
      {hasLocalImage && (
        <div style={{ fontSize: 12, color: '#666' }}>
          Imagen local seleccionada
        </div>
      )}
    </div>
  );
}
