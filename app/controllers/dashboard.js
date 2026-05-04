import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

function formatDate(date, includeTime = false) {
  if (includeTime) {
    // Local time string for datetime-local: YYYY-MM-DDTHH:mm
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  }
  return date.toISOString().slice(0, 10);
}

export default class DashboardController extends Controller {
  @service currentUser;

  queryParams = ['granularity', 'stage', 'userId', 'from', 'to'];

  @tracked granularity = 'month';
  @tracked stage = 'won';
  @tracked userId = '';
  @tracked from = this.computeDefaultFrom('month');
  @tracked to = formatDate(new Date(), false);

  computeDefaultFrom(granularity) {
    const now = new Date();
    let date;

    switch (granularity) {
      case 'hour':
        date = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        date = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        date = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
    }
    return formatDate(date, granularity === 'hour');
  }

  get users() {
    return this.model?.users ?? [];
  }

  get hasUserFilter() {
    return this.users.length > 1;
  }

  @action setGranularity(event) {
    this.granularity = event.target.value;
    // Clear dates to avoid confusion when granularity changes.
    // This allows the user to re-select a range that fits the new granularity.
    this.from = '';
    this.to = '';
  }

  @action setStage(event) {
    this.stage = event.target.value;
  }

  @action setUserId(event) {
    this.userId = event.target.value;
  }

  @action setFrom(event) {
    this.from = event.target.value;
  }

  @action setTo(event) {
    this.to = event.target.value;
  }

  @action setPresetRange(days) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);

    this.from = formatDate(from, this.granularity === 'hour');
    this.to = formatDate(to, this.granularity === 'hour');
  }
}
