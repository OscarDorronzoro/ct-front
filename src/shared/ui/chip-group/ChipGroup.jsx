import styles from './ChipGroup.module.css';

// Toggle buttons to pick one of the options (scrolls sideways when they don't fit).
// options: [{ value, label }]; label: what is chosen, for screen readers.
export default function ChipGroup({
  options, value, onChange, label,
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
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
