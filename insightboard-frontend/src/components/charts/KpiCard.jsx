import { HiOutlineTrendingUp } from 'react-icons/hi';

export default function KpiCard({ data, color }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  const value = data[0]?.value;
  const label = data[0]?.label || 'Value';
  const formattedValue = typeof value === 'number'
    ? value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
        ? `${(value / 1000).toFixed(1)}K`
        : value % 1 === 0 ? value.toLocaleString() : value.toFixed(2)
    : value;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4" >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ 
          background: color ? `${color}20` : undefined, // 20 hex is approx 12% opacity
          backgroundColor: !color ? 'rgba(99, 102, 241, 0.15)' : undefined
        }}
      >
        <HiOutlineTrendingUp className="w-6 h-6" style={{ color: color || '#6366f1' }} />
      </div>
      <div 
        className="text-3xl font-bold"
        style={color ? { color } : { 
          backgroundImage: 'linear-gradient(to right, #4f46e5, #818cf8)', 
          WebkitBackgroundClip: 'text', 
          color: 'transparent' 
        }}
      >
        {formattedValue}
      </div>
      <div className="text-sm text-surface-500 dark:text-surface-400 mt-1 font-medium text-center">
        {label}
      </div>
    </div>
  );
}
