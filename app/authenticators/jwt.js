import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import config from 'crm-frontend/config/environment';

export default class JwtAuthenticator extends BaseAuthenticator {
  async restore(data) {
    if (data && data.token) {
      return data;
    } else {
      throw 'No valid token found in session data.';
    }
  }

  async authenticate(email, password) {
    console.debug('JwtAuthenticator: Authenticating user...', email);
    const response = await fetch(`${config.API_HOST}/${config.API_NAMESPACE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        user: { email, password }
      })
    });

    if (response.ok) {
      // Devise-JWT sends the token in the Authorization header
      const authHeader = response.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        const json = await response.json();
        
        return {
          token,
          // Extract user details if they are in the payload (jsonapi-serializer format)
          user: json.data, 
        };
      } else {
        throw new Error('Authorization header missing from response.');
      }
    } else {
      const errorResponse = await response.json();
      throw errorResponse;
    }
  }

  async invalidate() {
    const data = this.session?.data?.authenticated;
    const token = data?.token;
    
    if (token) {
      await fetch(`${config.API_HOST}/${config.API_NAMESPACE}/logout`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.api+json'
        }
      });
    }
    
    return Promise.resolve();
  }
}
