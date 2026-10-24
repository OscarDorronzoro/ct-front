import { useState } from 'react';
import useWidth from './useWidth';
import { Legend, Tooltip } from './ChartParts';
import { formatNumber } from '@/shared/lib/format';
import { niceScale, formatX } from '../model/explorer';
import styles from './Explorer.module.css';

const HEIGHT = 240;
const MARGIN = {
  top: 12, right: 20, bottom: 28, left: 52,
};

// Line per series along the dates; nulls break the line. Crosshair + tooltip with every series.
export default function LineChart({
  x, series, unit, title,
}) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);

  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 40);
  const innerHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const n = x.keys.length;
  const scale = niceScale(series.flatMap((s) => s.values));

  const xAt = (i) => (n === 1 ? innerWidth / 2 : (i * innerWidth) / (n - 1));
  const yAt = (v) => innerHeight - ((v - scale.min) / (scale.max - scale.min)) * innerHeight;

  // Path with a new segment after each gap
  const pathOf = (values) => values.reduce((d, v, i) => {
    if (v === null) {
      return d;
    }
    const command = i === 0 || values[i - 1] === null ? 'M' : 'L';
    return `${d}${command}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`;
  }, '');

  const lastIndex = (values) => values.findLastIndex((v) => v !== null);

  const anchorAt = (px) => {
    if (px < 30) {
      return 'start';
    }
    return px > innerWidth - 30 ? 'end' : 'middle';
  };

  // As many date labels as fit without touching: ~6.5 px per character of the longest, plus air
  const xLabel = (i) => formatX(x.labels[i], x.dimension.id);
  const labelWidth = Math.max(...x.keys.map((_, i) => xLabel(i).length)) * 6.5 + 16;
  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(innerWidth / labelWidth))));

  const pick = (clientX, target) => {
    const box = target.getBoundingClientRect();
    const px = clientX - box.left;
    setHover(Math.min(n - 1, Math.max(0, Math.round((px / box.width) * (n - 1)))));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const step = e.key === 'ArrowRight' ? 1 : -1;
      setHover((h) => Math.min(n - 1, Math.max(0, (h ?? (step > 0 ? -1 : n)) + step)));
    }
  };

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartTitle}>{title}{unit && <span> ({unit})</span>}</figcaption>
      <Legend series={series} mark="line" />

      <div ref={ref} className={styles.plot}>
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={`${title}: gráfico de líneas. Use las flechas para recorrer los valores.`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onBlur={() => setHover(null)}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
              {scale.ticks.map((t) => (
                <g key={t}>
                  <line className={styles.grid} x1={0} x2={innerWidth} y1={yAt(t)} y2={yAt(t)} />
                  <text className={styles.axisText} x={-8} y={yAt(t)} dy="0.32em" textAnchor="end">
                    {formatNumber(t, { compact: true })}
                  </text>
                </g>
              ))}

              {/* Labels at the edges align inwards, so they aren't cut */}
              {x.keys.map((key, i) => (i % every === 0 ? (
                <text
                  key={key}
                  className={styles.axisText}
                  x={xAt(i)}
                  y={innerHeight + 18}
                  textAnchor={anchorAt(xAt(i))}
                >
                  {xLabel(i)}
                </text>
              ) : null))}

              {series.map((s) => (
                <path key={s.key} d={pathOf(s.values)} className={styles.line} style={{ stroke: s.color }} />
              ))}

              {/* Lone points (between gaps) and the end of each series */}
              {series.flatMap((s) => s.values.map((v, i) => {
                const gapAround = (s.values[i - 1] ?? null) === null && (s.values[i + 1] ?? null) === null;
                const lone = v !== null && gapAround;
                return v !== null && (lone || i === lastIndex(s.values)) ? (
                  <circle key={`${s.key}-${x.keys[i]}`} className={styles.dot} cx={xAt(i)} cy={yAt(v)} r={4} style={{ fill: s.color }} />
                ) : null;
              }))}

              {hover !== null && (
                <g>
                  <line className={styles.crosshair} x1={xAt(hover)} x2={xAt(hover)} y1={0} y2={innerHeight} />
                  {series.map((s) => (s.values[hover] === null ? null : (
                    <circle key={s.key} className={styles.dot} cx={xAt(hover)} cy={yAt(s.values[hover])} r={4} style={{ fill: s.color }} />
                  )))}
                </g>
              )}

              {/* The hit area is the whole plot: the pointer finds the nearest date */}
              <rect
                className={styles.hitArea}
                width={innerWidth}
                height={innerHeight}
                onPointerMove={(e) => pick(e.clientX, e.currentTarget)}
                onPointerLeave={() => setHover(null)}
              />
            </g>
          </svg>
        )}

        {hover !== null && (
          <Tooltip
            title={xLabel(hover)}
            unit={unit}
            left={MARGIN.left + xAt(hover)}
            top={MARGIN.top}
            alignRight={xAt(hover) > innerWidth / 2}
            rows={series
              .filter((s) => s.values[hover] !== null)
              .map((s) => ({
                key: s.key, label: s.label, color: s.color, value: s.values[hover],
              }))}
          />
        )}
      </div>
    </figure>
  );
}
