import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service tenantTheme;

  async beforeModel() {
    await this.session.setup();
  }

  sessionInvalidated() {
    this.tenantTheme.reset();
    super.sessionInvalidated();
  }
}
