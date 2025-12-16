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
    let currentPage = 0; // 0 = front page

    if (frontPage) frontPage.style.zIndex = 2000;

    /* -------------------------------
       Helper: Shuffle Array
    -------------------------------- */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /* -------------------------------
       Load CSV and create pages
    -------------------------------- */
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

            // Shuffle media
            shuffleArray(mediaArray);

            // Create pages
            mediaArray.forEach(media => createPage(media));
        })
        .catch(err => console.error('Failed to fetch CSV:', err));

    /* -------------------------------
       Create individual page
    -------------------------------- */
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
            // mediaEl.alt = media.title;
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
            // mediaEl.alt = media.title;
            page.appendChild(mediaEl);
        }

        // Title below media
    //     const titleEl = document.createElement('h2');
    //     titleEl.textContent = media.title;
    //     page.appendChild(titleEl);

    //     page.style.zIndex = 1000 - pages.length;
    //     album.appendChild(page);
    //     pages.push(page);
    // }

    /* -------------------------------
       Next / Prev Flip Buttons
    -------------------------------- */
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

    /* -------------------------------
       Album / Grid Toggle
    -------------------------------- */
    gridViewBtn.addEventListener('click', () => {
        album.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        albumViewBtn.classList.remove('active');
    });

    albumViewBtn.addEventListener('click', () => {
        album.classList.remove('grid-view');
        albumViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    });

    // Default active button
    albumViewBtn.classList.add('active');

    /* -------------------------------
       About Modal
    -------------------------------- */
    aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
});
