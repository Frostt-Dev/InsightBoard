import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
};

// Dataset APIs
export const datasetApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/datasets'),
  getPreview: (id) => api.get(`/datasets/${id}/preview`),
  delete: (id) => api.delete(`/datasets/${id}`),
};

// Dashboard APIs
export const dashboardApi = {
  create: (name) => api.post('/dashboards', { name }),
  getAll: () => api.get('/dashboards'),
  getById: (id) => api.get(`/dashboards/${id}`),
  update: (id, data) => api.put(`/dashboards/${id}`, data),
  toggleShare: (id) => api.post(`/dashboards/${id}/share`),
  delete: (id) => api.delete(`/dashboards/${id}`),
  duplicate: (id) => api.post(`/dashboards/${id}/duplicate`),
  getPublic: (shareId) => api.get(`/public/dashboards/${shareId}`),
};

// Chart APIs
export const chartApi = {
  getData: (config) => api.post('/charts/data', config),
  getPublicData: (config) => api.post('/public/charts/data', config),
};

// AI APIs (powered by Gemini)
export const aiApi = {
  nlq: (question, columns, datasetId) =>
    api.post('/ai/nlq', { question, columns, datasetId }),
  suggest: (columns, sampleRows, datasetId) =>
    api.post('/ai/suggest', { columns, sampleRows, datasetId }),
  summarize: (profileData) =>
    api.post('/ai/summarize', { profileData }),
};

export default api;

