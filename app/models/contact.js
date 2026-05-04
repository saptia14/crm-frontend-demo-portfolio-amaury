import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class ContactModel extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('string') phone;
  @attr('string') fullName;
  @attr() tagList; // Array of tags

  @belongsTo('company', { async: true, inverse: 'contacts' }) company;
  @hasMany('deal', { async: true, inverse: 'contact' }) deals;
  @hasMany('note', { async: true, inverse: 'notable', as: 'notable' }) notes;
}
