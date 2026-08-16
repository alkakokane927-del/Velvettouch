/* =============================================
   AAROHI CHATBOT — Full Logic
   Database: localStorage
   Flow: Name → Phone → Check DB → Services → Cart → Confirm
   ============================================= */

(function () {

  /* =========================================
     CONFIG
     ========================================= */
  const SERVICES = [
    { id: 'head',      icon: '🧖‍♀️', name: 'Head Massage',         desc: 'Relieves tension & relaxes mind' },
    { id: 'face',      icon: '✨', name: 'Face Massage',           desc: 'Glow-inducing facial treatment' },
    { id: 'foot',      icon: '🦶', name: 'Foot Massage',           desc: 'Reflexology pressure-point relief' },
    { id: 'fullbody',  icon: '💆‍♀️', name: 'Full Body Massage',      desc: 'Head-to-toe herbal oil therapy' },
    { id: 'steamer',   icon: '🌫️', name: 'Full Body Steamer',      desc: 'Detox · Relax · Rejuvenate' },
    { id: 'cupping',   icon: '🫙', name: 'Cupping Therapy',        desc: 'Ancient suction healing technique' },
    { id: 'scrub',     icon: '🫧', name: 'Body Scrub with Steam',  desc: 'Exfoliate · Detox · Glow' },
  ];

  const DB_KEY   = 'vt_users';
  const LEAD_KEY = 'vt_current_user';

  /* =========================================
     STATE
     ========================================= */
  let state = {
    step: 'greeting',   // greeting | ask_name | ask_phone | services | confirmed
    name: '',
    phone: '',
    isNewUser: false,
    cart: [],
  };

  /* =========================================
     DB HELPERS
     ========================================= */
  function getDB() {
    try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); } catch { return {}; }
  }
  function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
  function findUser(phone) {
    return getDB()[phone] || null;
  }
  function saveUser(user) {
    const db = getDB();
    db[user.phone] = user;
    saveDB(db);
    localStorage.setItem(LEAD_KEY, JSON.stringify(user));

    // Sync with backend API
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: user.phone,
        name: user.name,
        phone: user.phone,
        joinedAt: user.joinedAt || new Date().toISOString(),
        bookings: user.bookings || []
      })
    }).catch(e => console.warn('API Leads sync failed, local only'));
  }
  function updateLoginUI(name) {
    const loginBtn = document.getElementById('header-login-btn');
    if (loginBtn) {
      loginBtn.innerHTML = '👤 ' + name.split(' ')[0];
      loginBtn.style.color = '#C9A96E';
      loginBtn.style.fontWeight = '600';
    }
  }

  /* =========================================
     BUILD HTML SKELETON
     ========================================= */
  function buildUI() {
    // --- Toggle button ---
    const toggle = document.createElement('button');
    toggle.id = 'chatbot-toggle';
    toggle.setAttribute('aria-label', 'Chat with Aarohi');
    toggle.innerHTML = `
      <svg class="icon-open" viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>
      <svg class="icon-close" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      <span id="chatbot-badge">1</span>
    `;

    // --- Panel ---
    const panel = document.createElement('div');
    panel.id = 'chatbot-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Aarohi — Velvet Touch Wellness Guide');
    panel.innerHTML = `
      <!-- Header -->
      <div class="cb-header">
        <div class="cb-avatar">🌸<span class="cb-avatar-online"></span></div>
        <div class="cb-header-info">
          <div class="cb-header-name">Aarohi</div>
          <div class="cb-header-status"><span class="cb-status-dot"></span> Wellness Guide · Online</div>
        </div>
        <div class="cb-header-actions">
          <button class="cb-header-btn" id="cb-cart-btn" title="View Cart" aria-label="View cart">
            🛒
            <span id="cb-cart-count"></span>
          </button>
          <button class="cb-header-btn" id="cb-close-btn" title="Close" aria-label="Close chat">✕</button>
        </div>
      </div>

      <!-- Messages -->
      <div class="cb-messages" id="cb-messages"></div>

      <!-- Input -->
      <div class="cb-input-area">
        <input id="cb-input" type="text" placeholder="Type your message…" autocomplete="off" />
        <button id="cb-send" aria-label="Send message">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>

      <!-- Cart slide-over -->
      <div id="cb-cart-panel">
        <div class="cb-cart-header">
          <button class="cb-cart-back" id="cb-cart-back" aria-label="Back to chat">←</button>
          <span class="cb-cart-title">🛒 Your Selected Services</span>
        </div>
        <div class="cb-cart-items" id="cb-cart-items"></div>
        <div class="cb-cart-footer">
          <button id="cb-confirm-btn" disabled>Confirm Booking</button>
        </div>
      </div>
    `;

    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  /* =========================================
     MESSAGING
     ========================================= */
  let typingEl = null;

  function scrollToBottom() {
    const msgs = document.getElementById('cb-messages');
    if (msgs) setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 60);
  }

  function showTyping() {
    removeTyping();
    const msgs = document.getElementById('cb-messages');
    typingEl = document.createElement('div');
    typingEl.className = 'cb-msg bot';
    typingEl.innerHTML = `
      <div class="cb-msg-avatar">🌸</div>
      <div class="cb-bubble">
        <div class="cb-typing"><span></span><span></span><span></span></div>
      </div>`;
    msgs.appendChild(typingEl);
    scrollToBottom();
  }

  function removeTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  function botMsg(html, delay = 600) {
    return new Promise(resolve => {
      showTyping();
      setTimeout(() => {
        removeTyping();
        const msgs = document.getElementById('cb-messages');
        const row = document.createElement('div');
        row.className = 'cb-msg bot';
        row.innerHTML = `<div class="cb-msg-avatar">🌸</div><div class="cb-bubble">${html}</div>`;
        msgs.appendChild(row);
        scrollToBottom();
        resolve();
      }, delay);
    });
  }

  function userMsg(text) {
    const msgs = document.getElementById('cb-messages');
    const row = document.createElement('div');
    row.className = 'cb-msg user';
    row.innerHTML = `<div class="cb-bubble">${escHtml(text)}</div>`;
    msgs.appendChild(row);
    scrollToBottom();
  }

  function showChips(chips) {
    const msgs = document.getElementById('cb-messages');
    const wrap = document.createElement('div');
    wrap.className = 'cb-chips';
    wrap.id = 'cb-chips';
    chips.forEach(c => {
      const btn = document.createElement('button');
      btn.className = 'cb-chip';
      btn.textContent = c.label;
      btn.addEventListener('click', () => {
        wrap.remove();
        handleInput(c.value || c.label);
      });
      wrap.appendChild(btn);
    });
    msgs.appendChild(wrap);
    scrollToBottom();
  }

  function removeChips() {
    const c = document.getElementById('cb-chips');
    if (c) c.remove();
  }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* =========================================
     SERVICE CARDS IN CHAT
     ========================================= */
  function showServiceCards() {
    const msgs = document.getElementById('cb-messages');
    SERVICES.forEach((svc, i) => {
      const card = document.createElement('div');
      card.className = 'cb-service-card';
      card.style.animationDelay = (i * 0.07) + 's';
      card.dataset.id = svc.id;
      const inCart = state.cart.some(c => c.id === svc.id);
      card.innerHTML = `
        <span class="cb-service-icon">${svc.icon}</span>
        <div class="cb-service-info">
          <div class="cb-service-name">${svc.name}</div>
          <div class="cb-service-desc">${svc.desc}</div>
        </div>
        <button class="cb-service-add ${inCart ? 'added' : 'add'}">${inCart ? '✓ Added' : '+ Add'}</button>
      `;
      const addBtn = card.querySelector('.cb-service-add');
      addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCart(svc, card, addBtn);
      });
      card.addEventListener('click', () => toggleCart(svc, card, addBtn));
      msgs.appendChild(card);
    });
    scrollToBottom();
  }

  function toggleCart(svc, card, btn) {
    const idx = state.cart.findIndex(c => c.id === svc.id);
    if (idx === -1) {
      state.cart.push(svc);
      btn.textContent = '✓ Added';
      btn.className = 'cb-service-add added';
      card.classList.add('in-cart');
    } else {
      state.cart.splice(idx, 1);
      btn.textContent = '+ Add';
      btn.className = 'cb-service-add add';
      card.classList.remove('in-cart');
    }
    updateCartBadge();

    // Show "done" chip after first add
    if (state.cart.length > 0 && !document.getElementById('cb-done-chip')) {
      const msgs = document.getElementById('cb-messages');
      const doneWrap = document.createElement('div');
      doneWrap.className = 'cb-chips';
      doneWrap.id = 'cb-done-chip';
      const doneBtn = document.createElement('button');
      doneBtn.className = 'cb-chip';
      doneBtn.textContent = '✅ Done — Proceed to Booking';
      doneBtn.addEventListener('click', () => {
        doneWrap.remove();
        proceedToConfirm();
      });
      doneWrap.appendChild(doneBtn);
      msgs.appendChild(doneWrap);
      scrollToBottom();
    }
    if (state.cart.length === 0) {
      const done = document.getElementById('cb-done-chip');
      if (done) done.remove();
    }
  }

  function updateCartBadge() {
    const count = document.getElementById('cb-cart-count');
    if (!count) return;
    if (state.cart.length > 0) {
      count.textContent = state.cart.length;
      count.classList.add('visible');
    } else {
      count.classList.remove('visible');
    }
    // Refresh cart panel if open
    renderCartPanel();
  }

  /* =========================================
     CART PANEL
     ========================================= */
  function renderCartPanel() {
    const itemsEl = document.getElementById('cb-cart-items');
    const confirmBtn = document.getElementById('cb-confirm-btn');
    if (!itemsEl) return;
    itemsEl.innerHTML = '';
    if (state.cart.length === 0) {
      itemsEl.innerHTML = '<div class="cb-cart-empty">🛒 Your cart is empty.<br>Go back and add services!</div>';
      if (confirmBtn) confirmBtn.disabled = true;
      return;
    }
    state.cart.forEach(svc => {
      const item = document.createElement('div');
      item.className = 'cb-cart-item';
      item.innerHTML = `
        <span class="cb-cart-item-icon">${svc.icon}</span>
        <span class="cb-cart-item-name">${svc.name}</span>
        <button class="cb-cart-item-remove" title="Remove">✕</button>
      `;
      item.querySelector('.cb-cart-item-remove').addEventListener('click', () => {
        state.cart = state.cart.filter(c => c.id !== svc.id);
        // Unmark card in messages
        const card = document.querySelector(`.cb-service-card[data-id="${svc.id}"]`);
        if (card) {
          card.classList.remove('in-cart');
          const btn = card.querySelector('.cb-service-add');
          if (btn) { btn.textContent = '+ Add'; btn.className = 'cb-service-add add'; }
        }
        updateCartBadge();
        if (state.cart.length === 0) {
          const done = document.getElementById('cb-done-chip');
          if (done) done.remove();
        }
      });
      itemsEl.appendChild(item);
    });
    if (confirmBtn) confirmBtn.disabled = false;
  }

  function openCartPanel() {
    renderCartPanel();
    document.getElementById('cb-cart-panel').classList.add('open');
  }
  function closeCartPanel() {
    document.getElementById('cb-cart-panel').classList.remove('open');
  }

  /* =========================================
     PROCEED TO CONFIRM
     ========================================= */
  async function proceedToConfirm() {
    if (state.cart.length === 0) {
      await botMsg('Please add at least one service first! 🌸');
      return;
    }
    const names = state.cart.map(s => s.name).join(', ');
    await botMsg(`Great picks, ${state.name.split(' ')[0]}! 🎉<br>You've selected: <strong>${names}</strong>`, 500);
    await botMsg(`Our team will reach out on <strong>${state.phone}</strong> within minutes to confirm your slot. 📞`, 1000);
    await botMsg(`Meanwhile, would you like to add anything else or confirm now?`, 1600);
    showChips([
      { label: '✅ Confirm Booking', value: '__confirm__' },
      { label: '➕ Add More Services',  value: '__more__' },
    ]);
    state.step = 'confirm_prompt';
  }

  async function finalConfirm() {
    removeChips();
    // Save booking to DB
    const db = getDB();
    const user = db[state.phone] || {};
    if (!user.bookings) user.bookings = [];
    user.bookings.push({
      services: state.cart.map(s => s.name),
      bookedAt: new Date().toISOString(),
    });
    user.lastBooked = new Date().toISOString();
    saveUser({ ...user, name: state.name, phone: state.phone });

    await botMsg(`✅ <strong>Booking Confirmed!</strong><br>We'll call you on ${state.phone} shortly.`, 400);
    await botMsg(`Thank you for choosing Velvet Touch, ${state.name.split(' ')[0]}! 🌺<br>Prepare to be pampered! ✨`, 1200);
    updateLoginUI(state.name);
    state.step = 'confirmed';
    document.getElementById('cb-input').disabled = true;
    document.getElementById('cb-send').disabled  = true;
  }

  /* =========================================
     CONVERSATION FLOW
     ========================================= */
  async function startGreeting() {
    // Check returning user
    try {
      const saved = JSON.parse(localStorage.getItem(LEAD_KEY) || 'null');
      if (saved && saved.name && saved.phone) {
        state.name  = saved.name;
        state.phone = saved.phone;
        updateLoginUI(saved.name);
        await botMsg(`Welcome back, <strong>${saved.name.split(' ')[0]}</strong>! 🌸 So wonderful to see you again.`, 500);
        await botMsg(`Ready for another blissful session? Here are our services — just add what you fancy! 💆‍♀️`, 1100);
        state.step = 'services';
        showServiceCards();
        return;
      }
    } catch (_) {}

    await botMsg(`Namaste! 🌸 I'm <strong>Aarohi</strong>, your personal wellness guide at <em>Velvet Touch</em>.<br><br>I'm here to help you find the perfect treatment and get you booked in minutes!`, 700);
    await botMsg(`May I know your <strong>name</strong>, beautiful? 😊`, 1400);
    state.step = 'ask_name';
    setInputPlaceholder('Enter your full name…');
  }

  async function handleInput(text) {
    text = text.trim();
    if (!text) return;

    switch (state.step) {

      case 'ask_name': {
        if (text.length < 2) {
          userMsg(text);
          await botMsg(`Hmm, that doesn't look like a name. Could you type your full name? 😊`);
          return;
        }
        userMsg(text);
        state.name = text;
        await botMsg(`Lovely name, <strong>${text.split(' ')[0]}</strong>! 🌺`, 400);
        await botMsg(`Now, could you share your <strong>WhatsApp number</strong>? (10 digits) — We'll use this to confirm your booking. 📱`, 900);
        state.step = 'ask_phone';
        setInputPlaceholder('Enter 10-digit mobile number…');
        break;
      }

      case 'ask_phone': {
        const digits = text.replace(/\D/g, '');
        if (digits.length !== 10) {
          userMsg(text);
          await botMsg(`That doesn't look right 🤔 Please enter a valid <strong>10-digit</strong> Indian mobile number.`);
          return;
        }
        userMsg(text);
        state.phone = digits;
        setInputPlaceholder('Type your message…');

        // Check DB
        const existing = findUser(digits);
        if (existing) {
          // Returning user
          state.isNewUser = false;
          state.name = existing.name;
          saveUser({ ...existing, lastSeen: new Date().toISOString() });
          updateLoginUI(existing.name);
          await botMsg(`Welcome back, <strong>${existing.name.split(' ')[0]}</strong>! 🌸 We've missed you!`, 500);
          await botMsg(`Here are our services — go ahead and add your favourites to the cart! 💆‍♀️`, 1100);
        } else {
          // New user — capture lead
          state.isNewUser = true;
          const newUser = { name: state.name, phone: digits, joinedAt: new Date().toISOString(), bookings: [] };
          saveUser(newUser);
          updateLoginUI(state.name);
          await botMsg(`You're all set, <strong>${state.name.split(' ')[0]}</strong>! 🎉 Welcome to the Velvet Touch family! 🌺`, 600);
          await botMsg(`Here are our premium services — tap <strong>+ Add</strong> to build your perfect session! ✨`, 1200);
        }
        state.step = 'services';
        showServiceCards();
        break;
      }

      case 'services': {
        // Soft nudge if they type instead of tapping
        userMsg(text);
        await botMsg(`Just tap <strong>+ Add</strong> on the services above to add them to your cart! 🌸<br>When ready, tap <strong>Done — Proceed to Booking</strong>.`);
        break;
      }

      case 'confirm_prompt': {
        if (text === '__confirm__') {
          userMsg('✅ Confirm Booking');
          await finalConfirm();
        } else if (text === '__more__') {
          userMsg('➕ Add More Services');
          removeChips();
          await botMsg(`Of course! Scroll up to add more services, then tap the Done button when ready. 🌸`);
          state.step = 'services';
        } else {
          userMsg(text);
          await botMsg(`When you're ready, choose from the options above! 😊`);
        }
        break;
      }

      case 'confirmed': {
        userMsg(text);
        await botMsg(`Your booking is confirmed! 🌺 We'll be in touch soon. Is there anything else I can help with?`);
        showChips([{ label: '🔄 Book Again', value: '__restart__' }]);
        break;
      }

      default: {
        if (text === '__restart__') {
          userMsg('🔄 Book Again');
          state.cart = [];
          updateCartBadge();
          state.step = 'services';
          const msgs = document.getElementById('cb-messages');
          msgs.innerHTML = '';
          await startGreeting();
        }
        break;
      }
    }
  }

  function setInputPlaceholder(txt) {
    const inp = document.getElementById('cb-input');
    if (inp) inp.placeholder = txt;
  }

  /* =========================================
     EVENT LISTENERS
     ========================================= */
  function bindEvents() {
    const toggle  = document.getElementById('chatbot-toggle');
    const panel   = document.getElementById('chatbot-panel');
    const closeBtn = document.getElementById('cb-close-btn');
    const input   = document.getElementById('cb-input');
    const sendBtn = document.getElementById('cb-send');
    const cartBtn = document.getElementById('cb-cart-btn');
    const cartBack = document.getElementById('cb-cart-back');
    const confirmBtn = document.getElementById('cb-confirm-btn');

    // Toggle open/close
    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      // Remove badge on open
      if (isOpen) {
        const badge = document.getElementById('chatbot-badge');
        if (badge) badge.style.display = 'none';
      }
    });

    // Close button
    if (closeBtn) closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
      toggle.classList.remove('open');
    });

    // Send message
    function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      removeChips();
      handleInput(text);
    }
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    // Cart
    cartBtn.addEventListener('click', openCartPanel);
    if (cartBack) cartBack.addEventListener('click', closeCartPanel);
    if (confirmBtn) confirmBtn.addEventListener('click', () => {
      closeCartPanel();
      proceedToConfirm();
    });
  }

  /* =========================================
     INIT
     ========================================= */
  function init() {
    buildUI();
    bindEvents();
    // Auto-start greeting after short delay
    setTimeout(() => startGreeting(), 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
