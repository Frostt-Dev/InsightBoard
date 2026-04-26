import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { dashboardApi, chartApi } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import BarChartWidget from '../components/charts/BarChartWidget';
import LineChartWidget from '../components/charts/LineChartWidget';
import PieChartWidget from '../components/charts/PieChartWidget';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import DonutChartWidget from '../components/charts/DonutChartWidget';
import HorizontalBarWidget from '../components/charts/HorizontalBarWidget';
import ScatterChartWidget from '../components/charts/ScatterChartWidget';
import TableWidget from '../components/charts/TableWidget';
import KpiCard from '../components/charts/KpiCard';
import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_ICONS = { BAR: '📊', LINE: '📈', PIE: '🍩', DONUT: '⭕', AREA: '🏔️', HBAR: '⏸️', SCATTER: '✨', TABLE: '📋', KPI: '🎯' };

export default function DashboardViewerPage() {
  const { shareId } = useParams();
  const { darkMode, toggleDarkMode } = useTheme();
  const [dashboard, setDashboard] = useState(null);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getPublic(shareId);
        setDashboard(res.data);
        // Load data for all widgets
        for (const w of res.data.widgets || []) {
          if (w.config?.datasetId) {
            try {
              const chartRes = await chartApi.getPublicData({
                datasetId: w.config.datasetId,
                xAxis: w.config.xAxis,
                yAxis: w.config.yAxis,
                aggregation: w.config.aggregation,
                chartType: w.widgetType,
                dateGrouping: w.config.dateGrouping,
              });
              setChartData(prev => ({ ...prev, [w.widgetId]: chartRes.data }));
            } catch (err) {
              console.error('Failed to load chart', w.widgetId);
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Dashboard not found or not shared');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId]);

  const renderWidget = (widget) => {
    const data = chartData[widget.widgetId];
    const color = widget.config?.color;
    switch (widget.widgetType) {
      case 'BAR': return <BarChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'LINE': return <LineChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'PIE': return <PieChartWidget data={data?.data} color={color} />;
      case 'DONUT': return <DonutChartWidget data={data?.data} color={color} />;
      case 'AREA': return <AreaChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'HBAR': return <HorizontalBarWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'SCATTER': return <ScatterChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'TABLE': return <TableWidget data={data?.data} />;
      case 'KPI': return <KpiCard data={data?.data} color={color} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-700 dark:text-surface-300 mb-2">Dashboard Unavailable</h1>
          <p className="text-surface-500">{error}</p>
        </div>
      </div>
    );
  }

  const layout = (dashboard?.widgets || []).map(w => ({
    i: w.widgetId,
    x: w.position?.x || 0,
    y: w.position?.y || 0,
    w: w.position?.w || 6,
    h: w.position?.h || 4,
    static: true,
  }));

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-surface-900 dark:text-white">{dashboard?.name}</h1>
                <p className="text-xs text-surface-400">Shared via InsightBoard</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800">
              {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto p-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={80}
          isDraggable={false}
          isResizable={false}
          compactType="vertical"
          margin={[16, 16]}
        >
          {(dashboard?.widgets || []).map(w => (
            <div key={w.widgetId} className="card overflow-hidden">
              <div className="px-4 py-2 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                  {WIDGET_ICONS[w.widgetType]} {w.widgetType}
                </span>
              </div>
              <div className="p-2" style={{ height: 'calc(100% - 40px)' }}>
                {renderWidget(w)}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
