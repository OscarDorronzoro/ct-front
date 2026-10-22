// Roles of a user (backend: identity/roles.constants), in display order.
// What each one can do lives in the backend; the descriptions only help to choose.
const USER_ROLES = [
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Todo, incluidos los usuarios y sus sesiones.',
    tone: 'accent',
  },
  {
    value: 'manager',
    label: 'Encargado',
    description: 'Vacas, grupos y zonas; asigna collares y carga zonas en ellos.',
    tone: 'primary',
  },
  {
    value: 'veterinarian',
    label: 'Veterinario',
    description: 'Datos de las vacas y eventos sanitarios.',
    tone: 'primary',
  },
  {
    value: 'technician',
    label: 'Técnico',
    description: 'Collares: alta, asignación, configuración y firmware.',
    tone: 'primary',
  },
  {
    value: 'viewer',
    label: 'Consulta',
    description: 'Ve el mapa, el historial y los datos, sin modificar nada.',
    tone: 'neutral',
  },
];

const byValue = new Map(USER_ROLES.map((role) => [role.value, role]));

export function roleInfo(value) {
  return byValue.get(value) ?? { value, label: value, tone: 'neutral' };
}

export default USER_ROLES;
