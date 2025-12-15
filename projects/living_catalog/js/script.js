const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1f9HZPne6BTy_mwbm_KngGu_gegHF64px/gviz/tq?tqx=out:json';

const book = document.getElementById('book');
const cover = document.getElementById('cover');
const pagesContainer = document.querySelector('.pages');

const albumView = document.getElementById('albumView');
const gridView = document.getElementById('gridView');
const aboutModal = document.getElementById('aboutModal');

const albumBtn = document.getElementById('albumBtn');
const gridBtn = document.getElementById('gridBtn');
const aboutBtn = document.getElementById('aboutBtn');
const closeAbout = document.getElementById('closeAbout');

const nextZone = document.getElementById('nextZone');
const prevZone = document.getElementById('prevZone');

let pages = [];
let current = -1;

/* -------- FETCH SHEET -------- */

async function fetchSheet() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  const json = JSON.parse(
    text.replace(/.*setResponse\(/, '').replace(/\);$/, '')
  );

  const headers = json.table.cols.map(c => c.label);

  return json.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[headers[i]] = cell ? cell.v : '';
    });
    return obj;
  });
}

/* -------- RENDER ALBUM -------- */

function renderAlbum(items) {
  pagesContainer.innerHTML = '';

  items.forEach(item => {
    const page = document.createElement('div');
    page.className = 'page';

    const front = document.createElement('div');
    front.className = 'front';

    if (item.type === 'image')
      front.innerHTML = `<img src="${item.src}">`;

    if (item.type === 'video')
      front.innerHTML = `<video controls src="${item.src}"></video>`;

    if (item.type === 'audio')
      front.innerHTML = `<audio controls src="${item.src}"></audio>`;

    const back = document.createElement('div');
    back.className = 'back';

    page.append(front, back);
    pagesContainer.appendChild(page);
  });

  pages = document.querySelectorAll('.page');
}

/* -------- BOOK LOGIC -------- */

function openBook() {
  book.classList.remove('closed');
  book.classList.add('open');
  current = 0;
}

function closeBook() {
  pages.forEach(p => p.classList.remove('flipped'));
  book.classList.remove('open');
  book.classList.add('closed');
  current = -1;
}

function stopMedia() {
  document.querySelectorAll('video, audio').forEach(m => {
    m.pause();
    m.currentTime = 0;
  });
}

function nextPage() {
  if (current === -1) return;
  stopMedia();

  if (current < pages.length) {
    pages[current]?.classList.add('flipped');
    current++;
  }

  if (current === pages.length) closeBook();
}

function prevPage() {
  if (current <= 0) return;
  stopMedia();
  current--;
  pages[current].classList.remove('flipped');
}

/* -------- VIEW TOGGLES -------- */

function showView(view) {
  albumView.classList.remove('active');
  gridView.classList.remove('active');
  view.classList.add('active');
}

albumBtn.onclick = () => showView(albumView);
gridBtn.onclick = () => showView(gridView);
aboutBtn.onclick = () => aboutModal.classList.add('active');
closeAbout.onclick = () => aboutModal.classList.remove('active');

/* -------- EVENTS -------- */

cover.onclick = openBook;
nextZone.onclick = nextPage;
prevZone.onclick = prevPage;

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextPage();
  if (e.key === 'ArrowLeft') prevPage();
});

/* -------- INIT -------- */

async function init() {
  const items = await fetchSheet();
  renderAlbum(items);
  closeBook();
}

init();
