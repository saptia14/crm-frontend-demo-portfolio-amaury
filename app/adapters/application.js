import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { service } from '@ember/service';
import config from 'crm-frontend/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service session;

  host = config.API_HOST;
  namespace = config.API_NAMESPACE;

  get headers() {
    let headers = {};
    if (this.session.isAuthenticated) {
      // Devise-JWT returns and expects the Bearer token in the Authorization header
      let authData = this.session.data.authenticated;
      if (authData && authData.token) {
        headers['Authorization'] = `Bearer ${authData.token}`;
      }
    }
    return headers;
  }
}
