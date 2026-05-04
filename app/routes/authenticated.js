import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service session;
  @service currentUser;
  @service tenantTheme;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'signin');

    if (this.session.isAuthenticated) {
      try {
        let user = await this.currentUser.load();
        if (user) {
          let tenant = await user.get('tenant');
          if (tenant) {
            this.tenantTheme.apply(tenant.subdomain);
          }
        }
      } catch (e) {
        console.error('AuthenticatedRoute: Failed to load user or tenant for theming', e);
      }
    }
  }
}
