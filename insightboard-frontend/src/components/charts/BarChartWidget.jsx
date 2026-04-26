import { BarChart as RechartsBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { detectAnomalies } from '../../utils/mathUtils';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6'];
const ANOMALY_COLOR = '#ef4444';

const tooltipStyle = {
  background: 'rgba(255,255,255,0.95)',
  border: 'none',
  borderRadius: '12px',
  boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
  padding: '10px 14px',
  fontSize: '13px',
};

export default function BarChartWidget({ data, xAxisLabel, yAxisLabel, color, orientation = 'vertical', showAnomalies = false }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  const isHorizontal = orientation === 'horizontal';
  const anomalies = showAnomalies ? detectAnomalies(data) : new Set();

  const getCellColor = (i) => {
    if (showAnomalies && anomalies.has(i)) return ANOMALY_COLOR;
    return color || COLORS[i % COLORS.length];
  };

  if (isHorizontal) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBar data={data} layout="vertical" margin={{ top: 10, right: 30, left: 50, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            label={yAxisLabel ? { value: yAxisLabel, position: 'bottom', offset: 5, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            width={70}
            label={xAxisLabel ? { value: xAxisLabel, angle: -90, position: 'insideLeft', offset: -35, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={30}>
            {data.map((_, i) => <Cell key={i} fill={getCellColor(i)} />)}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBar data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          label={xAxisLabel ? { value: xAxisLabel, position: 'bottom', offset: 5, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 11, fill: '#94a3b8' } } : undefined}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50}>
          {data.map((_, i) => <Cell key={i} fill={getCellColor(i)} />)}
        </Bar>
      </RechartsBar>
    </ResponsiveContainer>
  );
}
