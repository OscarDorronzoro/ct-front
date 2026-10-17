import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';

import IconButton from './IconButton';
import styles from './EntityRow.module.css';

// Row of an entity list. The whole row opens `to`.
// avatar: icon element, or { src, fallback } for an image. meta: list of texts. tags: badges.
export default function EntityRow({
  avatar,
  title,
  meta = [],
  tags,
  to,
  entityLabel,
  onDelete,
}) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const open = () => navigate(to);

  const handleKeyDown = (e) => {
    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      open();
    }
  };

  const stop = (handler) => (e) => {
    e.stopPropagation();
    handler();
  };

  const visibleMeta = meta.filter(Boolean);

  return (
    <div
      role="link"
      tabIndex={0}
      className={styles.row}
      onClick={open}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.avatar}>
        {avatar?.src
          ? (imageFailed
            ? avatar.fallback
            : <img src={avatar.src} alt="" onError={() => setImageFailed(true)} />)
          : avatar}
      </div>

      <div className={styles.info}>
        <div className={styles.title}>{title}</div>

        {visibleMeta.length > 0 && (
          // nbsp before the dot: lines break after it, never start with it
          <div className={styles.meta}>
            {visibleMeta.join('\u00A0· ')}
          </div>
        )}

        {tags && <div className={styles.tags}>{tags}</div>}
      </div>

      <div className={styles.actions}>
        <span className={styles.edit}>
          <IconButton
            icon={Pencil}
            label={`Editar ${entityLabel}`}
            onClick={stop(open)}
          />
        </span>

        {onDelete && (
          <IconButton
            icon={Trash2}
            label={`Eliminar ${entityLabel}`}
            variant="danger"
            onClick={stop(onDelete)}
          />
        )}
      </div>
    </div>
  );
}
