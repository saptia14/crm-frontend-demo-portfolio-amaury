import SessionService from 'ember-simple-auth/services/session';

/**
 * The default `ember-simple-auth` SessionService transitions to the `index`
 * route after a successful authentication. Our app does not define an
 * `index` route — we use `dashboard` as the home (mapped to `/`). Override
 * `routeAfterAuthentication` so the post-login redirect targets `dashboard`.
 */
export default class Session extends SessionService {
  routeAfterAuthentication = 'dashboard';
}
