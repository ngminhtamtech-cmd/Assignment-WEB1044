(function initHomePage() {
  'use strict';

  const data = window.PCAstral.data;
  const utils = window.PCAstral.utils;
  const ui = window.PCAstral.ui;
  const slider = document.getElementById('hero');
  let slideIndex = 0;
  let hoverPaused = false;
  let manualPaused = false;
  let countdownTimer;

  function renderSlide() {
    const banner = data.banners[slideIndex];
    const titleLines = banner.title.split('\n');
    document.getElementById('hero-title').replaceChildren(
      document.createTextNode(titleLines[0]),
      document.createElement('br'),
      document.createTextNode(titleLines[1] || '')
    );
    document.getElementById('hero-eyebrow').textContent = banner.eyebrow;
    document.getElementById('hero-description').textContent = banner.description;
    const link = document.getElementById('hero-link');
    link.href = banner.link;
    link.textContent = banner.cta + ' ';
    const photo = document.getElementById('hero-photo');
    photo.src = banner.image;
    photo.alt = banner.caption;
    photo.hidden = false;
    delete photo.dataset.fallback;
    slider.querySelectorAll('.image-fallback').forEach(element => element.remove());
    document.getElementById('hero-caption-title').textContent = banner.caption;
    document.getElementById('hero-caption-spec').textContent = banner.spec;
    document.getElementById('slide-count').textContent = '0' + (slideIndex + 1) + ' / 03';

    document.querySelectorAll('[data-slide]').forEach(function updateDot(button, index) {
      const active = index === slideIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function changeSlide(step) {
    slideIndex = (slideIndex + step + data.banners.length) % data.banners.length;
    renderSlide();
  }

  function createSlideDots() {
    const dots = document.getElementById('slide-dots');
    data.banners.forEach(function createDot(banner, index) {
      const button = document.createElement('button');
      button.dataset.slide = index;
      button.setAttribute('aria-label', 'Đến banner ' + (index + 1));
      button.setAttribute('aria-pressed', 'false');
      dots.append(button);
    });
  }

  function renderCategories() {
    const container = document.getElementById('category-grid');
    const template = document.getElementById('category-template');
    data.categories.forEach(function renderCategory(category, index) {
      const tile = template.content.firstElementChild.cloneNode(true);
      tile.href = 'products.html?category=' + category.id;
      tile.querySelector('img').src = category.image;
      tile.querySelector('h3').textContent = category.name;
      tile.querySelector('div > span').textContent = category.tagline;
      tile.querySelector('.category-number').textContent = '0' + (index + 1);
      container.append(tile);
    });
  }

  function renderProductSections() {
    for (const group of ['new', 'hot', 'sale']) {
      const products = utils.selectProducts({ group }).slice(0, 4);
      ui.renderGrid(document.getElementById(group + '-grid'), products);
    }
  }

  function updateCountdown() {
    const remaining = Date.parse(data.promotion.endsAt) - Date.now();
    const seconds = Math.max(0, Math.floor(remaining / 1000));
    const countdown = document.getElementById('countdown');
    if (seconds === 0) {
      countdown.textContent = 'Chương trình đã kết thúc';
      clearInterval(countdownTimer);
      return false;
    }
    const parts = [
      Math.floor(seconds / 86400),
      Math.floor(seconds / 3600) % 24,
      Math.floor(seconds / 60) % 60,
      seconds % 60,
    ];
    countdown.querySelectorAll('[data-countdown-number]').forEach(function updateNumber(element, index) {
      element.textContent = String(parts[index]).padStart(2, '0');
    });
    return true;
  }

  function handleDotClick(event) {
    const button = event.target.closest('[data-slide]');
    if (!button) return;
    slideIndex = Number(button.dataset.slide);
    renderSlide();
  }

  function toggleSliderPause(event) {
    manualPaused = !manualPaused;
    event.currentTarget.textContent = manualPaused ? 'Tiếp tục' : 'Tạm dừng';
    event.currentTarget.setAttribute('aria-pressed', String(manualPaused));
  }

  function advanceSlider() {
    const hasFocus = slider.contains(document.activeElement);
    if (hoverPaused || manualPaused || document.hidden || hasFocus) return;
    changeSlide(1);
  }

  function bindEvents() {
    document.getElementById('prev-slide').addEventListener('click', function previousSlide() { changeSlide(-1); });
    document.getElementById('next-slide').addEventListener('click', function nextSlide() { changeSlide(1); });
    document.getElementById('slide-dots').addEventListener('click', handleDotClick);
    document.getElementById('pause-slide').addEventListener('click', toggleSliderPause);
    slider.addEventListener('mouseenter', function pauseOnHover() { hoverPaused = true; });
    slider.addEventListener('mouseleave', function resumeAfterHover() { hoverPaused = false; });
    window.addEventListener('promotion-expired', renderProductSections);
    document.addEventListener('visibilitychange', updateCountdown);
  }

  ui.initCommon();
  createSlideDots();
  renderSlide();
  renderCategories();
  renderProductSections();
  bindEvents();
  setInterval(advanceSlider, 6000);
  if (updateCountdown()) countdownTimer = setInterval(updateCountdown, 1000);
})();
