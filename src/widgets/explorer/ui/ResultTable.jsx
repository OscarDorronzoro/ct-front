import { Download } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { formatNumber, toCsv } from '../model/explorer';
import styles from './Explorer.module.css';

// Byte order mark: lets spreadsheets open the accents of the file right
const BOM = String.fromCharCode(0xfeff);

function download(result, name) {
  const blob = new Blob([BOM, toCsv(result)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${name}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// The dimension values identify a row (the result is grouped by them)
const rowKey = (row) => row
  .filter((cell) => cell !== null && typeof cell === 'object')
  .map((cell) => cell.value)
  .join('|') || 'total';

// Every value of the result: the view that doesn't depend on colors or on hovering
export default function ResultTable({ result, name }) {
  return (
    <section className={styles.tableCard} aria-label="Tabla de resultados">
      <div className={styles.tableHeader}>
        <span>{result.rows.length} {result.rows.length === 1 ? 'fila' : 'filas'}</span>
        <Button size="sm" variant="secondary" icon={Download} onClick={() => download(result, name)}>
          CSV
        </Button>
      </div>

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {result.columns.map((c) => (
                <th key={c.id} className={c.kind === 'measure' ? styles.num : undefined}>
                  {c.label}{c.unit ? ` (${c.unit})` : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={rowKey(row)}>
                {row.map((value, c) => (result.columns[c].kind === 'measure'
                  ? <td key={result.columns[c].id} className={styles.num}>{formatNumber(value)}</td>
                  : <td key={result.columns[c].id}>{value.label}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
