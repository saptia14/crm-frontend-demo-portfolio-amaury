import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import config from 'crm-frontend/config/environment';

export default class CheckoutController extends Controller {
  @service session;
  @service currentUser;

  @tracked cardName = '';
  @tracked cardNumber = '';
  @tracked cardExpiry = '';
  @tracked cardCvc = '';

  @tracked isProcessing = false;
  @tracked successMessage = '';
  @tracked errorMessage = '';
  @tracked transactionId = '';

  get isAdmin() {
    return Boolean(this.currentUser?.user?.isAdmin);
  }

  get canSubmit() {
    return (
      this.isAdmin &&
      !this.isProcessing &&
      this.cardName.trim() &&
      this.cardNumber.trim() &&
      this.cardExpiry.trim() &&
      this.cardCvc.trim()
    );
  }

  @action
  fillTestCard() {
    this.cardName = 'Demo Admin';
    this.cardNumber = '4242 4242 4242 4242';
    this.cardExpiry = '12 / 30';
    this.cardCvc = '123';
  }

  @action
  async processPayment(event) {
    event.preventDefault();

    if (!this.isAdmin) {
      this.errorMessage = 'Only Tenant Administrators can process payments.';
      return;
    }

    this.isProcessing = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.transactionId = '';

    const token = this.session?.data?.authenticated?.token;
    if (!token) {
      this.isProcessing = false;
      this.errorMessage = 'Your session expired. Please sign in again.';
      return;
    }

    try {
      // Use the relative `/api/v1/...` URL so Vite's dev proxy forwards to
      // the Rails backend. This avoids CORS issues and works in production
      // when both servers are reverse-proxied behind a single host.
      const response = await fetch(`${config.API_HOST}/${config.API_NAMESPACE}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment: {
            name: this.cardName,
            number: this.cardNumber.replace(/\s+/g, ''),
            expiry: this.cardExpiry,
            cvc: this.cardCvc,
          },
        }),
      });

      let result = {};
      try {
        result = await response.json();
      } catch {
        // ignore JSON parse failures, we still have the status code
      }

      if (response.ok && result.success) {
        this.successMessage = result.message || 'Subscription activated!';
        this.transactionId = result.transaction_id || '';
        // Reset form
        this.cardName = '';
        this.cardNumber = '';
        this.cardExpiry = '';
        this.cardCvc = '';
      } else if (response.status === 401) {
        this.errorMessage = 'Your session expired. Please sign in again.';
      } else if (response.status === 403) {
        this.errorMessage = 'You are not authorized to perform this action.';
      } else if (response.status === 402) {
        this.errorMessage =
          result.error || 'Payment declined. Please try a different card.';
      } else {
        this.errorMessage =
          result.error ||
          result?.errors?.[0]?.detail ||
          'Payment failed. Please try again.';
      }
    } catch (e) {
      console.error('processPayment error', e);
      this.errorMessage =
        'Network error: cannot reach the payment server. Is the backend running?';
    } finally {
      this.isProcessing = false;
    }
  }
}
