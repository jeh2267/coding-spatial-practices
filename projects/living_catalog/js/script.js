document.addEventListener('DOMContentLoaded', () => {
    const album = document.getElementById('album');
    let pages = [];
    let currentPage = 0;

    // Load CSV
    fetch('media/media.csv')
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch CSV');
            return res.text();
        })
        .then(data => {
            const lines = data.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            lines.slice(1).forEach(line => {
                if (!line.trim()) return;
                // Split CSV, remove surrounding quotes and spaces
                const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g).map(v => v.replace(/^"|"$/g, '').trim());

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

        album.appendChild(page);
        pages.push(page);
    }

    // Flip pages
    album.addEventListener('click', e => {
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
