import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service session;
  @service currentUser;
  @service permissions;

  @action
  logout() {
    this.session.invalidate();
  }
}
