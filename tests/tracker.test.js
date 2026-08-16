const fs = require('fs');
const path = require('path');

describe('tracker.js', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="hero"></div>
      <div id="services"></div>
      <a id="test-link" href="#">Test Link</a>
    `;
    
    // Clear localStorage
    localStorage.clear();
    
    // Mock IntersectionObserver
    global.IntersectionObserver = class {
      constructor(cb) { this.cb = cb; }
      observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
      unobserve() {}
      disconnect() {}
    };

    // Load and execute the script
    const scriptPath = path.resolve(__dirname, '../tracker.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf8');
    
    // Execute script in the current JSDOM context
    // We isolate execution using eval or new Function
    try {
      eval(scriptCode);
    } catch(e) {
      console.error(e);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initializes vt_sessions and seeds if empty', () => {
    const sessions = JSON.parse(localStorage.getItem('vt_sessions') || '[]');
    expect(sessions.length).toBeGreaterThan(5); // Seed function adds around 4*30 records
  });

  test('tracks scroll depth on beforeunload', () => {
    // Setup dimensions for scroll calculation
    window.scrollY = 500;
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true });
    
    // Dispatch scroll event
    window.dispatchEvent(new Event('scroll'));

    // Dispatch beforeunload to trigger saveSession
    window.dispatchEvent(new Event('beforeunload'));
    
    const sessions = JSON.parse(localStorage.getItem('vt_sessions') || '[]');
    const currentSession = sessions[sessions.length - 1];
    
    expect(currentSession.scrollDepth).toBe(100);
    expect(currentSession.isNew).toBeDefined();
  });

  test('tracks clicks and heatmap data', () => {
    const link = document.getElementById('test-link');
    const clickEvent = new window.MouseEvent('click', {
      bubbles: true,
      clientX: 100,
      clientY: 200
    });
    
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, configurable: true });

    link.dispatchEvent(clickEvent);

    const clicks = JSON.parse(localStorage.getItem('vt_clicks') || '[]');
    const latestClick = clicks[clicks.length - 1];
    
    expect(latestClick.label).toBe('test-link');
    // Math.round((100 / 1024) * 10000) / 100 = 9.77
    expect(latestClick.xPct).toBe(9.77); 
    // Math.round(((200 + 0) / 1000) * 10000) / 100 = 20
    expect(latestClick.yPct).toBe(20);
  });

  test('tracks CTA clicks in vt_events', () => {
    const link = document.getElementById('test-link');
    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const events = JSON.parse(localStorage.getItem('vt_events') || '[]');
    expect(events.length).toBeGreaterThan(0);
    
    const latestEvent = events[events.length - 1];
    expect(latestEvent.type).toBe('cta_click');
    expect(latestEvent.target).toBe('test-link');
  });
});
