export default function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  ...props
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: '100%',
    }}>
      <label
        htmlFor={name}
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#3a4744',
          textAlign: 'left',
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#a33', marginLeft: 3 }}>
            *
          </span>
        )}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
        style={{
          width: '100%',
          height: 42,
          boxSizing: 'border-box',

          padding: '0 12px',

          border: '1px solid #d5d5d5',
          borderRadius: 8,

          background: '#fff',
          color: '#222',

          fontSize: 15,
          outline: 'none',
        }}
      />
    </div>
  );
}
