const FORBIDDEN = 'No tiene permiso para hacer esto.';

// Text for the user of each error code of the backend ({ error: CODE } in the response body).
// A code that isn't here gets the message of its HTTP status (statusMessage).
export const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Hay datos inválidos. Revise el formulario.',
  FORBIDDEN,

  // Livestock
  COW_NOT_FOUND: 'La vaca no existe o fue eliminada.',
  BREED_NOT_FOUND: 'La raza no existe.',
  BREED_ALREADY_EXISTS: 'Ya existe una raza con ese nombre.',
  CATEGORY_NOT_FOUND: 'La categoría no existe.',
  CATEGORY_SEX_MISMATCH: 'La categoría no corresponde al sexo de la vaca.',
  SEX_REQUIRED_FOR_CATEGORY: 'Indique el sexo para poder asignar una categoría.',
  GROUP_NOT_FOUND: 'El grupo no existe o fue eliminado.',
  INVALID_IMAGE: 'La imagen no es válida. Pruebe con una foto JPG, PNG o WebP.',
  LIMIT_FILE_SIZE: 'La imagen es demasiado grande.',

  // Health
  EVENT_NOT_FOUND: 'El evento no existe.',
  EVENT_ALREADY_VOIDED: 'El evento ya estaba anulado.',
  CASTRATION_REQUIRES_MALE: 'Solo se puede castrar a un macho.',
  ALREADY_CASTRATED: 'La vaca ya tiene una castración registrada.',
  PRODUCT_NOT_FOUND: 'El producto no existe.',
  PRODUCT_ALREADY_EXISTS: 'Ya existe un producto con ese nombre.',
  PRODUCT_INACTIVE: 'El producto está inactivo: actívelo para usarlo en eventos nuevos.',
  PRODUCT_TYPE_MISMATCH: 'El producto no es del tipo que corresponde a este evento.',

  // Devices
  COLLAR_NOT_FOUND: 'El collar no existe o fue eliminado.',
  COLLAR_CODE_IN_USE: 'Ya existe un collar con ese código.',
  COLLAR_MAC_IN_USE: 'Ya existe un collar con esa MAC.',
  NO_FREE_COLLAR_CODE: 'No quedan códigos libres (1 a 255).',
  COMMAND_NOT_FOUND: 'El comando no existe.',
  COMMAND_FINISHED: 'El comando ya terminó.',
  INVALID_COMMAND: 'El comando no es válido para este collar.',
  FIRMWARE_NOT_FOUND: 'El firmware no existe.',
  FIRMWARE_CODE_IN_USE: 'Ya existe un firmware con ese código.',
  FIRMWARE_VERSION_IN_USE: 'Ya existe un firmware con esa versión.',
  INVALID_FIRMWARE: 'El archivo de firmware no es válido.',

  // Zones
  ZONE_NOT_FOUND: 'La zona no existe o fue eliminada.',
  INVALID_ZONE: 'La zona no es válida: los lados del polígono no pueden cruzarse.',

  // Users
  USER_NOT_FOUND: 'El usuario no existe o fue eliminado.',
  USERNAME_ALREADY_EXISTS: 'Ya existe un usuario con ese nombre.',
  CANNOT_DELETE_YOURSELF: 'No puede eliminar su propio usuario.',
  CANNOT_REMOVE_OWN_ADMIN_ROLE: 'No puede quitarse el rol de administrador.',
  LAST_ADMIN: 'Tiene que quedar al menos un administrador.',
  SESSION_NOT_FOUND: 'La sesión ya no existe.',

  // Analytics
  QUERY_TIMEOUT: 'La consulta tardó demasiado: acote el período o los agrupamientos.',
  UNKNOWN_DATASET: 'Esos datos ya no están disponibles.',
  UNKNOWN_MEASURE: 'Una de las medidas ya no está disponible.',
  UNKNOWN_DIMENSION: 'Uno de los agrupamientos ya no está disponible.',
  UNKNOWN_SORT: 'El orden elegido no es válido.',
};

// Any other failure: the caller can say which action failed instead (errorMessage)
export const GENERIC_MESSAGE = 'Error al comunicarse con el servidor';

// For codes without a text (and for the old "X not found" messages of some routes)
export function statusMessage(status: number) {
  if (status === 403) {
    return FORBIDDEN;
  }
  if (status === 404) {
    return 'No se encontró lo que buscabas: puede haber sido eliminado.';
  }
  if (status === 413) {
    return 'El archivo es demasiado grande.';
  }
  if (status >= 500) {
    return 'El servidor tuvo un problema. Intente de nuevo en unos segundos.';
  }
  return GENERIC_MESSAGE;
}
