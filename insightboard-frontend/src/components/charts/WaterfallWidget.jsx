import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const POSITIVE_COLOR = '#22c55e';  // green
const NEGATIVE_COLOR = '#ef4444';  // red
const TOTAL_COLOR    = '#6366f1';  // indigo for totals

function buildWaterfallData(raw) {
  // raw: [{ name, value }]
  // Transform into stacked bars: base (transparent) + delta (positive/negative)
  let running = 0;
  return raw.map((d, i) => {
    const val = Number(d.value);
    const isTotal = i === raw.length - 1; // treat last bar as total
    if (isTotal) {
      return { name: d.name, base: 0, up: running + val > 0 ? running + val : 0, down: running + val < 0 ? Math.abs(running + val) : 0, total: running + val, isTotal: true };
    }
    const base = val >= 0 ? running : running + val;
    const entry = {
      name: d.name,
      base: base < 0 ? 0 : base,
      up: val > 0 ? val : 0,
      down: val < 0 ? Math.abs(val) : 0,
      rawValue: val,
      isTotal: false,
    };
    running += val;
    return entry;
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const displayVal = d?.isTotal ? d.total : d?.rawValue;
  const color = d?.isTotal ? TOTAL_COLOR : displayVal >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
  return (
    <div style={{ background: 'rgba(255,255,255,0.97)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '10px 14px', fontSize: 13, border: 'none' }}>
      <p className="font-semibold text-surface-800 mb-1">{label}</p>
      <p style={{ color }}>{displayVal != null ? Number(displayVal).toLocaleString() : '—'}</p>
      {d?.isTotal && <p className="text-xs text-surface-400 mt-0.5">Running Total</p>}
    </div>
  );
};

export default function WaterfallWidget({ data, color }) {
  if (!data || data.length < 2) {
    return <div className="flex items-center justify-center h-full text-surface-400 text-sm">Need at least 2 data points</div>;
  }

  const wfData = buildWaterfallData(data);
  const posColor = color || POSITIVE_COLOR;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={wfData} margin={{ top: 15, right: 20, left: 10, bottom: 20 }} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
        <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />

        {/* Transparent base (spacer) */}
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />

        {/* Positive increments (green / custom color) */}
        <Bar dataKey="up" stackId="wf" radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive>
          {wfData.map((d, i) => (
            <Cell key={i} fill={d.isTotal ? TOTAL_COLOR : posColor} />
          ))}
        </Bar>

        {/* Negative decrements (red, drawn downward from base) */}
        <Bar dataKey="down" stackId="wf" radius={[0, 0, 4, 4]} maxBarSize={60} isAnimationActive>
          {wfData.map((d, i) => (
            <Cell key={i} fill={d.down > 0 ? NEGATIVE_COLOR : 'transparent'} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
