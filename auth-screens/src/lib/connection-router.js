/**
 * Connection Router Utility
 *
 * Handles routing users to their detected connection while preserving
 * all original OAuth parameters from the authorization request.
 */

/**
 * Extract OAuth parameters from the current Universal Login context
 * @param {Object} screenProvider - The ACUL screen provider instance
 * @returns {Object} OAuth parameters object
 */
export function getOAuthParams(screenProvider) {
  try {
    // Try to get parameters from the transaction object
    const transaction = screenProvider.transaction;
    const client = transaction?.client;

    // Get state from URL
    const urlParams = new URLSearchParams(window.location.search);
    const state = urlParams.get('state');

    // Try to extract params from various sources
    const params = {
      client_id: client?.clientId || client?.client_id,
      state: state,
      // These might be in the transaction or we need to use defaults
      response_type: 'code', // Most common for Auth0
      redirect_uri: client?.callbackURL || undefined,
      scope: 'openid profile email', // Common default scopes
    };

    return params;
  } catch (error) {
    console.error('Error extracting OAuth params:', error);
    return null;
  }
}

/**
 * Redirect to /authorize with connection parameter while preserving OAuth context
 * @param {Object} screenProvider - The ACUL screen provider instance
 * @param {string} connection - The connection name to route to
 * @param {string} identifier - The user's identifier (for login_hint)
 * @returns {boolean} Whether redirect was initiated
 */
export function redirectToConnection(screenProvider, connection, identifier) {
  try {
    const params = getOAuthParams(screenProvider);

    if (!params || !params.client_id || !params.state) {
      console.warn('Missing required OAuth parameters for redirect');
      return false;
    }

    // Construct the authorize URL
    const auth0Domain = window.location.hostname;
    const authorizeUrl = new URL(`${window.location.protocol}//${auth0Domain}/authorize`);

    // Add all OAuth parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        authorizeUrl.searchParams.set(key, value);
      }
    });

    // Add connection routing
    authorizeUrl.searchParams.set('connection', connection);
    authorizeUrl.searchParams.set('login_hint', identifier);

    console.log('Redirecting to:', authorizeUrl.toString());

    // Perform redirect
    window.location.href = authorizeUrl.toString();
    return true;
  } catch (error) {
    console.error('Error redirecting to connection:', error);
    return false;
  }
}
