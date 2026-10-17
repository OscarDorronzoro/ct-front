import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';
import formStyles from '../components/form/Form.module.css';
import Page from '../components/ui/Page';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import ImageField from '../components/form/ImageField';
import SelectField from '../components/form/SelectField';
import MultiSelectField from '../components/form/MultiSelectField';

import {
  getCow, getAllCows, updateCow, createCow,
} from '../services/cow';
import { getAllCollars } from '../services/collar';
import { getAllBreeds } from '../services/breed';
import { getAllGroups } from '../services/group';

import logger from '../utils/logger';
import { toDateInput } from '../utils/dateHelper';
import { collarLabel, cowLabel } from '../utils/labels';

const emptyForm = {
  alias: '',
  earTag: '',
  currentCollarId: '',
  imageUrl: '',
  breedId: '',
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
  const [groups, setGroups] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    collars: false,
    breeds: false,
    groups: false,
  });

  const { cowId } = useParams();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(form => ({
      ...form,
      [name]: value,
    }));
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

      ['alias', 'earTag', 'breedId', 'birthDate'].forEach((key) => {
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

      // Editing: always sent, empty unassigns the collar. New cow: only when chosen.
      if (isEdit || form.currentCollarId !== '') {
        formData.append('currentCollarId', form.currentCollarId);
      }

      if (imageChange) {
        formData.append('image', imageChange);
      } else if (imageChange === null && form.imageUrl) {
        formData.append('removeImage', 'true');
      }

      if (form.id) {
        await updateCow(form.id, formData);
      } else {
          await createCow(formData);
      }

      navigate('/settings/cows');

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
            currentCollarId: cow.currentCollarId ?? '',
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

  const collarHint = selectedOwner
    ? `Está asignado a ${cowLabel(selectedOwner)}: se le quitará al guardar.`
    : unassigning ? 'El collar actual se desasignará al guardar.' : null;

  return (
    <Page
      title={cowId ? 'Editar vaca' : 'Nueva vaca'}
      backTo="/settings/cows"
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
        />

        <FormField
          label="Caravana"
          name="earTag"
          value={form.earTag}
          onChange={handleChange}
          placeholder="Número de caravana"
        />

        <SelectField
          label="Collar asignado"
          name="currentCollarId"
          value={form.currentCollarId}
          onChange={handleChange}
          options={collarOptions}
          placeholder="Seleccione un collar"
          loading={loadingOptions.collars}
          hint={collarHint}
        />

        <ImageField
          key={form.imageUrl || 'no-image'}
          label="Imagen"
          initialImage={form.imageUrl}
          onChange={setImageChange}
        />

        <SelectField
          label="Raza"
          name="breedId"
          value={form.breedId}
          onChange={handleChange}
          options={breeds}
          placeholder="Seleccione una raza"
          loading={loadingOptions.breeds}
        />

        <MultiSelectField
          label="Grupos"
          name="groupIds"
          values={form.groupIds}
          onChange={handleChange}
          options={groups}
          placeholder="Seleccione un grupo"
        />

        <FormField
          label="Fecha de nacimiento"
          name="birthDate"
          type="date"
          value={form.birthDate}
          onChange={handleChange}
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
