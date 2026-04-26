import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function GaugeWidget({ data, color }) {
  // data is expected: [{ name, value }] — we take the first entry
  const raw = Array.isArray(data) && data.length > 0 ? data[0] : null;
  const value = raw ? Number(raw.value) : 0;
  const maxVal = Array.isArray(data) ? Math.max(...data.map(d => Number(d.value)), 1) : 1;
  const pct = Math.min(100, Math.round((value / maxVal) * 100));

  const fill = color || '#6366f1';

  const gaugeData = [{ name: raw?.name || 'Value', value: pct, fill }];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <RadialBarChart
          cx="50%"
          cy="80%"
          innerRadius="60%"
          outerRadius="100%"
          startAngle={180}
          endAngle={0}
          data={gaugeData}
          barSize={20}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={10}
            background={{ fill: '#e2e8f0' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center -mt-4">
        <div className="text-2xl font-bold" style={{ color: fill }}>{value.toLocaleString()}</div>
        <div className="text-xs text-surface-400 mt-0.5">{raw?.name || 'Value'}</div>
      </div>
    </div>
  );
}
