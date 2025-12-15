const SPREADSHEET_ID = '1f9HZPne6BTy_mwbm_KngGu_gegHF64px'; // e.g., 1f9HZPne6BTy_mwbm_KngGu_gegHF64px
const SHEET_GID = '1'; // Change if using a specific sheet tab
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;

// Album state
let pages = [];
let current = 0;

// DOM elements
const albumContainer = document.querySelector('.album-container');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

// --- Fetch GViz JSON ---
async function fetchSheetGViz() {
  const res = await fetch(SHEET_URL);
  const text = await res.text();

  // Clean the GViz JSON wrapper
  const jsonText = text.replace(/^.*setResponse\(/, '').replace(/\);$/, '');
  const json = JSON.parse(jsonText);

  if (!json.table || !json.table.rows) {
    console.error('No rows found in sheet');
    return [];
  }

  const headers = json.table.cols.map(c => c.label);

  const items = json.table.rows.map(row => {
    const obj = {};
    row.c.forEach((cell, i) => {
      obj[headers[i]] = cell ? cell.v : '';
    });
    return obj;
  });

  console.log('Parsed items:', items);
  return items;
}

// --- Render Album ---
function renderAlbum(items) {
  albumContainer.innerHTML = ''; // Clear previous content
  pages = []; // Reset pages array

  items.forEach((item, index) => {
    const page = document.createElement('div');
    page.classList.add('page');
    if (index === 0) page.classList.add('active');

    let media;
    switch (item.type.toLowerCase()) {
      case 'image':
        media = document.createElement('img');
        media.src = item.src;
        media.alt = item.title || `Image ${index + 1}`;
        break;
      case 'video':
        media = document.createElement('video');
        media.controls = true;
        const sourceVideo = document.createElement('source');
        sourceVideo.src = item.src;
        sourceVideo.type = 'video/mp4';
        media.appendChild(sourceVideo);
        break;
      case 'audio':
        media = document.createElement('audio');
        media.controls = true;
        const sourceAudio = document.createElement('source');
        sourceAudio.src = item.src;
        sourceAudio.type = 'audio/mpeg';
        media.appendChild(sourceAudio);
        break;
      default:
        console.warn('Unknown media type:', item.type);
    }

    if (media) page.appendChild(media);
    albumContainer.appendChild(page);
    pages.push(page);
  });
}

// --- Show Page ---
function showPage(index) {
  pages.forEach((page, i) => {
    if (i === index) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');

      // Pause any playing media on hidden pages
      const media = page.querySelector('video, audio');
      if (media) media.pause();
    }
  });
}

// --- Button Handlers ---
nextBtn.addEventListener('click', () => {
  if (current < pages.length - 1) {
    current++;
  } else {
    current = 0; // Return to first page after the last
  }
  showPage(current);
});

prevBtn.addEventListener('click', () => {
  if (current > 0) {
    current--;
  } else {
    current = pages.length - 1; // Wrap around to last page
  }
  showPage(current);
});

// --- Keyboard navigation ---
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') nextBtn.click();
  if (e.key === 'ArrowLeft') prevBtn.click();
});

// --- Initialize ---
(async function init() {
  const items = await fetchSheetGViz();
  renderAlbum(items);
  showPage(current);
})();
