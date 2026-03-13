import { USER_LOOKUP_URL } from './constants';

/**
 * Looks up a user's connection by their identifier (email or username)
 * @param {string} identifier - Email or username to look up
 * @returns {Promise<{found: boolean, connection?: string, userId?: string}>}
 */
export async function lookupUserConnection(identifier) {
  const response = await fetch(USER_LOOKUP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier })
  });

  if (!response.ok) {
    throw new Error('User lookup failed');
  }

  return response.json();
}
