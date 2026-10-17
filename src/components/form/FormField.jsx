import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import styles from './Form.module.css';

// type="password" gets a show/hide button
export default function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  hint,
  ...props
}) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  const input = (
    <input
      id={name}
      name={name}
      type={isPassword && revealed ? 'text' : type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`${styles.input} ${isPassword ? styles.inputWithButton : ''}`}
      {...props}
    />
  );

  return (
    <div className={styles.field}>
      <label htmlFor={name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      {isPassword ? (
        <div className={styles.inputWrap}>
          {input}

          <button
            type="button"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={revealed}
            aria-controls={name}
            className={styles.inputButton}
          >
            {revealed ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      ) : input}

      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
