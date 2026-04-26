import { PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444'];

export default function PieChartWidget({ data }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPie>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius="70%"
          innerRadius="40%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
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
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
      </RechartsPie>
    </ResponsiveContainer>
  );
}
