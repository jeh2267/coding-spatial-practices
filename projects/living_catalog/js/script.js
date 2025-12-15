document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    const frontPage = document.getElementById('front-page');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

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

        const content = document.createElement('div');
        content.classList.add('page-content');

        let mediaEl;

        if (media.type === 'link') {
            const a = document.createElement('a');
            a.href = media.address; // <-- your renamed column
            a.target = '_blank';
            a.rel = 'noopener noreferrer';

            mediaEl = document.createElement('img');
            mediaEl.src = 'media/' + media.src;
            mediaEl.alt = media.title;

            a.appendChild(mediaEl);
            content.appendChild(a);
        }

        if (media.type === 'image') {
            mediaEl = document.createElement('img');
            mediaEl.src = 'media/' + media.src;
            mediaEl.alt = media.title;
            content.appendChild(mediaEl);
        }

        if (media.type === 'video') {
            mediaEl = document.createElement('video');
            mediaEl.src = 'media/' + media.src;
            mediaEl.controls = true;
            content.appendChild(mediaEl);
        }

        const title = document.createElement('h2');
        title.textContent = media.title;

        content.appendChild(title);
        page.appendChild(content);

        album.appendChild(page);
        pages.push(page);
    }



    // Click handlers for edge buttons
    nextBtn.addEventListener('click', e => {
        e.stopPropagation(); // prevent any other click
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

    function updatePages() {
    pages.forEach((page, index) => {
        page.classList.remove('active');

        if (index === currentPage - 1) {
            page.classList.add('active');
        }
    });

    if (currentPage === 0 && frontPage) {
        frontPage.classList.add('active');
    } else if (frontPage) {
        frontPage.classList.remove('active');
    }
    }

});

