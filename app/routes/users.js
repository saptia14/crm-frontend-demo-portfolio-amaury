import AuthenticatedRoute from './authenticated';
import { service } from '@ember/service';

export default class UsersRoute extends AuthenticatedRoute {
  @service store;

  model() {
    return this.store.findAll('user');
  }
}
