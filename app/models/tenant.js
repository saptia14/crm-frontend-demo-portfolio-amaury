import Model, { attr, hasMany } from '@ember-data/model';

export default class TenantModel extends Model {
  @attr('string') name;
  @attr('string') subdomain;
  @attr('string') logoUrl;
  @attr('string') industry;
  
  @hasMany('user', { async: true, inverse: 'tenant' }) users;
}
