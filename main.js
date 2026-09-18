// Swap this to point at a different backend later without touching any
// of the rendering code below.
async function loadWorks() {
  const res = await fetch('media/manifest.json');
  return res.json();
}

async function loadStyles() {
  const res = await fetch('media/styles.json');
  return res.json();
}

function pieceCard(piece) {
  const btn = document.createElement('button');
  btn.className = 'board-item';
  btn.type = 'button';
  btn.dataset.style = piece.style;

  const media = piece.type === 'video'
    ? `<video src="${piece.src}" muted playsinline aria-hidden="true"></video>`
    : `<img src="${piece.src}" alt="${piece.alt}" loading="lazy">`;

  btn.innerHTML = `
    ${media}
    <div class="num">#${piece.id}</div>
    <div class="cap">${piece.title}</div>
  `;

  btn.addEventListener('click', () => openLightbox(piece));
  return btn;
}

function openLightbox(piece) {
  const lightbox = document.getElementById('lightbox');
  const body = document.getElementById('lightbox-body');
  body.innerHTML = piece.type === 'video'
    ? `<video src="${piece.src}" controls autoplay playsinline></video>`
    : `<img src="${piece.src}" alt="${piece.alt}">`;
  lightbox.hidden = false;
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.hidden = true;
  document.getElementById('lightbox-body').innerHTML = '';
}

function renderBoard(works, filter) {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const shown = filter === 'all' ? works : works.filter(w => w.style === filter);
  shown.forEach(piece => board.appendChild(pieceCard(piece)));
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  const [works, styles] = await Promise.all([loadWorks(), loadStyles()]);

  const featured = works.find(w => w.featured) || works[0];
  if (featured) {
    document.getElementById('featured-img').src = featured.src;
    document.getElementById('featured-img').alt = featured.alt;
    document.getElementById('featured-tag').textContent = `piece #${featured.id}`;
  }

  const styleById = Object.fromEntries(styles.map(s => [s.id, s]));
  const chips = document.getElementById('chips');
  const chipDesc = document.getElementById('chip-desc');
  const bookStyle = document.getElementById('book-style');

  styles.forEach(style => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.type = 'button';
    chip.dataset.style = style.id;
    chip.textContent = style.label;
    chips.appendChild(chip);

    const opt = document.createElement('option');
    opt.value = style.id;
    opt.textContent = style.label;
    bookStyle.appendChild(opt);
  });

  chips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chips.querySelectorAll('.chip').forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const styleId = chip.dataset.style;
    chipDesc.textContent = styleId === 'all' ? '' : (styleById[styleId]?.desc || '');
    renderBoard(works, styleId);
  });

  renderBoard(works, 'all');

  document.getElementById('book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    const contact = form.contact.value.trim();
    const styleLabel = styleById[form.style.value]?.label || 'No preference';
    const idea = form.idea.value.trim();
    const subject = encodeURIComponent(`Tattoo inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nContact: ${contact}\nStyle: ${styleLabel}\n\n${idea}`
    );
    window.location.href = `mailto:manny@example.com?subject=${subject}&body=${body}`;
  });
}

init();
