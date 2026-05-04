import Model, { attr, belongsTo } from '@ember-data/model';

export default class NoteModel extends Model {
  @attr('string') body;
  @attr('string') notableType;
  @attr('string') notableId;

  @belongsTo('notable', { async: true, polymorphic: true, inverse: 'notes' }) notable;
  @belongsTo('user', { async: true, inverse: 'notes' }) user; // Author
}
