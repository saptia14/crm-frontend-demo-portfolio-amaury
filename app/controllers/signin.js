import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @service session;
  @service router;

  demoTenants = [
    { name: 'Acme Corp', subdomain: 'acme', accent: 'bg-primary-50 text-primary-700' },
    { name: 'Globex Corporation', subdomain: 'globex', accent: 'bg-success-50 text-success-700' },
    { name: 'Initech', subdomain: 'initech', accent: 'bg-warning-50 text-warning-700' },
  ];

  demoRoles = [
    { key: 'admin', label: 'Admin' },
    { key: 'manager', label: 'Manager' },
    { key: 'sales1', label: 'Sales 1' },
    { key: 'sales2', label: 'Sales 2' },
  ];

  @tracked email = '';
  @tracked password = '';
  @tracked errorMessage = '';
  @tracked isProcessing = false;

  @action
  async authenticate(e) {
    e.preventDefault();
    this.isProcessing = true;
    this.errorMessage = '';

    try {
      console.debug('SigninController: Authenticating...', this.email);
      await this.session.authenticate('authenticator:jwt', this.email, this.password);
      console.debug('SigninController: Success! Session isAuthenticated:', this.session.isAuthenticated);
      
      if (this.session.isAuthenticated) {
        console.debug('SigninController: Transitioning to dashboard...');
        this.router.transitionTo('dashboard');
      } else {
        console.warn('SigninController: Authentication resolved but session is not authenticated.');
        this.errorMessage = 'Session initialization failed. Please try again.';
      }
    } catch (error) {
      console.error('SigninController: Authentication error:', error);
      if (error && error.error) {
        this.errorMessage = error.error;
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
    } finally {
      this.isProcessing = false;
    }
  }

  @action
  useDemo(tenant, role) {
    this.email = `${role.key}@${tenant.subdomain}.example.com`;
    this.password = 'password123';
    this.errorMessage = '';
  }
}
