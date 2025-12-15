let allData = [];
let currentPage = 1;
const itemsPerPage = 6; // adjust as needed

document.addEventListener("DOMContentLoaded", () => {
  fetch("media/media.csv")
    .then(resp => resp.text())
    .then(text => {
      allData = parseCSV(text);
      renderPage(currentPage);
      setupPagination();
    })
    .catch(err => console.error("Failed to fetch CSV:", err));
});

// ---- CSV parsing ----
function parseCSV(text) {
  const rows = text.trim().split("\n");
  const headers = rows.shift().split(",").map(h => h.trim());

  return rows.map(row => {
    const cols = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)
                    .map(c => c.replace(/^"|"$/g, "").trim());
    let obj = {};
    headers.forEach((h,i) => obj[h] = cols[i] || "");
    return obj;
  });
}

// ---- Render page ----
function renderPage(page) {
  const container = document.getElementById("album-container");
  container.innerHTML = "";

  const start = (page-1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = allData.slice(start, end);

  pageItems.forEach(item => {
    const div = document.createElement("div");
    div.className = "album-item";

    if(item.type === "image") {
      const img = document.createElement("img");
      img.src = `media/${item.src}`;
      img.alt = item.title;

      if(item.link) {
        const a = document.createElement("a");
        a.href = item.link;
        a.target = "_blank";
        a.appendChild(img);
        div.appendChild(a);
      } else {
        div.appendChild(img);
      }

    } else if(item.type === "video") {
      const vid = document.createElement("video");
      vid.src = `media/${item.src}`;
      vid.controls = true;
      div.appendChild(vid);

    } else if(item.type === "link") {
      const a = document.createElement("a");
      a.href = item.link || item.src;
      a.target = "_blank";

      const img = document.createElement("img");
      img.src = `media/${item.src}`;
      img.alt = item.title;

      a.appendChild(img);
      div.appendChild(a);
    }

    div.addEventListener("click", () => showPopup(item));
    container.appendChild(div);
  });

  document.getElementById("page-info").textContent = `Page ${page}`;
}

// ---- Popup ----
function showPopup(item) {
  const popup = document.getElementById("popup");
  const content = document.getElementById("popup-content");

  let html = `<h3>${item.title}</h3><p>Type: ${item.type}</p>`;
  if(item.link) html += `<p><a href="${item.link}" target="_blank">${item.link}</a></p>`;

  content.innerHTML = html;
  popup.classList.remove("hidden");
  popup.onclick = () => popup.classList.add("hidden");
}

// ---- Pagination buttons ----
function setupPagination() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.addEventListener("click", () => {
    if(currentPage > 1) {
      currentPage--;
      renderPage(currentPage);
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    if(currentPage < totalPages) {
      currentPage++;
      renderPage(currentPage);
    }
  });
}
