import Service from '@ember/service';
import { service } from '@ember/service';
import { action } from '@ember/object';

const PERMISSION_MATRIX = {
  admin: {
    contacts: ['read', 'write', 'delete', 'export'],
    deals: ['read', 'write', 'delete', 'export'],
    companies: ['read', 'write', 'delete', 'export'],
    dashboard: ['read', 'export'],
    users: ['read', 'write'],
  },
  manager: {
    contacts: ['read', 'write', 'export'],
    deals: ['read', 'write', 'export'],
    companies: ['read', 'export'],
    dashboard: ['read', 'export'],
    users: ['read'],
  },
  sales_rep: {
    contacts: ['read', 'export'],
    deals: ['read', 'write', 'export'],
    companies: [],
    dashboard: ['read'],
    users: [],
  },
  super_admin: {
    contacts: ['read', 'write', 'delete', 'export'],
    deals: ['read', 'write', 'delete', 'export'],
    companies: ['read', 'write', 'delete', 'export'],
    dashboard: ['read', 'export'],
    users: ['read', 'write'],
  },
};

export default class PermissionsService extends Service {
  @service currentUser;

  @action
  can(feature, actionName) {
    if (!this || !this.currentUser) {
      return false;
    }

    const role = this.currentUser.user?.role;
    if (!role) {
      return false;
    }

    const permissions = PERMISSION_MATRIX[role];
    if (!permissions) {
      return false;
    }

    const featurePermissions = permissions[feature];
    if (!featurePermissions) {
      return false;
    }

    return featurePermissions.includes(actionName);
  }
}
