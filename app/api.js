const ROOT = 'https://make.fun/api';
const cache = new Map();

async function get(path) {
  const url = `${ROOT}${path}`;
  const prior = cache.get(url);
  const headers = prior?.etag ? { 'If-None-Match': prior.etag } : {};
  const response = await fetch(url, { headers, mode: 'cors' });
  if (response.status === 304 && prior) return prior.data;
  if (!response.ok) throw new Error(`make.fun returned ${response.status}`);
  const data = await response.json();
  cache.set(url, { data, etag: response.headers.get('ETag') || '' });
  return data;
}

export const openBounties = () => get('/competitions?status=open&activity=times');
export const bounty = slug => get(`/competitions/${encodeURIComponent(slug)}`);
export const leaderboard = (slug, cursor = '') => get(`/competitions/${encodeURIComponent(slug)}/leaderboard?limit=25${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
export const profile = handle => get(`/profiles/${encodeURIComponent(handle)}`);
