import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UsersController extends Controller {
  @service store;
  @service session;
  @service currentUser;
  @service permissions;

  // Available roles for selection (excluding super_admin to prevent accidental creation)
  roles = ['admin', 'manager', 'sales_rep'];

  @tracked saveError = '';

  @action
  async updateRole(user, event) {
    const newRole = event.target.value;
    const previousRole = user.role;
    
    // Prevent modification of other super admins via UI
    if (user.isSuperAdmin) {
      alert("Cannot modify a Super Admin's role.");
      event.target.value = previousRole;
      return;
    }

    try {
      this.saveError = '';
      const token = this.session.data.authenticated?.token;

      // We use fetch here because modern Ember Data (WarpDrive) restricts the legacy .save() method
      // when certain compatibility flags are set. Using the dedicated roles endpoint is safer.
      const response = await fetch(`/api/v1/users/${user.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user: { role: newRole }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.detail || 'Failed to update role');
      }

      // Refresh the record in the store to sync the UI
      // We use findRecord with reload: true because .reload() is restricted in WarpDrive
      await this.store.findRecord('user', user.id, { reload: true });
      
    } catch (e) {
      console.error('Failed to update role', e);
      user.role = previousRole; // Rollback UI
      if (event?.target) {
        event.target.value = previousRole;
      }
      this.saveError = e.message || 'Failed to update role. Ensure you have proper permissions.';
      alert(this.saveError);
    }
  }
}
