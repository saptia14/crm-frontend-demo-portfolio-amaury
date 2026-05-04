import Service, { service } from '@ember/service';
import config from 'crm-frontend/config/environment';

export default class AnalyticsService extends Service {
  @service session;

  get headers() {
    const headers = { Accept: 'application/json' };
    const token = this.session.data.authenticated?.token;
    if (this.session.isAuthenticated && token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async fetchJson(path, params = {}) {
    const url = new URL(path, config.API_HOST);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  }

  revenue(params = {}) {
    return this.fetchJson('/api/v1/analytics/revenue', params);
  }

  pipeline(params = {}) {
    return this.fetchJson('/api/v1/analytics/pipeline', params);
  }
}
