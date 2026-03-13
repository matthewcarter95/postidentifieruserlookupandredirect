/**
 * Auth0 Action: Connection Router
 *
 * This Action runs during the login flow to route users to their detected connection.
 * It reads the connection detected by the frontend user lookup and redirects the user
 * to authenticate with that specific connection.
 *
 * Trigger: Login Flow (Pre User Registration or Continue Post Login)
 *
 * How it works:
 * 1. Frontend stores detected connection in sessionStorage
 * 2. This Action reads the detected connection from the context
 * 3. If a connection is detected and different from current, redirect to that connection
 */

exports.onExecutePostLogin = async (event, api) => {
  // Check if we have a detected connection from the frontend
  const detectedConnection = event.request.query.connection || event.request.body.connection;
  const currentConnection = event.connection.name;

  console.log('Connection Router Action');
  console.log('Current connection:', currentConnection);
  console.log('Detected connection:', detectedConnection);

  // If a specific connection was detected and it's different from the current one
  if (detectedConnection && detectedConnection !== currentConnection) {
    console.log(`Redirecting from ${currentConnection} to ${detectedConnection}`);

    // Redirect to the detected connection
    // Note: This will restart the authentication flow with the correct connection
    api.redirect.sendUserTo({
      url: `https://${event.request.hostname}/authorize`,
      query: {
        response_type: event.request.query.response_type,
        client_id: event.client.client_id,
        redirect_uri: event.request.query.redirect_uri,
        scope: event.request.query.scope,
        state: event.request.query.state,
        connection: detectedConnection,
        login_hint: event.request.query.login_hint || event.user.email || event.user.username
      }
    });
  }
};
