import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class DealModel extends Model {
  @attr('string') name;
  @attr('number') amount;
  @attr('string') stage;
  @attr('date') expectedCloseDate;
  @attr() tagList;

  @belongsTo('contact', { async: true, inverse: 'deals' }) contact;
  @belongsTo('company', { async: true, inverse: 'deals' }) company;
  @belongsTo('user', { async: true, inverse: 'deals' }) user; // Assigned sales rep
  @hasMany('note', { async: true, inverse: 'notable', as: 'notable' }) notes;

  get isWon() {
    return this.stage === 'won';
  }

  get isLost() {
    return this.stage === 'lost';
  }

  get isOpen() {
    return !['won', 'lost'].includes(this.stage);
  }
}
