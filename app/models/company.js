import Model, { attr, hasMany } from '@ember-data/model';

export default class CompanyModel extends Model {
  @attr('string') name;
  @attr('string') industry;
  @attr('string') website;

  @hasMany('contact', { async: true, inverse: 'company' }) contacts;
  @hasMany('deal', { async: true, inverse: 'company' }) deals;
  @hasMany('note', { async: true, inverse: 'notable', as: 'notable' }) notes;
}
