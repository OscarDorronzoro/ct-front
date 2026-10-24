import { errorMessage } from '@/shared/api';
import Alert from './Alert';

export default function ActionError({
  error,
  onClose,
}) {
  if (!error) {
    return null;
  }

  const message = errorMessage(error, 'No se pudo completar la operación.');

  return (
    <Alert tone="danger" onClose={onClose}>
      {message}
    </Alert>
  );
}
