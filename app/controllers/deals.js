import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

const DEAL_STAGES = [
  'prospect',
  'qualification',
  'proposal',
  'negotiation',
  'won',
  'lost',
];

export default class DealsController extends Controller {
  @service currentUser;
  @service store;
  @service router;
  @service csvExport;
  @service permissions;

  queryParams = ['stage', 'tags', 'q'];

  @tracked stage = '';
  @tracked tags = '';
  @tracked q = '';

  // Modal state
  @tracked showCreateModal = false;
  @tracked editingDeal = null;
  @tracked saveError = '';

  // Form fields
  @tracked formName = '';
  @tracked formAmount = '';
  @tracked formStage = 'prospect';
  @tracked formCloseDate = '';
  @tracked formContactId = '';
  @tracked formCompanyId = '';
  @tracked formTags = '';

  stages = DEAL_STAGES;

  get deals() {
    return this.model?.deals ?? [];
  }
  get contacts() {
    return this.model?.contacts ?? [];
  }
  get companies() {
    return this.model?.companies ?? [];
  }
  get totalDeals() {
    return this.model?.deals?.meta?.total ?? this.model?.deals?.length ?? 0;
  }
  get hasFilters() {
    return Boolean(this.stage || this.tags || this.q);
  }

  get exportParams() {
    return {
      filter: {
        stage: this.stage,
        tags: this.tags,
        q: this.q,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  @action applyFilters(event) {
    if (event && event.preventDefault) event.preventDefault();
    // queryParams binding handles the refresh.
  }

  @action clearFilters() {
    this.stage = '';
    this.tags = '';
    this.q = '';
  }

  @action setStageFilter(event) {
    this.stage = event.target.value;
  }

  // ---------------------------------------------------------------------------
  // Assign-to-me
  // ---------------------------------------------------------------------------

  @action async assignToMe(deal) {
    if (!this.currentUser.user) return;
    try {
      deal.user = this.currentUser.user;
      await this.store.saveRecord(deal);
    } catch (e) {
      console.error('assignToMe error', e);
      alert('Failed to assign deal.');
      deal.rollbackAttributes();
    }
  }

  // ---------------------------------------------------------------------------
  // Create / Edit modal
  // ---------------------------------------------------------------------------

  @action openCreate() {
    this.editingDeal = null;
    this.formName = '';
    this.formAmount = '';
    this.formStage = 'prospect';
    this.formCloseDate = '';
    this.formContactId = '';
    this.formCompanyId = '';
    this.formTags = '';
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action openEdit(deal) {
    this.editingDeal = deal;
    this.formName = deal.name || '';
    this.formAmount = deal.amount != null ? String(deal.amount) : '';
    this.formStage = deal.stage || 'prospect';
    this.formCloseDate = deal.expectedCloseDate
      ? new Date(deal.expectedCloseDate).toISOString().slice(0, 10)
      : '';
    this.formContactId = deal.belongsTo('contact').id() || '';
    this.formCompanyId = deal.belongsTo('company').id() || '';
    this.formTags = (deal.tagList || []).join(', ');
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action closeModal() {
    this.showCreateModal = false;
    this.editingDeal = null;
    this.saveError = '';
  }

  @action setFormField(field, event) {
    this[field] = event.target.value;
  }

  @action async saveDeal(event) {
    event.preventDefault();
    this.saveError = '';

    const tagList = this.formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const amount = this.formAmount ? Number(this.formAmount) : 0;

    try {
      if (this.editingDeal) {
        const d = this.editingDeal;
        d.name = this.formName;
        d.amount = amount;
        d.stage = this.formStage;
        d.expectedCloseDate = this.formCloseDate || null;
        d.tagList = tagList;
        if (this.formContactId) {
          d.contact = await this.store.findRecord('contact', this.formContactId);
        }
        if (this.formCompanyId) {
          d.company = await this.store.findRecord('company', this.formCompanyId);
        }
        await this.store.saveRecord(d);
      } else {
        const contact = this.formContactId
          ? await this.store.findRecord('contact', this.formContactId)
          : null;
        const company = this.formCompanyId
          ? await this.store.findRecord('company', this.formCompanyId)
          : null;
        const deal = this.store.createRecord('deal', {
          name: this.formName,
          amount,
          stage: this.formStage,
          expectedCloseDate: this.formCloseDate || null,
          tagList,
          contact,
          company,
          user: this.currentUser.user,
        });
        await this.store.saveRecord(deal);
      }
      this.closeModal();
      this.router.refresh('deals');
    } catch (e) {
      console.error('saveDeal error', e);
      this.saveError =
        e?.errors?.[0]?.detail || e?.message || 'Failed to save deal.';
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  @action async deleteDeal(deal) {
    if (!confirm(`Delete deal "${deal.name}"?`)) return;
    try {
      this.store.deleteRecord(deal);
      await this.store.saveRecord(deal);
      this.router.refresh('deals');
    } catch (e) {
      console.error('deleteDeal error', e);
      alert('Failed to delete deal. Check permissions.');
      deal.rollbackAttributes();
    }
  }

  @action
  async exportCsv() {
    if (!this.permissions.can('deals', 'export')) {
      alert('You do not have permission to export deals.');
      return;
    }

    try {
      await this.csvExport.exportDeals(this.exportParams);
    } catch (error) {
      console.error('exportDeals error', error);
      alert('Failed to export deals as CSV.');
    }
  }
}
