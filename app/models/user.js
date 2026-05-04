import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class UserModel extends Model {
  @attr('string') email;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') role;

  @belongsTo('tenant', { async: true, inverse: 'users' }) tenant;
  @hasMany('deal', { async: true, inverse: 'user' }) deals;
  @hasMany('note', { async: true, inverse: 'user' }) notes;

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get isAdmin() {
    return this.role === 'admin';
  }

  get isManager() {
    return this.role === 'manager';
  }

  get isSalesRep() {
    return this.role === 'sales_rep';
  }

  get isSuperAdmin() {
    return this.role === 'super_admin';
  }
}
