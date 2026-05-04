import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ContactsController extends Controller {
  @service currentUser;
  @service store;
  @service router;
  @service csvExport;
  @service permissions;

  queryParams = ['q', 'tags'];

  // Bound to the URL via queryParams above. Initial values come from the URL.
  @tracked q = '';
  @tracked tags = '';

  // Modal state
  @tracked showCreateModal = false;
  @tracked editingContact = null;
  @tracked saveError = '';

  // Form fields for create/edit
  @tracked formFirstName = '';
  @tracked formLastName = '';
  @tracked formEmail = '';
  @tracked formPhone = '';
  @tracked formCompanyId = '';
  @tracked formTags = '';

  get contacts() {
    return this.model?.contacts ?? [];
  }

  get companies() {
    return this.model?.companies ?? [];
  }

  get totalContacts() {
    return (
      this.model?.contacts?.meta?.total ??
      this.model?.contacts?.length ??
      0
    );
  }

  get hasFilters() {
    return Boolean(this.q || this.tags);
  }

  get exportParams() {
    return {
      filter: {
        q: this.q,
        tags: this.tags,
      },
    };
  }

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  @action
  applyFilters(event) {
    if (event && event.preventDefault) event.preventDefault();
    // The @tracked q/tags are already bound via Input @value; assigning
    // them to themselves triggers the queryParams refresh — but since they
    // ARE the query params (declared above), simply having them updated by
    // the Input component already triggers the refresh through Ember's
    // queryParams machinery on the next runloop. To force an immediate
    // refresh on submit (e.g. when a user pastes & hits Enter), we just
    // do nothing — Ember handles it.
  }

  @action
  clearFilters() {
    this.q = '';
    this.tags = '';
  }

  // ---------------------------------------------------------------------------
  // Create / Edit modal
  // ---------------------------------------------------------------------------

  @action
  openCreate() {
    this.editingContact = null;
    this.formFirstName = '';
    this.formLastName = '';
    this.formEmail = '';
    this.formPhone = '';
    this.formCompanyId = '';
    this.formTags = '';
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action
  openEdit(contact) {
    this.editingContact = contact;
    this.formFirstName = contact.firstName || '';
    this.formLastName = contact.lastName || '';
    this.formEmail = contact.email || '';
    this.formPhone = contact.phone || '';
    // Resolve company id without triggering an async fetch UI-side
    const companyRef = contact.belongsTo('company').id();
    this.formCompanyId = companyRef || '';
    this.formTags = (contact.tagList || []).join(', ');
    this.saveError = '';
    this.showCreateModal = true;
  }

  @action
  setCompanyId(event) {
    this.formCompanyId = event.target.value;
  }

  @action
  closeModal() {
    this.showCreateModal = false;
    this.editingContact = null;
    this.saveError = '';
  }

  @action
  async saveContact(event) {
    event.preventDefault();
    this.saveError = '';

    const tagList = this.formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (this.editingContact) {
        const c = this.editingContact;
        c.firstName = this.formFirstName;
        c.lastName = this.formLastName;
        c.email = this.formEmail;
        c.phone = this.formPhone;
        c.tagList = tagList;
        if (this.formCompanyId) {
          c.company = await this.store.findRecord('company', this.formCompanyId);
        }
        await this.store.saveRecord(c);
      } else {
        const company = this.formCompanyId
          ? await this.store.findRecord('company', this.formCompanyId)
          : null;
        const newContact = this.store.createRecord('contact', {
          firstName: this.formFirstName,
          lastName: this.formLastName,
          email: this.formEmail,
          phone: this.formPhone,
          tagList,
          company,
        });
        // WarpDrive 5.x with legacyRequests: true exposes
        // `store.saveRecord(record)` which goes through the LegacyNetworkHandler
        // and the application adapter (POST /api/v1/contacts). Using
        // `record.save()` directly is deprecated and behaves inconsistently
        // when ENABLE_LEGACY_REQUEST_METHODS is gated.
        await this.store.saveRecord(newContact);
      }
      this.closeModal();
      this.router.refresh('contacts');
    } catch (e) {
      console.error('saveContact error', e);
      const detail =
        e?.errors?.[0]?.detail ||
        e?.message ||
        'Failed to save. Please verify the inputs.';
      this.saveError = detail;
    }
  }

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  @action
  async deleteContact(contact) {
    if (
      !confirm(`Delete contact "${contact.fullName || contact.firstName}"?`)
    )
      return;
    try {
      this.store.deleteRecord(contact);
      await this.store.saveRecord(contact);
      this.router.refresh('contacts');
    } catch (e) {
      console.error('deleteContact error', e);
      alert('Failed to delete contact. Check permissions.');
      contact.rollbackAttributes();
    }
  }

  @action
  async exportCsv() {
    if (!this.permissions.can('contacts', 'export')) {
      alert('You do not have permission to export contacts.');
      return;
    }

    try {
      await this.csvExport.exportContacts(this.exportParams);
    } catch (error) {
      console.error('exportContacts error', error);
      alert('Failed to export contacts as CSV.');
    }
  }
}
