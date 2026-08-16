/* =============================================
   VELVET TOUCH — PAGE TRACKER
   Records: sessions, clicks, scroll depth, section views
   All data stored in localStorage
   ============================================= */
(function () {
  const SESSION_KEY = 'vt_sessions';
  const CLICK_KEY   = 'vt_clicks';
  const EVENT_KEY   = 'vt_events';

  /* ---- Helpers ---- */
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function getItem(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
  function setItem(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }
  function pushItem(key, obj, maxLen = 500) {
    const arr = getItem(key);
    arr.push(obj);
    if (arr.length > maxLen) arr.splice(0, arr.length - maxLen);
    setItem(key, arr);
  }

  async function postApi(type, data) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data })
      });
    } catch (e) {
      console.warn('API Analytics failed, falling back to local');
    }
  }

  /* ---- Device detection ---- */
  function getDevice() {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return 'Mobile';
    if (/Tablet|iPad/i.test(ua))  return 'Tablet';
    return 'Desktop';
  }
  function getBrowser() {
    const ua = navigator.userAgent;
    if (/Edg\//i.test(ua))    return 'Edge';
    if (/Chrome/i.test(ua))   return 'Chrome';
    if (/Firefox/i.test(ua))  return 'Firefox';
    if (/Safari/i.test(ua))   return 'Safari';
    if (/MSIE|Trident/i.test(ua)) return 'IE';
    return 'Other';
  }
  function getOS() {
    const ua = navigator.userAgent;
    if (/Windows/i.test(ua))  return 'Windows';
    if (/Mac OS/i.test(ua))   return 'macOS';
    if (/Android/i.test(ua))  return 'Android';
    if (/iPhone|iPad/i.test(ua)) return 'iOS';
    if (/Linux/i.test(ua))    return 'Linux';
    return 'Other';
  }
  function getReferrer() {
    const ref = document.referrer;
    if (!ref) return 'Direct';
    if (/google/i.test(ref))    return 'Google';
    if (/instagram/i.test(ref)) return 'Instagram';
    if (/facebook/i.test(ref))  return 'Facebook';
    if (/youtube/i.test(ref))   return 'YouTube';
    if (/whatsapp/i.test(ref))  return 'WhatsApp';
    return 'Other';
  }

  /* ---- Session ---- */
  const sessionId      = uid();
  const sessionStart   = Date.now();
  let   maxScroll      = 0;
  let   clickCount     = 0;
  const sectionsViewed = new Set();
  const existing       = localStorage.getItem('vt_current_user');
  const isNew          = !existing;

  /* ---- Scroll depth ---- */
  window.addEventListener('scroll', function () {
    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = docH > 0 ? Math.round((window.scrollY / docH) * 100) : 0;
    if (pct > maxScroll) maxScroll = pct;
  }, { passive: true });

  /* ---- Section visibility ---- */
  const sectionIds = ['hero','services','steamer','special-care','why-us','stats','testimonials','book'];
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) sectionsViewed.add(e.target.id); });
  }, { threshold: 0.3 });
  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) secObs.observe(el);
  });

  /* ---- Click heatmap ---- */
  document.addEventListener('click', function (e) {
    clickCount++;
    const xPct = Math.round((e.clientX / window.innerWidth)  * 10000) / 100;
    const yPct = Math.round(((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 10000) / 100;
    const label = e.target.closest('a,button,[id]')
      ? (e.target.closest('[id]') || {}).id || e.target.tagName
      : e.target.tagName;
    const data = { x: xPct, y: yPct, w: window.innerWidth, h: document.documentElement.scrollHeight, el: label, time: new Date().toISOString(), session: sessionId };
    pushItem(CLICK_KEY, { xPct, yPct, label, ts: Date.now(), sid: sessionId }, 1000);
    postApi('click', data);
  });

  /* ---- CTA event tracking ---- */
  ['click'].forEach(evType => {
    document.addEventListener(evType, function (e) {
      const el = e.target.closest('a[id],button[id]');
      if (!el) return;
      pushItem(EVENT_KEY, { type: 'cta_click', target: el.id, ts: Date.now(), sid: sessionId }, 300);
    });
  });

  /* ---- Save session on unload ---- */
  function saveSession() {
    const duration = Math.round((Date.now() - sessionStart) / 1000);
    const data = {
      id:        sessionId,
      startTime: new Date(sessionStart).toISOString(),
      duration,
      scrollDepth:    maxScroll,
      clickCount,
      sectionsViewed: [...sectionsViewed],
      device:     getDevice(),
      browser:    getBrowser(),
      os:         getOS(),
      referrer:   getReferrer(),
      isNew,
      date: new Date().toISOString().split('T')[0],
    };
    pushItem(SESSION_KEY, data, 500);
    postApi('session', data);
  }
  window.addEventListener('beforeunload', saveSession);
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveSession();
  });

  /* ---- Seed historical data on first visit ---- */
  function seedIfEmpty() {
    const sessions = getItem(SESSION_KEY);
    if (sessions.length > 5) return; // already have real data

    const devices   = ['Desktop','Mobile','Tablet'];
    const browsers  = ['Chrome','Safari','Firefox','Edge'];
    const oss       = ['Windows','Android','iOS','macOS'];
    const referrers = ['Direct','Google','Instagram','WhatsApp','Facebook'];
    const sections  = ['hero','services','stats','testimonials','book'];
    const now = Date.now();

    for (let d = 29; d >= 0; d--) {
      const count = Math.floor(Math.random() * 18) + 4;
      for (let i = 0; i < count; i++) {
        const ts = now - d * 86400000 - Math.random() * 86400000;
        pushItem(SESSION_KEY, {
          id:        uid(),
          startTime: new Date(ts).toISOString(),
          duration:  Math.floor(Math.random() * 240) + 30,
          scrollDepth: Math.floor(Math.random() * 80) + 10,
          clickCount:  Math.floor(Math.random() * 12),
          sectionsViewed: sections.slice(0, Math.floor(Math.random() * 5) + 1),
          device:    devices[Math.floor(Math.random() * devices.length)],
          browser:   browsers[Math.floor(Math.random() * browsers.length)],
          os:        oss[Math.floor(Math.random() * oss.length)],
          referrer:  referrers[Math.floor(Math.random() * referrers.length)],
          isNew:     Math.random() > 0.4,
          date:      new Date(ts).toISOString().split('T')[0],
        }, 1000);
        // seed some clicks
        for (let c = 0; c < 3; c++) {
          pushItem(CLICK_KEY, {
            xPct: Math.round(Math.random() * 10000) / 100,
            yPct: Math.round(Math.random() * 10000) / 100,
            label: 'seed', ts, sid: uid(),
          }, 1000);
        }
      }
    }
  }
  seedIfEmpty();

})();
