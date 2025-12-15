document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    let pages = [];
    let currentPage = 0; // 0 = front page

    // Load CSV
    fetch('projects/living_catalog/media/media.csv')
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

        // Title for each media
        const title = document.createElement('h2');
        title.textContent = media.title;
        page.appendChild(title);

        if (media.type === 'link') {
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

        page.style.zIndex = 1000 - pages.length; // stack pages on top of each other
        album.appendChild(page);
        pages.push(page);
    }

    // Flip page logic
    album.addEventListener('click', e => {
        if (currentPage < pages.length) {
            const page = currentPage === 0 ? document.getElementById('front-page') : pages[currentPage - 1];
            page.classList.add('flipped');
            currentPage++;
        }
    });
});
