import { openBounties, bounty, leaderboard, profile } from './api.js';
import { board, bountyPage, leaderboardPage, profilePage } from './views.js';

const app = document.querySelector('#app');
window.__shotReady = false;
let pageHistory = [];
let activeRoute = '';

function routeInfo() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'bounty' && parts[1]) return { kind: 'bounty', key: parts[1] };
  if (parts[0] === 'leaderboard' && parts[1]) return { kind: 'leaderboard', key: parts[1] };
  if (parts[0] === 'profile' && parts[1]) return { kind: 'profile', key: parts[1] };
  return { kind: 'board', key: '' };
}

function showError(error) {
  app.innerHTML = `<section class="error-state"><p class="eyebrow">A SMALL DETOUR</p><h1>We couldn’t load that page.</h1><p>${String(error?.message || 'Please try again in a moment.').replace(/[&<>"']/g, '')}</p><a class="button" href="#/">Back to challenges</a></section>`;
}

async function render() {
  const route = routeInfo();
  const key = `${route.kind}/${route.key}`;
  if (key === activeRoute && window.__shotReady) return;
  activeRoute = key;
  window.__shotReady = false;
  app.innerHTML = '<div class="loading" role="status"><span></span> Finding the good stuff…</div>';
  try {
    if (route.kind !== 'leaderboard') pageHistory = [];
    let html;
    if (route.kind === 'board') {
      const data = await openBounties();
      document.title = 'Open challenges — makefun';
      html = board(data);
    } else if (route.kind === 'bounty') {
      const data = await bounty(route.key);
      document.title = `${data.title || 'Challenge'} — makefun`;
      html = bountyPage(data);
    } else if (route.kind === 'leaderboard') {
      const current = pageHistory.length ? pageHistory[pageHistory.length - 1] : '';
      const data = await leaderboard(route.key, current);
      if (!pageHistory.length) pageHistory = [''];
      document.title = 'Leaderboard — makefun';
      html = leaderboardPage(data, route.key, current, pageHistory);
    } else {
      const data = await profile(route.key);
      document.title = `${data.display_name || data.handle || 'Maker'} — makefun`;
      html = profilePage(data);
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    window.__shotReady = true;
  } catch (error) {
    showError(error);
    window.__shotReady = true;
    console.error(error);
  }
}

app.addEventListener('click', event => {
  const button = event.target.closest('button[data-page]');
  if (!button || button.disabled) return;
  if (button.dataset.page === 'next') {
    pageHistory.push(button.dataset.cursor);
  } else if (pageHistory.length > 1) {
    pageHistory.pop();
  }
  activeRoute = '';
  render();
});

window.addEventListener('hashchange', render);
if (!location.hash) location.hash = '#/';
render();
