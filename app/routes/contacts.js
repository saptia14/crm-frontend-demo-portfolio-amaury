import AuthenticatedRoute from './authenticated';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class ContactsRoute extends AuthenticatedRoute {
  @service store;
  @service currentUser;

  queryParams = {
    q: { refreshModel: true },
    tags: { refreshModel: true },
  };

  async beforeModel(transition) {
    super.beforeModel(transition);
    if (this.session.isAuthenticated) {
      await this.currentUser.load();
    }
  }

  model(params) {
    const filter = {};
    if (params.q) filter.q = params.q;
    if (params.tags) filter.tags = params.tags;

    const query = { include: 'company' };
    if (Object.keys(filter).length) query.filter = filter;

    return hash({
      contacts: this.store.query('contact', query),
      // Used to populate the company <select> in the create/edit modal.
      companies: this.store.findAll('company'),
    });
  }
}
