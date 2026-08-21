import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import FormField from '../components/form/FormField';
import FormActions from '../components/form/FormActions';
import ImageField from '../components/form/ImageField';
import SelectField from '../components/form/SelectField';
import MultiSelectField from '../components/form/MultiSelectField';

import { getCow, updateCow, createCow } from '../services/cow';
import { getAllCollars } from '../services/collar';
import { getAllBreeds } from '../services/breed';
import { getAllGroups } from '../services/group';

import useIsMobile from '../hooks/useIsMobile';
import logger from '../utils/logger';

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
  const [imageFile, setImageFile] = useState(null);

  const [collars, setCollars] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState({
    collars: false,
    breeds: false,
    groups: false,
  });

  const { cowId } = useParams();
  const isMobile = useIsMobile();
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

      Object.keys(form).forEach(key => {
        if (key === 'imageUrl') {return;}

        if (key === 'groupIds') {
          form.groupIds.forEach(groupId => {
            formData.append('groupIds[]', groupId);
          });
        } else if (form[key] !== null && form[key] !== undefined && form[key] !== '') {
          formData.append(key, form[key]);
        }
      });

      if (imageFile) {
        formData.append('image', imageFile);
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
          setForm({
            ...cow,
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
        const collarsData = await getAllCollars();
        setCollars(collarsData.map(collar => ({
          value: collar.id,
          label: collar.name || `Collar ${collar.id}`,
        })));
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

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* Header */}
      <div style={{
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        background: '#ffffff',
        borderBottom: '1px solid #ddd',
        gap: '12px',
      }}>
        <div style={{
          fontWeight: 'bold',
          color: '#5e3b2c',
          margin: '0 auto',
          fontSize: 18,
        }}>
          <h2>{cowId ? 'Editar' : 'Crear'} vaca</h2>
        </div>

      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? '20px 16px' : '30px 20px'
      }}>
        <form
          style={{
            width: '80%',
            maxWidth: isMobile ? '500px' : '650px',
            margin: '0 auto',
            marginBottom: isMobile ? 60 : 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            padding: '20px 30px 10px 30px',
            borderRadius: 10,
            backgroundColor: 'white',
          }}
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              role="alert"
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

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
            options={collars}
            placeholder="Seleccione un collar"
            loading={loadingOptions.collars}
          />

          <ImageField
            key={form.imageUrl || 'no-image'}
            label="Imagen"
            initialImage={form.imageUrl}
            onChange={setImageFile}
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
        </form>
      </div>



    </div>
  );
}
