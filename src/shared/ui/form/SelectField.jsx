import { useState, useRef, useId } from 'react';
import { ChevronDown, Check, Plus } from 'lucide-react';
import { useClickOutside } from '@/shared/lib/click-outside';
import styles from './Form.module.css';

// A select of the app (a list with search). It's a select-only combobox (WAI-ARIA): its name is the
// label, its content the chosen option. ariaLabel: its name when it has no visible label.
export default function SelectField({
  label,
  ariaLabel,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  required = false,
  disabled = false,
  loading = false,
  error = null,
  hint = null,
  onAddMore = null,
  showAddButton = false,
  addButtonLabel = 'Agregar otro',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const id = useId();
  const listId = `${id}-options`;

  // Cerrar dropdown al hacer clic fuera
  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    setSearchTerm('');
  }, isOpen);

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Encontrar la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue) => {
    onChange({
      target: {
        name,
        value: optionValue
      }
    });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}

      <div ref={dropdownRef} className={styles.select}>
        {/* Trigger */}
        <button
          id={id}
          type="button"
          role="combobox"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-label={label ? undefined : ariaLabel}
          aria-required={required || undefined}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          className={[
            styles.input,
            styles.selectTrigger,
            isOpen && styles.selectOpen,
            error && styles.invalid,
          ].filter(Boolean).join(' ')}
        >
          <span className={`${styles.selectValue} ${selectedOption ? '' : styles.placeholder}`}>
            {loading ? 'Cargando...' : selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            size={18}
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div className={styles.menu}>
            <div className={styles.menuSearch}>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            <div id={listId} className={styles.options} role="listbox">
              {filteredOptions.length === 0 ? (
                <div className={styles.noOptions}>
                  No hay opciones disponibles
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                    className={`${styles.option} ${option.value === value ? styles.optionSelected : ''}`}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check size={16} />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add another option (multi-select) */}
      {showAddButton && onAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          className={styles.addMore}
        >
          <Plus size={14} />
          {addButtonLabel}
        </button>
      )}

      {error && <span className={styles.error}>{error}</span>}
      {!error && hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}
