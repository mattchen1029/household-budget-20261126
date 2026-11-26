// Hearth Budget — charts, hand-rolled as inline SVG.
//
// No chart library, no canvas, no network: two small pure functions that
// turn numbers into SVG strings. The views drop the result straight into
// the page.

import { CATEGORY_COLORS, money, round2 } from './data.js';

// A donut of spending by category. `segments` is [{ category, amount }],
// already sorted biggest first. Slices under 2% are folded into "Other"
// so the chart stays readable.
export function donutChart(segments, size = 220) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0);
  if (total <= 0) {
    return `<div class="chart-empty">No spending recorded this month yet.</div>`;
  }
  const merged = [];
  let other = 0;
  for (const s of segments) {
    if (s.amount / total < 0.02) other += s.amount;
    else merged.push(s);
  }
  if (other > 0) merged.push({ category: 'Other small items', amount: round2(other) });

  const radius = 84;
  const cx = size / 2;
  const cy = size / 2;
  const inner = 52;
  let angle = -Math.PI / 2;
  const paths = merged.map((s) => {
    const frac = s.amount / total;
    const sweep = frac * Math.PI * 2;
    const large = sweep > Math.PI ? 1 : 0;
    const color = CATEGORY_COLORS[s.category] ?? '#9a9a92';
    angle += sweep;
    // A hairline gap between slices, so neighbours stay distinct.
    const gap = 0.012;
    const gx1 = cx + radius * Math.cos(angle - sweep + gap);
    const gy1 = cy + radius * Math.sin(angle - sweep + gap);
    const gx2 = cx + radius * Math.cos(angle - gap);
    const gy2 = cy + radius * Math.sin(angle - gap);
    if (frac >= 0.999) {
      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${radius - inner}"><title>${s.category}: ${money(s.amount)}</title></circle>`;
    }
    return `<path d="M ${gx1.toFixed(1)} ${gy1.toFixed(1)} A ${radius} ${radius} 0 ${large} 1 ${gx2.toFixed(1)} ${gy2.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${radius - inner}"><title>${s.category}: ${money(s.amount)}</title></path>`;
  });

  const legend = merged
    .map(
      (s) =>
        `<li><span class="swatch" style="background:${CATEGORY_COLORS[s.category] ?? '#9a9a92'}"></span>${s.category} <b>${money(s.amount)}</b> <span class="muted">${Math.round((s.amount / total) * 100)}%</span></li>`,
    )
    .join('');

  return `<div class="donut-wrap">
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category, total ${money(total)}">
      ${paths.join('')}
      <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-total">${money(total)}</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-label">spent</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

// Grouped bars: income vs spending for each month in `months`
// ([{ key, label, income, spending }]).
export function incomeSpendingBars(months) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.spending]));
  const chartHeight = 180;
  // Leave headroom above the tallest bar for its value label.
  const scale = (v) => (v / (max * 1.3)) * chartHeight;
  const barWidth = 34;
  const gap = 10;
  const groupGap = 46;
  const leftPad = 40;
  const width = leftPad + months.length * (barWidth * 2 + gap + groupGap) + 8;

  const groups = months.map((m, i) => {
    const x = leftPad + i * (barWidth * 2 + gap + groupGap);
    const incomeH = scale(m.income);
    const spendH = scale(m.spending);
    return `<g>
      <rect x="${x}" y="${(chartHeight - incomeH).toFixed(1)}" width="${barWidth}" height="${incomeH.toFixed(1)}" rx="4" fill="#2e6f5e"><title>${m.label} income: ${money(m.income)}</title></rect>
      <rect x="${x + barWidth + gap}" y="${(chartHeight - spendH).toFixed(1)}" width="${barWidth}" height="${spendH.toFixed(1)}" rx="4" fill="#d96c4f"><title>${m.label} spending: ${money(m.spending)}</title></rect>
      <text x="${x + barWidth}" y="${chartHeight + 18}" text-anchor="middle" class="bar-label">${m.label}</text>
      <text x="${x}" y="${(chartHeight - incomeH - 6).toFixed(1)}" text-anchor="middle" class="bar-value">${money(m.income)}</text>
      <text x="${x + barWidth + gap}" y="${(chartHeight - spendH - 6).toFixed(1)}" text-anchor="middle" class="bar-value">${money(m.spending)}</text>
    </g>`;
  });

  return `<svg viewBox="0 0 ${width} ${chartHeight + 24}" class="bars" role="img" aria-label="Income versus spending by month">
    <line x1="0" y1="${chartHeight}" x2="${width}" y2="${chartHeight}" class="bar-axis" />
    ${groups.join('')}
  </svg>
  <p class="chart-key"><span class="key-dot" style="background:#2e6f5e"></span> Income <span class="key-dot" style="background:#d96c4f"></span> Spending</p>`;
}
