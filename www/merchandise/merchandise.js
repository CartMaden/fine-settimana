
      let activePayment = 'card';

      function switchPayment(method) {
        activePayment = method;
        document.querySelectorAll('.pay-tab').forEach(t => t.classList.toggle('active', t.dataset.method === method));
        document.getElementById('payCard').style.display = method === 'card' ? 'block' : 'none';
        document.getElementById('payIban').style.display = method === 'iban' ? 'block' : 'none';
      }

      function formatCardNumber(el) {
        let v = el.value.replace(/\D/g, '').slice(0, 16);
        el.value = v.match(/.{1,4}/g)?.join(' ') || v;
      }

      function formatExpiry(el) {
        let v = el.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
        el.value = v;
      }

      function formatIban(el) {
        let v = el.value.replace(/\s/g, '').toUpperCase().slice(0, 27);
        el.value = v.match(/.{1,4}/g)?.join(' ') || v;
      }

      
      const products = [
        { id: 1, name: 'Jersey Ufficiale 2026', tag: 'Abbigliamento', cat: 'abbigliamento', price: 49.99, icon: '👕', badge: 'Nuovo', hasSizes: true, description: 'Maglia tecnica ufficiale del torneo' },
        { id: 2, name: 'Hoodie Team Lazio DG', tag: 'Abbigliamento', cat: 'abbigliamento', price: 64.99, icon: '🧥', badge: null, hasSizes: true, description: 'Felpa con cappuccio premium' },
        { id: 3, name: 'T-Shirt Logo', tag: 'Abbigliamento', cat: 'abbigliamento', price: 24.99, icon: '👕', badge: null, hasSizes: true, description: 'T-shirt cotone 100%' },
        { id: 4, name: 'Snapback Cap', tag: 'Accessori', cat: 'accessori', price: 29.99, icon: '🧢', badge: 'Limited', hasSizes: false, description: 'Cappellino regolabile ufficiale' },
        { id: 5, name: 'Gaming Mousepad XL', tag: 'Gadget', cat: 'gadget', price: 19.99, icon: '🖱️', badge: null, hasSizes: false, description: 'Tappetino 90×40cm antiscivolo' },
        { id: 6, name: 'Zaino Team', tag: 'Accessori', cat: 'accessori', price: 54.99, icon: '🎒', badge: 'Nuovo', hasSizes: false, description: 'Zaino 30L resistente all\'acqua' },
        { id: 7, name: 'Tazza Termica', tag: 'Gadget', cat: 'gadget', price: 18.99, icon: '☕', badge: null, hasSizes: false, description: 'Mantiene caldo/freddo 12h' },
        { id: 8, name: 'Sticker Pack (×10)', tag: 'Gadget', cat: 'gadget', price: 7.99, icon: '🎨', badge: null, hasSizes: false, description: '10 sticker waterproof ufficiali' },
        { id: 9, name: 'Shorts Gaming', tag: 'Abbigliamento', cat: 'abbigliamento', price: 34.99, icon: '🩳', badge: null, hasSizes: true, description: 'Shorts sportivi ultraleggeri' },
        { id: 10, name: 'Portachiavi Gaming', tag: 'Accessori', cat: 'accessori', price: 9.99, icon: '🔑', badge: null, hasSizes: false, description: 'Portachiavi metallo smaltato' },
        { id: 11, name: 'Headband Team', tag: 'Accessori', cat: 'accessori', price: 14.99, icon: '🎽', badge: 'Limited', hasSizes: false, description: 'Fascia da competizione' },
        { id: 12, name: 'Bundle Starter', tag: 'Gadget', cat: 'gadget', price: 89.99, icon: '📦', badge: '−20%', hasSizes: false, description: 'Jersey + Cap + Sticker Pack' },
      ];

      
      const bgColors = {
        abbigliamento: ['#e8f0ff','#fff0f0','#e8fff0'],
        accessori: ['#fff8e8','#f0e8ff','#e8f8ff'],
        gadget: ['#f0ffe8','#ffe8f8','#e8f0ff'],
      };

      let cart = [];
      let activeFilter = 'all';

      
      function renderProducts() {
        const grid = document.getElementById('productGrid');
        const filtered = activeFilter === 'all' ? products : products.filter(p => p.cat === activeFilter);
        grid.innerHTML = '';
        filtered.forEach((p, i) => {
          const colors = bgColors[p.cat];
          const bg = colors[i % colors.length];
          grid.innerHTML += `
            <div class="product-card" data-id="${p.id}">
              <div class="product-img" style="background:${bg}">
                <span style="filter:drop-shadow(0 4px 12px rgba(0,0,0,0.12))">${p.icon}</span>
                ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
              </div>
              <div class="product-info">
                <div class="product-tag">${p.tag}</div>
                <div class="product-name">${p.name}</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-bottom:10px">${p.description}</div>
                ${p.hasSizes ? `
                <select class="size-select" id="size-${p.id}">
                  <option value="">Taglia</option>
                  <option>XS</option><option>S</option><option>M</option>
                  <option>L</option><option>XL</option><option>XXL</option>
                </select>` : ''}
                <div class="product-price-row">
                  <span class="product-price">€${p.price.toFixed(2)}</span>
                  <button class="add-to-cart-btn" onclick="addToCart(${p.id})">+ Aggiungi</button>
                </div>
              </div>
            </div>`;
        });
      }

      
      document.getElementById('filterBar').addEventListener('click', e => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.cat;
        renderProducts();
      });

     
      function addToCart(id) {
        const p = products.find(x => x.id === id);
        let size = null;
        if (p.hasSizes) {
          const sel = document.getElementById(`size-${id}`);
          size = sel ? sel.value : null;
          if (!size) { alert('Seleziona una taglia prima di aggiungere al carrello!'); return; }
        }
        const key = `${id}-${size || 'one'}`;
        const existing = cart.find(c => c.key === key);
        if (existing) {
          existing.qty++;
        } else {
          cart.push({ key, id, name: p.name, price: p.price, icon: p.icon, size, qty: 1 });
        }
        renderCart();
        
        const badge = document.getElementById('cartBadge');
        badge.classList.remove('cart-flash');
        void badge.offsetWidth;
        badge.classList.add('cart-flash');
      }

      
      function renderCart() {
        const container = document.getElementById('cartItems');
        const empty = document.getElementById('cartEmpty');
        const badge = document.getElementById('cartBadge');
        const total = document.getElementById('cartTotal');
        const btn = document.getElementById('checkoutBtn');

        const totalQty = cart.reduce((s, c) => s + c.qty, 0);
        const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);

        badge.textContent = totalQty;
        total.textContent = '€' + totalPrice.toFixed(2);
        btn.disabled = cart.length === 0;

        if (cart.length === 0) {
          container.innerHTML = '<div class="cart-empty" id="cartEmpty">Nessun articolo nel carrello</div>';
          return;
        }

        container.innerHTML = cart.map(item => `
          <div class="cart-item">
            <span class="cart-item-icon">${item.icon}</span>
            <div class="cart-item-info">
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-sub">${item.size ? 'Taglia: ' + item.size : ''}  €${item.price.toFixed(2)} cad.</div>
            </div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty('${item.key}',-1)">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty('${item.key}',1)">+</button>
            </div>
            <span class="cart-item-price">€${(item.price * item.qty).toFixed(2)}</span>
            <button class="remove-btn" onclick="removeFromCart('${item.key}')">✕</button>
          </div>`).join('');
      }

      function changeQty(key, delta) {
        const item = cart.find(c => c.key === key);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) cart = cart.filter(c => c.key !== key);
        renderCart();
      }

      function removeFromCart(key) {
        cart = cart.filter(c => c.key !== key);
        renderCart();
      }

      
      function openCheckout() {
        if (cart.length === 0) return;
        
        const totalPrice = cart.reduce((s, c) => s + c.price * c.qty, 0);
        const summaryHtml = cart.map(item =>
          `<div class="order-summary-item">
            <span>${item.icon} ${item.name}${item.size ? ' ('+item.size+')' : ''} × ${item.qty}</span>
            <span>€${(item.price * item.qty).toFixed(2)}</span>
          </div>`).join('') +
          `<div class="order-summary-total"><span>TOTALE</span><span>€${totalPrice.toFixed(2)}</span></div>`;
        document.getElementById('orderSummary').innerHTML = summaryHtml;
        
        document.getElementById('checkoutForm').style.display = 'block';
        document.getElementById('successScreen').classList.remove('visible');
        document.getElementById('checkoutModal').classList.add('open');
        document.body.style.overflow = 'hidden';
        
        switchPayment('card');
      }

      function closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('open');
        document.body.style.overflow = '';
        
        if (document.getElementById('successScreen').classList.contains('visible')) {
          cart = [];
          renderCart();
        }
      }

      function submitOrder() {
        const fields = ['firstName','lastName','email','address','city','zip'];
        let valid = true;
        fields.forEach(f => {
          const el = document.getElementById(f);
          if (!el.value.trim()) {
            el.style.borderColor = 'var(--brand-red)';
            valid = false;
          } else {
            el.style.borderColor = '';
          }
        });
        
        const emailEl = document.getElementById('email');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
          emailEl.style.borderColor = 'var(--brand-red)';
          valid = false;
        }

        
        if (activePayment === 'card') {
          const cardName   = document.getElementById('cardName');
          const cardNumber = document.getElementById('cardNumber');
          const cardExpiry = document.getElementById('cardExpiry');
          const cardCvv    = document.getElementById('cardCvv');
          if (!cardName.value.trim())                              { cardName.style.borderColor   = 'var(--brand-red)'; valid = false; } else cardName.style.borderColor   = '';
          if (cardNumber.value.replace(/\s/g,'').length !== 16)   { cardNumber.style.borderColor = 'var(--brand-red)'; valid = false; } else cardNumber.style.borderColor = '';
          if (!/^\d{2}\/\d{2}$/.test(cardExpiry.value))          { cardExpiry.style.borderColor = 'var(--brand-red)'; valid = false; } else cardExpiry.style.borderColor = '';
          if (cardCvv.value.length < 3)                           { cardCvv.style.borderColor    = 'var(--brand-red)'; valid = false; } else cardCvv.style.borderColor    = '';
        } else {
          const senderIban = document.getElementById('senderIban');
          const raw = senderIban.value.replace(/\s/g,'');
          if (raw.length < 15 || !/^[A-Z]{2}/.test(raw)) { senderIban.style.borderColor = 'var(--brand-red)'; valid = false; } else senderIban.style.borderColor = '';
        }

        if (!valid) { return; }

        
        document.getElementById('checkoutForm').style.display = 'none';
        document.getElementById('successScreen').classList.add('visible');
      }

      
      document.getElementById('checkoutModal').addEventListener('click', function(e) {
        if (e.target === this) closeCheckout();
      });

      
      renderProducts();
      renderCart();