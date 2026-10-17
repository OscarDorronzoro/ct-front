// components/form/MultiSelectField.jsx
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

import IconButton from '../ui/IconButton';
import styles from './Form.module.css';
import SelectField from './SelectField';

export default function MultiSelectField({
  label,
  name,
  values = [],
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  maxSelections = 10,
  disabled = false,
}) {
  const [selections, setSelections] = useState(
    values.length > 0 ? values : [null] // Iniciar con un selector vacío
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelections(
      values.length > 0 ? values : [null]
    );
  }, [values]);

  const handleSelectionChange = (index, value) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);

    // Filtrar valores null y actualizar el formulario
    const validSelections = newSelections.filter(v => v !== null && v !== '');
    onChange({
      target: {
        name,
        value: validSelections
      }
    });
  };

  const handleAddSelection = () => {
    if (selections.length < maxSelections) {
      setSelections([...selections, null]);
    }
  };

  // Removing the only selection leaves an empty selector (no selections at all)
  const handleRemoveSelection = (index) => {
    const remaining = selections.filter((_, i) => i !== index);
    const newSelections = remaining.length > 0 ? remaining : [null];
    setSelections(newSelections);

    const validSelections = newSelections.filter(v => v !== null && v !== '');
    onChange({
      target: {
        name,
        value: validSelections
      }
    });
  };

  // Filtrar opciones que ya están seleccionadas
  const getAvailableOptions = (currentIndex) => {
    const selectedValues = selections.filter((_, i) => i !== currentIndex);
    return options.filter(option => !selectedValues.includes(option.value));
  };

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}

      {selections.map((selection, index) => (
        <div
          key={index}
          style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <SelectField
              name={`${name}_${index}`}
              value={selection}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              options={getAvailableOptions(index)}
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>

          {(selections.length > 1 || selection !== null) && (
            <IconButton
              icon={X}
              label="Quitar"
              variant="danger"
              onClick={() => handleRemoveSelection(index)}
            />
          )}
        </div>
      ))}

      {selections.length < maxSelections && (
        <button
          type="button"
          onClick={handleAddSelection}
          disabled={disabled}
          className={styles.addMore}
        >
          <Plus size={14} />
          Agregar grupo
        </button>
      )}
    </div>
  );
}
