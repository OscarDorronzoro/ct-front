// Display names of the entities

export function collarLabel(collar) {
  return `Collar ${collar.code ?? collar.id}`;
}

export function cowLabel(cow) {
  return cow.alias || `Vaca ${cow.id}`;
}

export function groupLabel(group) {
  return group.name || `Grupo ${group.id}`;
}

export function userLabel(user) {
  return user.username || `Usuario ${user.id}`;
}
