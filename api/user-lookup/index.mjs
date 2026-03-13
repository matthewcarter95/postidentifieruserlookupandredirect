import axios from 'axios';

export const handler = async (event) => {
  // Get origin from request headers for CORS
  const origin = event.headers?.origin || event.headers?.Origin || '*';

  // Handle CORS preflight
  if (event.requestContext.http.method === 'OPTIONS') {
    return corsResponse(200, { message: 'OK' }, origin);
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { identifier } = body;

    // Validate input
    if (!identifier) {
      return corsResponse(400, { error: 'Identifier required' }, origin);
    }

    // Sanitize identifier to prevent injection
    const sanitizedIdentifier = identifier.replace(/[^\w@.\-+]/g, '');

    // Get Management API token
    const token = await getManagementToken();

    // Search for user
    const query = `email:"${sanitizedIdentifier}" OR username:"${sanitizedIdentifier}"`;
    const users = await searchUsers(token, query);

    // Extract connection
    if (users.length > 0) {
      const connection = users[0].identities?.[0]?.connection;
      const userId = users[0].user_id;

      return corsResponse(200, {
        found: true,
        connection,
        userId
      }, origin);
    }

    // User not found
    return corsResponse(200, { found: false }, origin);

  } catch (error) {
    console.error('Error:', error);
    return corsResponse(500, { error: 'Internal server error' }, origin);
  }
};

async function getManagementToken() {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_MGMT_CLIENT_ID,
      client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
      audience: process.env.AUTH0_MGMT_AUDIENCE
    }
  );
  return response.data.access_token;
}

async function searchUsers(token, query) {
  const response = await axios.get(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      params: {
        q: query,
        search_engine: 'v3'
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
}

function corsResponse(statusCode, body, origin = '*') {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
