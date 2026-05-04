import Service from '@ember/service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;

  @tracked user = null;
  _loadingPromise = null;

  async load() {
    if (!this.session.isAuthenticated) {
      this.user = null;
      this._loadingPromise = null;
      return null;
    }

    if (this.user) {
      return this.user;
    }

    if (this._loadingPromise) {
      return this._loadingPromise;
    }

    this._loadingPromise = (async () => {
      try {
        console.debug('CurrentUserService: Loading user data...');
        // Use queryRecord to avoid ID mismatch errors with singleton 'me' endpoint
        let user = await this.store.queryRecord('user', {});
        this.user = user;
        console.debug('CurrentUserService: User loaded successfully:', user.email);
        return user;
      } catch (e) {
        console.error('CurrentUserService: Failed to load user:', e);
        this._loadingPromise = null;
        // Only invalidate if it's a 401/403
        if (e.errors && e.errors[0] && (e.errors[0].status === '401' || e.errors[0].status === '403')) {
          this.session.invalidate();
        }
        throw e;
      }
    })();

    return this._loadingPromise;
  }
}
