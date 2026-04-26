import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { dashboardApi, datasetApi, chartApi, aiApi } from '../services/api';
import Navbar from '../components/layout/Navbar';
import BarChartWidget from '../components/charts/BarChartWidget';
import LineChartWidget from '../components/charts/LineChartWidget';
import PieChartWidget from '../components/charts/PieChartWidget';
import AreaChartWidget from '../components/charts/AreaChartWidget';
import DonutChartWidget from '../components/charts/DonutChartWidget';
import WaterfallWidget from '../components/charts/WaterfallWidget';
import ScatterChartWidget from '../components/charts/ScatterChartWidget';
import TableWidget from '../components/charts/TableWidget';
import KpiCard from '../components/charts/KpiCard';
import GaugeWidget from '../components/charts/GaugeWidget';
import FunnelWidget from '../components/charts/FunnelWidget';
import HeatmapWidget from '../components/charts/HeatmapWidget';
import {
  HiOutlinePlus, HiOutlineSave, HiOutlineTrash, HiOutlineCog, HiOutlineX,
  HiOutlineArrowLeft, HiOutlineShare, HiOutlineDownload, HiOutlinePencil,
  HiOutlineArrowsExpand, HiOutlineCheck, HiOutlineCode, HiOutlineClipboard,
  HiOutlineSparkles, HiOutlineLightningBolt,
} from 'react-icons/hi';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_TYPES = [
  { type: 'BAR', label: 'Bar Chart', icon: '📊' },
  { type: 'LINE', label: 'Line Chart', icon: '📈' },
  { type: 'PIE', label: 'Pie Chart', icon: '🍩' },
  { type: 'DONUT', label: 'Donut Chart', icon: '⭕' },
  { type: 'AREA', label: 'Area Chart', icon: '🏔️' },
  { type: 'SCATTER', label: 'Scatter Plot', icon: '✨' },
  { type: 'WATERFALL', label: 'Waterfall', icon: '💧' },
  { type: 'GAUGE', label: 'Gauge', icon: '🕹️' },
  { type: 'FUNNEL', label: 'Funnel', icon: '🔽' },
  { type: 'HEATMAP', label: 'Heatmap', icon: '🌡️' },
  { type: 'TABLE', label: 'Table', icon: '📋' },
  { type: 'KPI', label: 'KPI Card', icon: '🎯' },
];

// Widget types that support orientation toggling (horizontal/vertical)
const ORIENTATION_TYPES = ['BAR'];

export default function DashboardBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [chartData, setChartData] = useState({});
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fullscreenWidget, setFullscreenWidget] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null); // widgetId being renamed
  const [titleDraft, setTitleDraft] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [shareExpiry, setShareExpiry] = useState('');
  const [embedCopied, setEmbedCopied] = useState(false);
  const [nlqQuery, setNlqQuery] = useState('');
  const [nlqLoading, setNlqLoading] = useState(false);
  const [nlqResult, setNlqResult] = useState(null);
  const [nlqDatasetId, setNlqDatasetId] = useState('');
  const titleInputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, dsRes] = await Promise.all([
          dashboardApi.getById(id),
          datasetApi.getAll()
        ]);
        setDashboard(dashRes.data);
        setDatasets(dsRes.data);
        const loadedWidgets = dashRes.data.widgets || [];
        setWidgets(loadedWidgets);
        for (const w of loadedWidgets) {
          if (w.config?.datasetId && (w.config?.xAxis || w.widgetType === 'KPI' || w.widgetType === 'TABLE')) {
            loadChartData(w.widgetId, w.config, w.widgetType);
          }
        }
      } catch (err) {
        alert('Failed to load dashboard');
        navigate('/dashboards');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const loadChartData = async (widgetId, config, chartType) => {
    try {
      const res = await chartApi.getData({
        datasetId: config.datasetId,
        xAxis: config.xAxis,
        yAxis: config.yAxis,
        aggregation: config.aggregation,
        chartType: chartType,
        dateGrouping: config.dateGrouping,
      });
      setChartData(prev => ({ ...prev, [widgetId]: res.data }));
    } catch (err) {
      console.error('Failed to load chart data for widget', widgetId, err);
    }
  };

  const addWidget = (type) => {
    const widgetId = `widget_${Date.now()}`;
    const newWidget = {
      widgetId,
      widgetType: type,
      title: WIDGET_TYPES.find(t => t.type === type)?.label || type,
      config: {},
      position: {
        i: widgetId,
        x: (widgets.length * 4) % 12,
        y: Infinity,
        w: type === 'KPI' ? 3 : 6,
        h: type === 'KPI' ? 2 : 4,
        minW: 2,
        minH: 2,
      },
    };
    setWidgets(prev => [...prev, newWidget]);
    setShowAddWidget(false);
    setSelectedWidget(newWidget);
  };

  const removeWidget = (widgetId) => {
    setWidgets(prev => prev.filter(w => w.widgetId !== widgetId));
    setChartData(prev => { const next = { ...prev }; delete next[widgetId]; return next; });
    if (selectedWidget?.widgetId === widgetId) setSelectedWidget(null);
  };

  const updateWidgetConfig = async (widgetId, config) => {
    setWidgets(prev => prev.map(w =>
      w.widgetId === widgetId ? { ...w, config: { ...w.config, ...config } } : w
    ));
    const widget = widgets.find(w => w.widgetId === widgetId);
    if (widget) {
      const mergedConfig = { ...widget.config, ...config };
      if (mergedConfig.datasetId && (mergedConfig.xAxis || widget.widgetType === 'KPI' || widget.widgetType === 'TABLE')) {
        loadChartData(widgetId, mergedConfig, widget.widgetType);
      }
      setSelectedWidget(prev => prev ? { ...prev, config: mergedConfig } : null);
    }
  };

  const onLayoutChange = (layout) => {
    setWidgets(prev => prev.map(w => {
      const layoutItem = layout.find(l => l.i === w.widgetId);
      if (layoutItem) {
        return { ...w, position: { ...w.position, x: layoutItem.x, y: layoutItem.y, w: layoutItem.w, h: layoutItem.h } };
      }
      return w;
    }));
  };

  const saveDashboard = async () => {
    setSaving(true);
    try {
      await dashboardApi.update(id, { ...dashboard, widgets });
      setSaving(false);
    } catch (err) {
      alert('Failed to save dashboard');
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await dashboardApi.toggleShare(id);
      setDashboard(res.data);
    } catch (err) {
      alert('Failed to toggle sharing');
    }
  };

  const exportDashboard = async () => {
    const dashboardElement = document.querySelector('.react-grid-layout');
    if (!dashboardElement) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(dashboardElement, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${dashboard?.name || 'dashboard'}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to export dashboard');
    } finally {
      setSaving(false);
    }
  };

  const exportWidgetCSV = (widget) => {
    const data = chartData[widget.widgetId];
    if (!data?.data || data.data.length === 0) {
      alert('No data to export for this widget');
      return;
    }
    const rows = data.data;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${widget.title || widget.widgetType}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startRenameWidget = (widget) => {
    setEditingTitle(widget.widgetId);
    setTitleDraft(widget.title || '');
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const commitRename = (widgetId) => {
    if (titleDraft.trim()) {
      setWidgets(prev => prev.map(w => w.widgetId === widgetId ? { ...w, title: titleDraft.trim() } : w));
      if (selectedWidget?.widgetId === widgetId) {
        setSelectedWidget(prev => ({ ...prev, title: titleDraft.trim() }));
      }
    }
    setEditingTitle(null);
  };

  const getEmbedCode = () => {
    const shareUrl = `${window.location.origin}/view/${dashboard?.shareId}`;
    return `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2000);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/view/${dashboard?.shareId}`);
    alert('Public link copied to clipboard!');
  };

  // --- AI: Natural Language Query ---
  const handleNlqSubmit = async (e) => {
    e.preventDefault();
    if (!nlqQuery.trim() || datasets.length === 0) return;
    setNlqLoading(true);
    setNlqResult(null);
    try {
      // Use the explicitly-selected dataset, or the selected widget's dataset, or the first one
      const targetDs = nlqDatasetId
        ? datasets.find(d => d.id === nlqDatasetId)
        : selectedWidget?.config?.datasetId
          ? datasets.find(d => d.id === selectedWidget.config.datasetId)
          : datasets[0];
      if (!targetDs) { alert('No dataset available'); setNlqLoading(false); return; }

      const columns = targetDs.columns.map(c => ({ name: c.name, dataType: c.dataType }));
      const res = await aiApi.nlq(nlqQuery.trim(), columns, targetDs.id);
      const config = res.data;

      if (config.error) {
        setNlqResult({ error: config.error });
      } else {
        // Auto-create a widget from the AI result
        const widgetId = `widget_${Date.now()}`;
        const newWidget = {
          widgetId,
          widgetType: config.widgetType || 'BAR',
          title: config.title || nlqQuery,
          config: {
            datasetId: config.datasetId || targetDs.id,
            xAxis: config.xAxis,
            yAxis: config.yAxis,
            aggregation: config.aggregation || 'SUM',
          },
          position: {
            i: widgetId,
            x: (widgets.length * 4) % 12,
            y: Infinity,
            w: config.widgetType === 'KPI' ? 3 : 6,
            h: config.widgetType === 'KPI' ? 2 : 4,
            minW: 2, minH: 2,
          },
        };
        setWidgets(prev => [...prev, newWidget]);
        loadChartData(widgetId, newWidget.config, newWidget.widgetType);
        setNlqResult({ success: true, explanation: config.explanation });
        setNlqQuery('');
      }
    } catch (err) {
      setNlqResult({ error: err.response?.data?.error || 'AI request failed' });
    } finally {
      setNlqLoading(false);
    }
  };

  const renderWidget = (widget) => {
    const data = chartData[widget.widgetId];
    const color = widget.config?.color;
    const orientation = widget.config?.orientation || 'vertical';
    const showAnomalies = widget.config?.showAnomalies || false;
    switch (widget.widgetType) {
      case 'BAR': return <BarChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} orientation={orientation} showAnomalies={showAnomalies} />;
      case 'HBAR': return <BarChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} orientation="horizontal" showAnomalies={showAnomalies} />;
      case 'LINE': return <LineChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} showAnomalies={showAnomalies} />;
      case 'PIE': return <PieChartWidget data={data?.data} color={color} />;
      case 'DONUT': return <DonutChartWidget data={data?.data} color={color} />;
      case 'AREA': return <AreaChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} />;
      case 'SCATTER': return <ScatterChartWidget data={data?.data} xAxisLabel={data?.xAxisLabel} yAxisLabel={data?.yAxisLabel} color={color} showAnomalies={showAnomalies} />;
      case 'WATERFALL': return <WaterfallWidget data={data?.data} color={color} />;
      case 'GAUGE': return <GaugeWidget data={data?.data} color={color} />;
      case 'FUNNEL': return <FunnelWidget data={data?.data} color={color} />;
      case 'HEATMAP': return <HeatmapWidget data={data?.data} color={color} />;
      case 'TABLE': return <TableWidget data={data?.data} />;
      case 'KPI': return <KpiCard data={data?.data} color={color} />;
      default: return <div className="flex items-center justify-center h-full text-surface-400">Unknown widget</div>;
    }
  };

  const layout = widgets.map(w => ({
    i: w.widgetId,
    x: w.position?.x || 0,
    y: w.position?.y || 0,
    w: w.position?.w || 6,
    h: w.position?.h || 4,
    minW: w.position?.minW || 2,
    minH: w.position?.minH || 2,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  const selectedDataset = selectedWidget?.config?.datasetId
    ? datasets.find(d => d.id === selectedWidget.config.datasetId)
    : null;

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <Navbar />

      {/* Toolbar */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboards')} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
                <HiOutlineArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white truncate">
                {dashboard?.name || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddWidget(true)} className="btn-secondary flex items-center gap-2 text-sm py-2">
                <HiOutlinePlus className="w-4 h-4" />
                Add Widget
              </button>
              <button
                onClick={() => setShowShareModal(true)}
                className={`p-2 rounded-lg transition-colors ${dashboard?.public ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500'}`}
                title="Share"
              >
                <HiOutlineShare className="w-5 h-5" />
              </button>
              <button onClick={exportDashboard} disabled={saving} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors" title="Export to PDF">
                <HiOutlineDownload className="w-5 h-5" />
              </button>
              <button onClick={saveDashboard} disabled={saving} className="btn-primary flex items-center gap-2 text-sm py-2">
                <HiOutlineSave className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Search Bar */}
      <div className="bg-gradient-to-r from-primary-50 via-purple-50 to-primary-50 dark:from-primary-900/10 dark:via-purple-900/10 dark:to-primary-900/10 border-b border-primary-100 dark:border-primary-800/30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <form onSubmit={handleNlqSubmit} className="flex items-center gap-3">
            {/* Dataset selector */}
            {datasets.length > 1 && (
              <select
                value={nlqDatasetId}
                onChange={e => setNlqDatasetId(e.target.value)}
                className="py-2.5 px-3 text-sm rounded-xl border border-primary-200 dark:border-primary-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 min-w-[140px]"
              >
                <option value="">Auto (1st dataset)</option>
                {datasets.map(ds => (
                  <option key={ds.id} value={ds.id}>{ds.name}</option>
                ))}
              </select>
            )}
            <div className="relative flex-1">
              <HiOutlineSparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
              <input
                type="text"
                value={nlqQuery}
                onChange={e => setNlqQuery(e.target.value)}
                placeholder="Ask AI: e.g. 'show me total sales by month' or 'revenue trend over time'"
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-primary-200 dark:border-primary-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                disabled={nlqLoading}
              />
            </div>
            <button
              type="submit"
              disabled={nlqLoading || !nlqQuery.trim()}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 whitespace-nowrap disabled:opacity-50"
            >
              {nlqLoading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Thinking...</>
              ) : (
                <><HiOutlineLightningBolt className="w-4 h-4" /> Ask AI</>
              )}
            </button>
          </form>
          {nlqResult && (
            <div className={`mt-2 text-xs px-3 py-2 rounded-lg ${nlqResult.error ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'}`}>
              {nlqResult.error ? `⚠️ ${nlqResult.error}` : `✨ ${nlqResult.explanation}`}
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Grid Area */}
        <div className={`flex-1 p-4 transition-all duration-300 ${selectedWidget ? 'mr-80' : ''}`}>
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-3xl flex items-center justify-center mb-4">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-surface-600 dark:text-surface-400 mb-2">
                Start building your dashboard
              </h3>
              <p className="text-surface-400 dark:text-surface-500 mb-6 max-w-md">
                Click "Add Widget" to add charts, tables, and KPI cards.
              </p>
              <button onClick={() => setShowAddWidget(true)} className="btn-primary flex items-center gap-2">
                <HiOutlinePlus className="w-5 h-5" />
                Add Your First Widget
              </button>
            </div>
          ) : (
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: layout }}
              breakpoints={{ lg: 1200, md: 996, sm: 768 }}
              cols={{ lg: 12, md: 8, sm: 4 }}
              rowHeight={80}
              onLayoutChange={onLayoutChange}
              isDraggable
              isResizable
              compactType="vertical"
              margin={[16, 16]}
            >
              {widgets.map(w => (
                <div key={w.widgetId} className={`card overflow-hidden group ${selectedWidget?.widgetId === w.widgetId ? 'ring-2 ring-primary-500' : ''}`}>
                  {/* Widget Header — mousedown stopPropagation prevents grid drag from consuming button clicks */}
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 cursor-move">
                    {editingTitle === w.widgetId ? (
                      <div
                        className="flex items-center gap-1 flex-1"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                      >
                        <input
                          ref={titleInputRef}
                          value={titleDraft}
                          onChange={e => setTitleDraft(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename(w.widgetId);
                            if (e.key === 'Escape') setEditingTitle(null);
                          }}
                          className="flex-1 text-xs bg-transparent border-b border-primary-400 outline-none text-surface-700 dark:text-surface-300 font-medium"
                        />
                        <button
                          draggable={false}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={() => commitRename(w.widgetId)}
                          className="p-0.5 text-emerald-500 hover:text-emerald-600"
                        >
                          <HiOutlineCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          draggable={false}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={() => setEditingTitle(null)}
                          className="p-0.5 text-surface-400"
                        >
                          <HiOutlineX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider truncate select-none">
                        {WIDGET_TYPES.find(t => t.type === w.widgetType)?.icon} {w.title || w.widgetType}
                      </span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                      <button
                        draggable={false}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => startRenameWidget(w)}
                        className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-400"
                        title="Rename"
                      >
                        <HiOutlinePencil className="w-3 h-3" />
                      </button>
                      <button
                        draggable={false}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => exportWidgetCSV(w)}
                        className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-400"
                        title="Export CSV"
                      >
                        <HiOutlineDownload className="w-3 h-3" />
                      </button>
                      <button
                        draggable={false}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => setFullscreenWidget(w.widgetId)}
                        className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-400"
                        title="Fullscreen"
                      >
                        <HiOutlineArrowsExpand className="w-3 h-3" />
                      </button>
                      <button
                        draggable={false}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => setSelectedWidget(widgets.find(ww => ww.widgetId === w.widgetId) || w)}
                        className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-400"
                        title="Configure"
                      >
                        <HiOutlineCog className="w-3 h-3" />
                      </button>
                      <button
                        draggable={false}
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => removeWidget(w.widgetId)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-surface-400 hover:text-red-500"
                        title="Remove"
                      >
                        <HiOutlineTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  {/* Widget Content */}
                  <div className="p-2 flex-1" style={{ height: 'calc(100% - 36px)' }}>
                    {!w.config?.datasetId ? (
                      <button
                        onClick={() => setSelectedWidget(w)}
                        className="w-full h-full flex flex-col items-center justify-center gap-2 text-surface-400 hover:text-primary-500 transition-colors rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10"
                      >
                        <HiOutlineCog className="w-8 h-8" />
                        <span className="text-sm font-medium">Configure widget</span>
                      </button>
                    ) : renderWidget(w)}
                  </div>
                </div>
              ))}
            </ResponsiveGridLayout>
          )}
        </div>

        {/* Config Panel */}
        {selectedWidget && (
          <div className="fixed right-0 top-[7.5rem] bottom-0 w-80 bg-white dark:bg-surface-800 border-l border-surface-200 dark:border-surface-700 overflow-y-auto animate-slide-in-right z-30">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-surface-900 dark:text-white">Configure Widget</h3>
                <button onClick={() => setSelectedWidget(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                  <HiOutlineX className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Widget Title */}
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Widget Title</label>
                  <input
                    type="text"
                    value={selectedWidget.title || ''}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setWidgets(prev => prev.map(w => w.widgetId === selectedWidget.widgetId ? { ...w, title: newTitle } : w));
                      setSelectedWidget(prev => ({ ...prev, title: newTitle }));
                    }}
                    className="input-field"
                    placeholder="Widget title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Dataset</label>
                  <select
                    value={selectedWidget.config?.datasetId || ''}
                    onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { datasetId: e.target.value, xAxis: '', yAxis: '' })}
                    className="select-field"
                  >
                    <option value="">Select dataset...</option>
                    {datasets.map(ds => (
                      <option key={ds.id} value={ds.id}>{ds.name}</option>
                    ))}
                  </select>
                </div>

                {selectedWidget.widgetType !== 'KPI' && selectedWidget.widgetType !== 'TABLE' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                      {selectedWidget.widgetType === 'SCATTER' ? 'X-Axis Column (Numeric)' : 'X-Axis Column'}
                    </label>
                    <select
                      value={selectedWidget.config?.xAxis || ''}
                      onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { xAxis: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select column...</option>
                      {selectedDataset?.columns
                        ?.filter(col => selectedWidget.widgetType === 'SCATTER' ? col.dataType === 'NUMBER' : true)
                        .map((col, i) => (
                          <option key={i} value={col.name}>{col.name} ({col.dataType})</option>
                        ))}
                    </select>
                  </div>
                )}

                {selectedWidget.widgetType !== 'TABLE' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                      {selectedWidget.widgetType === 'KPI' ? 'Value Column' : 'Y-Axis Column'}
                    </label>
                    <select
                      value={selectedWidget.config?.yAxis || ''}
                      onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { yAxis: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select column...</option>
                      {selectedDataset?.columns?.filter(c => c.dataType === 'NUMBER').map((col, i) => (
                        <option key={i} value={col.name}>{col.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedWidget.widgetType !== 'TABLE' && selectedWidget.widgetType !== 'SCATTER' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Aggregation</label>
                    <select
                      value={selectedWidget.config?.aggregation || ''}
                      onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { aggregation: e.target.value })}
                      className="select-field"
                    >
                      <option value="">Select...</option>
                      <option value="SUM">SUM</option>
                      <option value="AVG">AVG</option>
                      <option value="COUNT">COUNT</option>
                    </select>
                  </div>
                )}

                {selectedDataset?.columns?.find(c => c.name === selectedWidget.config?.xAxis)?.dataType === 'DATE' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Date Grouping</label>
                    <select
                      value={selectedWidget.config?.dateGrouping || ''}
                      onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { dateGrouping: e.target.value })}
                      className="select-field"
                    >
                      <option value="">By Day (Default)</option>
                      <option value="MONTH">By Month</option>
                      <option value="YEAR">By Year</option>
                    </select>
                  </div>
                )}

                {/* Orientation toggle — for BAR chart */}
                {ORIENTATION_TYPES.includes(selectedWidget.widgetType) && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Orientation</label>
                    <div className="flex gap-2">
                      {['vertical', 'horizontal'].map(opt => (
                        <button
                          key={opt}
                          draggable={false}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={() => updateWidgetConfig(selectedWidget.widgetId, { orientation: opt })}
                          className={`flex-1 py-2 px-3 text-sm rounded-lg border-2 font-medium capitalize transition-all ${
                            (selectedWidget.config?.orientation || 'vertical') === opt
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'
                          }`}
                        >
                          {opt === 'vertical' ? '↕ Vertical' : '↔ Horizontal'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedWidget.widgetType !== 'TABLE' && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={selectedWidget.config?.color || '#6366f1'}
                        onChange={(e) => updateWidgetConfig(selectedWidget.widgetId, { color: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent p-0"
                      />
                      <span className="text-sm font-mono text-surface-500 uppercase">{selectedWidget.config?.color || '#6366f1'}</span>
                      {selectedWidget.config?.color && (
                        <button
                          onClick={() => updateWidgetConfig(selectedWidget.widgetId, { color: '' })}
                          className="text-xs text-red-500 hover:text-red-600 ml-auto"
                        >Clear</button>
                      )}
                    </div>
                  </div>
                )}

                {/* Anomaly Detection Toggle */}
                {['BAR', 'HBAR', 'LINE', 'SCATTER'].includes(selectedWidget.widgetType) && (
                  <div>
                    <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">🔴 Anomaly Detection</label>
                    <button
                      draggable={false}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => updateWidgetConfig(selectedWidget.widgetId, { showAnomalies: !selectedWidget.config?.showAnomalies })}
                      className={`w-full py-2 px-3 text-sm rounded-lg border-2 font-medium transition-all ${
                        selectedWidget.config?.showAnomalies
                          ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'border-surface-200 dark:border-surface-600 text-surface-500 hover:border-surface-300'
                      }`}
                    >
                      {selectedWidget.config?.showAnomalies ? '✅ Anomalies Highlighted' : 'Show Anomalies (IQR)'}
                    </button>
                    <p className="text-[10px] text-surface-400 mt-1">Outlier data points will be highlighted in red using the Interquartile Range method</p>
                  </div>
                )}
              </div>

              {/* CSV Export from panel */}
              <div className="pt-4 border-t border-surface-200 dark:border-surface-700 space-y-2">
                <button
                  onClick={() => exportWidgetCSV(selectedWidget)}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  <HiOutlineDownload className="w-4 h-4" />
                  Export Data as CSV
                </button>
                <p className="text-xs text-surface-400">
                  Widget ID: <span className="font-mono">{selectedWidget.widgetId.slice(-8)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Widget Modal */}
      {fullscreenWidget && (() => {
        const w = widgets.find(ww => ww.widgetId === fullscreenWidget);
        if (!w) return null;
        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setFullscreenWidget(null)}>
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full h-full max-w-5xl max-h-[90vh] overflow-hidden animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-surface-100 dark:border-surface-700">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{WIDGET_TYPES.find(t => t.type === w.widgetType)?.icon}</span>
                  <h3 className="font-semibold text-surface-900 dark:text-white">{w.title || w.widgetType}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportWidgetCSV(w)} className="btn-secondary text-sm flex items-center gap-1.5 py-1.5">
                    <HiOutlineDownload className="w-4 h-4" /> Export CSV
                  </button>
                  <button onClick={() => setFullscreenWidget(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                    <HiOutlineX className="w-5 h-5 text-surface-500" />
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                {renderWidget(w)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up space-y-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Share Dashboard</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                <HiOutlineX className="w-4 h-4 text-surface-500" />
              </button>
            </div>

            {/* Toggle public/private */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-700">
              <div>
                <p className="font-medium text-surface-900 dark:text-white text-sm">Public Access</p>
                <p className="text-xs text-surface-400 mt-0.5">Anyone with the link can view</p>
              </div>
              <button
                onClick={handleShare}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dashboard?.public ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${dashboard?.public ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {dashboard?.public && (
              <>
                {/* Share Link */}
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={`${window.location.origin}/view/${dashboard.shareId}`}
                      className="input-field text-xs font-mono"
                    />
                    <button onClick={copyShareLink} className="btn-secondary text-sm px-3 shrink-0">Copy</button>
                  </div>
                </div>

                {/* Link Expiry */}
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                    Link Expiry <span className="text-xs text-surface-400">(informational)</span>
                  </label>
                  <input
                    type="date"
                    value={shareExpiry}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setShareExpiry(e.target.value)}
                    className="input-field"
                  />
                  {shareExpiry && (
                    <p className="text-xs text-amber-500 mt-1">⚠️ Reminder set: share manually expires {new Date(shareExpiry).toLocaleDateString()}</p>
                  )}
                </div>

                {/* View Password */}
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                    View Password <span className="text-xs text-surface-400">(optional, informational)</span>
                  </label>
                  <input
                    type="text"
                    value={sharePassword}
                    onChange={e => setSharePassword(e.target.value)}
                    className="input-field"
                    placeholder="Set a password hint for viewers..."
                  />
                  <p className="text-xs text-surface-400 mt-1">Share this password separately with viewers</p>
                </div>

                {/* Embed Code */}
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-400 mb-1.5">Embed Code</label>
                  <div className="relative">
                    <pre className="bg-surface-100 dark:bg-surface-900 rounded-lg p-3 text-xs font-mono text-surface-600 dark:text-surface-400 overflow-x-auto whitespace-pre-wrap break-all">
                      {getEmbedCode()}
                    </pre>
                    <button
                      onClick={copyEmbedCode}
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-surface-700 hover:bg-surface-50 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600 transition-colors"
                      title="Copy embed code"
                    >
                      {embedCopied ? <HiOutlineCheck className="w-3.5 h-3.5 text-emerald-500" /> : <HiOutlineClipboard className="w-3.5 h-3.5 text-surface-500" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAddWidget(false)}>
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Add Widget</h3>
            <div className="grid grid-cols-3 gap-3">
              {WIDGET_TYPES.map(wt => (
                <button
                  key={wt.type}
                  onClick={() => addWidget(wt.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-surface-200 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all duration-200"
                >
                  <span className="text-2xl">{wt.icon}</span>
                  <span className="text-xs font-medium text-surface-700 dark:text-surface-300">{wt.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAddWidget(false)} className="w-full mt-4 btn-secondary text-sm">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
