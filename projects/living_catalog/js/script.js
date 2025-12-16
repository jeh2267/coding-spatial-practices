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

    // Load media from CSV
    fetch('media.csv')
        .then(res => res.text())
        .then(data => {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());
            const mediaArray = lines.slice(1).filter(l => l.trim()).map(line => {
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
            mediaArray.forEach(createPage);
        });

    function createPage(media) {
        const page = document.createElement('div');
        page.classList.add('page');
        page.dataset.type = media.type;

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

    // Prev/Next buttons
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

    // Toggle Grid View
    gridViewBtn.addEventListener('click', () => {
        album.classList.add('grid-view');
        album.classList.remove('album-view');
        gridViewBtn.classList.add('active');
        albumViewBtn.classList.remove('active');
        filterContainer.style.display = 'inline-block';
        pages.forEach(p => p.classList.remove('flipped'));
        layoutGrid();
    });

    // Toggle Album View
    albumViewBtn.addEventListener('click', () => {
        album.classList.remove('grid-view');
        album.classList.add('album-view');
        albumViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
        filterContainer.style.display = 'none';
        currentPage = 0;
    });

    // Grid layout
    function layoutGrid() {
        const padding = 20;
        const containerWidth = album.clientWidth;
        let x = 0, y = 0, rowHeight = 0;
        pages.forEach(page => {
            if (page.style.display === 'none') return;
            const pageWidth = page.offsetWidth || 260;
            const pageHeight = page.offsetHeight || 260;
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
            page.style.display = selected === 'all' || page.dataset.type === selected ? 'flex' : 'none';
        });
        layoutGrid();
    });

    // About modal
    aboutBtn.addEventListener('click', () => aboutModal.style.display = 'flex');
    closeModal.addEventListener('click', () => aboutModal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === aboutModal) aboutModal.style.display = 'none'; });
});
