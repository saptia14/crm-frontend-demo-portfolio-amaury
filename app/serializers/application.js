import JSONAPISerializer from '@ember-data/serializer/json-api';
import { underscore } from '@ember/string';

/**
 * The Rails `jsonapi-serializer` gem outputs attribute & relationship keys in
 * snake_case by default (e.g. `first_name`, `expected_close_date`).
 *
 * Ember Data's default `JSONAPISerializer` dasherizes keys (`first-name`),
 * which means it will NOT match the backend payload and attributes will
 * silently be `undefined` on the model — breaking the entire UI (full names,
 * roles, RBAC checks, etc.).
 *
 * We override `keyForAttribute` and `keyForRelationship` to use snake_case so
 * the JS-side camelCase properties (`firstName`) map to the backend's
 * snake_case keys (`first_name`).
 */
export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(key /*, method */) {
    return underscore(key);
  }

  keyForRelationship(key /*, typeClass, method */) {
    return underscore(key);
  }
}
