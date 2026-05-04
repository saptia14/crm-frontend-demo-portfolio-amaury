import AuthenticatedRoute from './authenticated';
import { service } from '@ember/service';

export default class CompaniesRoute extends AuthenticatedRoute {
  @service store;
  @service currentUser;
  @service permissions;
  @service router;

  async beforeModel(transition) {
    await super.beforeModel(transition);

    if (this.session.isAuthenticated) {
      await this.currentUser.load();

      if (!this.permissions.can('companies', 'read')) {
        this.router.transitionTo('dashboard');
      }
    }
  }

  model() {
    return this.store.findAll('company');
  }
}
