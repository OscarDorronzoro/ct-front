// components/form/MultiSelectField.jsx
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
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

  const handleRemoveSelection = (index) => {
    if (selections.length > 1) {
      const newSelections = selections.filter((_, i) => i !== index);
      setSelections(newSelections);

      const validSelections = newSelections.filter(v => v !== null && v !== '');
      onChange({
        target: {
          name,
          value: validSelections
        }
      });
    }
  };

  // Filtrar opciones que ya están seleccionadas
  const getAvailableOptions = (currentIndex) => {
    const selectedValues = selections.filter((_, i) => i !== currentIndex);
    return options.filter(option => !selectedValues.includes(option.value));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {label && (
        <label style={{ fontWeight: 500, textAlign: 'left' }}>
          {label}
        </label>
      )}

      {selections.map((selection, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <SelectField
              name={`${name}_${index}`}
              value={selection}
              onChange={(e) => handleSelectionChange(index, e.target.value)}
              options={getAvailableOptions(index)}
              placeholder={placeholder}
              disabled={disabled}
            />
          </div>

          {selections.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveSelection(index)}
              aria-label="Eliminar grupo"
              style={{
                flexShrink: 0,

                width: 32,
                height: 32,

                padding: 0,

                border: '1px solid #e5e7eb',
                borderRadius: '50%',

                background: '#fff',
                color: '#777',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                cursor: 'pointer',

                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#777';
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          )}
        </div>
      ))}

      {selections.length < maxSelections && (
        <button
          type="button"
          onClick={handleAddSelection}
          disabled={disabled}
          style={{
            padding: '8px 12px',
            border: '1px dashed #d1d5db',
            borderRadius: 6,
            background: 'transparent',
            color: '#3b82f6',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {e.target.style.background = '#f9fafb';}
          }}
          onMouseLeave={(e) => {
            if (!disabled) {e.target.style.background = 'transparent';}
          }}
        >
          <Plus size={16} />
          Agregar grupo
        </button>
      )}
    </div>
  );
}
