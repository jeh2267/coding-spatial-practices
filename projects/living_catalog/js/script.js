document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    const frontPage = document.getElementById('front-page');
    let pages = [];
    let currentPage = 0; // 0 = front page

    if (frontPage) frontPage.style.zIndex = 2000;

    // Load CSV
    fetch('media.csv')
        .then(res => res.text())
        .then(data => {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            lines.slice(1).forEach(line => {
                if (!line.trim()) return;
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                    .map(v => v.replace(/^"|"$/g, '').trim());

                const media = {
                    id: values[headers.indexOf('id')],
                    title: values[headers.indexOf('title')],
                    src: values[headers.indexOf('src')],
                    link: values[headers.indexOf('link')],
                    type: values[headers.indexOf('type')]
                };
                createPage(media);
            });
        })
        .catch(err => console.error('Failed to fetch CSV:', err));

    function createPage(media) {
        const page = document.createElement('div');
        page.classList.add('page');

        // Media element
        let mediaEl;
        if (media.type === 'link') {
            const a = document.createElement('a');
            a.href = media.link;
            a.target = '_blank';
            mediaEl = document.createElement('img');
            mediaEl.src = 'media/' + media.src;
            mediaEl.alt = media.title;
            a.appendChild(mediaEl);
            page.appendChild(a);
        } else if (media.type === 'video') {
            mediaEl = document.createElement('video');
            mediaEl.src = 'media/' + media.src;
            mediaEl.controls = true;
            page.appendChild(mediaEl);
        } else if (media.type === 'image') {
            mediaEl = document.createElement('img');
            mediaEl.src = 'media/' + media.src;
            mediaEl.alt = media.title;
            page.appendChild(mediaEl);
        }

        // Title below media
        const titleEl = document.createElement('h2');
        titleEl.textContent = media.title;
        page.appendChild(titleEl);

        page.style.zIndex = 1000 - pages.length;
        album.appendChild(page);
        pages.push(page);
    }

    // Click to flip forward/backward
    album.addEventListener('click', e => {
        const rect = album.getBoundingClientRect();
        const x = e.clientX - rect.left;

        // Left side click = go back
        if (x < rect.width / 2 && currentPage > 0) {
            currentPage--;
            const page = currentPage === 0 ? frontPage : pages[currentPage - 1];
            if (page) page.classList.remove('flipped');

        // Right side click = go forward
        } else if (x >= rect.width / 2 && currentPage < pages.length) {
            const page = currentPage === 0 ? frontPage : pages[currentPage - 1];
            if (page) page.classList.add('flipped');
            currentPage++;
        }
    });
});
