export default function HeatmapWidget({ data, color }) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;
  }

  // data: [{name, value}]
  const values = data.map(d => Number(d.value));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const baseHue = color ? null : 240; // indigo hue default

  const getColor = (val) => {
    const intensity = (val - minVal) / range; // 0..1
    if (color) {
      // tint the given color
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const alpha = 0.15 + intensity * 0.85;
      return `rgba(${r},${g},${b},${alpha})`;
    }
    return `hsla(${baseHue}, 80%, ${70 - intensity * 45}%, 1)`;
  };

  const cols = Math.ceil(Math.sqrt(data.length));

  return (
    <div className="w-full h-full overflow-auto p-2">
      <div
        className="grid gap-1 w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.name}: ${Number(d.value).toLocaleString()}`}
            className="rounded flex flex-col items-center justify-center p-1 cursor-pointer transition-transform hover:scale-105"
            style={{
              backgroundColor: getColor(Number(d.value)),
              minHeight: '48px',
            }}
          >
            <span className="text-[9px] font-medium text-surface-800 dark:text-white truncate w-full text-center leading-tight">
              {d.name}
            </span>
            <span className="text-[10px] font-bold text-surface-900 dark:text-white">
              {Number(d.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
