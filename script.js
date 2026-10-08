const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* ignore */ }
  },
};

const THEME_KEY = "portfolio-theme";
const themeToggle = $("#themeToggle");
const themeIcon = $("#themeIcon");

function renderThemeIcon() {
  themeIcon.textContent = document.body.classList.contains("light") ? "☀" : "☾";
}

if (storage.get(THEME_KEY) === "light") document.body.classList.add("light");
renderThemeIcon();

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light");
  storage.set(THEME_KEY, isLight ? "light" : "dark");
  renderThemeIcon();
});

$("#year").textContent = new Date().getFullYear();

const modal = $("#imageModal");
const modalImage = $("#modalImage");
const modalTitle = $("#modalTitle");

function openModal({ image, title = "Portfolio image" }) {
  modalImage.src = image;
  modalImage.alt = title;
  modalTitle.textContent = title;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalImage.src = "";
}

$$(".image-button").forEach((button) => {
  button.addEventListener("click", () => {
    openModal({ image: button.dataset.image, title: button.dataset.title || undefined });
  });
});

$("#modalClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

$$(".reveal").forEach((el) => revealObserver.observe(el));

const navLinks = $$(".nav a");

const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });

navLinks.forEach((link) => {
  const section = $(link.getAttribute("href"));
  if (section) spyObserver.observe(section);
});

const SLIDER_GAP = 16;  // keep in sync with .slider-track gap in CSS
const EDGE_TOLERANCE = 4;

function initSlider(slider) {
  const track = $(".slider-track", slider);
  const prev = $(".prev", slider);
  const next = $(".next", slider);

  const stepSize = () => {
    const slide = $(".slide", track);
    return slide ? slide.getBoundingClientRect().width + SLIDER_GAP : track.clientWidth * 0.8;
  };

  const scrollByStep = (direction) =>
    track.scrollBy({ left: direction * stepSize(), behavior: "smooth" });

  function updateArrows() {
    const hasOverflow = track.scrollWidth > track.clientWidth + EDGE_TOLERANCE;
    prev.hidden = next.hidden = !hasOverflow;
    prev.disabled = track.scrollLeft <= EDGE_TOLERANCE;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - EDGE_TOLERANCE;
  }

  prev.addEventListener("click", () => scrollByStep(-1));
  next.addEventListener("click", () => scrollByStep(1));
  track.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);
  window.addEventListener("load", updateArrows);
  updateArrows();
}

$$("[data-slider]").forEach(initSlider);