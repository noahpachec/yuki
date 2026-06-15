const revealItems = document.querySelectorAll(".reveal");
const progressBar = document.querySelector(".progress span");
const timeline = document.querySelector(".timeline");
const svg = document.querySelector(".timeline__line");
const basePath = document.querySelector(".timeline__line-base");
const progressPath = document.querySelector(".timeline__line-progress");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.13, rootMargin: "0px 0px -7% 0px" }
);

revealItems.forEach((item) => observer.observe(item));

function drawTimeline() {
  const cards = [...timeline.querySelectorAll(".day__heading, .moment, .photo-pair, .photo-strip")];
  const timelineRect = timeline.getBoundingClientRect();
  const width = timeline.clientWidth;
  const height = timeline.clientHeight;
  const mobile = width < 700;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const points = cards.map((card, index) => {
    const rect = card.getBoundingClientRect();
    const y = rect.top - timelineRect.top + Math.min(rect.height * 0.45, 190);
    let x;

    if (card.classList.contains("day__heading")) {
      x = width / 2;
    } else if (mobile) {
      x = index % 2 ? width * 0.84 : width * 0.16;
    } else {
      const isRight = card.classList.contains("moment--right");
      x = isRight ? width * 0.76 : width * 0.24;
      if (card.classList.contains("photo-pair") || card.classList.contains("photo-strip")) x = width / 2;
    }
    return { x, y };
  });

  if (!points.length) return;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const middle = (previous.y + current.y) / 2;
    path += ` C ${previous.x} ${middle}, ${current.x} ${middle}, ${current.x} ${current.y}`;
  }

  basePath.setAttribute("d", path);
  progressPath.setAttribute("d", path);

  const length = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = `${length}`;
  progressPath.style.strokeDashoffset = `${length}`;
  progressPath.dataset.length = length;
}

function updateProgress() {
  const scrollTop = window.scrollY;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const pageProgress = scrollable > 0 ? scrollTop / scrollable : 0;
  progressBar.style.transform = `scaleX(${pageProgress})`;

  const rect = timeline.getBoundingClientRect();
  const timelineProgress = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height));
  const length = Number(progressPath.dataset.length || 0);
  progressPath.style.strokeDashoffset = `${length * (1 - timelineProgress)}`;
}

let ticking = false;
function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateProgress();
    ticking = false;
  });
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", () => {
  drawTimeline();
  updateProgress();
});
window.addEventListener("load", () => {
  drawTimeline();
  updateProgress();
});

drawTimeline();
updateProgress();
