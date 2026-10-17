import { useRef, useState, useEffect } from 'react';
import { ImagePlus, RefreshCw, X } from 'lucide-react';

import IconButton from '../ui/IconButton';
import formStyles from './Form.module.css';
import styles from './ImageField.module.css';

// onChange(file) with a new image, onChange(null) when the current one is removed,
// onChange(undefined) when back to the current one (no change)
export default function ImageField({
  initialImage = '',
  onChange,
  label = 'Imagen',
}) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState(null);

  const normalizedInitialImage = initialImage
    ? (initialImage.startsWith('http') ? initialImage : `${window.location.origin}${initialImage}`)
    : '';

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetInput = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {return;}

    if (!file.type.startsWith('image/')) {
      setError('Seleccioná un archivo de imagen válido.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
    onChange(file);
  };

  // Empty field: the new image is discarded and the current one (if any) goes on save
  const handleRemove = () => {
    setPreview(null);
    setRemoved(true);
    resetInput();
    onChange(normalizedInitialImage ? null : undefined);
  };

  const handleUndo = () => {
    setRemoved(false);
    onChange(undefined);
  };

  const handleChangeImage = () => {
    inputRef.current?.click();
  };

  const displayImage = preview ?? (removed ? '' : normalizedInitialImage);

  return (
    <div className={formStyles.field}>
      <span className={formStyles.label}>{label}</span>

      <div className={styles.frame}>
        {displayImage ? (
          <>
            <img src={displayImage} alt="Vista previa" className={styles.image} />

            {/* Always visible: touch screens have no hover */}
            <div className={styles.actions}>
              <IconButton
                icon={RefreshCw}
                label="Cambiar imagen"
                variant="surface"
                size="sm"
                onClick={handleChangeImage}
              />
              <IconButton
                icon={X}
                label="Quitar imagen"
                variant="surface"
                size="sm"
                onClick={handleRemove}
              />
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={handleChangeImage}
            className={styles.empty}
          >
            <ImagePlus size={28} strokeWidth={1.7} />
            Agregar imagen
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          hidden
        />
      </div>

      {error && <span className={formStyles.error}>{error}</span>}
      {!error && preview && (
        <span className={formStyles.hint}>Imagen nueva: se guarda al confirmar.</span>
      )}
      {!error && removed && normalizedInitialImage && (
        <span className={formStyles.hint}>
          La imagen actual se quitará al guardar.{' '}
          <button type="button" onClick={handleUndo} className={styles.undo}>Deshacer</button>
        </span>
      )}
    </div>
  );
}
