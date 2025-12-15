document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    let pages = [];
    let currentPage = 0;

    // Load CSV
    fetch('media.csv')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch CSV');
            return response.text();
        })
        .then(data => {
            const rows = data.split('\n').slice(1); // skip header
            rows.forEach(row => {
                if (!row.trim()) return; // skip empty rows
                const [id, title, src, link, type] = row.split(',');
                createPage({id, title, src, link, type});
            });
        })
        .catch(err => console.error('Failed to fetch CSV:', err));

    function createPage(media) {
        const page = document.createElement('div');
        page.classList.add('page');

        if (media.type === 'link') {
            // Thumbnail links to external site
            const a = document.createElement('a');
            a.href = media.link;
            a.target = '_blank';
            const img = document.createElement('img');
            img.src = 'media/' + media.src;
            img.alt = media.title;
            a.appendChild(img);
            page.appendChild(a);

        } else if (media.type === 'video') {
            const video = document.createElement('video');
            video.src = 'media/' + media.src;
            video.controls = true;
            page.appendChild(video);

        } else if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = 'media/' + media.src;
            img.alt = media.title;
            page.appendChild(img);
        }

        album.appendChild(page);
        pages.push(page);
    }

    // Flip page logic
    album.addEventListener('click', (e) => {
        const rect = album.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (currentPage === 0) {
            pages[0]?.classList.add('flipped');
            currentPage++;
        } else if (x > rect.width / 2 && currentPage < pages.length) {
            pages[currentPage]?.classList.add('flipped');
            currentPage++;
        } else if (x < rect.width / 2 && currentPage > 1) {
            currentPage--;
            pages[currentPage]?.classList.remove('flipped');
        }
    });
});
