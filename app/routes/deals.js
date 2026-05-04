import AuthenticatedRoute from './authenticated';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class DealsRoute extends AuthenticatedRoute {
  @service store;
  @service currentUser;

  queryParams = {
    stage: { refreshModel: true },
    tags: { refreshModel: true },
    q: { refreshModel: true },
  };

  async beforeModel(transition) {
    super.beforeModel(transition);
    if (this.session.isAuthenticated) {
      await this.currentUser.load();
    }
  }

  model(params) {
    const filter = {};
    if (params.stage) filter.stage = params.stage;
    if (params.tags) filter.tags = params.tags;
    if (params.q) filter.q = params.q;

    const query = { include: 'company,contact,user' };
    if (Object.keys(filter).length) query.filter = filter;

    return hash({
      deals: this.store.query('deal', query),
      contacts: this.store.findAll('contact'),
      companies: this.store.findAll('company'),
    });
  }
}
