/* =============================================
   VELVET TOUCH MASSAGE — JAVASCRIPT
   ============================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     AMBIENT MUSIC PLAYER
     ============================================= */
  const music = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  
  if (music && musicToggle) {
    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Autoplay successful
        musicToggle.classList.remove('muted');
      }).catch(() => {
        // Autoplay blocked by browser policy, wait for interaction
        musicToggle.classList.add('muted');
        
        const startAudio = () => {
          music.play();
          musicToggle.classList.remove('muted');
          document.removeEventListener('click', startAudio);
          document.removeEventListener('scroll', startAudio);
        };
        document.addEventListener('click', startAudio, { once: true });
        document.addEventListener('scroll', startAudio, { once: true });
      });
    }

    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (music.paused) {
        music.play();
        musicToggle.classList.remove('muted');
      } else {
        music.pause();
        musicToggle.classList.add('muted');
      }
    });
  }
  /* =============================================
     PAGE LOADER — 7 seconds on first visit
     Re-triggered after 10s idle on home section
     ============================================= */
  const loader         = document.getElementById('page-loader');
  const loaderBar      = document.getElementById('loader-bar');
  const loaderLogoWrap = document.getElementById('loader-logo-wrap');
  const LOADER_DURATION = 7000;

  function runLoader(callback) {
    if (!loader) { if (callback) callback(); return; }

    loader.classList.remove('hidden');
    const realContent = document.getElementById('real-loader-content');
    if (realContent) realContent.style.opacity = '1';

    loaderBar.style.width = '0%';
    loaderLogoWrap.className = 'loader-logo-wrap';
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / LOADER_DURATION) * 100, 100);
      loaderBar.style.width = pct + '%';

      if (pct >= 70 && !loaderLogoWrap.classList.contains('calming')) {
        loaderLogoWrap.classList.add('calming');
      }
      if (pct >= 90 && !loaderLogoWrap.classList.contains('calm')) {
        loaderLogoWrap.classList.remove('calming');
        loaderLogoWrap.classList.add('calm');
      }

      if (elapsed < LOADER_DURATION) {
        requestAnimationFrame(tick);
      } else {
        loader.classList.add('hidden');
        document.body.style.overflow = '';
        if (callback) setTimeout(callback, 700);

        // ---- FIRE ENTRANCE ANIMATIONS AFTER LOADER HIDES ----
        setTimeout(triggerHeaderEntrance, 400);
        setTimeout(triggerHeroEntrance,   750);
        setTimeout(() => {
          const fab = document.getElementById('floating-whatsapp');
          if (fab) fab.classList.add('vt-fab-in');
        }, 1400);
      }
    }

    requestAnimationFrame(tick);
  }
  // Check if loader has been seen in this session
  const tapToStart = document.getElementById('tap-to-start');

  if (sessionStorage.getItem('loaderSeen')) {
    loader.classList.add('hidden');
    loader.style.display = 'none'; 
    if (tapToStart) { tapToStart.style.display = 'none'; tapToStart.classList.add('hidden'); }
    document.body.style.overflow = '';
    
    // Trigger entrance animations immediately
    triggerHeaderEntrance();
    triggerHeroEntrance();
    const fab = document.getElementById('floating-whatsapp');
    if (fab) fab.classList.add('vt-fab-in');
  } else {
    sessionStorage.setItem('loaderSeen', 'true');
    if (tapToStart) {
      tapToStart.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      // keep real loader visible underneath but it won't animate until runLoader is called
      
      tapToStart.addEventListener('click', () => {
        // Try playing music explicitly on this trusted event
        if (music) {
          music.play().then(() => {
            if (musicToggle) musicToggle.classList.remove('muted');
          }).catch(() => {});
        }
        
        tapToStart.classList.add('hidden'); // begins fading out
        runLoader(null); // start the loader underneath immediately
        
        setTimeout(() => {
          tapToStart.style.display = 'none';
        }, 800); // match CSS transition
      });
    } else {
      runLoader(null);
    }
  }




  /* =============================================
     ✨ ENTRANCE ANIMATION ENGINE
     ============================================= */

  /* --- 1. Hero entrance (triggered after loader fades) --- */
  function triggerHeroEntrance() {
    const hero = document.querySelector('.hero');
    if (hero) hero.classList.add('hero-animated');
  }

  /* --- 2. Header slide-down entrance --- */
  function triggerHeaderEntrance() {
    const cityBar    = document.getElementById('city-bar');
    const mainHeader = document.getElementById('main-header');
    if (cityBar)    cityBar.classList.add('vt-header-in');
    if (mainHeader) setTimeout(() => mainHeader.classList.add('vt-header-in'), 100);
  }

  /* --- 3. Tag every element with data-vt-anim --- */
  function tagAnimations() {

    // ---- TRUST BADGES ----
    document.querySelectorAll('.trust-item').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'fade-up');
      el.setAttribute('data-vt-delay', String(i + 1));
    });

    // ---- SWEDISH HIGHLIGHT SECTION ----
    const swBanner = document.querySelector('.swedish-banner');
    if (swBanner) swBanner.setAttribute('data-vt-anim', 'zoom-in');

    // ---- SERVICES SECTION ----
    const servHeader = document.querySelector('#services .section-header');
    if (servHeader) servHeader.setAttribute('data-vt-anim', 'fade-up');

    const lhb = document.querySelector('.ladies-highlight-banner');
    if (lhb) { lhb.setAttribute('data-vt-anim', 'fade-up'); lhb.setAttribute('data-vt-delay', '2'); }

    document.querySelectorAll('.sl-card').forEach((el, i) => {
      el.setAttribute('data-vt-anim', i % 2 === 0 ? 'fade-left' : 'fade-right');
      el.setAttribute('data-vt-delay', String((i % 5) + 1));
    });

    const viewAll = document.getElementById('view-all-services');
    if (viewAll) viewAll.setAttribute('data-vt-anim', 'fade-up');

    // ---- STEAMER SECTION ----
    const steamerEyebrow = document.querySelector('.steamer-text .section-eyebrow');
    if (steamerEyebrow) steamerEyebrow.setAttribute('data-vt-anim', 'fade-up');

    const steamerTitle = document.querySelector('.steamer-title');
    if (steamerTitle) {
      steamerTitle.setAttribute('data-vt-anim', 'fade-left');
      steamerTitle.setAttribute('data-vt-delay', '2');
    }

    document.querySelectorAll('.steamer-pillar').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'zoom-in');
      el.setAttribute('data-vt-delay', String(i + 3));
    });

    const steamerDesc = document.querySelector('.steamer-desc');
    if (steamerDesc) { steamerDesc.setAttribute('data-vt-anim', 'fade-up'); steamerDesc.setAttribute('data-vt-delay', '5'); }

    const steamerBtn = document.getElementById('steamer-book-btn');
    if (steamerBtn) { steamerBtn.setAttribute('data-vt-anim', 'fade-up'); steamerBtn.setAttribute('data-vt-delay', '6'); }

    document.querySelectorAll('.stb-card').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'flip-up');
      el.setAttribute('data-vt-delay', String(i + 1));
    });

    // ---- SPECIALIZED SECTION ----
    const specHeader = document.querySelector('#specialized .section-header');
    if (specHeader) specHeader.setAttribute('data-vt-anim', 'fade-up');

    document.querySelectorAll('.pain-card').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'zoom-in');
      el.setAttribute('data-vt-delay', String((i % 7) + 1));
    });

    // ---- SPECIAL CARE SECTION ----
    const careHeader = document.querySelector('#special-care .section-header');
    if (careHeader) careHeader.setAttribute('data-vt-anim', 'fade-up');

    document.querySelectorAll('.care-card').forEach((el, i) => {
      el.setAttribute('data-vt-anim', i === 0 ? 'fade-left' : 'fade-right');
      el.setAttribute('data-vt-delay', '1');
    });

    document.querySelectorAll('.care-card-icon-wrap').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'glow-pop');
      el.setAttribute('data-vt-delay', String(i + 2));
    });

    document.querySelectorAll('.care-badge').forEach(el => {
      el.setAttribute('data-vt-anim', 'glow-pop');
      el.setAttribute('data-vt-delay', '3');
    });

    document.querySelectorAll('.care-title').forEach(el => {
      el.setAttribute('data-vt-anim', 'fade-up');
      el.setAttribute('data-vt-delay', '4');
    });

    document.querySelectorAll('.care-features li').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'fade-left');
      el.setAttribute('data-vt-delay', String((i % 4) + 5));
    });

    document.querySelectorAll('.care-book-btn').forEach(el => {
      el.setAttribute('data-vt-anim', 'fade-up');
      el.setAttribute('data-vt-delay', '9');
    });

    // ---- WHY US ----
    const whyHeader = document.querySelector('#why-us .section-header');
    if (whyHeader) whyHeader.setAttribute('data-vt-anim', 'fade-up');

    document.querySelectorAll('.why-card').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'flip-up');
      el.setAttribute('data-vt-delay', String(i + 1));
    });

    // ---- STATS ----
    document.querySelectorAll('.stat-item').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'zoom-in');
      el.setAttribute('data-vt-delay', String(i + 1));
    });

    // ---- TESTIMONIALS ----
    const testHeader = document.querySelector('#testimonials .section-header');
    if (testHeader) testHeader.setAttribute('data-vt-anim', 'fade-up');

    // ---- BOOK SECTION ----
    const bookEyebrow = document.querySelector('.book-eyebrow');
    if (bookEyebrow) bookEyebrow.setAttribute('data-vt-anim', 'fade-up');

    const bookTitle = document.querySelector('.book-title');
    if (bookTitle) { bookTitle.setAttribute('data-vt-anim', 'fade-up'); bookTitle.setAttribute('data-vt-delay', '2'); }

    const bookSub = document.querySelector('.book-subtitle');
    if (bookSub) { bookSub.setAttribute('data-vt-anim', 'fade-up'); bookSub.setAttribute('data-vt-delay', '3'); }

    const bookCtas = document.querySelector('.book-ctas');
    if (bookCtas) { bookCtas.setAttribute('data-vt-anim', 'fade-up'); bookCtas.setAttribute('data-vt-delay', '4'); }

    // ---- FOOTER ----
    const footerBrand = document.querySelector('.footer-brand');
    if (footerBrand) footerBrand.setAttribute('data-vt-anim', 'fade-left');

    document.querySelectorAll('.footer-col').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'fade-up');
      el.setAttribute('data-vt-delay', String(i + 2));
    });

    document.querySelectorAll('.social-link').forEach((el, i) => {
      el.setAttribute('data-vt-anim', 'glow-pop');
      el.setAttribute('data-vt-delay', String(i + 1));
    });

    // ---- NEWSLETTER BAR ----
    const newsletterBar = document.querySelector('.newsletter-bar');
    if (newsletterBar) newsletterBar.setAttribute('data-vt-anim', 'fade-up');

    const newsletterText = document.querySelector('.newsletter-text');
    if (newsletterText) { newsletterText.setAttribute('data-vt-anim', 'fade-left'); newsletterText.setAttribute('data-vt-delay', '1'); }

    // ---- SECTION-LEVEL markers for CSS section-visible reveals ----
    ['#book', '#testimonials'].forEach(id => {
      const el = document.querySelector(id);
      if (el) el.setAttribute('data-vt-section', id.replace('#', ''));
    });
  }

  tagAnimations();

  /* --- Render Frontend Content from API --- */
  async function loadFrontendContent() {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const content = await res.json();
        
        if (content.hero_eyebrow) {
          const eyebrow = document.getElementById('dyn-hero-eyebrow');
          if (eyebrow) eyebrow.innerHTML = content.hero_eyebrow;
        }
        if (content.hero_title) {
          const title = document.getElementById('dyn-hero-title');
          if (title) title.innerHTML = content.hero_title;
        }
        if (content.hero_subtitle) {
          const subtitle = document.getElementById('dyn-hero-subtitle');
          if (subtitle) subtitle.innerHTML = content.hero_subtitle;
        }
        if (content.hero_bg_url) {
          const heroBg = document.getElementById('hero-bg');
          if (heroBg) heroBg.style.backgroundImage = `url('${content.hero_bg_url}')`;
        }

        if (content.whyus_heading) {
          const whyUs = document.getElementById('dyn-whyus-heading');
          if (whyUs) whyUs.innerHTML = content.whyus_heading;
        }
        if (content.swedish_title) {
          const swTitle = document.getElementById('dyn-swedish-title');
          if (swTitle) swTitle.innerHTML = content.swedish_title;
        }
        if (content.swedish_desc) {
          const swDesc = document.getElementById('dyn-swedish-desc');
          if (swDesc) swDesc.innerHTML = content.swedish_desc;
        }
        if (content.contact_phone) {
          const callBtn = document.getElementById('book-call-btn');
          if (callBtn) {
            callBtn.href = 'tel:' + content.contact_phone.replace(/[^0-9+]/g, '');
            callBtn.innerHTML = '&#128222; Call ' + content.contact_phone;
          }
          const footerPhone = document.getElementById('dyn-contact-phone');
          if (footerPhone) footerPhone.innerHTML = content.contact_phone;
          
          document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
            const num = content.contact_phone.replace(/[^0-9]/g, '');
            if (num) link.href = link.href.replace(/https:\/\/wa\.me\/[0-9]+/, 'https://wa.me/' + num);
          });
        }
        if (content.contact_email) {
          const footerEmail = document.getElementById('dyn-contact-email');
          if (footerEmail) footerEmail.innerHTML = content.contact_email;
        }
      }
    } catch(e) {
      console.warn('Failed to load frontend content', e);
    }
  }
  loadFrontendContent();

  /* --- Render Custom Services from API --- */
  async function renderCustomServices() {
    const grid = document.querySelector('.service-list-grid');
    if (!grid) return;
    
    try {
      let customServices = [];
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          customServices = await res.json();
          localStorage.setItem('customServices', JSON.stringify(customServices));
        } else {
          throw new Error('API error');
        }
      } catch (e) {
        console.warn('Failed to fetch services from API, using fallback');
        customServices = JSON.parse(localStorage.getItem('customServices') || '[]');
      }

      customServices.forEach((service, index) => {
        // Calculate delay for staggered animation based on existing items + new index
        const delay = 300 + (index * 100);
        
        const cardHtml = `
          <div class="sl-card" id="${service.id}" data-vt-anim="fade-up" data-vt-delay="${delay}">
            <div class="sl-img"><img src="${service.image}" alt="${service.name}" loading="lazy"></div>
            <div class="sl-content">
              <div class="sl-icon">${service.icon}</div>
              <div class="sl-body">
                <h3 class="sl-title" data-en="${service.name}" data-hi="${service.name}" data-mr="${service.name}">${service.name}</h3>
                <p class="sl-desc" data-en="${service.desc}" data-hi="${service.desc}" data-mr="${service.desc}">${service.desc}</p>
              </div>
              <a href="https://wa.me/918001234567?text=Hi%2C%20I%20would%20like%20to%20book%20${encodeURIComponent(service.name)}%20at%20Velvet%20Touch." class="sl-book" target="_blank" rel="noopener noreferrer" data-en="Book" data-hi="बूक करा" data-mr="बुक करा">Book</a>
            </div>
          </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
      });
      
      // Re-run the observer on the newly added elements so they actually fade in!
      if (typeof revealObserver !== 'undefined') {
        grid.querySelectorAll('[data-vt-anim]').forEach(el => revealObserver.observe(el));
      }
    } catch(e) {
      console.error('Error rendering custom services:', e);
    }
  }
  renderCustomServices();

  /* --- 4. Single IntersectionObserver for all [data-vt-anim] elements --- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vt-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-vt-anim]').forEach(el => revealObserver.observe(el));

  /* --- 5. Section-level observer (CSS-driven section reveals) --- */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('vt-section-visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll('[data-vt-section], .testimonials-section').forEach(el => sectionObserver.observe(el));


  /* =============================================
     HAMBURGER / MOBILE NAV
     ============================================= */
  const hamburger     = document.getElementById('hamburger-btn');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const mobileClose   = document.getElementById('mobile-nav-close');
  const mobileLinks   = document.querySelectorAll('.mobile-nav-link, .mobile-book-btn');

  function openMobileNav() {
    mobileOverlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger)   hamburger.addEventListener('click', openMobileNav);
  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));


  /* =============================================
     STICKY HEADER SCROLL
     ============================================= */
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });


  /* =============================================
     HERO PARALLAX + IMAGE LOAD
     ============================================= */
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    heroBg.classList.add('loaded');
    window.addEventListener('scroll', function () {
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        heroBg.style.transform = 'scale(1) translateY(' + (offset * 0.3) + 'px)';
      }
    }, { passive: true });
  }


  /* =============================================
     SMOOTH ANCHOR SCROLL
     ============================================= */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 100;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* =============================================
     COUNTER ANIMATION
     ============================================= */
  function formatNumber(n) {
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
    return n.toString();
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  const statsSection = document.getElementById('stats');
  if (statsSection) counterObserver.observe(statsSection);


  /* =============================================
     NEWSLETTER FORM
     ============================================= */
  const newsletterForm   = document.getElementById('newsletter-form');
  const newsletterEmail  = document.getElementById('newsletter-email');
  const newsletterSubmit = document.getElementById('newsletter-submit');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const email      = newsletterEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newsletterEmail.style.borderColor = '#e74c3c';
        newsletterEmail.focus();
        return;
      }
      newsletterEmail.style.borderColor = '';
      newsletterSubmit.textContent      = 'Subscribed!';
      newsletterSubmit.style.background = '#4CAF50';
      newsletterSubmit.disabled         = true;
      setTimeout(() => {
        newsletterEmail.value             = '';
        newsletterSubmit.textContent      = 'Subscribe';
        newsletterSubmit.style.background = '';
        newsletterSubmit.disabled         = false;
      }, 3500);
    });
  }


  /* =============================================
     SCROLL PROGRESS INDICATOR
     ============================================= */
  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed; top: 0; left: 0; z-index: 9999;
    height: 3px; width: 0%;
    background: linear-gradient(90deg, #C9A96E, #6B2D3E);
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(progressBar);

  window.addEventListener('scroll', function () {
    const docEl        = document.documentElement;
    const scrollHeight = docEl.scrollHeight - docEl.clientHeight;
    progressBar.style.width = ((window.scrollY / scrollHeight) * 100) + '%';
  }, { passive: true });


  /* =============================================
     SERVICE CARD HOVER TILT
     ============================================= */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', function (e) {
      const rect    = this.getBoundingClientRect();
      const rotateX = ((e.clientY - rect.top)  / rect.height - 0.5) * -6;
      const rotateY = ((e.clientX - rect.left) / rect.width  - 0.5) *  6;
      this.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', function () { this.style.transform = ''; });
  });


  /* =============================================
     WHATSAPP FLOATING TOOLTIP
     ============================================= */
  const floatingBtn = document.getElementById('floating-whatsapp');
  if (floatingBtn) {
    const tooltip = document.createElement('span');
    tooltip.textContent = 'Book via WhatsApp';
    tooltip.style.cssText = `
      position: absolute; right: 72px; top: 50%;
      transform: translateY(-50%);
      background: #333; color: #fff;
      padding: 6px 14px; border-radius: 20px;
      font-size: 12px; white-space: nowrap;
      opacity: 0; pointer-events: none;
      transition: opacity 0.2s ease;
    `;
    floatingBtn.style.position = 'fixed';
    floatingBtn.appendChild(tooltip);
    floatingBtn.addEventListener('mouseenter', () => tooltip.style.opacity = '1');
    floatingBtn.addEventListener('mouseleave', () => tooltip.style.opacity = '0');
  }


  /* =============================================
     RIPPLE KEYFRAME STYLE
     ============================================= */
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `@keyframes ripple-anim { to { transform: scale(3); opacity: 0; } }`;
  document.head.appendChild(rippleStyle);


  /* =============================================
     LANGUAGE SWITCHER — EN / HI / MR
     ============================================= */
  let currentLang = 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    document.documentElement.setAttribute('data-lang', lang);

    document.querySelectorAll('[data-en]').forEach(el => {
      const val = el.getAttribute('data-' + lang) || el.getAttribute('data-en') || '';
      if (val.includes('<')) {
        el.innerHTML = val;
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    const loaderTagline = document.querySelector('.loader-tagline');
    if (loaderTagline) {
      const taglineVal = loaderTagline.getAttribute('data-' + lang) || loaderTagline.getAttribute('data-en');
      if (taglineVal) loaderTagline.textContent = taglineVal;
    }
  }

  document.querySelectorAll('.lang-btn[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  applyLanguage('en');

  /* ===== MOBILE BOTTOM NAV LOGIC ===== */
  const mbNavItems = document.querySelectorAll(".mb-nav-item");

  // Map nav href → actual section ID on page
  const navIdMap = {
    "hero":     "hero",
    "services": "services",
    "trust":    "testimonials",   // "Reviews" nav → testimonials section
    "contact":  "book"            // "Contact" nav → book/enquiry section
  };

  // Smooth scroll click
  mbNavItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const key = item.getAttribute("href").substring(1);
      const realId = navIdMap[key] || key;
      const target = document.getElementById(realId);
      if (target) target.scrollIntoView({ behavior: "smooth" });
      // Immediately set active on click
      mbNavItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // Active highlight on scroll
  function updateMbNav() {
    // 40% down the viewport
    const viewMid = window.innerHeight * 0.4; 
    let closest = null;
    let closestDist = Infinity;

    Object.values(navIdMap).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      
      const rect = el.getBoundingClientRect();
      // Check if the 40% viewport mark falls within this section's top/bottom
      // or if it's the closest one if none strictly contain it
      if (rect.top <= viewMid && rect.bottom > viewMid) {
        closest = id;
        closestDist = 0; // Exact match
      } else if (closestDist !== 0) {
        // Fallback for edge cases (e.g., bottom of page)
        const dist = Math.abs(rect.top - viewMid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = id;
        }
      }
    });

    // Find the nav key that maps to this section
    const activeKey = Object.keys(navIdMap).find(k => navIdMap[k] === closest);

    mbNavItems.forEach(item => {
      item.classList.remove("active");
      if (item.getAttribute("href").substring(1) === activeKey) {
        item.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateMbNav, { passive: true });
  updateMbNav(); // run once on load

});

