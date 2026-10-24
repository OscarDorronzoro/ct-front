import { useEffect, useRef, useState } from 'react';
import {
  CalendarClock, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { Button, IconButton } from '@/shared/ui/button';
import {
  PRESETS, presetRange, resolveRange, shiftRange, rangeLabel, rangeSummary, customRange, toDateValue, toTimeValue, fromInputs,
} from '@/shared/lib/date';
import { useClickOutside } from '@/shared/lib/click-outside';
import styles from './RangePicker.module.css';

// Time range of the history map: previous/next period, presets and a custom range
export default function RangePicker({ range, onChange }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const pickerRef = useRef(null);

  // Live ranges: keep the summary ("08:00 → ahora", rolling start) current
  useEffect(() => {
    if (!range.live) {
      return undefined;
    }

    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, [range.live]);

  useClickOutside(pickerRef, () => setOpen(false), open);

  const apply = (newRange) => {
    setError(null);
    setNow(new Date());
    onChange(newRange);
  };

  // The custom fields are a draft: applied together, so intermediate values aren't validated
  const toggleOpen = () => {
    if (!open) {
      const current = resolveRange(range);
      setDraft({
        fromDate: toDateValue(current.from),
        fromTime: toTimeValue(current.from),
        toDate: toDateValue(current.to),
        toTime: toTimeValue(current.to),
        untilNow: range.live,
      });
      setError(null);
    }

    setOpen((current) => !current);
  };

  const choosePreset = (key) => {
    apply(presetRange(key));
    setOpen(false);
  };

  const updateDraft = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const applyDraft = () => {
    const result = customRange(
      fromInputs(draft.fromDate, draft.fromTime),
      fromInputs(draft.toDate, draft.toTime),
      draft.untilNow,
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    apply(result.range);
    setOpen(false);
  };

  const today = toDateValue(now);

  return (
    <div className={styles.picker} ref={pickerRef}>
      <div className={styles.bar}>
        <IconButton
          icon={ChevronLeft}
          label="Período anterior"
          onClick={() => apply(shiftRange(range, -1))}
        />

        <button
          type="button"
          className={styles.summary}
          onClick={toggleOpen}
          aria-expanded={open}
        >
          <CalendarClock size={18} className={styles.summaryIcon} aria-hidden="true" />

          <span className={styles.texts}>
            <span className={styles.title}>
              {rangeLabel(range)}
              {range.live && <span className={styles.liveDot} title="Se actualiza solo" />}
            </span>
            <span className={styles.range}>{rangeSummary(range, now)}</span>
          </span>

          <ChevronDown
            size={18}
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            aria-hidden="true"
          />
        </button>

        <IconButton
          icon={ChevronRight}
          label="Período siguiente"
          disabled={range.live}
          onClick={() => apply(shiftRange(range, 1))}
        />
      </div>

      {open && (
        <div className={styles.panel}>
          <div className={styles.presets}>
            {PRESETS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.chip} ${range.preset === key ? styles.chipActive : ''}`}
                onClick={() => choosePreset(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.sectionTitle}>Personalizado</div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Desde</span>
            <input
              type="date"
              className={styles.input}
              aria-label="Fecha desde"
              value={draft.fromDate}
              max={today}
              onChange={updateDraft('fromDate')}
            />
            <input
              type="time"
              className={styles.input}
              aria-label="Hora desde"
              value={draft.fromTime}
              onChange={updateDraft('fromTime')}
            />
          </div>

          <div className={styles.row}>
            <span className={styles.rowLabel}>Hasta</span>
            <input
              type="date"
              className={styles.input}
              aria-label="Fecha hasta"
              value={draft.toDate}
              max={today}
              disabled={draft.untilNow}
              onChange={updateDraft('toDate')}
            />
            <input
              type="time"
              className={styles.input}
              aria-label="Hora hasta"
              value={draft.toTime}
              disabled={draft.untilNow}
              onChange={updateDraft('toTime')}
            />
          </div>

          <label className={styles.switch}>
            <input
              type="checkbox"
              role="switch"
              checked={draft.untilNow}
              onChange={updateDraft('untilNow')}
            />
            <span>
              Hasta ahora
              <span className={styles.switchHint}>Se actualiza solo con las posiciones nuevas</span>
            </span>
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <Button block onClick={applyDraft}>Aplicar</Button>
        </div>
      )}
    </div>
  );
}
