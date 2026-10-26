import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SelectField, MultiSelectField } from '@/shared/ui/form';
import { IconButton } from '@/shared/ui/button';
import { getDimensionValues } from '../api/analyticsApi';
import { logger } from '@/shared/lib/logger';
import styles from './Explorer.module.css';

// One filter: a dimension and the values to keep (the ones the dimension has in the range)
export default function FilterRow({
  filter, dimensions, dataset, dateFrom, dateTo, onChange, onRemove,
}) {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (!filter.dimension) {
      return undefined;
    }

    let cancelled = false;
    getDimensionValues({
      dataset, dimension: filter.dimension, dateFrom, dateTo,
    })
      .then((values) => {
        if (!cancelled) {
          setOptions(values.map((v) => ({ value: v.value, label: String(v.label) })));
        }
      })
      .catch((err) => logger.error('Error loading filter values', err));

    return () => { cancelled = true; };
  }, [dataset, filter.dimension, dateFrom, dateTo]);

  return (
    <div className={styles.filterRow}>
      <SelectField
        ariaLabel="Filtrar por"
        name="dimension"
        value={filter.dimension}
        onChange={(e) => onChange({ dimension: e.target.value, values: [] })}
        options={dimensions.map((d) => ({ value: d.id, label: d.label }))}
        placeholder="Filtrar por…"
      />
      <MultiSelectField
        name="values"
        values={filter.values}
        onChange={(e) => onChange({ ...filter, values: e.target.value })}
        options={options}
        placeholder={filter.dimension ? 'Elija un valor' : 'Elija primero qué filtrar'}
        disabled={!filter.dimension}
      />
      <IconButton icon={X} label="Quitar filtro" onClick={onRemove} />
    </div>
  );
}
