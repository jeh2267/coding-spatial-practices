const album = document.getElementById('album');
let pages = [];
let currentPage = 0;

// Load CSV file
fetch('media/media.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n').slice(1); // skip header
        rows.forEach(row => {
            if (!row.trim()) return; // skip empty rows
            const [id, title, src, link] = row.split(',');
            createPage({id, title, src, link});
        });
    });

// Function to create page element
function createPage(media) {
    const page = document.createElement('div');
    page.classList.add('page');

    if (media.link) {
        const a = document.createElement('a');
        a.href = media.link;
        a.target = '_blank';
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.title;
        a.appendChild(img);
        page.appendChild(a);
    } else if (media.src.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true;
        page.appendChild(video);
    } else {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.title;
        page.appendChild(img);
    }

    album.appendChild(page);
    pages.push(page);
}

// Event listener for flipping pages
album.addEventListener('click', (e) => {
    const rect = album.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (currentPage === 0) {
        // Flip front page
        pages[0]?.classList.add('flipped');
        currentPage++;
    } else if (x > rect.width / 2 && currentPage < pages.length) {
        // Right side: next page
        pages[currentPage]?.classList.add('flipped');
        currentPage++;
    } else if (x < rect.width / 2 && currentPage > 1) {
        // Left side: previous page
        currentPage--;
        pages[currentPage]?.classList.remove('flipped');
    }
});
