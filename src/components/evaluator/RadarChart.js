import React from 'react';

// Dependency-free SVG radar. `series` values are on a 1–5 scale; null plots at the centre.
export default function RadarChart({axes, series, size = 300}) {
  // Wide side padding so long axis labels are never clipped.
  const padX = 130;
  const padY = 52;
  const w = size + padX * 2;
  const h = size + padY * 2;
  const cx = w / 2;
  const cy = h / 2;
  const R = size / 2;
  const n = axes.length;
  const angle = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i, v) => {
    const r = (Math.max(0, (v ?? 0) - 0) / 5) * R;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  };
  const ring = (v) => axes.map((_, i) => pt(i, v).join(',')).join(' ');

  return (
    <svg className="ie-radar" viewBox={`0 0 ${w} ${h}`} role="img"
      aria-label={`Radar chart: ${series.map((s) => `${s.name}: ${axes.map((a, i) => `${a.label} ${s.values[i] ?? 'unscored'}`).join(', ')}`).join('; ')}`}>
      {[1, 2, 3, 4, 5].map((v) => (
        <polygon key={v} points={ring(v)} className={v === 3 ? 'ie-radar-ring mid' : 'ie-radar-ring'} />
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 5);
        return <line key={a.label} x1={cx} y1={cy} x2={x} y2={y} className="ie-radar-axis" />;
      })}
      {[1, 3, 5].map((v) => (
        <text key={v} x={cx + 4} y={cy - (v / 5) * R + 4} className="ie-radar-tick">{v}</text>
      ))}
      {series.map((s, si) => (
        <g key={si}>
          <polygon points={axes.map((_, i) => pt(i, s.values[i]).join(',')).join(' ')}
            style={{fill: s.color, stroke: s.color}} className="ie-radar-area" />
          {axes.map((_, i) =>
            s.values[i] == null ? null : (
              <circle key={i} cx={pt(i, s.values[i])[0]} cy={pt(i, s.values[i])[1]} r={3.5} style={{fill: s.color}} />
            ),
          )}
        </g>
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 5.6);
        const anchor = Math.abs(x - cx) < 6 ? 'middle' : x > cx ? 'start' : 'end';
        return (
          <text key={a.label} x={x} y={y} textAnchor={anchor} dominantBaseline="middle" className="ie-radar-label">
            {a.short || a.label}
            {series.length === 1 && (
              <tspan className="ie-radar-val" x={x} dy="1.2em">{series[0].values[i] == null ? '–' : series[0].values[i].toFixed(1)}</tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}
