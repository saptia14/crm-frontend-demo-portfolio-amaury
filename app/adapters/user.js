import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {
  /**
   * For queryRecord('user', {}), we want to hit /api/v1/users/me
   */
  urlForQueryRecord(query, modelName) {
    return `${this.buildURL(modelName)}/me`;
  }

  /**
   * Fallback for findRecord('user', 'me')
   */
  urlForFindRecord(id, modelName, snapshot) {
    if (id === 'me') {
      return `${this.buildURL(modelName)}/me`;
    }
    return super.urlForFindRecord(id, modelName, snapshot);
  }
}
