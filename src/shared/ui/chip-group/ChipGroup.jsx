import styles from './ChipGroup.module.css';

// Toggle buttons to pick one of the options. They scroll sideways when they don't fit, or go
// on to the next line with `wrap`. options: [{ value, label }]; label: what is chosen, for
// screen readers.
export default function ChipGroup({
  options, value, onChange, label, wrap = false,
}) {
  return (
    <div className={`${styles.group} ${wrap ? styles.wrap : ''}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          className={styles.chip}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
