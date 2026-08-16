const fs = require('fs');
const path = require('path');

describe('chatbot.js', () => {
  let domContentLoadedCallback;

  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();

    // Intercept DOMContentLoaded to prevent multiple executions across tests
    domContentLoadedCallback = null;
    jest.spyOn(document, 'addEventListener').mockImplementation((event, cb) => {
      if (event === 'DOMContentLoaded') {
        domContentLoadedCallback = cb;
      }
    });

    const scriptPath = path.resolve(__dirname, '../chatbot.js');
    const scriptCode = fs.readFileSync(scriptPath, 'utf8');
    
    Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true });
    
    try {
      eval(scriptCode);
    } catch(e) {
      console.error(e);
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('initializes chatbot UI on DOMContentLoaded', () => {
    expect(domContentLoadedCallback).not.toBeNull();
    domContentLoadedCallback();
    
    const toggle = document.getElementById('chatbot-toggle');
    const panel = document.getElementById('chatbot-panel');
    
    expect(toggle).not.toBeNull();
    expect(panel).not.toBeNull();

    // Toggle click opens panel
    toggle.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    expect(panel.classList.contains('open')).toBe(true);
  });

  test('handles new user flow and adds service to cart', async () => {
    jest.useFakeTimers();
    expect(domContentLoadedCallback).not.toBeNull();
    domContentLoadedCallback();
    
    // Fast forward initial greeting timers
    await jest.runAllTimersAsync();
    
    const input = document.getElementById('cb-input');
    const sendBtn = document.getElementById('cb-send');

    // Enter name
    input.value = 'Jane Doe';
    sendBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await jest.runAllTimersAsync();

    // Enter phone
    input.value = '9876543210';
    sendBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await jest.runAllTimersAsync();

    // Verify user is saved to DB
    const db = JSON.parse(localStorage.getItem('vt_users') || '{}');
    expect(db['9876543210']).toBeDefined();
    expect(db['9876543210'].name).toBe('Jane Doe');

    // Services should be rendered
    const addBtns = document.querySelectorAll('.cb-service-add');
    expect(addBtns.length).toBeGreaterThan(0);
    
    // Add first service to cart
    addBtns[0].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    
    const cartCount = document.getElementById('cb-cart-count');
    expect(cartCount.textContent).toBe('1');
    expect(cartCount.classList.contains('visible')).toBe(true);

    // Verify cart panel shows the item
    const cartBtn = document.getElementById('cb-cart-btn');
    cartBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));

    const confirmBtn = document.getElementById('cb-confirm-btn');
    expect(confirmBtn.disabled).toBe(false);

    // Proceed to confirm
    confirmBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await jest.runAllTimersAsync();

    const chips = Array.from(document.querySelectorAll('.cb-chip'));
    const confirmChip = chips.find(c => c.textContent.includes('Confirm Booking'));
    expect(confirmChip).toBeDefined();
    
    confirmChip.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    await jest.runAllTimersAsync();

    // Verify booking is saved
    const updatedDb = JSON.parse(localStorage.getItem('vt_users') || '{}');
    expect(updatedDb['9876543210'].bookings).toBeDefined();
    expect(updatedDb['9876543210'].bookings.length).toBe(1);
  });
});
