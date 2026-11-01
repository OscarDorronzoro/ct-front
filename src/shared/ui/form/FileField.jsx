import { useRef, useState } from 'react';
import styles from './Form.module.css';

// onChange(file), or onChange(null) when nothing valid is chosen. maxSize in bytes.
export default function FileField({
  label,
  name,
  onChange,
  accept,
  maxSize,
  required = false,
  hint = null,
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0] ?? null;

    if (file && maxSize && file.size > maxSize) {
      setError(`El archivo no debe superar los ${maxSize / (1024 * 1024)} MB.`);
      inputRef.current.value = '';
      onChange(null);
      return;
    }

    setError(null);
    onChange(file);
  };

  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        required={required}
        onChange={handleChange}
        className={`${styles.input} ${styles.file}`}
      />

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
