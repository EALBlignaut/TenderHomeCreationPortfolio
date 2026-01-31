// Flipbook: single front cover -> spreads -> single back cover
const bookEl = document.getElementById("book");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageLabel = document.getElementById("pageLabel");

const AUTO_PAGES = [
  "pages/page_001.jpg",
  "pages/page_002.jpg",
  "pages/page_003.jpg",
  "pages/page_004.jpg",
  "pages/page_005.jpg",
  "pages/page_006.jpg",
  "pages/page_007.jpg",
  "pages/page_008.jpg",
  "pages/page_009.jpg",
  "pages/page_010.jpg",
  "pages/page_011.jpg",
  "pages/page_012.jpg",
  "pages/page_013.jpg",
  "pages/page_014.jpg",
  "pages/page_015.jpg",
  "pages/page_016.jpg",
  "pages/page_017.jpg",
  "pages/page_018.jpg",
  "pages/page_019.jpg",
  "pages/page_020.jpg",
  "pages/page_021.jpg",
  "pages/page_022.jpg",
  "pages/page_023.jpg",
  "pages/page_024.jpg",
  "pages/page_025.jpg",
  "pages/page_026.jpg",
  "pages/page_027.jpg",
  "pages/page_028.jpg",
  "pages/page_029.jpg",
  "pages/page_030.jpg",
  "pages/page_031.jpg",
  "pages/page_032.jpg",
  "pages/page_033.jpg",
  "pages/page_034.jpg",
  "pages/page_035.jpg",
  "pages/page_036.jpg",
  "pages/page_037.jpg",
  "pages/page_038.jpg",
  "pages/page_039.jpg",
  "pages/page_040.jpg",
  "pages/page_041.jpg",
  "pages/page_042.jpg",
  "pages/page_043.jpg",
  "pages/page_044.jpg"
];

let pages = AUTO_PAGES.map(src => ({ name: src, url: src }));

// state can be "cover", "spread", "back"
let state = "cover";
// spreadIndex 0 => left=1 right=2, spreadIndex 1 => left=3 right=4 ...
let spreadIndex = 0;
let isAnimating = false;

function imgEl(src, alt){
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt || "";
  return img;
}

function safePage(i){
  if(i >= 0 && i < pages.length) return pages[i].url;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'>
      <rect width='100%' height='100%' fill='#0b0d12'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
            fill='#a6b0c3' font-size='44' font-family='system-ui,Segoe UI,Arial'>
        Blank
      </text>
    </svg>
  `);
}

function totalInnerSpreads(){
  const innerPages = Math.max(0, pages.length - 2); // exclude cover + back
  return Math.ceil(innerPages / 2);
}

function updateUI(){
  prevBtn.disabled = isAnimating || (state === "cover");
  nextBtn.disabled = isAnimating || (state === "back");

  if(state === "cover") pageLabel.textContent = "Cover";
  else if(state === "back") pageLabel.textContent = "Back cover";
  else {
    const left = spreadIndex * 2 + 1;
    const right = spreadIndex * 2 + 2;
    pageLabel.textContent = `Spread ${spreadIndex+1} • p${left+1}–p${Math.min(right+1, pages.length-1)}`;
  }
}

function render(){
  bookEl.innerHTML = "";
  bookEl.classList.remove("spread");

  if(state === "cover"){
    const cover = document.createElement("div");
    cover.className = "page single right cover";
    cover.appendChild(imgEl(safePage(0), "Front Cover"));
    bookEl.appendChild(cover);
    updateUI();
    return;
  }

  if(state === "back"){
    const back = document.createElement("div");
    back.className = "page single right cover";
    back.appendChild(imgEl(safePage(pages.length - 1), "Back Cover"));
    bookEl.appendChild(back);
    updateUI();
    return;
  }

  // spread
  bookEl.classList.add("spread");
  const leftIdx  = spreadIndex * 2 + 1;
  const rightIdx = spreadIndex * 2 + 2;

  const left = document.createElement("div");
  left.className = "page left";
  left.appendChild(imgEl(safePage(leftIdx), `Page ${leftIdx+1}`));

  const right = document.createElement("div");
  right.className = "page right";
  right.appendChild(imgEl(safePage(rightIdx), `Page ${rightIdx+1}`));

  const flip = document.createElement("div");
  flip.className = "flip";

  const front = document.createElement("div");
  front.className = "front";
  front.appendChild(imgEl(safePage(rightIdx), ""));

  const back = document.createElement("div");
  back.className = "back";
  // reveal next page on back side
  back.appendChild(imgEl(safePage(rightIdx + 1), ""));

  flip.appendChild(front);
  flip.appendChild(back);

  bookEl.appendChild(left);
  bookEl.appendChild(right);
  bookEl.appendChild(flip);

  updateUI();
}

function next(){
  if(isAnimating) return;

  if(state === "cover"){
    state = "spread";
    spreadIndex = 0;
    render();
    return;
  }

  if(state === "spread"){
    const spreads = totalInnerSpreads();
    if(spreadIndex >= spreads - 1){
      state = "back";
      render();
      return;
    }
    isAnimating = true;
    updateUI();
    bookEl.classList.add("turning");
    setTimeout(() => {
      spreadIndex += 1;
      bookEl.classList.remove("turning");
      isAnimating = false;
      render();
    }, 640);
  }
}

function prev(){
  if(isAnimating) return;

  if(state === "back"){
    state = "spread";
    spreadIndex = Math.max(0, totalInnerSpreads() - 1);
    render();
    return;
  }

  if(state === "spread"){
    if(spreadIndex <= 0){
      state = "cover";
      render();
      return;
    }
    isAnimating = true;
    updateUI();
    spreadIndex -= 1;
    render();
    requestAnimationFrame(() => {
      bookEl.classList.add("turning");
      setTimeout(() => {
        bookEl.classList.remove("turning");
        isAnimating = false;
        render();
      }, 640);
    });
  }
}

prevBtn.addEventListener("click", prev);
nextBtn.addEventListener("click", next);

window.addEventListener("keydown", (e) => {
  if(e.key === "ArrowRight") next();
  if(e.key === "ArrowLeft") prev();
});

bookEl.addEventListener("click", (e) => {
  const rect = bookEl.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if(x < rect.width * 0.45) prev();
  else next();
});

render();
