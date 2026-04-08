const API_BASE = process.env.REACT_APP_API_URL || 'https://menu-app-bf0f.onrender.com';

/**
 * Upload a menu image for OCR processing.
 */
export const uploadMenuImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/menu/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Upload failed (${res.status})`);
  }

  return res.json();
};

/**
 * Send a chat query to the backend.
 */
export const sendChatQuery = async (message) => {
  const res = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Query failed (${res.status})`);
  }

  return res.json();
};

/**
 * Health check.
 */
export const checkHealth = async () => {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
};
