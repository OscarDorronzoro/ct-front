import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { IconButton } from '@/shared/ui/button';
import styles from './Form.module.css';
import SelectField from './SelectField';

// One selector per value; each offers the options not chosen in the others.
// onChange({ target: { name, value: [...] } }) like an input. The selectors added and not yet
// chosen live only here; with no values there is always one, empty.
export default function MultiSelectField({
  label,
  name,
  values = [],
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  addLabel = 'Agregar otro',
  maxSelections = 10,
  disabled = false,
}) {
  const [emptySlots, setEmptySlots] = useState(0);

  const slots = [...values, ...Array(emptySlots).fill(null)];
  const rows = slots.length > 0 ? slots : [null];

  const change = (value) => onChange({ target: { name, value } });

  const handleSelectionChange = (index, value) => {
    if (index < values.length) {
      change(values.map((v, i) => (i === index ? value : v)));
      return;
    }

    // An empty selector got its value
    setEmptySlots((n) => Math.max(0, n - 1));
    change([...values, value]);
  };

  const handleRemoveSelection = (index) => {
    if (index < values.length) {
      change(values.filter((_, i) => i !== index));
    } else {
      setEmptySlots((n) => Math.max(0, n - 1));
    }
  };

  // Options not chosen in the other selectors
  const getAvailableOptions = (currentIndex) => {
    const selectedValues = values.filter((_, i) => i !== currentIndex);
    return options.filter(option => !selectedValues.includes(option.value));
  };

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      {rows.map((selection, index) => (
        <div key={index} className={styles.multiRow}>
          <div className={styles.multiSelect}>
            <SelectField
              name={`${name}_${index}`}
              value={selection}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              options={getAvailableOptions(index)}
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>

          {(rows.length > 1 || selection !== null) && (
            <IconButton
              icon={X}
              label="Quitar"
              variant="danger"
              onClick={() => handleRemoveSelection(index)}
            />
          )}
        </div>
      ))}

      {rows.length < maxSelections && (
        <button
          type="button"
          onClick={() => setEmptySlots((n) => n + (slots.length === 0 ? 2 : 1))}
          disabled={disabled}
          className={styles.addMore}
        >
          <Plus size={14} />
          {addLabel}
        </button>
      )}
    </div>
  );
}
