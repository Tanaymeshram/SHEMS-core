const API_BASE = '/api';

// Helper for sending requests with JWT authentication header propagation
async function request(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Inject JWT Bearer Token if present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || errData.detail || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth Module
  async login(username, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem('user', JSON.stringify(res.user));
    if (res.access_token) {
      localStorage.setItem('token', res.access_token);
    }
    return res.user;
  },

  async register(username, password, name, role) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, role }),
    });
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },

  // Live Dashboard Feed (BEMS)
  async getLiveDashboard() {
    return request('/dashboard/live');
  },

  // HVAC Settings
  async getHvacSettings() {
    return request('/hvac/settings');
  },

  async setHvacSettings(data) {
    return request('/hvac/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AI & ML Predictions
  async getEnergyPredictions(model = 'random_forest', horizon = 'day', outdoorTemp = 24.0) {
    return request(`/predictions/energy?model=${model}&horizon=${horizon}&outdoor_temp=${outdoorTemp}`);
  },

  // Historical Energy Analytics Aggregations
  async getEnergyAnalytics() {
    return request('/analytics');
  },

  // Medical Equipment Monitor
  async getEquipment() {
    return request('/equipment');
  },

  async updateEquipmentStatus(name, status) {
    return request('/equipment', {
      method: 'POST',
      body: JSON.stringify({ name, status }),
    });
  },

  // Anomalies & Leakages
  async getAnomalies() {
    return request('/anomalies');
  },

  // Automation Policies
  async toggleAutomation(key, value = null) {
    return request('/automation/toggle', {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },

  // Alerts Management
  async getAlerts() {
    return request('/alerts');
  },

  async resolveAlert(id) {
    return request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ id, action: 'resolve' }),
    });
  },

  async deleteAlert(id) {
    return request('/alerts', {
      method: 'POST',
      body: JSON.stringify({ id, action: 'delete' }),
    });
  },

  // Reports Exporter Link
  getReportExportUrl(type, format = 'csv') {
    return `${API_BASE}/reports/export?type=${type}&format=${format}`;
  },

  // System Controls
  async retrainModels() {
    return request('/settings/system', {
      method: 'POST',
      body: JSON.stringify({ action: 'retrain' }),
    });
  },

  async resetDatabase() {
    return request('/settings/system', {
      method: 'POST',
      body: JSON.stringify({ action: 'reset_db' }),
    });
  },

  async askAssistant(query) {
    return request('/assistant/ask', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  async uploadCsvData(csvText) {
    return request('/ingestion/csv', {
      method: 'POST',
      body: JSON.stringify({ csv_data: csvText }),
    });
  },

  async sendSimulatedSensor(sensorData) {
    return request('/ingestion/sensor', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  },

  async overrideHvac(room, overrides) {
    return request('/hvac/override', {
      method: 'POST',
      body: JSON.stringify({ room, ...overrides }),
    });
  },

  async ingestInfra(infraData) {
    return request('/ingestion/infra', {
      method: 'POST',
      body: JSON.stringify(infraData),
    });
  },

  async getPeakLoadPredictions() {
    return request('/predictions/peak');
  },

  async getSolarForecasts() {
    return request('/renewables/forecast');
  },

  async getAnomalyHeatmap() {
    return request('/anomalies/heatmap');
  },

  async getPredictiveMaintenance() {
    return request('/maintenance/predictive');
  }
};

