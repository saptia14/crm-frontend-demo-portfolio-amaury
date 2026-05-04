import Component from '@ember/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Chart from 'chart.js/auto';

export default class RevenueChartComponent extends Component {
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
      const payload = await this.analytics.revenue({
        granularity: this.granularity,
        from: this.from,
        to: this.to,
        stage: this.stage,
        user_id: this.userId,
      });

      this.destroyChart();

      const canvas = this.element?.querySelector('canvas');
      if (!canvas) {
        return;
      }

      const series = payload.data?.series ?? [];
      this.chart = new Chart(canvas, {
        type: 'line',
        data: {
          labels: series.map((point) => point.period),
          datasets: [
            {
              label: `${this.stage || 'won'} amount`,
              data: series.map((point) => point.amount),
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.12)',
              fill: true,
              tension: 0.35,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    } catch (_error) {
      this.errorMessage = 'Unable to load revenue chart.';
    } finally {
      this.isLoading = false;
    }
  }
}
