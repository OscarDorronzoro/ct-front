import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from '@/shared/api';
import { logger } from '@/shared/lib/logger';

// State of a create / edit form:
// - id: the entity to edit (undefined: new). load(id) loads it and toForm(entity) gives the
//   form values; `entity` keeps what was loaded (to compare with the original values).
// - empty: the values of a new form, or a function that returns them (computed when it opens).
// - validate(form): message of what's missing, or null. save(form): creates or updates.
// - onSaved(): after saving (navigate back).
// - messages: { load, save } shown when loading or saving fails for an unknown reason (a known
//   API error shows its own message).
// load and toForm must keep their identity (module functions): a new one loads again.
export default function useEntityForm({
  id, empty, load, toForm, validate, save, onSaved, messages,
}) {
  const [form, setForm] = useState(empty);
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(Boolean(id && load));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id || !load) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    load(id)
      .then((loaded) => {
        if (!cancelled) {
          setEntity(loaded);
          setForm(toForm(loaded));
        }
      })
      .catch((err) => {
        logger.error('Error loading the form', err);
        if (!cancelled) {
          setError(errorMessage(err, messages.load));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id, load, toForm, messages.load]);

  // For the inputs: { target: { name, value } }
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    const invalid = validate?.(form);
    if (invalid) {
      setError(invalid);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await save(form);
      onSaved();
    } catch (err) {
      logger.error('Error saving the form', err);
      setError(errorMessage(err, messages.save));
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    setForm,
    handleChange,
    handleSubmit,
    entity,
    loading,
    saving,
    error,
    clearError: () => setError(null),
  };
}
