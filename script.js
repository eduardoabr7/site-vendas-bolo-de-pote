const WHATSAPP_NUMBER = '5551997481828';

const cardapio = [
  { id: 'm1', emoji: '🍗', name: 'Frango Grelhado', desc: 'Arroz branco, feijão, purê de batata, frango grelhado temperado', price: 21.90, flavor: 'Clássico' },
  { id: 'm2', emoji: '🥩', name: 'Carne de Panela', desc: 'Arroz branco, feijão, batata cozida, cenoura refogada, carne de panela com molho vermelho', price: 25.90, flavor: 'Tradicional' },
  { id: 'm3', emoji: '🍝', name: 'Macarrão com Almôndega', desc: 'Macarrão ao molho vermelho, almôndega caseira, OPCIONAL: Queijo ralado', price: 23.90, flavor: 'Especial' },
  { id: 'm4', emoji: '🥦', name: 'Vegetariana', desc: 'Arroz branco, feijão, legumes refogados', price: 19.90, flavor: 'Vegano' }
];

const combos = [
  {
    id: 'c1', emoji: '📦', name: 'Combo 5 Marmitas', subtitle: 'Perfeito para a semana toda',
    items: ['5 marmitas à sua escolha', 'Variações de sabor liberadas', 'Entrega única no mesmo endereço', 'Cardápio disponível via WhatsApp'],
    discountPerUnit: 4.00,
    marmitaQty: 5, boloQty: 0,
    featured: false,
  },
  {
    id: 'c2', emoji: '💼', name: 'Combo CLT', subtitle: '22 marmitas — um mês cheio!',
    items: ['22 marmitas (dias úteis)', 'Entrega diária ou semanal', 'Cardápio rotativo incluso', 'Desconto especial no total'],
    discountPerUnit: 6.00,
    marmitaQty: 22, boloQty: 0,
    featured: true, badge: 'Mais vendido',
  },
  {
    id: 'c3', emoji: '🎂', name: 'Combo Marmita + Bolo', subtitle: 'Almoço completo com sobremesa',
    items: ['1 marmita à escolha', '1 bolo de pote à escolha', 'Sabores disponíveis do dia', 'Entrega conjunta'],
    discountPerUnit: 2.00,
    marmitaQty: 1, boloQty: 1,
    featured: false,
  },
];

const bolos = [
  { id: 'b1', emoji: '🍫', name: 'Creme de avelã com Ninho', desc: 'Massa fofinha com o sabor irresistível do avelã, trazendo muito chocolate e cremosidade em cada colherada', price: 10, img: './assets/creme_avela_ninho.jpeg' },
  { id: 'b2', emoji: '🍫', name: 'Brigadeiro', desc: 'Clássico sabor de brigadeiro com massa macia e cobertura cremosa de chocolate', price: 8, img: './assets/brigadeiro.jpeg' },
  { id: 'b3', emoji: '🤍', name: 'Beijinho com coco', desc: 'Delicado e cremoso, feito com brigadeiro branco e um sabor suave que conquista qualquer um', price: 8, img: './assets/beijinho_coco.jpeg' },
  { id: 'b4', emoji: '🍓', name: 'Morango com Leite Ninho', desc: 'Combinação perfeita do doce do leite ninho com a leveza e o frescor do morango', price: 10, img: './assets/morango_ninho.jpeg' },
];

let cart = [];
let cartOpen = false;

let activeCombo = null;
let modalMarmitaQtys = {};
let modalBoloQtys = {};

function getMinPrice(items) {
  return Math.min(...items.map(i => i.price));
}

function comboFromPrice(combo) {
  const minM = getMinPrice(cardapio);
  const minB = combo.boloQty > 0 ? getMinPrice(bolos) : 0;
  const base = minM * combo.marmitaQty + minB * combo.boloQty;
  const disc = combo.discountPerUnit * (combo.marmitaQty + combo.boloQty);
  return Math.max(0, base - disc);
}

function cardBg(flavor) {
  const map = {
    'Clássico': 'linear-gradient(135deg, #F5E8D0, #F0D9B0)',
    'Tradicional': 'linear-gradient(135deg, #FFE4C4, #FFCBA4)',
    'Especial': 'linear-gradient(135deg, #FFE4C4, #F5C89A)',
    'Vegano': 'linear-gradient(135deg, #E8F5E9, #A8BB88)',
  };
  return map[flavor] || 'linear-gradient(135deg, #F5E8D0, #FAF6EE)';
}

function fmt(v) { return 'R$ ' + v.toFixed(2).replace('.', ','); }

function renderMenu() {
  const grid = document.getElementById('menuGrid');
  grid.innerHTML = cardapio.map(item => `
    <div class="menu-card reveal" onclick="addToCart('menu','${item.id}')">
      <div class="card-img" style="background: ${cardBg(item.flavor)}">${item.emoji}</div>
      <div class="card-body">
        <span class="flavor-tag">${item.flavor}</span>
        <div class="card-name">${item.name}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-footer">
          <div class="card-price">${fmt(item.price)}</div>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart('menu','${item.id}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

function renderCombos() {
  const grid = document.getElementById('combosGrid');
  grid.innerHTML = combos.map(c => {
    const fromPrice = comboFromPrice(c);
    const totalItems = c.marmitaQty + c.boloQty;
    const unitLabel = totalItems > 0
      ? fmt((fromPrice) / totalItems) + '/unid. (a partir de)'
      : '';
    return `
    <div class="combo-card reveal ${c.featured ? 'featured' : ''}">
      ${c.badge ? `<div class="combo-badge">${c.badge}</div>` : ''}
      <div class="combo-top">
        <div class="combo-emoji">${c.emoji}</div>
        <div>
          <div class="combo-name">${c.name}</div>
          <div class="combo-subtitle">${c.subtitle}</div>
        </div>
      </div>
      <div class="combo-body">
        <ul class="combo-items">${c.items.map(i => `<li>${i}</li>`).join('')}</ul>
        <div class="combo-footer">
          <div>
            <div class="combo-price">
              <span class="from-label">a partir de</span>
              ${fmt(fromPrice)}
              <small>${unitLabel}</small>
            </div>
          </div>
          <button class="add-combo-btn" onclick="openComboModal('${c.id}')">🍱 Montar combo</button>
        </div>
      </div>
    </div>
  `}).join('');
  observeReveal();
}

function renderBolos() {
  const grid = document.getElementById('bolosGrid');
  grid.innerHTML = bolos.map(b => `
    <div class="bolo-card reveal">
      <div class="bolo-img-wrap">
        <img class="bolo-img-photo" src="${b.img}" alt="${b.name}" loading="lazy" />
      </div>
      <div class="bolo-body">
        <div class="bolo-name">${b.name}</div>
        <div class="bolo-desc">${b.desc}</div>
        <div class="bolo-footer">
          <div class="card-price">${fmt(b.price)}</div>
          <button class="add-btn" onclick="addToCart('bolo','${b.id}')">+</button>
        </div>
      </div>
    </div>
  `).join('');
  observeReveal();
}

function openComboModal(comboId) {
  activeCombo = combos.find(c => c.id === comboId);
  if (!activeCombo) return;

  modalMarmitaQtys = {};
  modalBoloQtys = {};
  cardapio.forEach(m => modalMarmitaQtys[m.id] = 0);
  bolos.forEach(b => modalBoloQtys[b.id] = 0);

  document.getElementById('modalTitle').textContent = activeCombo.name;
  document.getElementById('modalSubtitle').textContent = activeCombo.subtitle;

  renderModalBody();
  updateModalState();

  document.getElementById('comboModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeComboModal() {
  document.getElementById('comboModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  activeCombo = null;
}

function handleModalOverlayClick(e) {
  if (e.target === document.getElementById('comboModalOverlay')) closeComboModal();
}

function renderModalBody() {
  const body = document.getElementById('modalBody');
  let html = '';

  const mQty = activeCombo.marmitaQty;
  const bQty = activeCombo.boloQty;

  if (mQty > 0) {
    html += `<div class="modal-section-title">🍱 Escolha ${mQty === 1 ? 'a marmita' : 'as ' + mQty + ' marmitas'}</div>`;
    cardapio.forEach(item => {
      const qty = modalMarmitaQtys[item.id] || 0;
      html += `
        <div class="flavor-row ${qty > 0 ? 'has-qty' : ''}" id="mrow-${item.id}">
          <div class="flavor-emoji">${item.emoji}</div>
          <div class="flavor-info">
            <div class="flavor-name">${item.name}</div>
            <div class="flavor-price">${fmt(item.price)}</div>
          </div>
          <div class="flavor-qty-ctrl">
            <button class="qty-ctrl-btn" onclick="changeModalQty('marmita','${item.id}',-1)" id="mminus-${item.id}">−</button>
            <div class="qty-ctrl-num" id="mnum-${item.id}">${qty}</div>
            <button class="qty-ctrl-btn" onclick="changeModalQty('marmita','${item.id}',1)" id="mplus-${item.id}">+</button>
          </div>
        </div>`;
    });
  }

  if (bQty > 0) {
    html += `<div class="modal-section-title" style="margin-top: ${mQty > 0 ? '24px' : '0'}">🎂 Escolha ${bQty === 1 ? 'o bolo de pote' : 'os ' + bQty + ' bolos de pote'}</div>`;
    bolos.forEach(item => {
      const qty = modalBoloQtys[item.id] || 0;
      html += `
        <div class="flavor-row ${qty > 0 ? 'has-qty' : ''}" id="brow-${item.id}">
          <div class="flavor-emoji">${item.emoji}</div>
          <div class="flavor-info">
            <div class="flavor-name">${item.name}</div>
            <div class="flavor-price">${fmt(item.price)}</div>
          </div>
          <div class="flavor-qty-ctrl">
            <button class="qty-ctrl-btn" onclick="changeModalQty('bolo','${item.id}',-1)" id="bminus-${item.id}">−</button>
            <div class="qty-ctrl-num" id="bnum-${item.id}">${qty}</div>
            <button class="qty-ctrl-btn" onclick="changeModalQty('bolo','${item.id}',1)" id="bplus-${item.id}">+</button>
          </div>
        </div>`;
    });
  }

  body.innerHTML = html;
}

function changeModalQty(type, id, delta) {
  const qtys = type === 'marmita' ? modalMarmitaQtys : modalBoloQtys;
  const maxQty = type === 'marmita' ? activeCombo.marmitaQty : activeCombo.boloQty;
  const currentTotal = Object.values(qtys).reduce((a, b) => a + b, 0);

  const cur = qtys[id] || 0;
  const newVal = cur + delta;

  if (newVal < 0) return;
  if (delta > 0 && currentTotal >= maxQty) return;

  qtys[id] = newVal;

  const prefix = type === 'marmita' ? 'm' : 'b';
  const numEl = document.getElementById(`${prefix}num-${id}`);
  const rowEl = document.getElementById(`${prefix}row-${id}`);
  if (numEl) numEl.textContent = newVal;
  if (rowEl) rowEl.classList.toggle('has-qty', newVal > 0);

  updateModalState();
}

function getModalTotals() {
  let mTotal = 0, bTotal = 0;
  cardapio.forEach(m => { mTotal += (modalMarmitaQtys[m.id] || 0) * m.price; });
  bolos.forEach(b => { bTotal += (modalBoloQtys[b.id] || 0) * b.price; });
  return { mTotal, bTotal, raw: mTotal + bTotal };
}

function updateModalState() {
  const mTotal = Object.values(modalMarmitaQtys).reduce((a, b) => a + b, 0);
  const bTotal = Object.values(modalBoloQtys).reduce((a, b) => a + b, 0);

  const needM = activeCombo.marmitaQty;
  const needB = activeCombo.boloQty;
  const totalNeeded = needM + needB;
  const totalSelected = mTotal + bTotal;

  const pct = Math.min(100, (totalSelected / totalNeeded) * 100);
  document.getElementById('progressFill').style.width = pct + '%';

  const plabel = document.getElementById('progressLabel');
  plabel.textContent = `${totalSelected} / ${totalNeeded}`;
  plabel.className = 'progress-label' + (totalSelected === totalNeeded ? ' ok' : totalSelected > totalNeeded ? ' over' : '');

  const { raw } = getModalTotals();
  const totalDiscount = activeCombo.discountPerUnit * totalNeeded;
  const finalPrice = Math.max(0, raw - totalDiscount);

  document.getElementById('modalTotal').textContent = fmt(finalPrice);

  const discEl = document.getElementById('modalDiscount');
  if (totalSelected > 0 && totalDiscount > 0) {
    discEl.textContent = `Você economiza ${fmt(totalDiscount)} 🎉`;
  } else {
    discEl.textContent = '';
  }

  const mOk = mTotal === needM;
  const bOk = bTotal === needB;
  const valid = mOk && bOk;

  const errEl = document.getElementById('modalError');
  const errText = document.getElementById('modalErrorText');
  const btn = document.getElementById('modalConfirmBtn');

  if (!valid && totalSelected > 0) {
    let msgs = [];
    if (!mOk) msgs.push(`Selecione exatamente ${needM} marmita${needM > 1 ? 's' : ''} (${mTotal} selecionada${mTotal !== 1 ? 's' : ''})`);
    if (!bOk) msgs.push(`Selecione exatamente ${needB} bolo${needB > 1 ? 's' : ''} de pote (${bTotal} selecionado${bTotal !== 1 ? 's' : ''})`);
    errText.textContent = msgs.join(' • ');
    errEl.classList.add('show');
  } else {
    errEl.classList.remove('show');
  }

  btn.disabled = !valid;

  cardapio.forEach(m => {
    const plusBtn = document.getElementById(`mplus-${m.id}`);
    if (plusBtn) plusBtn.disabled = (mTotal >= needM);
    const minusBtn = document.getElementById(`mminus-${m.id}`);
    if (minusBtn) minusBtn.disabled = (modalMarmitaQtys[m.id] || 0) === 0;
  });
  bolos.forEach(b => {
    const plusBtn = document.getElementById(`bplus-${b.id}`);
    if (plusBtn) plusBtn.disabled = (bTotal >= needB);
    const minusBtn = document.getElementById(`bminus-${b.id}`);
    if (minusBtn) minusBtn.disabled = (modalBoloQtys[b.id] || 0) === 0;
  });
}

function confirmCombo() {
  if (!activeCombo) return;

  const { raw } = getModalTotals();
  const totalDiscount = activeCombo.discountPerUnit * (activeCombo.marmitaQty + activeCombo.boloQty);
  const finalPrice = Math.max(0, raw - totalDiscount);

  let details = [];
  cardapio.forEach(m => {
    const q = modalMarmitaQtys[m.id] || 0;
    if (q > 0) details.push(`${q}x ${m.emoji} ${m.name}`);
  });
  bolos.forEach(b => {
    const q = modalBoloQtys[b.id] || 0;
    if (q > 0) details.push(`${q}x ${b.emoji} ${b.name}`);
  });

  const cartId = activeCombo.id + '_' + Date.now();
  cart.push({
    id: cartId,
    name: activeCombo.name,
    emoji: activeCombo.emoji,
    price: finalPrice,
    qty: 1,
    isCombo: true,
    comboDetails: details.join(', '),
  });

  updateCartUI();
  showToast(`${activeCombo.emoji} ${activeCombo.name} adicionado!`);
  closeComboModal();
}

function addToCart(type, id) {
  let item;
  if (type === 'menu') item = cardapio.find(i => i.id === id);
  else if (type === 'combo') item = combos.find(i => i.id === id);
  else item = bolos.find(i => i.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name: item.name, price: item.price, emoji: item.emoji, qty: 1 });
  updateCartUI();
  showToast(`${item.emoji} ${item.name} adicionado!`);
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  badge.textContent = totalQty;
  badge.classList.toggle('visible', totalQty > 0);
  const itemsEl = document.getElementById('cartItems');
  const footerEl = document.getElementById('cartFooter');
  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🍽️</div><p>Seu carrinho está vazio</p><p style="font-size:0.85rem">Adicione itens do cardápio!</p></div>`;
    footerEl.style.display = 'none';
    return;
  }
  footerEl.style.display = 'block';
  document.getElementById('cartTotal').textContent = fmt(total);
  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${fmt(item.price * item.qty)} (${item.qty}x ${fmt(item.price)})</div>
        ${item.comboDetails ? `<div class="cart-item-detail">${item.comboDetails}</div>` : ''}
      </div>
      <div class="cart-item-controls">
        ${item.isCombo ? '' : `<button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button><span class="qty-num">${item.qty}</span><button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>`}
        <button class="remove-btn" onclick="removeItem('${item.id}')" title="Remover">✕</button>
      </div>
    </div>
  `).join('');
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeItem(id);
  else updateCartUI();
}

function removeItem(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cartSidebar').classList.toggle('open', cartOpen);
  document.getElementById('cartOverlay').classList.toggle('open', cartOpen);
  document.body.style.overflow = cartOpen ? 'hidden' : '';
}

function sendWhatsApp() {
  if (cart.length === 0) { showToast('⚠️ Adicione itens ao carrinho primeiro!'); return; }
  const obs = document.getElementById('cartObs').value;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  let msg = '🍱 *NOVO PEDIDO — Sabor de Casa*\n\n*Itens do pedido:*\n';
  cart.forEach(item => {
    msg += `• ${item.qty}x ${item.emoji} ${item.name} — ${fmt(item.price * item.qty)}\n`;
    if (item.comboDetails) msg += `  _↳ ${item.comboDetails}_\n`;
  });
  msg += `\n*Total: ${fmt(total)}*`;
  if (obs) msg += `\n\n📝 *Observações:* ${obs}`;
  msg += '\n\nAguardo confirmação! 😊';
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
}

function openWhatsApp() {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de mais informações sobre as marmitas e bolos de pote 😊')}`, '_blank');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 2500);
}

function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  els.forEach(el => observer.observe(el));
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 60);
});

function closeMenu() { document.getElementById('navLinks').classList.remove('open'); }
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('open');
});

setTimeout(() => {
  const bubble = document.getElementById('waBubble');
  if (bubble) { bubble.style.transition = 'opacity 0.5s'; bubble.style.opacity = '0'; setTimeout(() => bubble.remove(), 500); }
}, 5000);

renderMenu();
renderCombos();
renderBolos();
observeReveal();