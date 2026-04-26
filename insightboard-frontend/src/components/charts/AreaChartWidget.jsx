import { AreaChart as RechartsArea, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AreaChartWidget({ data, xAxisLabel, yAxisLabel, color }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsArea data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
        <defs>
          <linearGradient id={`colorValueArea`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color || "#6366f1"} stopOpacity={0.6}/>
            <stop offset="95%" stopColor={color || "#6366f1"} stopOpacity={0}/>
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="value"
          stroke={color || "#6366f1"}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#colorValueArea)`}
        />
      </RechartsArea>
    </ResponsiveContainer>
  );
}
