import Service, { service } from '@ember/service';
import config from 'crm-frontend/config/environment';

function appendParams(searchParams, value, prefix = '') {
  Object.entries(value).forEach(([key, entry]) => {
    if (entry === undefined || entry === null || entry === '') {
      return;
    }

    const nextKey = prefix ? `${prefix}[${key}]` : key;
    if (typeof entry === 'object' && !Array.isArray(entry)) {
      appendParams(searchParams, entry, nextKey);
    } else {
      searchParams.set(nextKey, entry);
    }
  });
}

export default class CsvExportService extends Service {
  @service session;

  get headers() {
    const headers = { Accept: 'text/csv' };
    const token = this.session.data.authenticated?.token;
    if (this.session.isAuthenticated && token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async download(path, params, filename) {
    const url = new URL(path, config.API_HOST);
    const searchParams = new URLSearchParams();
    appendParams(searchParams, params);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));

    const response = await fetch(url, { headers: this.headers });
    if (!response.ok) {
      throw new Error(`CSV export failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  }

  exportContacts(params = {}) {
    return this.download('/api/v1/contacts.csv', params, 'contacts.csv');
  }

  exportDeals(params = {}) {
    return this.download('/api/v1/deals.csv', params, 'deals.csv');
  }

  exportCompanies(params = {}) {
    return this.download('/api/v1/companies.csv', params, 'companies.csv');
  }
}
