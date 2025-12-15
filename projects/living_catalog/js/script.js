// Path to CSV in your repo
const csvUrl = 'media/media.csv';

// Fetch CSV and convert to objects
async function fetchCSV() {
    try {
        const res = await fetch(csvUrl);
        const text = await res.text();

        // Split CSV into lines
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',');

        // Convert CSV to array of objects
        const items = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj = {};
            headers.forEach((header, i) => {
                obj[header.trim()] = values[i]?.trim();
            });
            return obj;
        });

        renderItems(items);
    } catch (err) {
        console.error('Error fetching or parsing CSV:', err);
    }
}

// Render album pages
function renderItems(items) {
    const albumContainer = document.querySelector('.album-container');
    albumContainer.innerHTML = '';

    items.forEach(item => {
        const page = document.createElement('div');
        page.classList.add('page');

        let mediaEl;

        if (item.type === 'image') {
            mediaEl = document.createElement('img');
            mediaEl.src = item.src;
            mediaEl.alt = item.title;
        } else if (item.type === 'video') {
            mediaEl = document.createElement('video');
            mediaEl.controls = true;
            const source = document.createElement('source');
            source.src = item.src;
            source.type = 'video/mp4';
            mediaEl.appendChild(source);
        } else if (item.type === 'link') {
            mediaEl = document.createElement('a');
            mediaEl.href = item.src;
            mediaEl.target = '_blank';
            mediaEl.textContent = item.title;
        }

        page.appendChild(mediaEl);
        albumContainer.appendChild(page);
    });

    initAlbum(); // Initialize flipping logic
}

// Album flipping logic
function initAlbum() {
    const pages = document.querySelectorAll('.page');
    let current = 0;

    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');

    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle('active', i === index);
        });
    }

    nextBtn.addEventListener('click', () => {
        if (current < pages.length - 1) current++;
        showPage(current);
    });

    prevBtn.addEventListener('click', () => {
        if (current > 0) current--;
        showPage(current);
    });

    // Initialize first page
    showPage(current);
}

// Kick everything off
fetchCSV();
