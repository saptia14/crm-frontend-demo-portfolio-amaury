import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class CompaniesController extends Controller {
  @service currentUser;
  @service store;
  @service router;
  @service csvExport;
  @service permissions;

  @tracked showCreateModal = false;
  @tracked editingCompany = null;
  @tracked saveError = '';

  @tracked formName = '';
  @tracked formIndustry = '';
  @tracked formWebsite = '';

  get companies() {
    return this.model;
  }

  @action openCreate() {
    this.editingCompany = null;
    this.formName = '';
    this.formIndustry = '';
    this.formWebsite = '';
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action openEdit(company) {
    this.editingCompany = company;
    this.formName = company.name || '';
    this.formIndustry = company.industry || '';
    this.formWebsite = company.website || '';
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action closeModal() {
    this.showCreateModal = false;
    this.editingCompany = null;
    this.saveError = '';
  }

  @action async saveCompany(event) {
    event.preventDefault();
    this.saveError = '';
    try {
      if (this.editingCompany) {
        const c = this.editingCompany;
        c.name = this.formName;
        c.industry = this.formIndustry;
        c.website = this.formWebsite;
        await this.store.saveRecord(c);
      } else {
        const c = this.store.createRecord('company', {
          name: this.formName,
          industry: this.formIndustry,
          website: this.formWebsite,
        });
        await this.store.saveRecord(c);
      }
      this.closeModal();
      this.router.refresh('companies');
    } catch (e) {
      console.error('saveCompany error', e);
      this.saveError =
        e?.errors?.[0]?.detail || e?.message || 'Failed to save company.';
    }
  }

  @action async deleteCompany(company) {
    if (!confirm(`Delete company "${company.name}"?`)) return;
    try {
      this.store.deleteRecord(company);
      await this.store.saveRecord(company);
      this.router.refresh('companies');
    } catch (e) {
      console.error('deleteCompany error', e);
      alert('Failed to delete company. Check permissions.');
      company.rollbackAttributes();
    }
  }

  @action
  async exportCsv() {
    if (!this.permissions.can('companies', 'export')) {
      alert('You do not have permission to export companies.');
      return;
    }

    try {
      await this.csvExport.exportCompanies();
    } catch (error) {
      console.error('exportCompanies error', error);
      alert('Failed to export companies as CSV.');
    }
  }
}
