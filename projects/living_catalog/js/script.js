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
    const filterContainer = document.getElementById('filterContainer');
    const mediaFilter = document.getElementById('mediaFilter');

    let pages = [];
    let currentPage = 0;

    if (frontPage) frontPage.style.zIndex = 2000;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Load media from CSV
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

    function createPage(media) {
        const page = document.createElement('div');
        page.classList.add('page');
        page.dataset.type = media.type; // for filter

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

    // Next/Prev
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

    // Album / Grid toggle
    gridViewBtn.addEventListener('click', () => {
        album.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        albumViewBtn.classList.remove('active');

        if (frontPage) frontPage.style.display = 'none';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        filterContainer.style.display = 'inline-block';

        layoutGrid();
    });


    albumViewBtn.addEventListener('click', () => {
        location.reload(); // simply reload the page to reset album
    });

    // albumViewBtn.addEventListener('click', () => {
    //     album.classList.remove('grid-view');
    //     albumViewBtn.classList.add('active');
    //     gridViewBtn.classList.remove('active');

    //     if (frontPage) frontPage.style.display = 'flex';
    //     prevBtn.style.display = 'block';
    //     nextBtn.style.display = 'block';
    //     filterContainer.style.display = 'none';
    //     mediaFilter.value = 'all';

    //     pages.forEach((page, i) => {
    //         page.style.position = 'absolute';
    //         page.style.top = '0';
    //         page.style.left = '0';
    //         page.style.transform = '';
    //         page.style.display = 'flex';
    //         page.style.zIndex = 1000 - i;
    //     });
    //     currentPage = 0;
    // });

    // albumViewBtn.classList.add('active');

    // About modal
    aboutBtn.addEventListener('click', () => aboutModal.style.display = 'flex');
    closeModal.addEventListener('click', () => aboutModal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === aboutModal) aboutModal.style.display = 'none'; });

    // Grid layout: ordered grid, responsive
    function layoutGrid() {
        const padding = 20;
        const containerWidth = album.clientWidth;
        let x = 0, y = 0, rowHeight = 0;

        pages.forEach(page => {
            if (page.style.display === 'none') return;

            page.style.position = 'absolute';
            page.style.display = 'flex';
            page.style.justifyContent = 'center';
            page.style.alignItems = 'center';

            const rect = page.getBoundingClientRect();
            const pageWidth = rect.width || 260;
            const pageHeight = rect.height || 260;

            if (x + pageWidth > containerWidth - padding) {
                x = 0;
                y += rowHeight + padding;
                rowHeight = 0;
            }

            page.style.left = x + 'px';
            page.style.top = y + 'px';
            x += pageWidth + padding;
            rowHeight = Math.max(rowHeight, pageHeight);
        });

        album.style.height = (y + rowHeight + padding) + 'px';
    }

    // Filter functionality
    mediaFilter.addEventListener('change', () => {
        const selected = mediaFilter.value;
        pages.forEach(page => {
            const type = page.dataset.type;
            if (selected === 'all' || type === selected) {
                page.style.display = 'flex';
            } else {
                page.style.display = 'none';
            }
        });
        layoutGrid(); // re-layout visible media
    });
});
