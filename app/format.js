export const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export function money(value, compact = false) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: amount < 10 ? 2 : 0, notation: compact && amount >= 10000 ? 'compact' : 'standard' }).format(amount);
}

export function date(value) {
  if (!value) return 'No deadline';
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? 'No deadline' : new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

export function left(value) {
  const end = new Date(value || 0).valueOf();
  if (!end) return 'No deadline';
  const delta = end - Date.now();
  if (delta <= 0) return 'Ended';
  const days = Math.floor(delta / 86400000);
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`;
  const hours = Math.max(1, Math.floor(delta / 3600000));
  return `${hours} hour${hours === 1 ? '' : 's'} left`;
}

export const pot = item => Number(item?.potUsd ?? item?.rewardAmount ?? item?.reward_usd ?? 0);
