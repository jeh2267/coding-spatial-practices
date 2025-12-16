document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    const frontPage = document.getElementById('front-page');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const albumBtn = document.getElementById('albumViewBtn');
    const gridBtn = document.getElementById('gridViewBtn');

    let pages = [];
    let currentPage = 0;

    if (frontPage) frontPage.style.zIndex = 2000;

    // Set default active button
    albumBtn.classList.add('active');

    // Toggle active states
    [albumBtn, gridBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            albumBtn.classList.remove('active');
            gridBtn.classList.remove('active');
            btn.classList.add('active');
        });
    });

    // Toggle views
    albumBtn.addEventListener('click', () => {
        album.classList.remove('grid-view');
        // Reset flipped pages
        pages.forEach(page => page.classList.remove('flipped'));
        if (frontPage) frontPage.style.zIndex = 2000;
        currentPage = 0;
    });

    gridBtn.addEventListener('click', () => {
        album.classList.add('grid-view');
    });

    // Load CSV media
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
                    address: values[headers.indexOf('address')],
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
            a.href = media.address;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
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

        // Title
        const titleEl = document.createElement('h2');
        titleEl.textContent = media.title;
        page.appendChild(titleEl);

        page.style.zIndex = 1000 - pages.length;
        album.appendChild(page);
        pages.push(page);
    }

    // Flip buttons
    nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (currentPage < pages.length) {
            const pageToFlip = currentPage === 0 ? frontPage : pages[currentPage - 1];
            if (pageToFlip) pageToFlip.classList.add('flipped');
            currentPage++;
        }
    });

    prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        if (currentPage > 0) {
            currentPage--;
            const pageToUnflip = currentPage === 0 ? frontPage : pages[currentPage - 1];
            if (pageToUnflip) pageToUnflip.classList.remove('flipped');
        }
    });
});
