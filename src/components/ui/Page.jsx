import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';

import IconButton from './IconButton';
import styles from './Page.module.css';

// Settings page: header (back, title, actions) and a scrollable body.
// width: default | narrow (forms) | full (maps). flush: body without padding.
export default function Page({
  title,
  subtitle,
  backTo,
  actions,
  width = 'default',
  flush = false,
  hideHeaderOnMobile = false,
  children,
}) {
  const navigate = useNavigate();

  const headerClasses = [
    styles.header,
    hideHeaderOnMobile && styles.hideHeaderOnMobile,
  ].filter(Boolean).join(' ');

  const contentClasses = [
    styles.content,
    width !== 'default' && styles[width],
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.page}>
      <header className={headerClasses}>
        {backTo && (
          <IconButton
            icon={ArrowLeft}
            label="Volver"
            onClick={() => navigate(backTo)}
          />
        )}

        <div className={styles.titles}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {actions && <div className={styles.actions}>{actions}</div>}
      </header>

      <div className={`${styles.body} ${flush ? styles.flush : ''}`}>
        <div className={contentClasses}>
          {children}
        </div>
      </div>
    </div>
  );
}
