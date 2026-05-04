import Component from '@ember/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Chart from 'chart.js/auto';

export default class PipelineDoughnutComponent extends Component {
  @service analytics;

  @tracked isLoading = true;
  @tracked errorMessage = '';

  chart = null;

  async didInsertElement() {
    await this.loadChart();
  }

  async didUpdateAttrs() {
    await this.loadChart();
  }

  willDestroyElement() {
    this.destroyChart();
  }

  destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  async loadChart() {
    if (!this.from || !this.to) {
      this.isLoading = false;
      this.destroyChart();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const payload = await this.analytics.pipeline({
        from: this.from,
        to: this.to,
        user_id: this.userId,
      });

      this.destroyChart();

      const canvas = this.element?.querySelector('canvas');
      if (!canvas) {
        return;
      }

      const stages = payload.data?.stages ?? [];
      const totalCount = stages.reduce((sum, item) => sum + item.count, 0);

      if (totalCount === 0) {
        this.errorMessage = 'No deals found for the selected range.';
        return;
      }

      this.chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: stages.map((item) => item.stage),
          datasets: [
            {
              data: stages.map((item) => item.count),
              backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: { size: 11 }
              }
            }
          },
          cutout: '70%'
        },
      });
    } catch (_error) {
      this.errorMessage = 'Unable to load pipeline chart.';
    } finally {
      this.isLoading = false;
    }
  }
}
