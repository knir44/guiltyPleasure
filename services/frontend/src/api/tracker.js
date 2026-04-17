const BASE = '/api/tracker';

async function req(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const getAll        = (params = {}) => req(`?${new URLSearchParams(params)}`);
export const getById       = (id)          => req(`/${id}`);
export const create        = (body)        => req('/', { method: 'POST', body: JSON.stringify(body) });
export const update        = (id, body)    => req(`/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const remove        = (id)          => req(`/${id}`, { method: 'DELETE' });
export const getGenres     = ()            => req('/genres');
export const getNowWatching = ()           => req('/now');
export const getNext       = ()            => req('/next');
