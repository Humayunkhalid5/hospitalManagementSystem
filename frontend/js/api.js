// API layer: fetch + async/await; failures become rejected Promises
const BASE = 'http://localhost:3000/api';
export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => (t ? localStorage.setItem('token', t) : localStorage.removeItem('token'));

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg || res.statusText);
  }
  return data;
}

export const login = (email, password) => request('/auth/login', { method: 'POST', body: { email, password } });
export const register = (email, password) => request('/auth/register', { method: 'POST', body: { email, password } });
export const list = (r) => request(`/${r}`);
export const create = (r, body) => request(`/${r}`, { method: 'POST', body });
export const update = (r, id, body) => request(`/${r}/${id}`, { method: 'PATCH', body });
export const remove = (r, id) => request(`/${r}/${id}`, { method: 'DELETE' });
