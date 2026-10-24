import { useState } from 'react';
import useWidth from './useWidth';
import { Legend, Tooltip } from './ChartParts';
import { niceScale, formatNumber, formatX } from '@/utils/explorer';
import styles from './Explorer.module.css';

const BAR = 20;
const GAP = 2;
const BAND_PADDING = 12;
const LABEL_ROOM = 56; // right of the bars: the value at the tip
const RADIUS = 4;

// Bar rounded only at its data end, square at the baseline
function barPath(x0, x1, y, height) {
  const r = Math.min(RADIUS, Math.abs(x1 - x0), height / 2);
  if (x1 >= x0) {
    return `M${x0},${y}H${x1 - r}Q${x1},${y} ${x1},${y + r}V${y + height - r}Q${x1},${y + height} ${x1 - r},${y + height}H${x0}Z`;
  }
  return `M${x0},${y}H${x1 + r}Q${x1},${y} ${x1},${y + r}V${y + height - r}Q${x1},${y + height} ${x1 + r},${y + height}H${x0}Z`;
}

// Horizontal bars per category (one per series), from a zero baseline. The value goes at the tip
// when there is one series; with several, the legend and the tooltip carry them.
export default function BarChart({
  x, series, unit, title,
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const scale = niceScale([...series.flatMap((s) => s.values), 0]);
  const track = Math.max(width - LABEL_ROOM, 40);
  const xAt = (v) => ((v - scale.min) / (scale.max - scale.min)) * track;
  const zero = xAt(0);
  const band = series.length * BAR + (series.length - 1) * GAP + BAND_PADDING;
  const single = series.length === 1;

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartTitle}>{title}{unit && <span> ({unit})</span>}</figcaption>
      <Legend series={series} mark="bar" />

      <div className={styles.bars}>
        {x.keys.map((key, i) => (
          <div key={key} className={styles.barRow}>
            <span className={styles.barLabel} title={x.labels[i]}>{formatX(x.labels[i], x.dimension.id)}</span>
            <div ref={i === 0 ? ref : undefined} className={styles.barTrack}>
              {width > 0 && (
                <svg width={width} height={band} aria-hidden="true">
                  <line className={styles.baseline} x1={zero} x2={zero} y1={0} y2={band} />
                  {series.map((s, j) => {
                    const v = s.values[i];
                    if (v === null) {
                      return null;
                    }
                    const y = BAND_PADDING / 2 + j * (BAR + GAP);
                    const active = hover?.i === i && hover?.j === j;
                    return (
                      <g key={s.key}>
                        <path
                          d={barPath(zero, xAt(v), y, BAR)}
                          className={`${styles.bar} ${active ? styles.barActive : ''}`}
                          style={{ fill: s.color }}
                        />
                        {single && (
                          <text className={styles.valueText} x={Math.max(xAt(v), zero) + 6} y={y + BAR / 2} dy="0.32em">
                            {formatNumber(v)}
                          </text>
                        )}
                        {/* Hit area: the whole slot of the bar, wider than the mark */}
                        <rect
                          className={styles.hitArea}
                          x={0}
                          y={y - GAP}
                          width={track}
                          height={BAR + 2 * GAP}
                          onPointerEnter={() => setHover({ i, j })}
                          onPointerLeave={() => setHover(null)}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}

              {hover?.i === i && (
                <Tooltip
                  title={`${x.labels[i]}${single ? '' : ` · ${series[hover.j].label}`}`}
                  unit={unit}
                  left={Math.max(xAt(series[hover.j].values[i] ?? 0), zero)}
                  top={0}
                  alignRight={xAt(series[hover.j].values[i] ?? 0) > track / 2}
                  rows={[{
                    key: series[hover.j].key,
                    label: series[hover.j].label,
                    color: series[hover.j].color,
                    value: series[hover.j].values[i],
                  }]}
                />
              )}
            </div>
          </div>
        ))}

        <div className={styles.barRow}>
          <span />
          <div className={styles.barAxis}>
            {scale.ticks.map((t) => (
              <span key={t} style={{ left: xAt(t) }}>{formatNumber(t, { compact: true })}</span>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
