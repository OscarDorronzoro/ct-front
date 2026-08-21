// components/form/SelectField.jsx
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione una opción',
  required = false,
  disabled = false,
  loading = false,
  error = null,
  isMulti = false,
  onAddMore = null,
  showAddButton = false,
  addButtonLabel = '+ Agregar otro',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontWeight: 500, textAlign: 'left' }}>
          {label}
          {required && <span style={{ color: '#dc2626' }}> *</span>}
        </label>
      )}

      <div ref={dropdownRef} style={{ position: 'relative' }}>
        {/* Botón principal del dropdown */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
            borderRadius: 6,
            background: disabled ? '#f3f4f6' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: 14,
            color: '#374151',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'}
          onBlur={(e) => e.target.style.boxShadow = 'none'}
        >
          <span style={{
            color: selectedOption ? '#374151' : '#9ca3af',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {loading ? 'Cargando...' : selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            size={18}
            style={{
              transition: 'transform 0.2s',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0
            }}
          />
        </button>

        {/* Dropdown menu */}
        {isOpen && !disabled && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              background: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              maxHeight: 240,
              overflowY: 'auto',
              zIndex: 1000,
            }}
          >
            {/* Barra de búsqueda */}
            <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: 4,
                  fontSize: 13,
                  outline: 'none',
                }}
                autoFocus
              />
            </div>

            {/* Lista de opciones */}
            <div>
              {filteredOptions.length === 0 ? (
                <div style={{ padding: 12, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                  No hay opciones disponibles
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: 'none',
                      background: option.value === value ? '#eff6ff' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#374151',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (option.value !== value) {
                        e.target.style.background = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (option.value !== value) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check size={16} color="#3b82f6" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Botón para agregar más opciones (solo para multi-select) */}
      {showAddButton && onAddMore && (
        <button
          type="button"
          onClick={onAddMore}
          style={{
            padding: '6px 12px',
            border: '1px dashed #d1d5db',
            borderRadius: 6,
            background: 'transparent',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.background = '#f9fafb'}
          onMouseLeave={(e) => e.target.style.background = 'transparent'}
        >
          <span style={{ fontSize: 18 }}>+</span>
          {addButtonLabel}
        </button>
      )}

      {/* Mensaje de error */}
      {error && (
        <span style={{ fontSize: 12, color: '#dc2626' }}>
          {error}
        </span>
      )}
    </div>
  );
}
