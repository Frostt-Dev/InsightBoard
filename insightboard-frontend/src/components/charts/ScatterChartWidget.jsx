import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { detectAnomalies } from '../../utils/mathUtils';

const ANOMALY_COLOR = '#ef4444';

export default function ScatterChartWidget({ data, xAxisLabel, yAxisLabel, color, showAnomalies = false }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  // For scatter, detect anomalies on the Y-axis values
  const anomalies = showAnomalies ? detectAnomalies(data, 'y') : new Set();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis
          type="number"
          dataKey="x"
          name={xAxisLabel || 'X'}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 5, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yAxisLabel || 'Y'}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            padding: '10px 14px',
            fontSize: '13px',
          }}
        />
        <Scatter data={data} fill={color || '#6366f1'}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={showAnomalies && anomalies.has(i) ? ANOMALY_COLOR : (color || '#6366f1')}
              r={showAnomalies && anomalies.has(i) ? 8 : 5}
            />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
