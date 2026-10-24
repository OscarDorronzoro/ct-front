export default function CowIcon({
  size = 24,
  strokeWidth = 2,
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Cuernos */}
      <path d="M6.5 7.5C5.1 6.7 4.2 5.4 4 3.5" />
      <path d="M17.5 7.5C18.9 6.7 19.8 5.4 20 3.5" />

      {/* Orejas */}
      <path d="M6.5 8L3 7.5C2.4 7.4 2 8 2.4 8.5L5.8 11" />
      <path d="M17.5 8L21 7.5C21.6 7.4 22 8 21.6 8.5L18.2 11" />

      {/* Cabeza */}
      <path d="M6 8.5C6 6.8 7.5 6 9 6H15C16.5 6 18 6.8 18 8.5V14C18 17.5 15.4 20 12 20C8.6 20 6 17.5 6 14V8.5Z" />

      {/* Ojos */}
      <circle cx="9.5" cy="11" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="11" r="0.7" fill="currentColor" stroke="none" />

      {/* Hocico */}
      <path d="M8.5 15C8.5 13.8 9.7 13 12 13C14.3 13 15.5 13.8 15.5 15C15.5 16.5 14 17.5 12 17.5C10 17.5 8.5 16.5 8.5 15Z" />

      {/* Nariz */}
      <circle
        cx="10.5"
        cy="15.2"
        r="0.45"
        fill="currentColor"
        stroke="none"
      />
      <circle
        cx="13.5"
        cy="15.2"
        r="0.45"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
