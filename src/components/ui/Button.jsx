import { Link } from 'react-router';

import styles from './Button.module.css';

// variant: primary | secondary | ghost | danger. size: sm | md | lg.
// With `to` it renders a router link.
export default function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  block = false,
  loading = false,
  to,
  type = 'button',
  className,
  children,
  disabled,
  ...props
}) {
  const classes = [
    styles.button,
    styles[variant],
    size !== 'md' && styles[size],
    block && styles.block,
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading
        ? <span className={styles.spinner} aria-hidden="true" />
        : Icon && <Icon size={size === 'sm' ? 16 : 18} strokeWidth={2.2} aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
