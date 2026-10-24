// Permissions come from the backend (GET /auth/me): the UI only shows what the user can do,
// the backend enforces it.

// Whether the user has any of the permissions
export function can(user: { permissions: string[] } | null | undefined, ...permissions: string[]) {
  const granted = user?.permissions ?? [];
  return permissions.some((permission) => granted.includes(permission));
}
