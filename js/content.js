import { loadJSON, randomPick } from './utils.js';

export function renderEvents(events = []) {
  const c = document.getElementById('eventsContainer');
  if (!c) return;
  c.innerHTML = '';
  events.forEach(ev => {
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<span class="date">${ev.date || ''}</span><h3>${ev.title || ''}</h3><p>${ev.excerpt || ''}</p>`;
    if (ev.link && ev.link !== '#') {
      const a = document.createElement('a');
      a.href = ev.link;
      a.className = 'read';
      a.textContent = 'read more →';
      el.appendChild(a);
    }
    c.appendChild(el);
  });
}

export function renderExplore(posts = []) {
  const c = document.getElementById('exploreContainer');
  if (!c) return;
  c.innerHTML = '';
  randomPick(posts, 3).forEach(p => {
    const el = document.createElement('article');
    el.className = 'blog-card';
    el.innerHTML = `<div class="blog-thumb ${p.thumb || 't1'}">${p.tag || '•'}</div>
      <div class="blog-body">
        <h3>${p.title || ''}</h3>
        <a class="read" href="${p.link || '#'}">read more &rarr;</a>
      </div>`;
    c.appendChild(el);
  });
}

export function renderFeatured(posts = []) {
  const c = document.getElementById('featuredContainer');
  if (!c) return;
  c.innerHTML = '';
  const latest = [...posts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);
  latest.forEach(p => {
    const el = document.createElement('div');
    el.className = 'foot-post';
    el.innerHTML = `<div class="stub">${p.tag || '•'}</div><span><a href="${p.link || '#'}">${p.title || ''}</a></span>`;
    c.appendChild(el);
  });
}

export function renderUpdates(updates = []) {
  const container = document.getElementById('updatesContainer');
  if (!container) return;

  if (!updates || updates.length === 0) {
    container.innerHTML = `
      <div class="updates-empty">
        <p>No new transmissions at this time. Check back shortly.</p>
      </div>`;
    return;
  }

  container.innerHTML = updates.map(item => `
    <article class="update-entry">
      <time datetime="${item.timestamp || ''}">${item.date || ''}</time>
      <div class="update-body">
        <strong>${item.title || ''}</strong>
        <p>${item.message || ''}</p>
      </div>
    </article>
  `).join('');
}

export async function initUpdates() {
  const updates = await loadJSON('data/updates.json');
  renderUpdates(updates);
}

export async function initHomeContent() {
  const [events, explore, featured] = await Promise.all([
    loadJSON('data/recentEvents.json'),
    loadJSON('data/explore.json'),
    loadJSON('data/featured.json')
  ]);
  renderEvents(events);
  renderExplore(explore);
  renderFeatured(featured);
}
