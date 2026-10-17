import { Plus, Minus, LocateFixed, Layers } from 'lucide-react';

import styles from './MapControls.module.css';

function ControlButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`${styles.button} ${active ? styles.active : ''}`}
    >
      <Icon size={20} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}

// hiddenOnMobile: a bottom sheet is open and takes that space
export default function MapControls({
  onZoomIn, onZoomOut, onCenter, zonesVisible, onToggleZones, hiddenOnMobile = false,
}) {
  return (
    <div className={`${styles.controls} ${hiddenOnMobile ? styles.hiddenOnMobile : ''}`}>
      <div className={styles.group}>
        <ControlButton icon={Layers} label={zonesVisible ? 'Ocultar zonas' : 'Mostrar zonas'} active={zonesVisible} onClick={onToggleZones} />
      </div>

      <div className={styles.group}>
        <ControlButton icon={LocateFixed} label="Centrar en las vacas" onClick={onCenter} />
      </div>

      <div className={styles.group}>
        <ControlButton icon={Plus} label="Acercar" onClick={onZoomIn} />
        <ControlButton icon={Minus} label="Alejar" onClick={onZoomOut} />
      </div>
    </div>
  );
}
