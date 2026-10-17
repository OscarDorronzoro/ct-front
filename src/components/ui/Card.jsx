import styles from './Card.module.css';

// padded: content card (forms). Without padding: lists of rows.
export default function Card({ padded = false, as: Component = 'div', className, children, ...props }) {
  const classes = [
    styles.card,
    padded ? styles.padded : styles.list,
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
