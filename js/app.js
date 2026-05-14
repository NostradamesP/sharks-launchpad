// ===== DOM REFS =====
const navbar = document.getElementById('navbar');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
let noResults = document.getElementById('noResults');
let searchTerm = document.getElementById('searchTerm');
let allCards = document.querySelectorAll('.card');
let allSections = document.querySelectorAll('.section');
const compactBtn = document.getElementById('compactBtn');
const favsBtn = document.getElementById('favsBtn');
const starBadge = document.getElementById('starBadge');
const historyBtn = document.getElementById('historyBtn');
const historyBadge = document.getElementById('historyBadge');
const historyDropdown = document.getElementById('historyDropdown');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const shortcutsOverlay = document.getElementById('shortcutsOverlay');
const shortcutsClose = document.getElementById('shortcutsClose');
const tooltip = document.getElementById('tooltipPreview');
const tpTitle = document.getElementById('tpTitle');
const tpDesc = document.getElementById('tpDesc');
const tpScreenshot = document.getElementById('tpScreenshot');

function refreshDomRefs() {
  noResults = document.getElementById('noResults');
  searchTerm = document.getElementById('searchTerm');
  allCards = document.querySelectorAll('.card');
  allSections = document.querySelectorAll('.section');
}

// ===== MOBILE TOGGLE =====
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
  mobileToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});
document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('mobileToggle').classList.remove('active');
  document.getElementById('navLinks').classList.remove('open');
}));

// Nav section links (Health Office, HHRR)
document.querySelectorAll('[data-section]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const section = a.dataset.section;
    const target = document.querySelector(`section[data-category="${section}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      categoryFilters?.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      document.querySelector(`#categoryFilters button[data-cat="${section}"]`)?.classList.add('active');
      allSections.forEach(s => s.style.display = s.dataset.category === section ? '' : 'none');
      allCards.forEach(c => c.classList.remove('card-hidden'));
      if (noResults) noResults.style.display = 'none';
      searchInput.value = '';
      searchClear.classList.remove('visible');
      favsFilterActive = false;
      favsBtn.classList.remove('active');
    }
  });
});

// Mobile dropdown toggle
document.querySelectorAll('.has-dropdown > a').forEach(a => {
  a.addEventListener('click', e => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      a.parentElement.querySelector('.dropdown').classList.toggle('open');
    }
  });
});

// ===== COMPACT VIEW =====
const mainContent = document.querySelector('.main-content');
function initCompact() {
  const saved = localStorage.getItem('launchpad-compact');
  if (saved === 'true') {
    mainContent.classList.add('compact');
    compactBtn.textContent = '⊟';
  } else {
    compactBtn.textContent = '⊞';
  }
}
function toggleCompact() {
  mainContent.classList.toggle('compact');
  const isCompact = mainContent.classList.contains('compact');
  compactBtn.textContent = isCompact ? '⊟' : '⊞';
  localStorage.setItem('launchpad-compact', isCompact);
}
compactBtn.addEventListener('click', toggleCompact);

// ===== FAVORITES =====
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('launchpad-favs')) || []; } catch { return []; }
}
function saveFavorites(favs) {
  localStorage.setItem('launchpad-favs', JSON.stringify(favs));
}
function updateStarBadge() {
  const count = getFavorites().length;
  if (count > 0) { starBadge.textContent = count; starBadge.classList.add('visible'); }
  else { starBadge.classList.remove('visible'); }
}
function addStarsToCards() {
  const favs = getFavorites();
  allCards.forEach(card => {
    if (card.querySelector('.star-btn')) return;
    const icon = card.querySelector('.card-icon');
    const btn = document.createElement('button');
    btn.className = 'star-btn';
    btn.textContent = '☆';
    btn.setAttribute('aria-label', 'Marcar como favorito');
    const url = card.getAttribute('href');
    if (favs.includes(url)) { btn.classList.add('starred'); btn.textContent = '★'; }
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const favs2 = getFavorites();
      const idx = favs2.indexOf(url);
      if (idx > -1) { favs2.splice(idx, 1); btn.classList.remove('starred'); btn.textContent = '☆'; }
      else { favs2.push(url); btn.classList.add('starred'); btn.textContent = '★'; }
      saveFavorites(favs2);
      updateStarBadge();
      if (favsBtn.classList.contains('active')) applyFavsFilter();
    });
    (icon || card).appendChild(btn);
  });
}
let favsFilterActive = false;
function applyFavsFilter() {
  const favs = getFavorites();
  allCards.forEach(card => {
    const url = card.getAttribute('href');
    card.classList.toggle('card-hidden', !favs.includes(url));
  });
  allSections.forEach(section => {
    const cards = section.querySelectorAll('.card');
    let hasVisible = false;
    cards.forEach(c => { if (!c.classList.contains('card-hidden')) hasVisible = true; });
    section.style.display = hasVisible ? '' : 'none';
  });
  noResults.style.display = 'none';
}
function toggleFavs() {
  favsFilterActive = !favsFilterActive;
  favsBtn.classList.toggle('active', favsFilterActive);
  if (favsFilterActive) {
    applyFavsFilter();
  } else {
    filterCards();
  }
}
favsBtn.addEventListener('click', toggleFavs);
addStarsToCards();
updateStarBadge();

// ===== HISTORY =====
function getHistory() {
  try { return JSON.parse(localStorage.getItem('launchpad-history')) || []; } catch { return []; }
}
function saveHistory(h) {
  localStorage.setItem('launchpad-history', JSON.stringify(h));
}
function updateHistoryBadge() {
  const count = getHistory().length;
  if (count > 0) { historyBadge.textContent = count; historyBadge.classList.add('visible'); }
  else { historyBadge.classList.remove('visible'); }
}
function renderHistory() {
  const items = getHistory();
  historyList.innerHTML = '';
  if (items.length === 0) {
    historyList.innerHTML = '<div class="hd-empty">No hay historial aún</div>';
    return;
  }
  items.forEach(item => {
    const el = document.createElement('a');
    el.className = 'hd-item';
    el.href = item.url;
    el.target = '_blank';
    el.innerHTML = `<div class="hd-icon" style="background:var(--primary-light)">🔗</div><span class="hd-title">${item.title}</span>`;
    historyList.appendChild(el);
  });
}
function trackHistory(card) {
  const title = card.querySelector('h3')?.textContent || 'Enlace';
  const url = card.getAttribute('href');
  let items = getHistory();
  items = items.filter(i => i.url !== url);
  items.unshift({ title, url });
  if (items.length > 8) items = items.slice(0, 8);
  saveHistory(items);
  updateHistoryBadge();
}
allCards.forEach(card => {
  card.addEventListener('click', () => {
    trackHistory(card);
    const url = card.getAttribute('href');
    trackClick(url);
    trackVisit(url);
  });
});
historyBtn.addEventListener('click', e => {
  e.stopPropagation();
  historyDropdown.classList.toggle('open');
  renderHistory();
});
clearHistoryBtn.addEventListener('click', e => {
  e.stopPropagation();
  saveHistory([]);
  updateHistoryBadge();
  renderHistory();
});
document.addEventListener('click', e => {
  if (!historyDropdown.contains(e.target) && e.target !== historyBtn) {
    historyDropdown.classList.remove('open');
  }
});
updateHistoryBadge();

// ===== SEARCH + CATEGORY FILTER =====
function filterCards() {
  if (favsFilterActive) return;
  const query = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;
  searchClear.classList.toggle('visible', query.length > 0);
  allCards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const match = !query || text.includes(query);
    card.classList.toggle('card-hidden', !match);
    if (match) visibleCount++;
  });
  allSections.forEach(section => {
    const cards = section.querySelectorAll('.card');
    let hasVisible = false;
    cards.forEach(c => { if (!c.classList.contains('card-hidden')) hasVisible = true; });
    section.style.display = hasVisible ? '' : 'none';
  });
  if (query && visibleCount === 0) {
    if (searchTerm) searchTerm.textContent = query;
    if (noResults) noResults.style.display = 'block';
  } else {
    if (noResults) noResults.style.display = 'none';
  }
}
searchInput.addEventListener('input', filterCards);
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  filterCards();
});

const categoryFilters = document.getElementById('categoryFilters');
function showCategory(cat) {
  refreshDomRefs();
  favsFilterActive = false;
  favsBtn.classList.remove('active');
  categoryFilters?.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  searchInput.value = '';
  searchClear.classList.remove('visible');
  allCards.forEach(c => c.classList.remove('card-hidden'));
  allSections.forEach(section => {
    section.style.display = (cat === 'all' || section.dataset.category === cat) ? '' : 'none';
  });
  if (noResults) noResults.style.display = 'none';
}
categoryFilters?.addEventListener('click', e => {
  const btn = e.target.closest('button[data-cat]');
  if (!btn) return;
  showCategory(btn.dataset.cat);
});

// ===== TOOLTIP PREVIEW =====
let tooltipTimeout = null;
allCards.forEach(card => {
  card.addEventListener('mouseenter', e => {
    clearTimeout(tooltipTimeout);
    const title = card.querySelector('h3')?.textContent || '';
    const desc = card.querySelector('p')?.textContent || '';
    const icon = card.querySelector('.card-icon')?.textContent || '🔗';
    tpTitle.textContent = title;
    tpDesc.textContent = desc;
    tpScreenshot.textContent = icon;
    tooltipTimeout = setTimeout(() => {
      tooltip.classList.add('visible');
      positionTooltip(card);
    }, 400);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(tooltipTimeout);
    tooltip.classList.remove('visible');
  });
  card.addEventListener('mousemove', () => {
    if (tooltip.classList.contains('visible')) positionTooltip(card);
  });
});
function positionTooltip(card) {
  const rect = card.getBoundingClientRect();
  const tw = 240;
  const th = tooltip.offsetHeight || 200;
  let left = rect.right + 12;
  let top = rect.top + rect.height / 2 - th / 2;
  if (left + tw > window.innerWidth - 10) {
    left = rect.left - tw - 12;
  }
  if (left < 10) {
    left = rect.left;
    top = rect.bottom + 8;
  }
  if (top + th > window.innerHeight - 10) {
    top = window.innerHeight - th - 10;
  }
  if (top < 10) top = 10;
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}

shortcutsClose.addEventListener('click', () => {
  shortcutsOverlay.classList.remove('open');
});
shortcutsOverlay.addEventListener('click', e => {
  if (e.target === shortcutsOverlay) shortcutsOverlay.classList.remove('open');
});

// ===== KEYBOARD SHORTCUTS =====
const ignoreKeys = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
document.addEventListener('keydown', e => {
  if (ignoreKeys.has(e.target.tagName) || e.target.isContentEditable) return;
  const k = e.key.toLowerCase();
  if (k === 'c') { e.preventDefault(); toggleCompact(); }
  else if (k === 'v') { e.preventDefault(); toggleFavs(); }
  else if (k === 'r') { e.preventDefault(); historyBtn.click(); }
  else if (k === 'g') {
    e.preventDefault();
    if (mainContent.classList.contains('compact')) toggleCompact();
  }
  else if (k === '?') { e.preventDefault(); shortcutsOverlay.classList.toggle('open'); }
  else if (k === 'escape') {
    shortcutsOverlay.classList.remove('open');
    historyDropdown.classList.remove('open');
  }
});

// ===== PARTICLES =====
function createParticles() {
  if (window.innerWidth < 768) return;
  const hero = document.querySelector('.hero');
  const container = document.createElement('div');
  container.className = 'particles';
  hero.prepend(container);
  const emojis = ['⬡', '⬢', '✦', '✧', '◇', '○'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 4 + Math.random() * 8;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (12 + Math.random() * 20) + 's';
    p.style.animationDelay = (Math.random() * 15) + 's';
    p.style.background = `rgba(255,255,255,${0.03 + Math.random() * 0.08})`;
    container.appendChild(p);
  }
}
createParticles();

// ===== SCROLL BLUR =====
let scrollRAF = null;
window.addEventListener('scroll', () => {
  if (scrollRAF) cancelAnimationFrame(scrollRAF);
  scrollRAF = requestAnimationFrame(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
});

// ===== INTERSECTION OBSERVER =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
    }
  });
}, { threshold: 0.05 });
allCards.forEach(card => {
  card.style.animationPlayState = 'paused';
  observer.observe(card);
});

// ===== CLICK COUNTER + MOST USED =====
const _clicksKey = 'launchpad-clicks';
function getClickCounts() { try { return JSON.parse(localStorage.getItem(_clicksKey)) || {}; } catch { return {}; } }
function saveClickCounts(c) { localStorage.setItem(_clicksKey, JSON.stringify(c)); }
function trackClick(url) {
  const counts = getClickCounts();
  counts[url] = (counts[url] || 0) + 1;
  saveClickCounts(counts);
  renderMostUsed();
}
function escHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function renderMostUsed() {
  const counts = getClickCounts();
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const grid = document.getElementById('mostUsedGrid');
  const section = document.getElementById('mostUsedSection');
  if (entries.length === 0) { section.classList.remove('visible'); return; }
  section.classList.add('visible');
  grid.innerHTML = entries.map(([url, count]) => {
    const card = Array.from(allCards).find(c => c.getAttribute('href') === url);
    if (!card) return '';
    const title = card.querySelector('h3')?.textContent || '';
    const icon = card.querySelector('.card-icon')?.textContent || '🔗';
    return `<a href="${escHtml(url)}" target="_blank" class="most-used-chip"><span class="mu-icon">${icon}</span>${escHtml(title)}<span class="mu-count">${count}</span></a>`;
  }).join('');
}

// ===== ANNOUNCEMENT BANNER =====
(function() {
  const bar = document.getElementById('announcementBar');
  const closeBtn = document.getElementById('announcementClose');
  const msgEl = document.getElementById('announcementText');
  const currentMsg = msgEl.textContent;
  const storedMsg = localStorage.getItem('launchpad-ann-msg');
  if (storedMsg !== currentMsg) {
    localStorage.removeItem('launchpad-ann-dismissed');
    localStorage.setItem('launchpad-ann-msg', currentMsg);
  }
  if (!localStorage.getItem('launchpad-ann-dismissed') && currentMsg) bar.classList.add('visible');
  closeBtn.addEventListener('click', () => {
    bar.classList.remove('visible');
    localStorage.setItem('launchpad-ann-dismissed', '1');
  });
})();

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => { backToTop.classList.toggle('visible', window.scrollY > 400); });
backToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

// ===== COLLAPSIBLE SECTIONS =====
allSections.forEach(section => {
  const header = section.querySelector('.section-header');
  const icon = document.createElement('span');
  icon.className = 'collapse-icon'; icon.textContent = '▾';
  const sc = header.querySelector('.sec-count');
  if (sc) sc.after(icon); else header.appendChild(icon);
  header.addEventListener('click', e => {
    if (e.target.closest('button, a, .category-progress')) return;
    section.classList.toggle('collapsed');
    localStorage.setItem(`launchpad-collapse-${section.dataset.category}`, section.classList.contains('collapsed'));
  });
  if (localStorage.getItem(`launchpad-collapse-${section.dataset.category}`) === 'true') section.classList.add('collapsed');
});

// ===== SEARCH SUGGESTIONS =====
const searchSuggestions = document.getElementById('searchSuggestions');
searchInput.addEventListener('input', () => {
  searchSuggestions.innerHTML = '';
  searchSuggestions.classList.remove('open');
});
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) searchSuggestions.classList.remove('open'); });

// ===== CATEGORY PROGRESS =====
const _visitedKey = 'launchpad-visited';
function getVisited() { try { return JSON.parse(localStorage.getItem(_visitedKey)) || []; } catch { return []; } }
function saveVisited(v) { localStorage.setItem(_visitedKey, JSON.stringify(v)); }
function trackVisit(url) {
  const v = getVisited();
  if (!v.includes(url)) { v.push(url); saveVisited(v); updateCategoryProgress(); }
}
function updateCategoryProgress() {
  const visited = getVisited();
  allSections.forEach(section => {
    const cards = section.querySelectorAll('.card'); const total = cards.length;
    if (total === 0) return;
    let vc = 0; cards.forEach(c => { if (visited.includes(c.getAttribute('href'))) vc++; });
    const pct = Math.round((vc / total) * 100);
    const hdr = section.querySelector('.section-header');
    let prog = hdr.querySelector('.category-progress');
    if (!prog) {
      prog = document.createElement('div'); prog.className = 'category-progress';
      const sc = hdr.querySelector('.sec-count');
      if (sc) sc.after(prog); else hdr.appendChild(prog);
    }
    prog.innerHTML = `<span class="cp-bar"><span class="cp-fill" style="width:${pct}%"></span></span><span class="cp-text">${vc}/${total}</span>`;
  });
}

// ===== FAVORITES MANAGER =====
const favsOverlay = document.getElementById('favsOverlay');
const favsOverlayClose = document.getElementById('favsOverlayClose');
const favsManagerList = document.getElementById('favsManagerList');
const exportFavsBtn = document.getElementById('exportFavsBtn');
const exportFavsBtnMgr = document.getElementById('exportFavsBtnManager');
const clearFavsBtnMgr = document.getElementById('clearFavsBtnManager');

function updateStars() {
  const favs = getFavorites();
  allCards.forEach(card => {
    const s = card.querySelector('.star-btn');
    if (!s) return;
    const starred = favs.includes(card.getAttribute('href'));
    s.classList.toggle('starred', starred);
    s.textContent = starred ? '★' : '☆';
  });
}
function renderFavsManager() {
  const favs = getFavorites();
  if (favs.length === 0) {
    favsManagerList.innerHTML = '<div class="fm-empty">No tienes favoritos aún.<br>Haz clic en la estrella ☆ de cualquier enlace para agregarlo.</div>';
    return;
  }
  favsManagerList.innerHTML = favs.map((url, i) => {
    const card = Array.from(allCards).find(c => c.getAttribute('href') === url);
    const title = card?.querySelector('h3')?.textContent || 'Enlace';
    const icon = card?.querySelector('.card-icon')?.textContent || '🔗';
    return `<div class="fm-item" data-url="${escHtml(url)}" data-index="${i}" draggable="true"><span class="fm-drag-handle">⠿</span><span class="fm-icon" style="background:var(--primary-light)">${icon}</span><span class="fm-title">${escHtml(title)}</span><button class="fm-remove" data-url="${escHtml(url)}">✕</button></div>`;
  }).join('');
  let dragSrc = null;
  favsManagerList.querySelectorAll('.fm-item').forEach(item => {
    item.addEventListener('dragstart', e => { dragSrc = item; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.dataset.url); });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (dragSrc && dragSrc !== item) {
        const fi = parseInt(dragSrc.dataset.index), ti = parseInt(item.dataset.index);
        const f2 = getFavorites(); const [m] = f2.splice(fi, 1); f2.splice(ti, 0, m);
        saveFavorites(f2); updateStarBadge(); updateStars(); renderFavsManager();
        if (favsFilterActive) applyFavsFilter();
      }
    });
  });
  favsManagerList.querySelectorAll('.fm-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const f2 = getFavorites().filter(u => u !== btn.dataset.url); saveFavorites(f2);
      updateStarBadge(); updateStars(); renderFavsManager();
      if (favsFilterActive) applyFavsFilter();
    });
  });
}
exportFavsBtn.addEventListener('click', () => { favsOverlay.classList.add('open'); renderFavsManager(); });
favsOverlayClose.addEventListener('click', () => favsOverlay.classList.remove('open'));
favsOverlay.addEventListener('click', e => { if (e.target === favsOverlay) favsOverlay.classList.remove('open'); });
exportFavsBtnMgr.addEventListener('click', () => {
  const favs = getFavorites(); if (favs.length === 0) return;
  const items = favs.map(url => { const card = Array.from(allCards).find(c => c.getAttribute('href') === url); const title = card?.querySelector('h3')?.textContent || 'Enlace'; return `- ${title}: ${url}`; }).join('\n');
  const blob = new Blob([`Sharks Launch Pad - Favoritos\n===============================\n${items}\n`], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sharks-launchpad-favoritos.txt';
  a.click(); URL.revokeObjectURL(a.href);
});
clearFavsBtnMgr.addEventListener('click', () => {
  if (confirm('¿Limpiar todos los favoritos?')) {
    saveFavorites([]); updateStarBadge(); updateStars(); renderFavsManager();
    if (favsFilterActive) applyFavsFilter();
  }
});

// ===== NEW / UPDATED BADGES =====
allCards.forEach(card => {
  if (card.dataset.new === 'true') { const b = document.createElement('span'); b.className = 'card-badge new'; b.textContent = 'Nuevo'; card.appendChild(b); }
  if (card.dataset.updated === 'true') { const b = document.createElement('span'); b.className = 'card-badge updated'; b.textContent = 'Actualizado'; card.appendChild(b); }
});

// ===== ESCAPE KEY EXTRA CLOSES =====
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchSuggestions.classList.remove('open');
    favsOverlay.classList.remove('open');
  }
});

// ===== INIT =====
initCompact();
renderMostUsed();
updateCategoryProgress();

// ============================================================
// FIREBASE CMS
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyCc1UoFDsz-90g67hZp4bDSVZVG5oZTScU",
  authDomain: "sharks-launchpad.firebaseapp.com",
  projectId: "sharks-launchpad",
  storageBucket: "sharks-launchpad.firebasestorage.app",
  messagingSenderId: "120727023964",
  appId: "1:120727023964:web:922c7a64ed435ffb779199",
  measurementId: "G-26MSY5BGGP"
};

let fbReady = false, db = null, auth = null, fbUser = null, portalUser = null;
let fbCats = [], fbCards = [], fbSite = {};
let pendingLogin = false;

const SCHOOL_DOMAIN = '@cms.edu.do';
const ADMIN_DOMAIN = ''; // safer default: no whole-domain editing. Put '@cms.edu.do' only if every cms.edu.do account should edit.
const ADMIN_EMAILS = ['erojas@cms.edu.do'];

function isSchoolUser(user = portalUser) {
  const email = String(user?.email || '').toLowerCase();
  return !!user && user.emailVerified !== false && email.endsWith(SCHOOL_DOMAIN);
}

function isAuthorizedAdmin(user = fbUser) {
  const email = String(user?.email || '').toLowerCase();
  const domainAllowed = ADMIN_DOMAIN && email.endsWith(ADMIN_DOMAIN);
  return !!user && (domainAllowed || ADMIN_EMAILS.includes(email));
}

function canWriteToFirebase() {
  return !!(fbReady && db && isAuthorizedAdmin());
}

function protectedPlaceholderHtml(title = 'Contenido protegido', message = 'Inicia sesión con tu cuenta del colegio para cargar los recursos.') {
  return '<div class="portal-empty" id="portalEmpty"><h3>' + escHtml(title) + '</h3><p>' + escHtml(message) + '</p></div>' +
    '<div class="no-results" id="noResults"><div class="nr-icon">🔍</div><h3>Sin resultados</h3><p>No encontramos nada para "<span id="searchTerm"></span>". Intenta con otro término.</p></div>';
}

function clearProtectedContent(clearState = true) {
  if (clearState) {
    fbCats = [];
    fbCards = [];
  }
  const mc = document.querySelector('.main-content');
  if (mc) mc.innerHTML = protectedPlaceholderHtml();
  const mostUsedGrid = document.getElementById('mostUsedGrid');
  const mostUsedSection = document.getElementById('mostUsedSection');
  if (mostUsedGrid) mostUsedGrid.innerHTML = '';
  if (mostUsedSection) mostUsedSection.classList.remove('visible');
  refreshDomRefs();
}

function updatePortalAccess(user = portalUser, status) {
  const allowed = isSchoolUser(user);
  const gateStatus = document.getElementById('portalGateStatus');
  const userMenu = document.getElementById('userMenu');
  const userMenuName = document.getElementById('userMenuName');
  const userMenuEmail = document.getElementById('userMenuEmail');
  document.body.classList.toggle('portal-locked', !allowed);
  document.body.classList.toggle('portal-checking', false);
  document.body.classList.toggle('portal-authenticated', allowed);
  if (userMenu) userMenu.classList.remove('open');
  if (userMenuName) userMenuName.textContent = allowed ? (user.displayName || user.email.split('@')[0]) : '';
  if (userMenuEmail) userMenuEmail.textContent = allowed ? user.email : '';
  if (!allowed) clearProtectedContent();
  if (gateStatus) {
    gateStatus.textContent = status || (allowed ? 'Acceso autorizado.' : 'Inicia sesión con tu correo @cms.edu.do.');
  }
}

function disableEditMode(reason) {
  if (editMode) {
    editMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('editBtn')?.classList.remove('active');
    if (typeof teardownEditUI === 'function') teardownEditUI();
  }
  if (reason) showToast(reason, 'error');
}

function updateAdminControls(user = fbUser) {
  const adminBtn = document.getElementById('adminBtn');
  const editBtn = document.getElementById('editBtn');
  const allowed = isAuthorizedAdmin(user);

  document.body.classList.toggle('admin-authenticated', allowed);
  document.body.classList.toggle('admin-logged-out', !allowed);
  if (adminBtn) adminBtn.title = allowed ? 'Admin' : 'Iniciar sesión (Admin)';
  if (editBtn) {
    editBtn.disabled = !allowed;
    editBtn.setAttribute('aria-disabled', String(!allowed));
    editBtn.title = allowed ? 'Modo edición' : 'Inicia sesión como admin para editar';
  }

  if (!allowed) disableEditMode();
}

function requireAdminAccess(message = 'Inicia sesión como admin para editar.') {
  const currentUser = auth?.currentUser || fbUser;
  if (isAuthorizedAdmin(currentUser)) {
    fbUser = currentUser;
    updateAdminControls(currentUser);
    return true;
  }
  fbUser = null;
  updateAdminControls(null);
  disableEditMode(message);
  document.getElementById('adminOverlay')?.classList.remove('open');
  return false;
}

function initFB() {
  if (firebaseConfig.apiKey === "TU_API_KEY") { console.log("Firebase not configured"); return; }
  if (typeof firebase === 'undefined') { console.error("Firebase SDK not loaded"); showToast('Error cargando Firebase SDK. Revisa tu conexión.', 'error'); return; }
  console.log('initFB: firebase OK, initializing...');
  try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    db.settings({ merge: true });
    fbReady = true;
    console.log("Firebase initialized");
    // Handle redirect result (popup blocked fallback)
    auth.getRedirectResult().catch(e => console.error('getRedirectResult:', e));
    auth.onAuthStateChanged(user => {
      const schoolAllowed = isSchoolUser(user);
      const adminAllowed = isAuthorizedAdmin(user);
      portalUser = schoolAllowed ? user : null;
      fbUser = adminAllowed ? user : null;
      updatePortalAccess(portalUser);
      updateAdminControls(fbUser);

      if (schoolAllowed) {
        document.getElementById('apUserInfo').innerHTML = user.photoURL ? '<img src="' + escHtml(user.photoURL) + '" alt=""> ' + escHtml(user.email) : '👤 ' + escHtml(user.email);
        document.getElementById('apLogout')?.classList.toggle('visible', adminAllowed);
        loadFB({ seedIfEmpty: adminAllowed }).then(hideLoading).catch(hideLoading);
        if (pendingLogin && adminAllowed) {
          pendingLogin = false;
          document.getElementById('adminOverlay').classList.add('open');
        }
      } else {
        portalUser = null;
        fbUser = null;
        document.getElementById('apUserInfo').innerHTML = '';
        document.getElementById('apLogout')?.classList.remove('visible');
        document.getElementById('adminOverlay')?.classList.remove('open');
        pendingLogin = false;
        if (user) {
          updatePortalAccess(null, 'Ese correo no pertenece al dominio del colegio.');
          showToast('Usa tu correo @cms.edu.do para entrar.', 'error');
          auth.signOut();
        } else {
          updatePortalAccess(null);
        }
      }
    });
  } catch(e) {
    console.error('initFB CATCH:', e.message, e.stack);
    updatePortalAccess(null, 'No se pudo iniciar seguridad. Revisa Firebase.');
  }
}

function showToast(msg, type) {
  const t = document.getElementById('toast'), m = document.getElementById('toastMsg');
  if (!t || !m) return;
  m.textContent = msg;
  t.className = 'toast ' + (type || 'info') + ' show';
  clearTimeout(t._hide);
  t._hide = setTimeout(() => t.classList.remove('show'), type === 'success' ? 2500 : 5000);
}

function isEditInteractiveTarget(target) {
  return !!target.closest('button, input, textarea, select, label, .hero-editor, .inline-card-form, .ap-modal, .admin-panel, .star-btn');
}

document.addEventListener('click', e => {
  if (!editMode) return;
  const card = e.target.closest('.card');
  if (card && !isEditInteractiveTarget(e.target)) {
    e.preventDefault();
    e.stopPropagation();
  }
}, true);

let _loadCount = 0;
function showLoading() { _loadCount++; document.getElementById('loadingOverlay').classList.add('show'); }
function hideLoading() { _loadCount = Math.max(0, _loadCount - 1); if (!_loadCount) document.getElementById('loadingOverlay').classList.remove('show'); }

function isImageBg(bg) {
  const v = (bg || '').trim();
  return v.startsWith('data:') || v.startsWith('http://') || v.startsWith('https://') || v.startsWith('blob:') || v.startsWith('url(');
}

function imageBgValue(bg) {
  const v = (bg || '').trim();
  if (v.startsWith('url(')) return v;
  return 'url("' + v.replace(/"/g, '\\"') + '")';
}

function parseHeroPosition(position) {
  const parts = String(position || '50% 50%').match(/-?\d+(\.\d+)?/g) || ['50', '50'];
  return { x: Number(parts[0] || 50), y: Number(parts[1] || 50) };
}

function parseHeroZoom(size) {
  const match = String(size || '').match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 120;
}

function colorInputValue(value, fallback) {
  const v = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
}

function applyHeroBackground(el, bg, position = '50% 50%', size = 'cover') {
  if (!el || !bg) return;
  if (isImageBg(bg)) {
    el.style.backgroundImage = imageBgValue(bg);
    el.style.backgroundSize = size || 'cover';
    el.style.backgroundPosition = position || '50% 50%';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.animation = 'none';
    el.classList.add('has-image-bg');
  } else {
    el.style.background = bg;
    el.style.backgroundSize = '200% 200%';
    el.style.backgroundPosition = 'center';
    el.style.backgroundRepeat = 'no-repeat';
    el.style.animation = '';
    el.classList.remove('has-image-bg');
  }
}

function resizeHeroImage(file, maxWidth = 1400, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function openHeroPhotoAdjust(draftCfg, previousCfg) {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  document.querySelector('.hero-photo-adjust')?.remove();
  let pos = parseHeroPosition(draftCfg.heroBgPosition);
  let zoom = parseHeroZoom(draftCfg.heroBgSize);
  const overlay = document.createElement('div');
  overlay.className = 'hero-photo-adjust';
  overlay.innerHTML =
    '<div class="hero-photo-tools">' +
    '<label>Zoom <input type="range" id="hpaZoom" min="80" max="260" value="' + zoom + '"></label>' +
    '<button class="hpa-done" type="button">Done</button>' +
    '<button class="hpa-cancel" type="button">Cancel</button>' +
    '</div>';
  hero.appendChild(overlay);
  const applyAdjust = () => {
    draftCfg.heroBgPosition = Math.round(pos.x) + '% ' + Math.round(pos.y) + '%';
    draftCfg.heroBgSize = zoom + '% auto';
    applyFBcfg(draftCfg);
  };
  applyAdjust();
  overlay.querySelector('#hpaZoom').addEventListener('input', e => {
    zoom = Number(e.target.value);
    applyAdjust();
  });
  let dragStart = null;
  overlay.addEventListener('pointerdown', e => {
    if (e.target.closest('.hero-photo-tools')) return;
    dragStart = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    overlay.setPointerCapture(e.pointerId);
  });
  overlay.addEventListener('pointermove', e => {
    if (!dragStart) return;
    const rect = overlay.getBoundingClientRect();
    pos.x = Math.max(0, Math.min(100, dragStart.px - ((e.clientX - dragStart.x) / rect.width) * 100));
    pos.y = Math.max(0, Math.min(100, dragStart.py - ((e.clientY - dragStart.y) / rect.height) * 100));
    applyAdjust();
  });
  overlay.addEventListener('pointerup', () => { dragStart = null; });
  overlay.addEventListener('pointercancel', () => { dragStart = null; });
  overlay.querySelector('.hpa-cancel').addEventListener('click', () => {
    applyFBcfg(previousCfg);
    overlay.remove();
  });
  overlay.querySelector('.hpa-done').addEventListener('click', async () => {
    fbSite = { ...draftCfg };
    if (canWriteToFirebase()) await db.collection('config').doc('site').set(fbSite);
    overlay.remove();
    showToast('Foto guardada', 'success');
  });
}

function loginGoogle() {
  if (!fbReady) { showToast('Firebase no está listo. ¿Está configurado?', 'error'); return; }
  showLoading();
  showToast('Abriendo ventana de Google...', 'info');
  pendingLogin = true;
  const p = new firebase.auth.GoogleAuthProvider();
  p.setCustomParameters({ hd: 'cms.edu.do' });
  auth.signInWithPopup(p).catch(e => {
    console.error('signInWithPopup error:', e);
    hideLoading();
    pendingLogin = false;
    if (e.code === 'auth/popup-blocked') {
      showToast('Popup bloqueado. Redirigiendo...', 'info');
      auth.signInWithRedirect(p).catch(e2 => {
        console.error('signInWithRedirect error:', e2);
        showToast('Error al iniciar sesión: ' + e2.message, 'error');
      });
    } else if (e.code === 'auth/popup-closed-by-user') {
      showToast('Inicio de sesión cancelado.', 'info');
    } else {
      showToast('Error: ' + e.message, 'error');
    }
  });
}

function logoutGoogle() {
  pendingLogin = false;
  fbUser = null;
  portalUser = null;
  disableEditMode();
  updateAdminControls(null);
  updatePortalAccess(null);
  document.getElementById('adminOverlay')?.classList.remove('open');
  if (!auth) return;
  auth.signOut().then(() => {
    fbUser = null;
    portalUser = null;
    disableEditMode();
    updateAdminControls(null);
    updatePortalAccess(null, 'Sesión cerrada.');
    showToast('Sesión cerrada', 'success');
  }).catch(e => showToast('Error al cerrar sesión: ' + e.message, 'error'));
}

async function loadFB(options = {}) {
  const seedIfEmpty = options.seedIfEmpty ?? !!fbUser;
  try {
    const [sSnap, cSnap, cdSnap] = await Promise.all([
      db.collection('config').doc('site').get(),
      db.collection('categories').orderBy('order').get(),
      db.collection('cards').orderBy('order').get()
    ]);
    if (sSnap.exists) { fbSite = sSnap.data(); applyFBcfg(fbSite); }
    else {
      fbSite = { heroBg: 'linear-gradient(135deg, #b00 0%, #d00 50%, #b00 100%)', heroBgPosition: '50% 50%', heroBgSize: 'cover', primaryColor: '#b00', mascot: '\u{1F988}', title: 'Sharks Launch Pad', announcement: '', heroTitleColor: '#ffffff', heroAccentColor: '#ff6b6b', heroSubtitleColor: 'rgba(255,255,255,0.7)', heroSearchTextColor: '#ffffff' };
      if (seedIfEmpty) await db.collection('config').doc('site').set(fbSite);
    }
    fbCats = cSnap.empty ? [] : cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    fbCards = cdSnap.empty ? [] : cdSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (seedIfEmpty && (!fbCats.length || !fbCards.length)) {
      console.info('Firestore is empty. Add categories and links from the admin panel.');
    }
    renderFB();
    renderAdminCats();
    renderAdminCards_();
    fillCardFilter();
    fillConfigForm();
  } catch(e) { console.error(e); }
}

function applyFBcfg(cfg) {
  if (!cfg) return;
  const hero = document.querySelector('.hero');
  if (hero && cfg.heroBg) applyHeroBackground(hero, cfg.heroBg, cfg.heroBgPosition, cfg.heroBgSize);
  if (hero) {
    hero.style.setProperty('--hero-title-color', cfg.heroTitleColor || '#fff');
    hero.style.setProperty('--hero-accent-color', cfg.heroAccentColor || '#ff6b6b');
    hero.style.setProperty('--hero-subtitle-color', cfg.heroSubtitleColor || 'rgba(255,255,255,0.7)');
    hero.style.setProperty('--hero-search-text-color', cfg.heroSearchTextColor || '#fff');
  }
  if (cfg.primaryColor) { document.documentElement.style.setProperty('--primary', cfg.primaryColor); document.documentElement.style.setProperty('--primary-light', cfg.primaryColor + '22'); }
  const mascotEl = document.querySelector('.hero-mascot');
  if (mascotEl && cfg.mascot) mascotEl.textContent = cfg.mascot;
  const titleEl = document.querySelector('.hero h1');
  if (titleEl && cfg.title) { const p = cfg.title.split(' '); const l = p.pop(); titleEl.innerHTML = p.join(' ') + ' <span class=\"accent\">' + escHtml(l) + '</span>'; }
  const annBar = document.getElementById('announcementBar');
  const annText = document.getElementById('announcementText');
  if (annBar && annText && cfg.announcement) { annText.textContent = cfg.announcement; localStorage.removeItem('launchpad-ann-dismissed'); annBar.classList.add('visible'); }
}

function catBg(name) {
  const m = { 'schoolwide': '#fee2e2', 'forms': '#fef3c7', 'systems': '#e0e7ff', 'comms': '#fef3c7', 'communications': '#fef3c7', 'elementary': '#fce7f3', 'elementary school': '#fce7f3', 'middle': '#e0e7ff', 'middle school': '#e0e7ff', 'high': '#fee2e2', 'high school': '#fee2e2', 'athletics': '#fef3c7', 'health': '#fee2e2', 'health office': '#fee2e2', 'hhrr': '#fef3c7', 'human resources': '#fef3c7' };
  return m[name.toLowerCase()] || '#f0f0f0';
}

function catSlug(name) {
  const normalized = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const aliases = {
    formspoliciesprocedures: 'forms',
    communications: 'comms',
    elementaryschool: 'elementary',
    middleschool: 'middle',
    highschool: 'high',
    healthoffice: 'health',
    humanresources: 'hhrr'
  };
  return aliases[normalized] || normalized;
}

function bootstrapStateFromDom() {
  const sections = Array.from(document.querySelectorAll('.main-content .section'));
  if (!sections.length) return;
  if (!fbCats.length) {
    fbCats = sections.map((s, i) => ({
      id: 'static_cat_' + i,
      name: s.querySelector('h2')?.textContent || '',
      icon: s.querySelector('.sec-icon')?.textContent || '\u{1F4C1}',
      order: i,
      enabled: true
    }));
  }
  if (!fbCards.length) {
    const catsBySlug = new Map(fbCats.map(c => [catSlug(c.name), c]));
    sections.forEach(sec => {
      const cat = catsBySlug.get(sec.dataset.category) || fbCats.find(c => c.name === sec.querySelector('h2')?.textContent);
      Array.from(sec.querySelectorAll('.card')).forEach((el, i) => {
        const id = el.dataset.cardId || 'static_card_' + fbCards.length;
        el.dataset.cardId = id;
        fbCards.push({
          id,
          title: el.querySelector('h3')?.textContent || '',
          description: el.querySelector('p')?.textContent || '',
          url: el.getAttribute('href') || '',
          icon: el.querySelector('.card-icon')?.textContent || '\u{1F517}',
          categoryId: cat?.id || '',
          order: i,
          isNew: el.dataset.new === 'true',
          isUpdated: el.dataset.updated === 'true',
          enabled: true
        });
      });
    });
  }
}

function renderFB() {
  const mc = document.querySelector('.main-content');
  if (!mc) return;
  let o = '';
  let renderedSections = 0;
  [...fbCats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).forEach(cat => {
    if (cat.enabled === false) return;
    const cc = fbCards.filter(c => c.categoryId === cat.id && c.enabled !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    if (cc.length === 0) return;
    renderedSections++;
    const bg = catBg(cat.name);
    const slug = catSlug(cat.name);
    o += '<section class="section" data-category="' + escHtml(slug) + '">';
    o += '<div class="section-header"><div class="sec-icon" style="background:' + bg + '">' + (cat.icon || '\u{1F4C1}') + '</div><h2>' + escHtml(cat.name) + '</h2><span class=\"sec-count\">' + cc.length + '</span></div>';
    o += '<div class="cards-grid">';
    cc.forEach(cd => {
      const d = (Math.random() * 0.5).toFixed(2);
      o += '<a href="' + escHtml(cd.url) + '" target="_blank" class="card" draggable="false" data-card-id="' + escHtml(cd.id) + '" style="animation-delay:' + d + 's"' + (cd.isNew ? ' data-new="true"' : '') + (cd.isUpdated ? ' data-updated="true"' : '') + '>';
      o += '<div class="card-icon" style="background:' + bg + '">' + (cd.icon || '\u{1F517}') + '</div>';
      o += '<div class="card-body"><h3>' + escHtml(cd.title) + '</h3><p>' + escHtml(cd.description) + '</p></div>';
      o += '<span class="card-arrow">→</span></a>';
    });
    o += '</div></section>';
  });
  if (!renderedSections) {
    o += protectedPlaceholderHtml('Contenido no disponible', 'No hay recursos publicados todavía. Un administrador puede agregarlos desde el panel.');
  } else {
    o += '<div class="no-results" id="noResults"><div class="nr-icon">🔍</div><h3>Sin resultados</h3><p>No encontramos nada para "<span id="searchTerm"></span>". Intenta con otro término.</p></div>';
  }
  mc.innerHTML = o;
  reinitFeats();
}

function reinitFeats() {
  refreshDomRefs();
  addStarsToCards();
  if (typeof updateStars === 'function') updateStars();
  updateStarBadge();
  allCards.forEach(card => {
    card.addEventListener('click', () => { trackHistory(card); const u = card.getAttribute('href'); trackClick(u); trackVisit(u); });
    card.addEventListener('mouseenter', e => { clearTimeout(tooltipTimeout); tpTitle.textContent = card.querySelector('h3')?.textContent || ''; tpDesc.textContent = card.querySelector('p')?.textContent || ''; tpScreenshot.textContent = card.querySelector('.card-icon')?.textContent || '🖥️'; tooltipTimeout = setTimeout(() => { tooltip.classList.add('visible'); positionTooltip(card); }, 400); });
    card.addEventListener('mouseleave', () => { clearTimeout(tooltipTimeout); tooltip.classList.remove('visible'); });
  });
  allCards.forEach(card => { card.style.animationPlayState = 'paused'; observer.observe(card); });
  allCards.forEach(card => {
    if (card.dataset.new === 'true') { const b = document.createElement('span'); b.className = 'card-badge new'; b.textContent = 'Nuevo'; card.appendChild(b); }
    if (card.dataset.updated === 'true') { const b = document.createElement('span'); b.className = 'card-badge updated'; b.textContent = 'Actualizado'; card.appendChild(b); }
  });
  renderMostUsed();
  updateCategoryProgress();
}

// Admin events
function adminBtnClick() {
  if (isAuthorizedAdmin()) { document.getElementById('adminOverlay').classList.add('open'); if (fbCats.length) { renderAdminCats(); renderAdminCards_(); fillCardFilter(); } }
  else {
    if (!fbReady) showToast('Firebase no está listo. Revisa la consola (F12).', 'error');
    else if (!isSchoolUser()) loginGoogle();
    else showToast('Tu cuenta puede ver el portal, pero no editarlo.', 'error');
  }
}
function initAdminEvents() {
  const $ = id => document.getElementById(id);
  const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
  on('apClose', 'click', () => { $('adminOverlay').classList.remove('open'); });
  on('apLogout', 'click', logoutGoogle);
  on('portalLoginBtn', 'click', loginGoogle);
  on('userLogoutBtn', 'click', logoutGoogle);
  on('userMenuBtn', 'click', e => {
    e.stopPropagation();
    $('userMenu')?.classList.toggle('open');
  });
}
document.addEventListener('click', e => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.contains(e.target)) menu.classList.remove('open');
});
document.addEventListener('click', e => {
  const tab = e.target.closest('.ap-tab');
  if (tab) {
    document.querySelectorAll('.ap-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ap-tab-content').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const tid = document.getElementById('apTab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1));
    if (tid) tid.classList.add('active');
  }
});

// Config form
const PRESET_COLORS = ['#b00', '#c00', '#800', '#e44', '#333', '#1a56db', '#059669', '#d97706'];
const PRESET_GRADIENTS = ['linear-gradient(135deg, #b00 0%, #d00 50%, #b00 100%)', 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'];
const EMOJIS = ['🦈', '🏫', '🎓', '📚', '💡', '⭐', '🔥', '🚀', '🌟', '💻', '📱', '🎯', '🏆', '👨‍🏫', '👩‍🏫', '🌐', '📖', '✏️', '📊', '🎨', '📋', '📁', '📂', '🗂️', '⚙️', '🔧', '🛠️', '📅', '📆', '📝', '✅', '❌', '📢', '🔔', '🏥', '👥', '🎒', '🏛️', '🏀', '📈', '📞', '🖥️'];

function fillConfigForm() {
  if (fbSite.heroBg) document.getElementById('apHeroBg').value = fbSite.heroBg;
  if (fbSite.primaryColor) { document.getElementById('apPrimaryColor').value = fbSite.primaryColor; document.querySelectorAll('.ap-color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === fbSite.primaryColor)); }
  if (fbSite.mascot) document.getElementById('apMascot').value = fbSite.mascot;
  if (fbSite.title) document.getElementById('apTitle').value = fbSite.title;
  if (fbSite.announcement) document.getElementById('apAnnouncement').value = fbSite.announcement;
}

const $1 = document.getElementById('apSaveConfig');
if ($1) $1.addEventListener('click', async () => {
  if (!requireAdminAccess()) return;
  const cfg = { ...fbSite, heroBg: document.getElementById('apHeroBg').value, heroBgPosition: fbSite.heroBgPosition || '50% 50%', heroBgSize: fbSite.heroBgSize || 'cover', primaryColor: document.getElementById('apPrimaryColor').value, mascot: document.getElementById('apMascot').value, title: document.getElementById('apTitle').value, announcement: document.getElementById('apAnnouncement').value };
  try { await db.collection('config').doc('site').set(cfg); fbSite = cfg; applyFBcfg(cfg); showFBmsg('apConfigFeedback', '✅ Guardado', 'success'); } catch(e) { showFBmsg('apConfigFeedback', '❌ ' + e.message, 'error'); }
});

function showFBmsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg; el.className = 'ap-save-feedback ' + type;
  if (type === 'success') setTimeout(() => { el.className = 'ap-save-feedback'; }, 3000);
}

// Admin categories
function renderAdminCats() {
  const list = document.getElementById('apCategoryList');
  if (!fbCats.length) { list.innerHTML = '<div class="ap-empty">No hay categorías</div>'; return; }
  list.innerHTML = fbCats.map((c, i) =>
    '<div class="admin-item" data-id="' + escHtml(c.id) + '" data-index="' + i + '" draggable="true">' +
    '<span class="ai-drag">⠿</span>' +
    '<span class="ai-icon" style="background:' + catBg(c.name) + '">' + (c.icon || '📁') + '</span>' +
    '<span class="ai-title">' + escHtml(c.name) + '</span>' +
    '<span class="ai-sub">' + (fbCards.filter(x => x.categoryId === c.id).length) + ' enlaces</span>' +
    '<div class="ai-actions"><button class="ai-edit" data-id="' + escHtml(c.id) + '" title="Editar">✏️</button><button class="ai-del" data-id="' + escHtml(c.id) + '" title="Eliminar">🗑️</button></div></div>'
  ).join('');
  setupDrag('apCategoryList', async ids => { if (!canWriteToFirebase()) return; for (let i = 0; i < ids.length; i++) { await db.collection('categories').doc(ids[i]).update({ order: i }); } fbCats.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); });
  document.querySelectorAll('#apCategoryList .ai-edit').forEach(b => b.addEventListener('click', () => openCatModal(b.dataset.id)));
  document.querySelectorAll('#apCategoryList .ai-del').forEach(b => b.addEventListener('click', () => delCat(b.dataset.id)));
}
const $2 = document.getElementById('apAddCategory');
if ($2) $2.addEventListener('click', () => openCatModal(null));

function openCatModal(id) {
  if (!requireAdminAccess()) return;
  const cat = id ? fbCats.find(c => c.id === id) : null;
  showModal(cat ? 'Editar categoría' : 'Nueva categoría',
    '<div class="ap-form">' +
    '<label>Nombre <input type="text" id="apmCatName" value="' + (cat ? escHtml(cat.name) : '') + '" placeholder="Ej: Schoolwide"></label>' +
    '<label>Icono <div class="ap-emoji-grid">' + EMOJIS.map(e => '<div class="ap-emoji-opt' + (cat && cat.icon === e ? ' active' : '') + '">' + e + '</div>').join('') + '</div><input type="text" id="apmCatIcon" value="' + (cat ? escHtml(cat.icon) : '📁') + '"></label>' +
    '</div>',
    async () => {
      if (!requireAdminAccess()) return;
      const name = document.getElementById('apmCatName').value.trim();
      const icon = document.getElementById('apmCatIcon').value.trim();
      if (!name) return;
      if (cat) { await db.collection('categories').doc(cat.id).update({ name, icon }); Object.assign(cat, { name, icon }); }
      else { const r = await db.collection('categories').add({ name, icon, order: fbCats.length, enabled: true }); fbCats.push({ id: r.id, name, icon, order: fbCats.length, enabled: true }); }
      renderAdminCats(); fillCardFilter(); if (fbCards.length) renderFB();
      closeModal();
    }
  );
}

async function delCat(id) {
  if (!requireAdminAccess()) return;
  if (!confirm('¿Eliminar categoría y todos sus enlaces?')) return;
  for (const cd of fbCards.filter(c => c.categoryId === id)) { await db.collection('cards').doc(cd.id).delete(); }
  await db.collection('categories').doc(id).delete();
  fbCards = fbCards.filter(c => c.categoryId !== id);
  fbCats = fbCats.filter(c => c.id !== id);
  renderAdminCats(); renderAdminCards_(); fillCardFilter();
  if (fbCards.length) renderFB();
}

// Admin cards
function renderAdminCards_(filterId) {
  const list = document.getElementById('apCardList');
  const catId = filterId || document.getElementById('apCardFilter')?.value || '';
  let filtered = catId ? fbCards.filter(c => c.categoryId === catId) : fbCards;
  if (!filtered.length) { list.innerHTML = '<div class="ap-empty">No hay enlaces' + (catId ? ' en esta categoría' : '') + '</div>'; return; }
  list.innerHTML = filtered.map((cd, i) => {
    const cat = fbCats.find(c => c.id === cd.categoryId);
    return '<div class="admin-item" data-id="' + escHtml(cd.id) + '" data-index="' + i + '" draggable="true">' +
    '<span class="ai-drag">⠿</span>' +
    '<span class="ai-icon" style="background:' + catBg(cat?.name || '') + '">' + (cd.icon || '🔗') + '</span>' +
    '<span class="ai-title">' + escHtml(cd.title) + '</span>' +
    (cd.isNew ? '<span class="ai-badge new">Nuevo</span>' : '') +
    (cd.isUpdated ? '<span class="ai-badge updated">Act.</span>' : '') +
    '<div class="ai-actions"><button class="ai-edit" data-id="' + escHtml(cd.id) + '" title="Editar">✏️</button><button class="ai-del" data-id="' + escHtml(cd.id) + '" title="Eliminar">🗑️</button></div></div>';
  }).join('');
  setupDrag('apCardList', async ids => { if (!canWriteToFirebase()) return; for (let i = 0; i < ids.length; i++) { await db.collection('cards').doc(ids[i]).update({ order: i }); } fbCards.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id)); });
  document.querySelectorAll('#apCardList .ai-edit').forEach(b => b.addEventListener('click', () => openCardModal(b.dataset.id)));
  document.querySelectorAll('#apCardList .ai-del').forEach(b => b.addEventListener('click', () => delCard(b.dataset.id)));
}

function fillCardFilter() {
  const sel = document.getElementById('apCardFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">Todas</option>' + fbCats.map(c => '<option value="' + escHtml(c.id) + '">' + escHtml(c.name) + '</option>').join('');
  sel.value = cur || '';
  sel.onchange = () => renderAdminCards_(sel.value);
}
const $3 = document.getElementById('apAddCard');
if ($3) $3.addEventListener('click', () => openCardModal(null));

function openCardModal(id) {
  if (!requireAdminAccess()) return;
  const cd = id ? fbCards.find(c => c.id === id) : null;
  const catOpts = fbCats.map(c => '<option value="' + escHtml(c.id) + '"' + (cd && cd.categoryId === c.id ? ' selected' : '') + '>' + escHtml(c.name) + '</option>').join('');
  showModal(cd ? 'Editar enlace' : 'Nuevo enlace',
    '<div class="ap-form">' +
    '<label>Título <input type="text" id="apmCardTitle" value="' + (cd ? escHtml(cd.title) : '') + '" placeholder="Ej: PowerSchool Teachers"></label>' +
    '<label>Descripción <textarea id="apmCardDesc">' + (cd ? escHtml(cd.description) : '') + '</textarea></label>' +
    '<label>URL <input type="url" id="apmCardUrl" value="' + (cd ? escHtml(cd.url) : '') + '" placeholder="https://..."></label>' +
    '<div class="ap-row"><label>Categoría <select id="apmCardCat">' + catOpts + '</select></label><label>Icono <input type="text" id="apmCardIcon" value="' + (cd ? escHtml(cd.icon) : '🔗') + '"></label></div>' +
    '<div class="ap-row"><label class="ap-toggle"><input type="checkbox" id="apmCardNew"' + (cd?.isNew ? ' checked' : '') + '> Nuevo</label><label class="ap-toggle"><input type="checkbox" id="apmCardUpdated"' + (cd?.isUpdated ? ' checked' : '') + '> Actualizado</label></div>' +
    '</div>',
    async () => {
      if (!requireAdminAccess()) return;
      const d = {
        title: document.getElementById('apmCardTitle').value.trim(),
        description: document.getElementById('apmCardDesc').value.trim(),
        url: document.getElementById('apmCardUrl').value.trim(),
        categoryId: document.getElementById('apmCardCat').value,
        icon: document.getElementById('apmCardIcon').value.trim() || '🔗',
        isNew: document.getElementById('apmCardNew').checked,
        isUpdated: document.getElementById('apmCardUpdated').checked
      };
      if (!d.title || !d.url) return;
      if (cd) {
        const oldCategoryId = cd.categoryId;
        if (oldCategoryId !== d.categoryId) d.order = fbCards.filter(c => c.categoryId === d.categoryId).length;
        await db.collection('cards').doc(cd.id).update(d);
        Object.assign(cd, d);
        if (oldCategoryId !== cd.categoryId) {
          normalizeCardOrders(oldCategoryId);
          await saveCardOrder(oldCategoryId);
        }
      }
      else { d.order = fbCards.filter(c => c.categoryId === d.categoryId).length; d.enabled = true; const r = await db.collection('cards').add(d); fbCards.push({ id: r.id, ...d }); }
      renderAdminCards_(document.getElementById('apCardFilter').value);
      renderAdminCats();
      renderFB();
      closeModal();
    }
  );
}

async function delCard(id) {
  if (!requireAdminAccess()) return;
  if (!confirm('¿Eliminar este enlace?')) return;
  const card = fbCards.find(c => c.id === id);
  await db.collection('cards').doc(id).delete();
  fbCards = fbCards.filter(c => c.id !== id);
  normalizeCardOrders(card?.categoryId);
  await saveCardOrder();
  renderAdminCards_(document.getElementById('apCardFilter').value);
  renderFB();
}

// Modal
function showModal(title, bodyHtml, onSave) {
  document.getElementById('apModalTitle').textContent = title;
  document.getElementById('apModalBody').innerHTML = bodyHtml;
  document.getElementById('apModalOverlay').classList.add('open');
  document.querySelectorAll('.ap-emoji-opt').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.ap-emoji-opt').forEach(e => e.classList.remove('active'));
      el.classList.add('active');
      const inp = document.getElementById('apmCatIcon') || document.getElementById('apmCardIcon');
      if (inp) inp.value = el.textContent;
    });
  });
  document.getElementById('apModalSave').onclick = onSave;
  document.getElementById('apModalCancel').onclick = closeModal;
  document.getElementById('apModalClose').onclick = closeModal;
  document.getElementById('apModalOverlay').onclick = e => { if (e.target === document.getElementById('apModalOverlay')) closeModal(); };
}

function closeModal() { document.getElementById('apModalOverlay').classList.remove('open'); }

// Drag reorder
function setupDrag(listId, onReorder) {
  const list = document.getElementById(listId);
  let src = null;
  list.querySelectorAll('.admin-item').forEach(item => {
    item.addEventListener('dragstart', e => { src = item; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', item.dataset.id); });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    item.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    item.addEventListener('drop', e => {
      e.preventDefault();
      if (src && src !== item) {
        const fi = parseInt(src.dataset.index), ti = parseInt(item.dataset.index);
        const items = list.querySelectorAll('.admin-item');
        const ids = Array.from(items).map(el => el.dataset.id);
        ids.splice(ti, 0, ids.splice(fi, 1)[0]);
        items.forEach((el, i) => el.dataset.index = i);
        onReorder(ids);
      }
    });
  });
}

// Color swatches (initialized after DOM)
function initColorGrid() {
  const grid = document.getElementById('apColorGrid');
  if (!grid) return;
  grid.innerHTML = PRESET_COLORS.map(c => '<div class="ap-color-swatch" style="background:' + c + '" data-color="' + c + '"></div>').join('');
  grid.addEventListener('click', e => {
    const sw = e.target.closest('.ap-color-swatch');
    if (sw) { document.querySelectorAll('.ap-color-swatch').forEach(s => s.classList.remove('active')); sw.classList.add('active'); document.getElementById('apPrimaryColor').value = sw.dataset.color; }
  });
}

// EDIT MODE
let editMode = false;

function toggleEditMode() {
  if (!requireAdminAccess()) return;
  editMode = !editMode;
  const btn = document.getElementById('editBtn');
  btn.classList.toggle('active', editMode);
  document.body.classList.toggle('edit-mode', editMode);
  if (editMode) setupEditUI();
  else teardownEditUI();
}

function setupEditUI() {
  if (!isAuthorizedAdmin()) { disableEditMode(); return; }
  bootstrapStateFromDom();
  if (!fbCats.length && !document.querySelector('.section')) return;
  const firstInit = !document.body.classList.contains('edit-mode-initialized');
  document.body.classList.add('edit-mode-initialized');
  // Delegated drop events on main-content
  const mc = document.querySelector('.main-content');
  if (mc && firstInit && !mc._editListeners) {
    mc._editListeners = true;
    mc.addEventListener('dragover', e => {
      const sec = e.target.closest('.section');
      if (sec) { e.preventDefault(); sec.classList.add('section-dragover'); }
      const card = e.target.closest('.card');
      if (card) { e.preventDefault(); card.classList.add('card-dragover'); }
    });
    mc.addEventListener('dragleave', e => {
      const sec = e.target.closest('.section');
      if (sec) sec.classList.remove('section-dragover');
      document.querySelectorAll('.card').forEach(c => c.classList.remove('card-dragover'));
    });
    mc.addEventListener('drop', e => {
      const data = e.dataTransfer.getData('text/plain');
      if (!data) return;
      e.preventDefault();
      if (data.startsWith('section:')) {
        const sec = e.target.closest('.section');
        if (sec) onSectionDrop(data, sec);
      } else if (data.startsWith('card:')) {
        const grid = e.target.closest('.cards-grid');
        if (grid) onCardDrop(data, grid, e);
      }
      document.querySelectorAll('.section').forEach(s => s.classList.remove('section-dragover'));
      document.querySelectorAll('.card').forEach(c => c.classList.remove('card-dragover'));
    });
  }
  // Section drag handles, delete buttons, add buttons
  document.querySelectorAll('.section').forEach(sec => {
    const hdr = sec.querySelector('.section-header');
    if (!hdr) return;
    hdr.draggable = true;
    if (!hdr._editDragReady) {
      hdr._editDragReady = true;
      hdr.addEventListener('dragstart', e => {
        if (isEditInteractiveTarget(e.target)) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', 'section:' + sec.dataset.category);
        sec.classList.add('dragging');
      });
      hdr.addEventListener('dragend', () => {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('dragging', 'section-dragover'));
      });
    }
    if (!sec.querySelector('.sec-drag-handle')) {
      const dh = document.createElement('span');
      dh.className = 'sec-drag-handle'; dh.textContent = '⠿';
      hdr.insertBefore(dh, hdr.firstChild);
    }
    if (!sec.querySelector('.sec-del-btn')) {
      const db = document.createElement('button');
      db.className = 'sec-del-btn'; db.textContent = '✕';
      db.title = 'Eliminar sección';
      db.addEventListener('click', e => { e.stopPropagation(); delSection(sec.dataset.category); });
      sec.appendChild(db);
    }
    if (!sec.querySelector('.sec-add-btn')) {
      const ab = document.createElement('button');
      ab.className = 'sec-add-btn'; ab.textContent = '+ Agregar enlace';
      ab.addEventListener('click', () => addCardToSection(sec.dataset.category));
      sec.appendChild(ab);
    }
  });
  // Card drag handles, edit/delete buttons
  document.querySelectorAll('.card').forEach(card => {
    card.draggable = true;
    if (!card._editDragReady) {
      card._editDragReady = true;
      card.addEventListener('dragstart', e => {
        if (isEditInteractiveTarget(e.target)) { e.preventDefault(); return; }
        e.dataTransfer.setData('text/plain', 'card:' + card.dataset.cardId);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('dragging', 'card-dragover'));
      });
    }
    if (!card.querySelector('.card-drag-handle')) {
      const dh = document.createElement('span');
      dh.className = 'card-drag-handle'; dh.textContent = '⠿';
      card.insertBefore(dh, card.firstChild);
    }
    if (!card.querySelector('.card-edit-btn')) {
      const eb = document.createElement('button');
      eb.className = 'card-edit-btn'; eb.textContent = '✏️';
      eb.title = 'Editar enlace';
      eb.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); editCard(card); });
      card.appendChild(eb);
    }
    if (!card.querySelector('.card-del-btn')) {
      const db = document.createElement('button');
      db.className = 'card-del-btn'; db.textContent = '✕';
      db.title = 'Eliminar enlace';
      db.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); delCardByEl(card); });
      card.appendChild(db);
    }
  });
  // Add section bar
  if (!document.querySelector('.add-section-bar')) {
    const bar = document.createElement('div');
    bar.className = 'add-section-bar';
    bar.innerHTML = '<button id="addSectionBtn">+ Agregar sección</button>';
    document.querySelector('.main-content').appendChild(bar);
    document.getElementById('addSectionBtn').addEventListener('click', addSection);
  }
  // Hero click
  const hero = document.querySelector('.hero');
  if (hero && !hero._editListener) {
    hero._editListener = true;
    hero.addEventListener('click', openHeroEditor);
  }
}

function teardownEditUI() {
  document.querySelectorAll('.sec-drag-handle, .sec-del-btn, .sec-add-btn, .card-drag-handle, .card-edit-btn, .card-del-btn, .add-section-bar, .inline-card-form').forEach(el => el.remove());
  document.querySelectorAll('.card').forEach(card => { card.draggable = false; });
  document.querySelectorAll('.section-header').forEach(hdr => { hdr.draggable = false; });
  const hero = document.querySelector('.hero');
  if (hero) { hero.removeEventListener('click', openHeroEditor); hero._editListener = false; }
  const he = document.querySelector('.hero-editor');
  if (he) {
    if (he.dataset.saved !== 'true' && he._restoreCfg) applyFBcfg(he._restoreCfg);
    he.remove();
  }
  document.body.classList.remove('edit-mode-initialized');
}

function onSectionDrop(data, targetSec) {
  const srcCat = data.replace('section:', '');
  if (srcCat === targetSec.dataset.category) return;
  const srcIdx = fbCats.findIndex(c => catSlug(c.name) === srcCat);
  const tgtIdx = fbCats.findIndex(c => catSlug(c.name) === targetSec.dataset.category);
  if (srcIdx === -1 || tgtIdx === -1) return;
  const [moved] = fbCats.splice(srcIdx, 1);
  fbCats.splice(tgtIdx, 0, moved);
  fbCats.forEach((c, i) => c.order = i);
  saveCatOrder();
  renderFB();
  if (editMode) setupEditUI();
}

function onCardDrop(data, grid, e) {
  const srcId = data.replace('card:', '');
  const srcCard = fbCards.find(c => c.id === srcId);
  if (!srcCard) return;
  const targetCardEl = e.target.closest('.card');
  const sec = grid.closest('.section');
  const targetSlug = sec?.dataset.category;
  const targetCat = fbCats.find(c => catSlug(c.name) === targetSlug);
  if (!targetCat) return;
  const originalCatId = srcCard.categoryId;
  srcCard.categoryId = targetCat.id;
  let catCards = fbCards.filter(c => c.categoryId === targetCat.id).sort((a, b) => a.order - b.order);
  const curIdx = catCards.findIndex(c => c.id === srcCard.id);
  if (curIdx !== -1) catCards.splice(curIdx, 1);
  if (targetCardEl) {
    const tgtId = targetCardEl.dataset.cardId;
    const tgtIdx = catCards.findIndex(c => c.id === tgtId);
    if (tgtIdx !== -1) catCards.splice(tgtIdx, 0, srcCard);
    else catCards.push(srcCard);
  } else {
    catCards.push(srcCard);
  }
  catCards.forEach((c, i) => c.order = i);
  if (originalCatId !== targetCat.id) normalizeCardOrders(originalCatId);
  saveCardOrder();
  renderFB();
  if (editMode) setupEditUI();
}

function delSection(sectionSlug) {
  if (!requireAdminAccess()) return;
  const cat = fbCats.find(c => catSlug(c.name) === sectionSlug);
  if (!cat || !confirm('¿Eliminar sección "' + escHtml(cat.name) + '" y todos sus enlaces?')) return;
  if (canWriteToFirebase()) {
    fbCards.filter(c => c.categoryId === cat.id).forEach(c => db.collection('cards').doc(c.id).delete());
    db.collection('categories').doc(cat.id).delete();
  }
  fbCards = fbCards.filter(c => c.categoryId !== cat.id);
  fbCats = fbCats.filter(c => c.id !== cat.id);
  renderFB();
  if (editMode) setupEditUI();
  if (typeof renderAdminCats === 'function' && fbCats.length) renderAdminCats();
}

function delCardByEl(el) {
  if (!requireAdminAccess()) return;
  const id = el.dataset.cardId;
  const card = fbCards.find(c => c.id === id);
  if (!card || !confirm('¿Eliminar "' + escHtml(card.title) + '"?')) return;
  if (canWriteToFirebase()) db.collection('cards').doc(card.id).delete();
  fbCards = fbCards.filter(c => c.id !== card.id);
  normalizeCardOrders(card.categoryId);
  saveCardOrder();
  renderFB();
  if (editMode) setupEditUI();
}

function editCard(el) {
  if (!requireAdminAccess()) return;
  const id = el.dataset.cardId;
  const card = fbCards.find(c => c.id === id);
  if (!card) return;
  const catOpts = fbCats.map(c => '<option value="' + escHtml(c.id) + '"' + (c.id === card.categoryId ? ' selected' : '') + '>' + escHtml(c.name) + '</option>').join('');
  showModal('Editar enlace',
    '<div class="ap-form">' +
    '<label>Título <input type="text" id="apmCardTitle" value="' + escHtml(card.title) + '"></label>' +
    '<label>Descripción <textarea id="apmCardDesc">' + escHtml(card.description) + '</textarea></label>' +
    '<label>URL <input type="url" id="apmCardUrl" value="' + escHtml(card.url) + '"></label>' +
    '<div class="ap-row"><label>Categoría <select id="apmCardCat">' + catOpts + '</select></label><label>Icono <input type="text" id="apmCardIcon" value="' + escHtml(card.icon) + '"></label></div>' +
    '<div class="ap-row"><label class="ap-toggle"><input type="checkbox" id="apmCardNew"' + (card.isNew ? ' checked' : '') + '> Nuevo</label><label class="ap-toggle"><input type="checkbox" id="apmCardUpdated"' + (card.isUpdated ? ' checked' : '') + '> Actualizado</label></div>' +
    '</div>',
    async () => {
      card.title = document.getElementById('apmCardTitle').value.trim();
      card.description = document.getElementById('apmCardDesc').value.trim();
      card.url = document.getElementById('apmCardUrl').value.trim();
      const oldCategoryId = card.categoryId;
      card.categoryId = document.getElementById('apmCardCat').value;
      card.icon = document.getElementById('apmCardIcon').value.trim() || '🔗';
      card.isNew = document.getElementById('apmCardNew').checked;
      card.isUpdated = document.getElementById('apmCardUpdated').checked;
      if (!card.title || !card.url) return;
      if (oldCategoryId !== card.categoryId) {
        card.order = fbCards.filter(c => c.categoryId === card.categoryId && c.id !== card.id).length;
        normalizeCardOrders(oldCategoryId);
      }
      if (canWriteToFirebase()) await db.collection('cards').doc(card.id).update({
        title: card.title, description: card.description, url: card.url,
        categoryId: card.categoryId, icon: card.icon,
        isNew: card.isNew, isUpdated: card.isUpdated, order: card.order
      });
      if (oldCategoryId !== card.categoryId) await saveCardOrder(oldCategoryId);
      closeModal();
      renderFB();
      if (editMode) setupEditUI();
    }
  );
}

function addCardToSection(sectionSlug) {
  const cat = fbCats.find(c => catSlug(c.name) === sectionSlug);
  if (!cat) return;
  const section = Array.from(document.querySelectorAll('.section')).find(s => s.dataset.category === sectionSlug);
  if (!section) return;
  section.querySelector('.inline-card-form')?.remove();
  const form = document.createElement('div');
  form.className = 'inline-card-form';
  form.innerHTML =
    '<label>Icono <div class="icf-icons">' + EMOJIS.map((e, i) => '<button type="button" class="icf-icon' + (i === 0 ? ' active' : '') + '" data-icon="' + e + '">' + e + '</button>').join('') + '</div><input type="text" class="icf-icon-input" value="' + escHtml(EMOJIS[0]) + '"></label>' +
    '<div class="icf-grid">' +
    '<label>Nombre <input type="text" class="icf-title" placeholder="Ej: Child Protection Reporting"></label>' +
    '<label>Link <input type="url" class="icf-url" placeholder="https://..."></label>' +
    '</div>' +
    '<label>Descripción <textarea class="icf-desc" placeholder="Breve descripción del recurso"></textarea></label>' +
    '<div class="icf-grid">' +
    '<label><span><input type="checkbox" class="icf-new"> Nuevo</span></label>' +
    '<label><span><input type="checkbox" class="icf-updated"> Actualizado</span></label>' +
    '</div>' +
    '<div class="icf-actions"><button type="button" class="icf-cancel">Cancelar</button><button type="button" class="icf-save">Guardar enlace</button></div>';
  section.querySelector('.sec-add-btn')?.before(form);
  form.querySelector('.icf-title').focus();
  form.querySelectorAll('.icf-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      form.querySelectorAll('.icf-icon').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      form.querySelector('.icf-icon-input').value = btn.dataset.icon;
    });
  });
  form.querySelector('.icf-cancel').addEventListener('click', () => form.remove());
  form.querySelector('.icf-save').addEventListener('click', async () => {
    const d = {
      title: form.querySelector('.icf-title').value.trim(),
      description: form.querySelector('.icf-desc').value.trim(),
      url: form.querySelector('.icf-url').value.trim(),
      categoryId: cat.id,
      icon: form.querySelector('.icf-icon-input').value.trim() || '🔗',
      isNew: form.querySelector('.icf-new').checked,
      isUpdated: form.querySelector('.icf-updated').checked,
      order: fbCards.filter(c => c.categoryId === cat.id).length,
      enabled: true
    };
    if (!d.title || !d.url) { showToast('Completa nombre y link.', 'error'); return; }
    if (!requireAdminAccess()) return;
    const r = await db.collection('cards').add(d);
    fbCards.push({ id: r.id, ...d });
    renderFB();
    if (editMode) setupEditUI();
    showToast('Enlace agregado', 'success');
  });
}

function addSection() {
  showModal('Nueva sección',
    '<div class="ap-form">' +
    '<label>Nombre <input type="text" id="apmCatName" placeholder="Ej: Recursos"></label>' +
    '<label>Icono <div class="ap-emoji-grid">' + EMOJIS.map(e => '<div class="ap-emoji-opt">' + e + '</div>').join('') + '</div><input type="text" id="apmCatIcon" value="📁"></label>' +
    '</div>',
    async () => {
      if (!requireAdminAccess()) return;
      const name = document.getElementById('apmCatName').value.trim();
      const icon = document.getElementById('apmCatIcon').value.trim();
      if (!name) return;
      const order = fbCats.length;
      if (canWriteToFirebase()) { const r = await db.collection('categories').add({ name, icon, order, enabled: true }); fbCats.push({ id: r.id, name, icon, order, enabled: true }); }
      else { fbCats.push({ id: 'local_' + Date.now(), name, icon, order, enabled: true }); }
      closeModal();
      renderFB();
      if (editMode) setupEditUI();
    }
  );
}

function openHeroEditor() {
  if (!editMode || !requireAdminAccess()) return;
  const existing = document.querySelector('.hero-editor');
  if (existing) existing.remove();
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const previousCfg = { ...fbSite };
  const bgVal = fbSite.heroBg || 'linear-gradient(135deg, #b00 0%, #d00 50%, #b00 100%)';
  const pos = parseHeroPosition(fbSite.heroBgPosition);
  const zoom = parseHeroZoom(fbSite.heroBgSize);
  const editor = document.createElement('div');
  editor.className = 'hero-editor';
  editor._restoreCfg = previousCfg;
  const isImg = isImageBg(bgVal);
  editor.innerHTML =
    '<div class="he-panel">' +
    '<h3>Editar cabecera</h3>' +
    '<div class="he-compact-grid">' +
    '<div><div class="he-section-title">Foto</div>' +
    '<div id="hePreview" class="he-preview" title="Arrastra para mover la imagen"></div>' +
    '<label>Subir foto <input type="file" id="heFileInput" accept="image/*"></label></div>' +
    '<div><div class="he-section-title">Texto</div>' +
    '<div class="he-main-fields">' +
    '<label>Mascota <input type="text" id="heMascot" value="' + escHtml(fbSite.mascot || '🦈') + '"></label>' +
    '<label>Título <input type="text" id="heTitle" value="' + escHtml(fbSite.title || 'Sharks Launch Pad') + '"></label>' +
    '<label>Anuncio <input type="text" id="heAnn" value="' + escHtml(fbSite.announcement || '') + '" placeholder="Dejar vacío para ocultar"></label>' +
    '</div><div class="he-section-title">Color</div>' +
    '<div class="he-color-strip">' +
    '<label>Fondo <input type="color" id="heColor" value="' + colorInputValue(fbSite.primaryColor, '#bb0000') + '"></label>' +
    '<label>Letras <input type="color" id="heTitleColor" value="' + colorInputValue(fbSite.heroTitleColor, '#ffffff') + '"></label>' +
    '<label>Resaltado <input type="color" id="heAccentColor" value="' + colorInputValue(fbSite.heroAccentColor, '#ff6b6b') + '"></label>' +
    '</div></div></div>' +
    '<details class="he-advanced"><summary>Más ajustes</summary>' +
    '<div class="he-range-row"><span>Mover X</span><input type="range" id="hePosX" min="0" max="100" value="' + pos.x + '"><span id="hePosXVal">' + pos.x + '%</span></div>' +
    '<div class="he-range-row"><span>Mover Y</span><input type="range" id="hePosY" min="0" max="100" value="' + pos.y + '"><span id="hePosYVal">' + pos.y + '%</span></div>' +
    '<div class="he-range-row"><span>Zoom</span><input type="range" id="heZoom" min="80" max="260" value="' + zoom + '"><span id="heZoomVal">' + zoom + '%</span></div>' +
    '<label>URL de imagen <input type="text" id="heBgUrl" value="' + escHtml(isImg ? bgVal : '') + '" placeholder="https://ejemplo.com/imagen.jpg"></label>' +
    '<label>Gradiente <div class="he-presets">' + PRESET_GRADIENTS.map(g => '<div class="he-preset" style="background:' + g + '" data-bg="' + escHtml(g) + '"></div>').join('') + '</div></label>' +
    '<label>Fondo manual <input type="text" id="heBg" value="' + escHtml(bgVal) + '"></label>' +
    '<label>Subtítulo color <input type="color" id="heSubtitleColor" value="' + colorInputValue(fbSite.heroSubtitleColor, '#ffffff') + '"></label>' +
    '<label>Buscador color <input type="color" id="heSearchColor" value="' + colorInputValue(fbSite.heroSearchTextColor, '#ffffff') + '"></label>' +
    '<div class="he-presets" style="margin-bottom:8px">' + PRESET_COLORS.map(c => '<div class="he-preset" style="background:' + c + '" data-color="' + c + '"></div>').join('') + '</div>' +
    '</details>' +
    '</div>' +
    '<div class="he-actions">' +
    '<button class="he-cancel" id="heCancel">Cancelar</button>' +
    '<button class="he-save" id="heSave">Guardar</button></div></div>';
  editor.addEventListener('click', e => e.stopPropagation());
  hero.appendChild(editor);
  const getHeroPosition = () => document.getElementById('hePosX').value + '% ' + document.getElementById('hePosY').value + '%';
  const getHeroSize = () => document.getElementById('heZoom').value + '% auto';
  const getHeroCfg = () => ({
    ...fbSite,
    heroBg: document.getElementById('heBg').value.trim() || 'linear-gradient(135deg, #b00 0%, #d00 50%, #b00 100%)',
    heroBgPosition: getHeroPosition(),
    heroBgSize: getHeroSize(),
    heroTitleColor: document.getElementById('heTitleColor').value || '#ffffff',
    heroAccentColor: document.getElementById('heAccentColor').value || '#ff6b6b',
    heroSubtitleColor: document.getElementById('heSubtitleColor').value || document.getElementById('heTitleColor').value || '#ffffff',
    heroSearchTextColor: document.getElementById('heSearchColor').value || document.getElementById('heTitleColor').value || '#ffffff',
    primaryColor: document.getElementById('heColor').value.trim() || '#b00',
    mascot: document.getElementById('heMascot').value.trim() || '🦈',
    title: document.getElementById('heTitle').value.trim() || 'Sharks Launch Pad',
    announcement: document.getElementById('heAnn').value.trim()
  });
  const applyHeroDraft = () => applyFBcfg(getHeroCfg());
  const updateRangeLabels = () => {
    document.getElementById('hePosXVal').textContent = document.getElementById('hePosX').value + '%';
    document.getElementById('hePosYVal').textContent = document.getElementById('hePosY').value + '%';
    document.getElementById('heZoomVal').textContent = document.getElementById('heZoom').value + '%';
  };
  const setHeroPreviewBg = bg => {
    updateRangeLabels();
    applyHeroBackground(document.getElementById('hePreview'), bg, getHeroPosition(), getHeroSize());
    applyHeroDraft();
  };
  setHeroPreviewBg(bgVal);
  ['hePosX', 'hePosY', 'heZoom'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => setHeroPreviewBg(document.getElementById('heBg').value || bgVal));
  });
  ['heMascot', 'heTitle', 'heAnn', 'heColor', 'heTitleColor', 'heAccentColor', 'heSubtitleColor', 'heSearchColor'].forEach(id => {
    document.getElementById(id).addEventListener('input', applyHeroDraft);
  });
  let dragStart = null;
  document.getElementById('hePreview').addEventListener('pointerdown', e => {
    dragStart = { x: e.clientX, y: e.clientY, px: Number(document.getElementById('hePosX').value), py: Number(document.getElementById('hePosY').value) };
    e.currentTarget.setPointerCapture(e.pointerId);
  });
  document.getElementById('hePreview').addEventListener('pointermove', e => {
    if (!dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nextX = Math.max(0, Math.min(100, dragStart.px - ((e.clientX - dragStart.x) / rect.width) * 100));
    const nextY = Math.max(0, Math.min(100, dragStart.py - ((e.clientY - dragStart.y) / rect.height) * 100));
    document.getElementById('hePosX').value = Math.round(nextX);
    document.getElementById('hePosY').value = Math.round(nextY);
    setHeroPreviewBg(document.getElementById('heBg').value || bgVal);
  });
  document.getElementById('hePreview').addEventListener('pointerup', () => { dragStart = null; });
  document.getElementById('hePreview').addEventListener('pointercancel', () => { dragStart = null; });
  // File upload
  document.getElementById('heFileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    resizeHeroImage(file).then(dataUrl => {
      const draftCfg = {
        ...getHeroCfg(),
        heroBg: dataUrl,
        heroBgPosition: getHeroPosition(),
        heroBgSize: getHeroSize()
      };
      editor.remove();
      openHeroPhotoAdjust(draftCfg, previousCfg);
      showToast('Mueve la foto y ajusta el zoom.', 'info');
    }).catch(e => showToast(e.message, 'error'));
  });
  // Preset clicks
  editor.querySelectorAll('.he-preset').forEach(el => {
    el.addEventListener('click', () => {
      if (el.dataset.bg) {
        document.getElementById('heBg').value = el.dataset.bg;
        document.getElementById('heBgUrl').value = '';
        setHeroPreviewBg(el.dataset.bg);
      }
      if (el.dataset.color) { document.getElementById('heColor').value = el.dataset.color; applyHeroDraft(); }
    });
  });
  document.getElementById('heBgUrl').addEventListener('input', function() {
    if (this.value) {
      document.getElementById('heBg').value = this.value;
      setHeroPreviewBg(this.value);
    }
  });
  document.getElementById('heBg').addEventListener('input', function() {
    setHeroPreviewBg(this.value || 'none');
  });
  document.getElementById('heCancel').addEventListener('click', () => {
    applyFBcfg(previousCfg);
    editor.remove();
  });
  document.getElementById('heSave').addEventListener('click', async () => {
    const cfg = getHeroCfg();
    fbSite = cfg;
    applyFBcfg(cfg);
    if (canWriteToFirebase()) await db.collection('config').doc('site').set(cfg);
    editor.dataset.saved = 'true';
    editor.remove();
    showToast('✅ Cabecera guardada', 'success');
  });
}

async function saveCatOrder() {
  if (!canWriteToFirebase()) return;
  await Promise.all(fbCats.map((c, i) => db.collection('categories').doc(c.id).update({ order: i })));
}

function normalizeCardOrders(categoryId) {
  if (!categoryId) return;
  fbCards
    .filter(c => c.categoryId === categoryId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((c, i) => c.order = i);
}

async function saveCardOrder(categoryId) {
  if (!canWriteToFirebase()) return;
  const cards = categoryId ? fbCards.filter(c => c.categoryId === categoryId) : fbCards;
  await Promise.all(cards.map(c => db.collection('cards').doc(c.id).update({ order: c.order, categoryId: c.categoryId })));
}

// Init edit button
const editBtnEl = document.getElementById('editBtn');

// HARD SECURITY GUARD: this capture listener runs before the normal edit-mode click handler.
// Edit mode cannot be enabled unless Firebase auth has a currently authorized admin.
editBtnEl?.addEventListener('click', function(e) {
  const currentUser = auth?.currentUser || fbUser;
  if (!isAuthorizedAdmin(currentUser)) {
    e.preventDefault();
    e.stopImmediatePropagation();
    fbUser = null;
    updateAdminControls(null);
    disableEditMode('Inicia sesión como admin para editar.');
    return false;
  }
}, true);

editBtnEl?.addEventListener('click', toggleEditMode);
updateAdminControls();

// Modify renderFB to reapply edit UI
const _origRenderFB = renderFB;
renderFB = function() {
  _origRenderFB();
  if (editMode) setupEditUI();
};

// Init Firebase
initFB();

// ===== Deferred Admin Init =====
function initAdminDeferred() {
  initAdminEvents();
  initColorGrid();
  document.getElementById('adminBtn')?.addEventListener('click', adminBtnClick);
}
initAdminDeferred();
