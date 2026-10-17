import Alert from '../ui/Alert';

export default function ActionError({
  error,
  onClose,
}) {
  if (!error) {
    return null;
  }

  const message =
    error?.name === 'ApiError'
      ? error.message
      : 'No se pudo completar la operación.';

  return (
    <Alert tone="danger" onClose={onClose}>
      {message}
    </Alert>
  );
}
