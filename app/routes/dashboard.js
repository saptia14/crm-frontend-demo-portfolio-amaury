import AuthenticatedRoute from './authenticated';
import { service } from '@ember/service';
import { hash } from 'rsvp';

export default class DashboardRoute extends AuthenticatedRoute {
  @service currentUser;
  @service store;

  async beforeModel(transition) {
    super.beforeModel(transition);
    if (this.session.isAuthenticated) {
      await this.currentUser.load();
    }
  }

  async model() {
    // Fire all KPI queries in parallel. We only need `meta.total` and a
    // small slice of records — page[size]=5 keeps it cheap.
    const [contacts, openDeals, wonDeals, recentDeals, recentContacts, users] =
      await Promise.all([
        this.store.query('contact', { page: { size: 1 } }),
        this.store.query('deal', {
          filter: { status: 'open' },
          page: { size: 1 },
        }),
        this.store.query('deal', {
          filter: { stage: 'won' },
          page: { size: 1 },
        }),
        this.store.query('deal', { page: { size: 5 } }),
        this.store.query('contact', { page: { size: 5 } }),
        this.store.query('user', { page: { size: 50 } }),
      ]);

    const wonRevenue = recentDeals
      .filter((d) => d.stage === 'won')
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    const pipelineValue = recentDeals
      .filter((d) => !['won', 'lost'].includes(d.stage))
      .reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return hash({
      totalContacts: contacts.meta?.total ?? contacts.length,
      openDeals: openDeals.meta?.total ?? openDeals.length,
      wonDeals: wonDeals.meta?.total ?? wonDeals.length,
      pipelineValue,
      wonRevenue,
      recentDeals,
      recentContacts,
      users,
    });
  }
}
