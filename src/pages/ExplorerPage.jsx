import { useEffect, useMemo, useState } from 'react';
import { Plus, ChartColumn } from 'lucide-react';

import Page from '../components/ui/Page';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { EmptyState, ErrorState } from '../components/ui/ListState';
import Spinner from '../components/ui/Spinner';
import SelectField from '../components/form/SelectField';
import CheckboxGroupField from '../components/form/CheckboxGroupField';
import FilterRow from '../components/analytics/FilterRow';
import LineChart from '../components/analytics/LineChart';
import BarChart from '../components/analytics/BarChart';
import ResultTable from '../components/analytics/ResultTable';
import styles from '../components/analytics/Explorer.module.css';

import { getCatalog, runQuery } from '../services/analytics';
import {
  RANGE_PRESETS, presetDates, chartsOf, withUnit, MAX_SERIES,
} from '../utils/explorer';
import logger from '../utils/logger';

const MAX_MEASURES = 4;
const MAX_FILTERS = 5;
const DEFAULT_PRESET = '90d';

// Defaults when a dataset is chosen: its first measure, by week if it has dates
function defaultsOf(dataset) {
  const byDate = dataset.dimensions.find((d) => d.id === 'week') ?? dataset.dimensions[0];
  return { measures: [dataset.measures[0].id], dimensions: [byDate?.id ?? '', ''], filters: [] };
}

// Explorer of the dw: the user picks dataset, measures, groups and filters; the backend builds the
// query from its catalog. Results as charts (one per measure) and a table.
export default function ExplorerPage() {
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState(null);
  const [datasetId, setDatasetId] = useState(null);
  const [selection, setSelection] = useState({ measures: [], dimensions: ['', ''], filters: [] });
  const [range, setRange] = useState({ preset: DEFAULT_PRESET, ...presetDates(DEFAULT_PRESET) });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCatalog()
      .then((datasets) => {
        setCatalog(datasets);
        if (datasets.length) {
          setDatasetId(datasets[0].id);
          setSelection(defaultsOf(datasets[0]));
        }
      })
      .catch((err) => {
        logger.error('Error loading the analytics catalog', err);
        setCatalogError(err);
      });
  }, []);

  const dataset = catalog?.find((d) => d.id === datasetId);

  const query = useMemo(() => (dataset && selection.measures.length ? {
    dataset: dataset.id,
    measures: selection.measures,
    dimensions: selection.dimensions.filter(Boolean),
    filters: selection.filters
      .filter((f) => f.dimension && f.values.length)
      .map(({ dimension, values }) => ({ dimension, values })),
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
  } : null), [dataset, selection, range]);
  const queryKey = query && JSON.stringify(query);

  // Runs a moment after the last change; the previous result stays (dimmed) meanwhile
  useEffect(() => {
    if (!queryKey) {
      return undefined;
    }

    let current = true;
    const timer = setTimeout(() => {
      setLoading(true);
      runQuery(JSON.parse(queryKey))
        .then((data) => {
          if (current) {
            setResult({ ...data, key: queryKey });
            setError(null);
          }
        })
        .catch((err) => {
          logger.error('Error running the analytics query', err);
          if (current) {
            setError(err);
          }
        })
        .finally(() => {
          if (current) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [queryKey]);

  const chooseDataset = (id) => {
    setDatasetId(id);
    setSelection(defaultsOf(catalog.find((d) => d.id === id)));
    setResult(null);
  };

  const update = (changes) => setSelection((s) => ({ ...s, ...changes }));

  const setDimension = (index, value) => {
    const dimensions = [...selection.dimensions];
    dimensions[index] = value;
    if (index === 0 && (!value || value === dimensions[1])) {
      dimensions[1] = '';
    }
    update({ dimensions });
  };

  // Filters keep an id of their own: they are added and removed in any order
  const setFilter = (id, filter) => update({
    filters: selection.filters.map((f) => (f.id === id ? { ...filter, id } : f)),
  });

  if (catalogError) {
    return (
      <Page title="Análisis" width="full">
        <ErrorState title="No se pudo cargar el catálogo de consultas." error={catalogError} />
      </Page>
    );
  }

  if (!catalog) {
    return (
      <Page title="Análisis" width="full">
        <Spinner />
      </Page>
    );
  }

  if (!dataset) {
    return (
      <Page title="Análisis" width="full">
        <EmptyState icon={ChartColumn} title="No hay datos disponibles para su rol" />
      </Page>
    );
  }

  const dimensionOptions = dataset.dimensions.map((d) => ({ value: d.id, label: d.label }));
  const measureOptions = dataset.measures.map((m) => ({
    value: m.id,
    label: m.unit ? `${m.label} (${m.unit})` : m.label,
    disabled: selection.measures.length >= MAX_MEASURES && !selection.measures.includes(m.id),
  }));

  const shaped = result && result.rows.length ? chartsOf(result, dataset.dimensions) : null;

  return (
    <Page title="Análisis" width="full">
      <div className={styles.layout}>
        <Card padded className={styles.controls}>
          <div className={styles.controlRow}>
            <SelectField
              label="Datos"
              name="dataset"
              value={dataset.id}
              onChange={(e) => chooseDataset(e.target.value)}
              options={catalog.map((d) => ({ value: d.id, label: d.label }))}
            />
            <div>
              <div className={styles.presets} role="group" aria-label="Período">
                {RANGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.preset}
                    aria-pressed={range.preset === p.id}
                    onClick={() => setRange({ preset: p.id, ...presetDates(p.id) })}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className={styles.dates}>
                <input
                  type="date"
                  aria-label="Desde"
                  value={range.dateFrom}
                  max={range.dateTo}
                  onChange={(e) => e.target.value && setRange((r) => ({ ...r, preset: null, dateFrom: e.target.value }))}
                />
                a
                <input
                  type="date"
                  aria-label="Hasta"
                  value={range.dateTo}
                  min={range.dateFrom}
                  onChange={(e) => e.target.value && setRange((r) => ({ ...r, preset: null, dateTo: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <p className={styles.description}>{dataset.description}</p>

          <div className={styles.controlRow}>
            <CheckboxGroupField
              label={`Medidas (hasta ${MAX_MEASURES})`}
              name="measures"
              values={selection.measures}
              onChange={(e) => update({ measures: e.target.value })}
              options={measureOptions}
            />
            <div className={styles.filters}>
              <SelectField
                label="Agrupar por"
                name="dimension0"
                value={selection.dimensions[0]}
                onChange={(e) => setDimension(0, e.target.value)}
                options={[{ value: '', label: 'Sin agrupar' }, ...dimensionOptions]}
              />
              <SelectField
                label="Y por"
                name="dimension1"
                value={selection.dimensions[1]}
                onChange={(e) => setDimension(1, e.target.value)}
                options={[
                  { value: '', label: 'Nada más' },
                  ...dimensionOptions.filter((d) => d.value !== selection.dimensions[0]),
                ]}
                disabled={!selection.dimensions[0]}
                hint={`Cada valor es una serie (hasta ${MAX_SERIES} en el gráfico).`}
              />
            </div>
          </div>

          <div className={styles.filters}>
            {selection.filters.map((filter) => (
              <FilterRow
                key={filter.id}
                filter={filter}
                dimensions={dataset.dimensions}
                dataset={dataset.id}
                dateFrom={range.dateFrom}
                dateTo={range.dateTo}
                onChange={(f) => setFilter(filter.id, f)}
                onRemove={() => update({ filters: selection.filters.filter((f) => f.id !== filter.id) })}
              />
            ))}
            {selection.filters.length < MAX_FILTERS && (
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Plus}
                  onClick={() => update({
                    filters: [...selection.filters, { id: crypto.randomUUID(), dimension: '', values: [] }],
                  })}
                >
                  Agregar filtro
                </Button>
              </div>
            )}
          </div>
        </Card>

        {error && <ErrorState title="No se pudo hacer la consulta." error={error} />}

        {result && (
          <div className={`${styles.results} ${loading ? styles.loading : ''}`} aria-busy={loading}>
            {result.rows.length === 0 && <p className={styles.notice}>No hay datos para esta consulta en el período elegido.</p>}
            {result.truncated && <p className={styles.notice}>Se muestran las primeras {result.rows.length} filas: acote el período o los filtros.</p>}

            {shaped?.kind === 'stat' && (
              <div className={styles.stats}>
                {shaped.measures.map((m) => (
                  <div key={m.id} className={styles.stat}>
                    <div className={styles.statLabel}>{m.label}</div>
                    <div className={styles.statValue}>{withUnit(m.value, null)}{m.unit && <span> {m.unit}</span>}</div>
                  </div>
                ))}
              </div>
            )}

            {shaped && shaped.kind !== 'stat' && shaped.tooMany && (
              <p className={styles.notice}>
                Hay más de {MAX_SERIES} valores de «{shaped.seriesDimension.label}»: el gráfico no los
                distinguiría. Filtre algunos, o vea todos en la tabla.
              </p>
            )}

            {shaped && shaped.kind !== 'stat' && !shaped.tooMany && (
              <div className={styles.charts}>
                {shaped.charts.map(({ measure, series }) => (shaped.kind === 'line'
                  ? <LineChart key={measure.id} x={shaped.x} series={series} unit={measure.unit} title={measure.label} />
                  : <BarChart key={measure.id} x={shaped.x} series={series} unit={measure.unit} title={measure.label} />))}
              </div>
            )}

            {result.rows.length > 0 && <ResultTable result={result} name={`${dataset.id}-${range.dateFrom}-${range.dateTo}`} />}
          </div>
        )}
      </div>
    </Page>
  );
}
