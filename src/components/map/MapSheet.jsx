import { X } from 'lucide-react';
import { IconButton } from '@/shared/ui/button';
import styles from './MapSheet.module.css';

// Details of something selected on the map. avatar: element, or { src } for an image.
export default function MapSheet({
  avatar, title, subtitle, onClose, actions, children,
}) {
  return (
    <section className={styles.sheet} aria-label={typeof title === 'string' ? title : undefined}>
      <div className={styles.handle} aria-hidden="true" />

      <div className={styles.header}>
        {avatar && (
          <div className={styles.avatar}>
            {avatar.src ? <img src={avatar.src} alt="" /> : avatar}
          </div>
        )}

        <div className={styles.titles}>
          <div className={styles.title}>{title}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>

        <IconButton icon={X} label="Cerrar" onClick={onClose} />
      </div>

      {children && <div className={styles.body}>{children}</div>}

      {actions && <div className={styles.actions}>{actions}</div>}
    </section>
  );
}
