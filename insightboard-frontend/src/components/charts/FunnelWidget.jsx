import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#ede9fe'];

export default function FunnelWidget({ data, color }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;
  }

  const funnelData = data.map((d, i) => ({
    name: String(d.name),
    value: Number(d.value),
    fill: color || COLORS[i % COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart>
        <Tooltip
          formatter={(val) => val.toLocaleString()}
          contentStyle={{
            background: 'var(--tooltip-bg, #1e293b)',
            border: 'none',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '12px',
          }}
        />
        <Funnel dataKey="value" data={funnelData} isAnimationActive>
          {funnelData.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
          <LabelList
            dataKey="name"
            position="right"
            style={{ fontSize: '11px', fill: 'currentColor' }}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}
