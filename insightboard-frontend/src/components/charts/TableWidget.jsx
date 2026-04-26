export default function TableWidget({ data }) {
  if (!data?.length) return <div className="flex items-center justify-center h-full text-surface-400 text-sm">No data</div>;

  const columns = Object.keys(data[0]);

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-xs">
        <thead className="bg-surface-50 dark:bg-surface-700 sticky top-0">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-surface-600 dark:text-surface-300 whitespace-nowrap border-b border-surface-200 dark:border-surface-600">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
          {data.slice(0, 100).map((row, i) => (
            <tr key={i} className="hover:bg-surface-50 dark:hover:bg-surface-700/30">
              {columns.map((col, j) => (
                <td key={j} className="px-3 py-1.5 text-surface-600 dark:text-surface-400 whitespace-nowrap">
                  {row[col] != null ? String(row[col]) : <span className="text-surface-300 italic">null</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
