/**
 * BFF API Client module connecting to FastAPI endpoints in bff/main.py
 */

const API_BASE_URL = import.meta.env.VITE_BFF_URL || '';

/**
 * Creates a new agent session for the user
 * @param {string} userId - The user's ID
 * @returns {Promise<{session_id: string, user_id: string}>}
 */
export async function createChatSession(userId) {
  const response = await fetch(`${API_BASE_URL}/api/chat/session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to create chat session');
    throw new Error(`Session creation failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * Sends a message to the search-agent via BFF
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.sessionId - Active session ID
 * @param {string} params.message - User prompt message
 * @returns {Promise<{response: string}>}
 */
export async function sendChatMessage({ userId, sessionId, message }) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      session_id: sessionId,
      message: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Failed to send message');
    throw new Error(`Chat error (${response.status}): ${errorText}`);
  }

  return await response.json();
}
