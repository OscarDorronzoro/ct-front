import styles from './IconButton.module.css';

const ICON_SIZES = { sm: 16, md: 18, lg: 20 };

// label is required: icon-only buttons need an accessible name.
// variant: default | danger (on hover) | surface (floating over the map).
export default function IconButton({
  icon: Icon,
  label,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) {
  const classes = [
    styles.iconButton,
    variant !== 'default' && styles[variant],
    size !== 'md' && styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={classes}
      {...props}
    >
      <Icon size={ICON_SIZES[size]} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
