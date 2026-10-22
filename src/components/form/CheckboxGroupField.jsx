import styles from './Form.module.css';

// Several choices from a short list, each with an optional description.
// onChange receives { target: { name, value } } with the checked values, in option order.
export default function CheckboxGroupField({
  label,
  name,
  values = [],
  onChange,
  options = [],
  required = false,
  error = null,
  hint = null,
}) {
  const toggle = (value) => {
    const checked = values.includes(value)
      ? values.filter((v) => v !== value)
      : [...values, value];

    onChange({
      target: {
        name,
        value: options.map((o) => o.value).filter((v) => checked.includes(v)),
      },
    });
  };

  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </legend>

      <div className={styles.checkGroup}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`${styles.checkOption} ${option.disabled ? styles.checkDisabled : ''}`}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={values.includes(option.value)}
              disabled={option.disabled}
              onChange={() => toggle(option.value)}
            />
            <span>
              <span className={styles.checkLabel}>{option.label}</span>
              {option.description && (
                <span className={styles.checkDescription}>{option.description}</span>
              )}
            </span>
          </label>
        ))}
      </div>

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </fieldset>
  );
}
