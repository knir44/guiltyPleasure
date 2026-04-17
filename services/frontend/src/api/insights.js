const BASE = '/api/insights';

async function req(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export const getSummary  = ()               => req('/summary');
export const getByGenre  = ()               => req('/by-genre');
export const getByType   = ()               => req('/by-type');
export const getMonthly  = (months = 12)    => req(`/monthly?months=${months}`);
export const getTopRated = (limit = 10)     => req(`/top-rated?limit=${limit}`);
