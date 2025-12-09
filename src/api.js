const API_BASE = (import.meta.env.VITE_API_BASE) || (window.location.origin.replace(/:\/\/[0-9]+/, '') + ':4000/api');

export async function postJSON(path, body, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function getJSON(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  return res.json();
}
