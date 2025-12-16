document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    const frontPage = document.getElementById('front-page');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const albumViewBtn = document.getElementById('albumViewBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = document.querySelector('.modal .close');

    let pages = [];
    let currentPage = 0;

    if (frontPage) frontPage.style.zIndex = 2000;

    /* Helper: shuffle array */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /* Load CSV and create pages */
    fetch('media.csv')
        .then(res => res.text())
        .then(data => {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const mediaArray = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
                    .map(v => v.replace(/^"|"$/g, '').trim());
                return {
                    id: values[headers.indexOf('id')],
                    title: values[headers.indexOf('title')],
                    src: values[headers.indexOf('src')],
                    address: values[headers.indexOf('address')],
                    type: values[headers.indexOf('type')]
                };
            });

            shuffleArray(mediaArray);
            mediaArray.forEach(media => createPage(media));

        }).catch(err => console.error('Failed to fetch CSV:', err));

    /* Create page */
    function createPage(media) {
        const page = document.createElement('div');
        page.classList.add('page');

        let mediaEl;
        if (media.type === 'link') {
            const a = document.createElement('a');
            a.href = media.address;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            mediaEl = document.createElement('img');
            mediaEl.src = 'media/' + media.src;
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
            page.appendChild(mediaEl);
        }

        page.style.zIndex = 1000 - pages.length;
        album.appendChild(page);
        pages.push(page);
    }

    /* Next / Prev */
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

    /* Album / Grid toggle */
    gridViewBtn.addEventListener('click', () => {
        album.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        albumViewBtn.classList.remove('active');

        if (frontPage) frontPage.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';

        layoutGrid();
    });

    albumViewBtn.addEventListener('click', () => {
        album.classList.remove('grid-view');
        albumViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');

        if (frontPage) frontPage.style.display = 'flex';
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';

        pages.forEach((page, i) => {
            page.style.position = 'absolute';
            page.style.top = '0';
            page.style.left = '0';
            page.style.transform = '';
            page.style.zIndex = 1000 - i;
        });
        currentPage = 0;
    });

    albumViewBtn.classList.add('active');

    /* About modal */
    aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'flex';
    });
    closeModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });
    window.addEventListener('click', e => {
        if (e.target === aboutModal) aboutModal.style.display = 'none';
    });

    function layoutGrid() {
        const padding = 10; // smaller gap between items
        const placed = [];
        const containerWidth = album.clientWidth;

        const mediaLoadPromises = pages.map(page => {
            const mediaEl = page.querySelector('img, video');

            return new Promise(resolve => {
                if (!mediaEl) {
                    resolve(page);
                } else if (mediaEl.tagName === 'IMG') {
                    if (!mediaEl.complete) {
                        mediaEl.onload = () => resolve(page);
                    } else {
                        resolve(page);
                    }
                } else if (mediaEl.tagName === 'VIDEO') {
                    mediaEl.addEventListener('loadeddata', () => resolve(page), { once: true });
                } else {
                    resolve(page);
                }
            });
        });

        Promise.all(mediaLoadPromises).then(() => {
            pages.forEach(page => {
                const pageWidth = page.offsetWidth;
                const pageHeight = page.offsetHeight;

                let x, y, overlap, tries = 0;

                do {
                    x = Math.random() * (containerWidth - pageWidth - padding);
                    y = Math.random() * (window.innerHeight + pages.length * 100);
                    overlap = placed.some(r =>
                        !(x + pageWidth < r.x || x > r.x + r.width || y + pageHeight < r.y || y > r.y + r.height)
                    );
                    tries++;
                    if (tries > 200) break;
                } while (overlap);

                page.style.position = 'absolute';
                page.style.left = x + 'px';
                page.style.top = y + 'px';

                placed.push({ x, y, width: pageWidth + padding, height: pageHeight + padding });
            });

            // Adjust album height so last items are above footer
            const maxY = placed.reduce((max, r) => Math.max(max, r.y + r.height), 0);
            album.style.height = (maxY + 100) + 'px';
        });
    }

});
