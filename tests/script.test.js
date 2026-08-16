const fs = require('fs');
const path = require('path');

describe('script.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <audio id="bg-music"></audio>
      <button id="music-toggle" class="muted"></button>
      <div id="page-loader" class="hidden"></div>
      <div id="loader-bar"></div>
      <div id="loader-logo-wrap"></div>
      <div class="hero"></div>
      <div id="city-bar"></div>
      <header id="main-header"></header>
      <button id="floating-whatsapp"></button>
      <button class="lang-btn" data-lang="hi"></button>
      <h3 class="sl-title" data-en="Massage" data-hi="मालिश">Massage</h3>
      <button id="hamburger-btn" aria-expanded="false"></button>
      <div id="mobile-nav-overlay"></div>
      <button id="mobile-nav-close"></button>
      <form id="newsletter-form">
        <input id="newsletter-email" type="email" />
        <button id="newsletter-submit">Subscribe</button>
      </form>
    `;

    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe() {}
      unobserve() {}
      disconnect() {}
    };

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => setTimeout(() => cb(performance.now()), 0));

    // Mock audio play/pause
    window.HTMLAudioElement.prototype.play = jest.fn().mockResolvedValue(true);
    window.HTMLAudioElement.prototype.pause = jest.fn();

    // Clear sessionStorage
    sessionStorage.clear();

    const scriptPath = path.resolve(__dirname, '../script.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf8');
    try {
      eval(scriptCode);
    } catch(e) {
      console.error(e);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('loader initializes correctly on first visit', () => {
    // Dispatch DOMContentLoaded
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // On first visit, loaderSeen is set to true and loader is visible (hidden class removed)
    expect(sessionStorage.getItem('loaderSeen')).toBe('true');
    const loader = document.getElementById('page-loader');
    expect(loader.classList.contains('hidden')).toBe(false);
  });

  test('language switcher changes data-lang attribute and text', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Default language is en
    expect(document.documentElement.getAttribute('data-lang')).toBe('en');
    const title = document.querySelector('.sl-title');
    expect(title.textContent).toBe('Massage');

    // Click Hindi button
    const hiBtn = document.querySelector('.lang-btn[data-lang="hi"]');
    hiBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    expect(document.documentElement.getAttribute('data-lang')).toBe('hi');
    expect(title.textContent).toBe('मालिश');
  });

  test('hamburger menu toggles overlay and sets aria-expanded', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const hamburger = document.getElementById('hamburger-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    const closeBtn = document.getElementById('mobile-nav-close');

    hamburger.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
    expect(overlay.classList.contains('open')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    closeBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
    expect(overlay.classList.contains('open')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  test('newsletter form validates email and updates UI on success', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const form = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email');
    const submitBtn = document.getElementById('newsletter-submit');

    // Invalid email
    emailInput.value = 'invalidemail';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(emailInput.style.borderColor).not.toBe(''); // It sets to #e74c3c or rgb equivalent

    // Valid email
    emailInput.value = 'test@example.com';
    form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
    expect(submitBtn.textContent).toBe('Subscribed!');
    expect(submitBtn.disabled).toBe(true);
  });
});
