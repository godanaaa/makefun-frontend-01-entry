import { esc, money, date, left, pot } from './format.js';

const route = (kind, value) => `#/${kind}/${encodeURIComponent(value || '')}`;
const heading = (eyebrow, title, copy = '') => `<div class="page-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${copy ? `<p class="lede">${copy}</p>` : ''}</div>`;
const stat = (label, value, detail = '') => `<div class="stat"><span>${label}</span><strong>${value}</strong>${detail ? `<small>${detail}</small>` : ''}</div>`;
const bountyPath = slug => route('bounty', slug);

export function board(data) {
  const items = data.items || [];
  const total = items.reduce((sum, item) => sum + pot(item), 0);
  const cards = items.map(item => {
    const fee = Number(item.entryFeeUsd || 0);
    const closed = item.deadline && new Date(item.deadline) <= new Date();
    return `<a class="bounty-card" href="${bountyPath(item.slug)}"><div class="card-top"><span class="tag ${closed ? 'muted' : ''}"><i></i>${closed ? 'Closed' : 'Open'}</span><span class="arrow">↗</span></div><p class="category">${esc(item.category || 'OPEN CHALLENGE')}</p><h2>${esc(item.title)}</h2><p class="summary">${esc(item.summary || '')}</p><div class="card-pot"><span>LIVE POT</span><strong>${money(pot(item), true)}</strong></div><div class="card-meta">${fee ? `<span class="fee">Entry ${money(fee)}</span>` : '<span class="fee">Free to enter</span>'}<span>${left(item.deadline)}</span></div><div class="card-bottom"><span>◉ &nbsp;${Number(item.submissionCount || 0)} entries</span><span>View challenge&nbsp; →</span></div></a>`;
  }).join('');
  return `${heading('THE OPEN CALL', 'Good ideas deserve <em>a stage.</em>', 'Build something brilliant. Compete for real rewards. Find your next challenge.')}
    <section class="overview" aria-label="Open challenge statistics"><div><span class="overview-label">OPEN CHALLENGES</span><strong>${items.length}</strong></div><div><span class="overview-label">LIVE REWARDS</span><strong class="accent">${money(total, true)}</strong></div><p>Fresh challenges.<br>Real money on the table.</p></section>
    <section class="section-head"><div><p class="eyebrow">PICK YOUR NEXT BUILD</p><h2>Open challenges <span>${String(items.length).padStart(2, '0')}</span></h2></div><span class="sort-label">SORTED BY ACTIVITY <b>⌄</b></span></section>
    <section class="bounty-grid" aria-label="Open bounties">${cards || '<p class="empty">No open challenges right now. Check back soon.</p>'}</section>`;
}

export function bountyPage(item) {
  const closed = item.deadline && new Date(item.deadline) <= new Date();
  const rewards = Array.isArray(item.rewards) ? item.rewards : [];
  const rewardRows = rewards.length ? rewards.map((reward, index) => `<tr><td><span class="place">${esc(reward.rank || reward.place || index + 1)}</span></td><td>${esc(reward.label || reward.title || `Place ${index + 1}`)}</td><td>${money(reward.amount ?? reward.rewardUsd ?? reward.prize_usd ?? 0)}</td></tr>`).join('') : `<tr><td><span class="place">★</span></td><td>Competition reward pool</td><td>${money(pot(item))}</td></tr>`;
  return `${heading(esc(item.category || 'THE CHALLENGE'), esc(item.title), esc(item.summary || ''))}<div class="detail-top"><span class="tag ${closed ? 'muted' : ''}"><i></i>${closed ? 'Closed' : 'Open for entries'}</span><a class="text-link" href="${route('leaderboard', item.slug)}">View leaderboard <span>↗</span></a></div>
    <section class="stats-grid" aria-label="Challenge details">${stat('LIVE POT', `<b class="accent">${money(pot(item), true)}</b>`, 'Prize + entry fees')}${stat('ENTRY FEE', item.entryFeeUsd ? money(item.entryFeeUsd) : 'Free', item.entryFeeUsd ? 'Per submission' : 'No fee to enter')}${stat('DEADLINE', date(item.deadline), left(item.deadline))}${stat('ENTRIES', Number(item.submissionCount || 0), 'Submissions so far')}</section>
    <div class="content-grid"><section class="prose"><p class="eyebrow">THE BRIEF</p><h2>What you’ll make</h2><div class="description">${esc(item.description || item.summary || 'Bring your best idea and build something memorable.')}</div></section><section class="rewards"><p class="eyebrow">REWARDS</p><h2>Reward breakdown</h2><table><thead><tr><th scope="col">PLACE</th><th scope="col">AWARD</th><th scope="col">PRIZE</th></tr></thead><tbody>${rewardRows}</tbody></table><a class="button" href="${route('leaderboard', item.slug)}">Explore the leaderboard <span>↗</span></a></section></div>`;
}

function score(entry) {
  const values = entry.values;
  if (values && typeof values === 'object') return values.display ?? values.score ?? Object.values(values)[0] ?? '—';
  return entry.score ?? '—';
}

export function leaderboardPage(data, slug, cursor, history) {
  const entries = data.entries || [];
  const rows = entries.map((entry, index) => {
    const rank = entry.rank ?? index + 1;
    const prizeRank = entry.prize_rank ?? entry.ranks?.prize_rank ?? '—';
    const cost = entry.cost?.micro_usd != null ? Number(entry.cost.micro_usd) / 1e6 : entry.cost_usd;
    return `<tr class="rank-row rank-${rank <= 3 ? rank : 'other'}"><td><span class="rank-number">${esc(rank)}</span></td><td><a class="handle" href="${route('profile', entry.handle)}">@${esc(entry.handle || 'anonymous')}</a></td><td class="entry-title">${esc(entry.title || 'Untitled entry')}${entry.repo_url ? ` <a class="repo" href="${esc(entry.repo_url)}" target="_blank" rel="noreferrer" aria-label="Open entry repository">↗</a>` : ''}</td><td>${esc(score(entry))}</td><td>${esc(prizeRank)}</td><td>${cost == null ? '—' : money(cost)}</td></tr>`;
  }).join('');
  const next = data.next_cursor || data.nextCursor || data.pagination?.next_cursor || '';
  const previous = history.length > 1;
  return `${heading('THE RESULTS', 'Leaderboard <em>& rankings.</em>', 'The builds, the makers, the numbers. See how the field is shaping up.')}
    <div class="detail-top"><span class="tag"><i></i>${entries.length} entries on this page</span><a class="text-link" href="${bountyPath(slug)}">Back to challenge <span>↗</span></a></div>
    <div class="table-wrap"><table class="leader-table"><thead><tr><th scope="col">RANK</th><th scope="col">MAKER</th><th scope="col">ENTRY</th><th scope="col">SCORE</th><th scope="col">PRIZE RANK</th><th scope="col">BUILD COST</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="empty">No entries yet. Be the first to build.</td></tr>'}</tbody></table></div>
    <nav class="paging" aria-label="Leaderboard pages"><button type="button" data-page="previous" ${previous ? '' : 'disabled'}>← Previous</button><span>Page ${history.length}</span><button type="button" data-page="next" data-cursor="${esc(next)}" ${next ? '' : 'disabled'}>Next →</button></nav>`;
}

export function profilePage(person) {
  const name = person.display_name || person.handle || 'Maker';
  const record = person.record || {};
  const solutions = person.solutions || [];
  const image = person.avatar || person.image;
  const avatar = image ? `<img src="${esc(image)}" crossorigin="anonymous" alt="${esc(name)} avatar">` : `<span>${esc((name[0] || 'M').toUpperCase())}</span>`;
  const entries = solutions.map(solution => {
    const comp = solution.competition || {};
    const slug = comp.slug || '';
    const scoreText = solution.score && typeof solution.score === 'object' ? solution.score.display ?? solution.score.value : solution.score;
    return `<a class="solution" href="${bountyPath(slug)}"><div><span class="eyebrow">${esc(comp.title || 'Competition')}</span><h3>${esc(solution.title || 'Untitled entry')}</h3><span class="solution-meta">${solution.placement ? `#${esc(solution.placement)} placement` : 'Entered'}${scoreText != null ? ` · Score ${esc(scoreText)}` : ''}</span></div><div class="solution-prize"><strong>${money(solution.prize_usd || 0)}</strong><span>PRIZE</span></div><span class="solution-arrow">↗</span></a>`;
  }).join('');
  return `<section class="profile-hero"><div class="avatar">${avatar}</div><div><p class="eyebrow">MAKER PROFILE</p><h1>${esc(name)}</h1><p class="profile-handle">@${esc(person.handle || '')}</p><p class="bio">${esc(person.bio || 'Building things worth sharing.')}</p></div></section>
    <section class="stats-grid record-grid" aria-label="Maker record">${stat('COMPETITIONS', Number(record.competitions_entered || 0))}${stat('PLACED', Number(record.competitions_placed || 0))}${stat('WON', Number(record.competitions_won || 0))}${stat('BEST PLACE', record.best_placement ? `#${esc(record.best_placement)}` : '—')}${stat('PRIZE USD', `<b class="accent">${money(record.prize_usd || 0)}</b>`)}</section>
    <section class="entries-section"><div class="section-head"><div><p class="eyebrow">THE PORTFOLIO</p><h2>Competition entries <span>${String(solutions.length).padStart(2, '0')}</span></h2></div></div><div class="solution-list">${entries || '<p class="empty">No public entries yet.</p>'}</div></section>`;
}
