import EmberRouter from '@ember/routing/router';
import config from 'crm-frontend/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('signin', { path: '/login' });
  this.route('dashboard', { path: '/' });
  this.route('contacts');
  this.route('deals');
  this.route('companies');
  this.route('checkout');
  this.route('users');
});
