import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { dashboardApi } from '../services/api';
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineShare, HiOutlineExternalLink,
  HiOutlineViewGrid, HiOutlineDuplicate, HiOutlineTemplate, HiOutlineX
} from 'react-icons/hi';

const TEMPLATES = [
  {
    id: 'sales',
    name: 'Sales Overview',
    description: 'Track revenue, units sold, and conversion funnel',
    icon: '💰',
    widgets: [
      { widgetId: 'w1', widgetType: 'KPI', config: {}, position: { i: 'w1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w2', widgetType: 'KPI', config: {}, position: { i: 'w2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w3', widgetType: 'LINE', config: {}, position: { i: 'w3', x: 0, y: 2, w: 8, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w4', widgetType: 'FUNNEL', config: {}, position: { i: 'w4', x: 8, y: 2, w: 4, h: 4, minW: 2, minH: 2 } },
    ],
  },
  {
    id: 'finance',
    name: 'Financial Dashboard',
    description: 'Expense breakdown, trends, and KPIs',
    icon: '📈',
    widgets: [
      { widgetId: 'w1', widgetType: 'KPI', config: {}, position: { i: 'w1', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w2', widgetType: 'KPI', config: {}, position: { i: 'w2', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w3', widgetType: 'KPI', config: {}, position: { i: 'w3', x: 6, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w4', widgetType: 'PIE', config: {}, position: { i: 'w4', x: 0, y: 2, w: 5, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w5', widgetType: 'BAR', config: {}, position: { i: 'w5', x: 5, y: 2, w: 7, h: 4, minW: 2, minH: 2 } },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing Analytics',
    description: 'Campaign performance, reach, and conversions',
    icon: '📣',
    widgets: [
      { widgetId: 'w1', widgetType: 'AREA', config: {}, position: { i: 'w1', x: 0, y: 0, w: 8, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w2', widgetType: 'DONUT', config: {}, position: { i: 'w2', x: 8, y: 0, w: 4, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w3', widgetType: 'HBAR', config: {}, position: { i: 'w3', x: 0, y: 4, w: 6, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w4', widgetType: 'TABLE', config: {}, position: { i: 'w4', x: 6, y: 4, w: 6, h: 4, minW: 2, minH: 2 } },
    ],
  },
  {
    id: 'operations',
    name: 'Operations Overview',
    description: 'Heatmap, KPIs, and performance bar charts',
    icon: '⚙️',
    widgets: [
      { widgetId: 'w1', widgetType: 'HEATMAP', config: {}, position: { i: 'w1', x: 0, y: 0, w: 6, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w2', widgetType: 'GAUGE', config: {}, position: { i: 'w2', x: 6, y: 0, w: 3, h: 4, minW: 2, minH: 2 } },
      { widgetId: 'w3', widgetType: 'KPI', config: {}, position: { i: 'w3', x: 9, y: 0, w: 3, h: 2, minW: 2, minH: 2 } },
      { widgetId: 'w4', widgetType: 'BAR', config: {}, position: { i: 'w4', x: 0, y: 4, w: 12, h: 4, minW: 2, minH: 2 } },
    ],
  },
];

export default function DashboardsListPage() {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newName, setNewName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const res = await dashboardApi.getAll();
      setDashboards(res.data);
    } catch (err) {
      console.error('Failed to load dashboards', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const res = await dashboardApi.create(newName.trim());
      navigate(`/dashboard/${res.data.id}`);
    } catch (err) {
      alert('Failed to create dashboard');
    }
  };

  const handleCreateFromTemplate = async (template) => {
    try {
      const res = await dashboardApi.create(template.name);
      const dashId = res.data.id;
      // Save widgets into the newly created dashboard
      await dashboardApi.update(dashId, { name: template.name, widgets: template.widgets });
      navigate(`/dashboard/${dashId}`);
    } catch (err) {
      alert('Failed to create dashboard from template');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this dashboard?')) return;
    try {
      await dashboardApi.delete(id);
      setDashboards(d => d.filter(dash => dash.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleShare = async (dashboard) => {
    try {
      const res = await dashboardApi.toggleShare(dashboard.id);
      setDashboards(d => d.map(dash => dash.id === dashboard.id ? res.data : dash));
      if (res.data.public) {
        const url = `${window.location.origin}/view/${res.data.shareId}`;
        navigator.clipboard.writeText(url);
        alert('Public link copied to clipboard!');
      }
    } catch (err) {
      alert('Failed to toggle sharing');
    }
  };

  const handleDuplicate = async (dashboard, e) => {
    e.stopPropagation();
    try {
      const res = await dashboardApi.duplicate(dashboard.id);
      // Fallback: if backend doesn't support duplicate, clone client-side
      if (res?.data?.id) {
        navigate(`/dashboard/${res.data.id}`);
      } else {
        loadDashboards();
      }
    } catch (err) {
      // Graceful fallback: create a copy manually
      try {
        const original = await dashboardApi.getById(dashboard.id);
        const copy = await dashboardApi.create(`${dashboard.name} (Copy)`);
        await dashboardApi.update(copy.data.id, {
          name: `${dashboard.name} (Copy)`,
          widgets: original.data.widgets || [],
        });
        loadDashboards();
      } catch {
        alert('Duplicate failed');
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Dashboards</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Build and manage your data visualizations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <HiOutlineTemplate className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
              <HiOutlinePlus className="w-5 h-5" />
              New Dashboard
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {creating && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCreating(false)}>
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Create New Dashboard</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  id="dashboard-name-input"
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="input-field"
                  placeholder="Dashboard name..."
                  autoFocus
                  required
                />
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setCreating(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Templates Modal */}
        {showTemplates && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowTemplates(false)}>
            <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Dashboard Templates</h3>
                  <p className="text-sm text-surface-400 mt-0.5">Start with a pre-built layout and configure your data</p>
                </div>
                <button onClick={() => setShowTemplates(false)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700">
                  <HiOutlineX className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setShowTemplates(false); handleCreateFromTemplate(t); }}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 border-surface-200 dark:border-surface-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left"
                  >
                    <span className="text-3xl shrink-0">{t.icon}</span>
                    <div>
                      <div className="font-semibold text-surface-900 dark:text-white">{t.name}</div>
                      <div className="text-xs text-surface-400 mt-0.5">{t.description}</div>
                      <div className="text-xs text-primary-500 mt-1">{t.widgets.length} widgets</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dashboard List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
          </div>
        ) : dashboards.length === 0 ? (
          <div className="text-center py-16">
            <HiOutlineViewGrid className="w-16 h-16 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-500 dark:text-surface-400">No dashboards yet</h3>
            <p className="text-surface-400 dark:text-surface-500 mt-1">Create your first dashboard to start visualizing data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboards.map(dash => (
              <div key={dash.id} className="card p-5 group cursor-pointer" onClick={() => navigate(`/dashboard/${dash.id}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-surface-900 dark:text-white truncate">{dash.name}</h3>
                    <p className="text-sm text-surface-400 mt-1">
                      {dash.widgets?.length || 0} widgets
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => handleDuplicate(dash, e)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400" title="Duplicate">
                      <HiOutlineDuplicate className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleShare(dash)} className={`p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 ${dash.public ? 'text-primary-500' : 'text-surface-400'}`} title={dash.public ? 'Shared' : 'Share'}>
                      <HiOutlineShare className="w-4 h-4" />
                    </button>
                    {dash.public && (
                      <button onClick={() => window.open(`/view/${dash.shareId}`, '_blank')} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400" title="Open public link">
                        <HiOutlineExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => handleDelete(dash.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500" title="Delete">
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-surface-400">
                  <span>Updated {new Date(dash.updatedAt).toLocaleDateString()}</span>
                  {dash.public && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium">
                      Public
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
