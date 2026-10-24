import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  FormField, FormActions, formStyles, ImageField, SelectField, MultiSelectField,
} from '@/shared/ui/form';
import { Page } from '@/shared/ui/page';
import { Card } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';

import {
  getCow, getAllCows, updateCow, createCow, cowLabel, SEX_LABELS,
} from '@/entities/cow';
import { getAllCollars, collarLabel } from '@/entities/collar';
import { getAllBreeds } from '@/entities/breed';
import { getAllGroups } from '@/entities/group';
import { getAllCategories } from '@/entities/category';
import { useCan } from '@/entities/viewer';

import { logger } from '@/shared/lib/logger';
import { toDateInput } from '@/shared/lib/date';

const sexOptions = Object.entries(SEX_LABELS).map(([value, label]) => ({ value, label }));

const emptyForm = {
  alias: '',
  earTag: '',
  currentCollarId: '',
  imageUrl: '',
  breedId: '',
  sex: '',
  categoryId: '',
  groupIds: [],
  birthDate: '',
};

export default function CowFormPage() {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // undefined: unchanged, File: new image, null: remove the current one
  const [imageChange, setImageChange] = useState(undefined);

  const [collars, setCollars] = useState([]);
  // collarId -> cow that has it now (to warn before taking it away)
  const [collarOwners, setCollarOwners] = useState(new Map());
  const [initialCollarId, setInitialCollarId] = useState('');
  const [breeds, setBreeds] = useState([]);
  // [{ id, name, sex }]: the form offers those of the cow's sex
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    collars: false,
    breeds: false,
    categories: false,
    groups: false,
  });

  const { cowId } = useParams();
  const navigate = useNavigate();

  // The collar is equipment (manager, technician); the rest is cow data (manager, veterinarian).
  // Fields the user can't change are shown disabled and not sent.
  const can = useCan();
  const canWrite = can('cows:write');
  const canAssignCollar = can('cows:assignCollar');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(form => ({
      ...form,
      [name]: value,
    }));
  };

  // A category is for one sex: changing the sex drops a category of the other one
  const handleSexChange = (e) => {
    const sex = e.target.value;

    setForm(form => {
      const category = categories.find((c) => c.id === form.categoryId);

      return {
        ...form,
        sex,
        categoryId: category && category.sex !== sex ? '' : form.categoryId,
      };
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }
    setError(null);

    try {
      setSaving(true);

      const formData = new FormData();
      const isEdit = Boolean(form.id);

      if (canWrite) {
        ['alias', 'earTag', 'breedId', 'sex', 'birthDate'].forEach((key) => {
          if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
            formData.append(key, form[key]);
          }
        });

        form.groupIds.forEach((groupId) => {
          formData.append('groupIds[]', groupId);
        });

        // A form can't send an empty list: an empty value means "no groups"
        if (form.groupIds.length === 0) {
          formData.append('groupIds', '');
        }

        // Editing: always sent, empty removes the category. New cow: only when chosen.
        if (isEdit || form.categoryId !== '') {
          formData.append('categoryId', form.categoryId);
        }

        if (imageChange) {
          formData.append('image', imageChange);
        } else if (imageChange === null && form.imageUrl) {
          formData.append('removeImage', 'true');
        }
      }

      // Editing: always sent, empty unassigns the collar. New cow: only when chosen.
      if (canAssignCollar && (isEdit || form.currentCollarId !== '')) {
        formData.append('currentCollarId', form.currentCollarId);
      }

      if (form.id) {
        await updateCow(form.id, formData);
      } else {
          await createCow(formData);
      }

      navigate(form.id ? `/settings/cows/${form.id}` : '/settings/cows');

    } catch (err) {
      logger.error(err);
      setError(
        (err.name === 'ApiError' ? err?.message : null) || 'No se pudo guardar la vaca.'
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!cowId) {
      return;
    }

    let cancelled = false;

    getCow(cowId)
      .then((cow) => {
        if (!cancelled) {
          setInitialCollarId(cow.currentCollarId ?? '');
          setForm({
            ...cow,
            alias: cow.alias ?? '',
            earTag: cow.earTag ?? '',
            breedId: cow.breedId ?? '',
            imageUrl: cow.imageUrl ?? '',
            currentCollarId: cow.currentCollarId ?? '',
            sex: cow.sex ?? '',
            categoryId: cow.categoryId ?? '',
            birthDate: toDateInput(cow.birthDate),
            groupIds: cow.groups ? cow.groups.map(g => g.id) : [],
          });
        }
      })
      .catch((err) => {
        logger.error('Error loading cow', err);
        setError('No se pudo cargar la vaca.');
      });

    return () => { cancelled = true; }

  }, [cowId]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(prev => ({ ...prev, collars: true }));
        const [collarsData, cowsData] = await Promise.all([getAllCollars(), getAllCows()]);
        setCollars(collarsData.map(collar => ({
          value: collar.id,
          label: collarLabel(collar),
        })));
        setCollarOwners(new Map(cowsData
          .filter((cow) => cow.currentCollarId)
          .map((cow) => [cow.currentCollarId, cow])));
      } catch (err) {
        logger.error('Error loading collars', err);
      } finally {
        setLoadingOptions(prev => ({ ...prev, collars: false }));
      }

      try {
        setLoadingOptions(prev => ({ ...prev, breeds: true }));
        const breedsData = await getAllBreeds();
        setBreeds(breedsData.map(breed => ({
          value: breed.id,
          label: breed.name,
        })));
      } catch (err) {
        logger.error('Error loading breeds', err);
      } finally {
        setLoadingOptions(prev => ({ ...prev, breeds: false }));
      }

      try {
        setLoadingOptions(prev => ({ ...prev, categories: true }));
        setCategories(await getAllCategories());
      } catch (err) {
        logger.error('Error loading categories', err);
      } finally {
        setLoadingOptions(prev => ({ ...prev, categories: false }));
      }

      try {
        setLoadingOptions(prev => ({ ...prev, groups: true }));
        const groupsData = await getAllGroups();
        setGroups(groupsData.map(group => ({
          value: group.id,
          label: group.name,
        })));
      } catch (err) {
        logger.error('Error loading groups', err);
      } finally {
        setLoadingOptions(prev => ({ ...prev, groups: false }));
      }
    };

    loadOptions();
  }, []);

  // Collars on another cow say so: choosing one takes it from that cow
  const otherOwner = (collarId) => {
    const owner = collarOwners.get(collarId);
    return owner && owner.id !== form.id ? owner : null;
  };

  const collarOptions = [
    { value: '', label: 'Sin collar' },
    ...collars.map((option) => {
      const owner = otherOwner(option.value);
      return owner ? { ...option, label: `${option.label}\u00A0· ${cowLabel(owner)}` } : option;
    }),
  ];

  const selectedOwner = form.currentCollarId !== '' ? otherOwner(form.currentCollarId) : null;
  const unassigning = Boolean(initialCollarId) && form.currentCollarId === '';

  const collarHint = !canAssignCollar
    ? 'Solo un encargado o un técnico pueden cambiar el collar.'
    : selectedOwner
      ? `Está asignado a ${cowLabel(selectedOwner)}: se le quitará al guardar.`
      : unassigning ? 'El collar actual se desasignará al guardar.' : null;

  const categoryOptions = [
    { value: '', label: 'Sin categoría' },
    ...categories
      .filter((category) => category.sex === form.sex)
      .map((category) => ({ value: category.id, label: category.name })),
  ];

  return (
    <Page
      title={cowId ? 'Editar vaca' : 'Nueva vaca'}
      backTo={cowId ? `/settings/cows/${cowId}` : '/settings/cows'}
      width="narrow"
    >
      <Card
        padded
        as="form"
        onSubmit={handleSubmit}
        className={formStyles.form}
      >
        {error && <Alert tone="danger">{error}</Alert>}

        <FormField
          label="Alias"
          name="alias"
          value={form.alias}
          onChange={handleChange}
          placeholder="Nombre de la vaca"
          required
          disabled={!canWrite}
        />

        <FormField
          label="Caravana"
          name="earTag"
          value={form.earTag}
          onChange={handleChange}
          placeholder="Número de caravana"
          disabled={!canWrite}
        />

        <SelectField
          label="Collar asignado"
          name="currentCollarId"
          value={form.currentCollarId}
          onChange={handleChange}
          options={collarOptions}
          placeholder="Seleccione un collar"
          loading={loadingOptions.collars}
          disabled={!canAssignCollar}
          hint={collarHint}
        />

        {canWrite && (
          <ImageField
            key={form.imageUrl || 'no-image'}
            label="Imagen"
            initialImage={form.imageUrl}
            onChange={setImageChange}
          />
        )}

        <SelectField
          label="Raza"
          name="breedId"
          value={form.breedId}
          onChange={handleChange}
          options={breeds}
          placeholder="Seleccione una raza"
          loading={loadingOptions.breeds}
          disabled={!canWrite}
        />

        <SelectField
          label="Sexo"
          name="sex"
          value={form.sex}
          onChange={handleSexChange}
          options={sexOptions}
          placeholder="Seleccione el sexo"
          disabled={!canWrite}
        />

        <SelectField
          label="Categoría"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          options={categoryOptions}
          placeholder="Seleccione una categoría"
          loading={loadingOptions.categories}
          disabled={!canWrite || !form.sex}
          hint={form.sex ? null : 'Elija primero el sexo.'}
        />

        <MultiSelectField
          label="Grupos"
          name="groupIds"
          values={form.groupIds}
          onChange={handleChange}
          options={groups}
          placeholder="Seleccione un grupo"
          disabled={!canWrite}
        />

        <FormField
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
          disabled={!canWrite}
        />

        {/* Actions */}
        <FormActions
          onCancel={handleCancel}
          saving={saving}
        />
      </Card>
    </Page>
  );
}
