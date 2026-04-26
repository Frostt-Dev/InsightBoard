import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { detectAnomalies } from '../../utils/mathUtils';

const ANOMALY_COLOR = '#ef4444';

const CustomDot = ({ cx, cy, index, anomalies, color }) => {
  const isAnomaly = anomalies.has(index);
  const dotColor = isAnomaly ? ANOMALY_COLOR : (color || '#6366f1');
  const r = isAnomaly ? 6 : 4;
  return (
    <circle
      cx={cx} cy={cy} r={r}
      fill={dotColor}
      stroke={isAnomaly ? '#fff' : '#fff'}
      strokeWidth={2}
      style={isAnomaly ? { filter: 'drop-shadow(0 0 4px rgba(239,68,68,0.5))' } : {}}
    />
  );
};

export default function LineChartWidget({ data, xAxisLabel, yAxisLabel, color, showAnomalies = false }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  const anomalies = showAnomalies ? detectAnomalies(data) : new Set();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLine data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
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
        <Tooltip
          contentStyle={{
            background: 'rgba(255,255,255,0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            padding: '10px 14px',
            fontSize: '13px',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color || "#6366f1"}
          strokeWidth={2.5}
          dot={showAnomalies
            ? (props) => <CustomDot {...props} anomalies={anomalies} color={color} />
            : { fill: color || '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }
          }
          activeDot={{ r: 6, stroke: color || '#6366f1', strokeWidth: 2, fill: '#fff' }}
        />
      </RechartsLine>
    </ResponsiveContainer>
  );
}
