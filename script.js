/* =========================================================
   CRONOS GRIFE — interações, animações e carrinho
   ========================================================= */
(() => {
'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const G = window.gsap;
const HAS_GSAP = !!G && !REDUCED;
if (HAS_GSAP && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);

const CAT_NAME = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

/* ---------------------------------------------------------
   Storage seguro
--------------------------------------------------------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

/* ---------------------------------------------------------
   Preço
--------------------------------------------------------- */
function priceHTML(p) {
  if (p.price == null) return '<span class="price__ask">Sob consulta</span>';
  const off = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
  return `${p.old ? `<s>${brl(p.old)}</s>` : ''}<strong>${brl(p.price)}</strong>${off >= 5 ? `<span class="price__off">-${off}%</span>` : ''}`;
}
function mediaHTML(p, opts = {}) {
  if (p.video && opts.video) {
    return `<video src="${p.video}#t=0.5" ${p.img ? `poster="${p.img}"` : ''} muted loop playsinline preload="metadata"></video>`;
  }
  return `<img src="${p.img}" alt="${p.name}" loading="lazy">`;
}

/* =========================================================
   CATEGORIAS
========================================================= */
const catsEl = $('#cats');
catsEl.innerHTML = CATEGORIES.map((c) => {
  const n = PRODUCTS.filter((p) => p.cat === c.id).length;
  return `<button class="cat" data-cat="${c.id}" data-hover data-label="Ver">
    <img src="${c.img}" alt="" loading="lazy">
    <small>${String(n).padStart(2, '0')} itens</small>
    <span>${c.label}</span></button>`;
}).join('');

/* =========================================================
   KITS (ofertas do Instagram)
========================================================= */
const kitsEl = $('#kitsGrid');
kitsEl.innerHTML = PRODUCTS.filter((p) => p.cat === 'kits').map((p) => `
  <article class="kit" data-hover data-label="Play">
    ${p.video ? `<video src="${p.video}" ${p.img ? `poster="${p.img}"` : ''} muted loop playsinline preload="metadata"></video>` : `<img src="${p.img}" alt="">`}
    ${p.badge ? `<span class="tag ${p.badge === 'Mais vendido' ? 'tag--hot' : ''}">${p.badge}</span>` : ''}
    <div class="kit__body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="price">${priceHTML(p)}</div>
      ${p.price == null
        ? `<a class="btn btn--ghost btn--block" href="${waLink(`Olá! Quero saber sobre o ${p.name}.`)}" target="_blank" rel="noopener">Consultar no WhatsApp</a>`
        : `<button class="btn btn--gold btn--block" data-open="${p.id}"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-bag"/></svg>Escolher tamanho</button>`}
    </div>
  </article>`).join('');

// vídeos dos kits tocam quando aparecem na tela
const vidIO = 'IntersectionObserver' in window ? new IntersectionObserver((es) => {
  es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()));
}, { threshold: 0.35 }) : null;
$$('.kit video').forEach((v) => vidIO && vidIO.observe(v));

/* =========================================================
   LOJA: filtros, ordenação e grade
========================================================= */
const grid = $('#shopGrid');
const chipsEl = $('#chips');
const sortSel = $('#sortSel');
let shopFilter = 'all';

chipsEl.innerHTML = [{ id: 'all', label: 'Todos' }, ...CATEGORIES].map((c) => {
  const n = c.id === 'all' ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length;
  return `<button class="chip${c.id === 'all' ? ' is-on' : ''}" role="tab" aria-selected="${c.id === 'all'}" data-shop="${c.id}">${c.label}<sup>${n}</sup></button>`;
}).join('');

function cardHTML(p) {
  const oneSize = p.sizes.length === 1;
  return `<article class="card" data-id="${p.id}">
    <div class="card__media" data-open="${p.id}" data-hover data-label="Ver">
      ${mediaHTML(p, { video: !p.img })}
      ${p.badge ? `<span class="tag ${p.badge === 'Mais vendido' ? 'tag--hot' : ''}">${p.badge}</span>` : ''}
      ${p.ig ? '<span class="ig-dot" title="Preço publicado no Instagram">IG</span>' : ''}
      <span class="card__shine"></span>
      <button class="card__quick" data-open="${p.id}" tabindex="-1">Espiar produto</button>
    </div>
    <div class="card__body">
      <span class="card__cat">${CAT_NAME[p.cat]}</span>
      <h3>${p.name}</h3>
      ${p.sub ? `<span class="card__sub">${p.sub}</span>` : ''}
      <div class="card__foot">
        <div class="price">${priceHTML(p)}</div>
        ${p.price == null ? '' : `<button class="add-btn" ${oneSize ? `data-add="${p.id}"` : `data-open="${p.id}"`} aria-label="Adicionar ${p.name} ao carrinho" data-hover>
          <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-plus"/></svg></button>`}
      </div>
    </div>
  </article>`;
}

function renderShop(animate = true) {
  let list = PRODUCTS.filter((p) => shopFilter === 'all' || p.cat === shopFilter);
  const s = sortSel.value;
  if (s !== 'default') list = [...list].sort((a, b) => ((a.price ?? 1e9) - (b.price ?? 1e9)) * (s === 'asc' ? 1 : -1));
  grid.innerHTML = list.map(cardHTML).join('');
  bindTilt();
  bindHover(grid);
  if (HAS_GSAP && animate) {
    G.fromTo(grid.children, { y: 50, opacity: 0, rotateX: -12 }, { y: 0, opacity: 1, rotateX: 0, duration: .8, ease: 'expo.out', stagger: .05, clearProps: 'transform' });
  }
}

function setShopFilter(id) {
  shopFilter = id;
  $$('.chip', chipsEl).forEach((c) => { const on = c.dataset.shop === id; c.classList.toggle('is-on', on); c.setAttribute('aria-selected', on); });
  renderShop();
}
chipsEl.addEventListener('click', (e) => { const c = e.target.closest('[data-shop]'); if (c) setShopFilter(c.dataset.shop); });
sortSel.addEventListener('change', () => renderShop());
catsEl.addEventListener('click', (e) => {
  const c = e.target.closest('[data-cat]'); if (!c) return;
  setShopFilter(c.dataset.cat);
  $('#loja').scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
});
$$('a[data-cat]').forEach((a) => a.addEventListener('click', () => setShopFilter(a.dataset.cat)));

/* Tilt 3D + brilho que segue o mouse */
function bindTilt() {
  if (!FINE || REDUCED) return;
  $$('.card', grid).forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateY(${(x - .5) * 10}deg) rotateX(${(.5 - y) * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1),border-color .3s';
      card.style.transform = '';
      setTimeout(() => { card.style.transition = ''; }, 600);
    });
  });
}

/* =========================================================
   PERFUMES em destaque (spotlight)
========================================================= */
const bottlesEl = $('#bottles');
bottlesEl.innerHTML = PRODUCTS.filter((p) => p.cat === 'perfumes').slice(0, 3).map((p) => `
  <button class="bottle" data-open="${p.id}" data-hover data-label="Ver">
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <div class="bottle__info">
      <h3>${p.name}</h3><p>${p.sub}</p>
      <ul class="bottle__notes">${(p.notes || []).map((n) => `<li>${n}</li>`).join('')}</ul>
      <span class="bottle__price">${brl(p.price)}</span>
    </div>
  </button>`).join('');
const perfSec = $('#perfumes');
perfSec.addEventListener('mousemove', (e) => {
  const r = perfSec.getBoundingClientRect();
  perfSec.style.setProperty('--sx', `${e.clientX - r.left}px`);
  perfSec.style.setProperty('--sy', `${e.clientY - r.top}px`);
});

/* =========================================================
   CARRINHO
========================================================= */
const CART_KEY = 'cronos_cart_v1';
let cart = store.get(CART_KEY, []).filter((i) => byId[i.id]);
const cartEl = $('#cart'), overlay = $('#overlay');
const cartList = $('#cartList'), cartEmpty = $('#cartEmpty'), cartFoot = $('#cartFoot');
const cartCount = $('#cartCount'), cartTotal = $('#cartTotal'), checkoutBtn = $('#checkoutBtn');
$('#shipText').innerHTML = '<strong>Entregamos</strong> em Cuiabá, Várzea Grande e todo MT. Frete combinado no WhatsApp.';
$('.ship-bar').remove();

function cartTotals() {
  return cart.reduce((a, i) => ({ qty: a.qty + i.qty, sum: a.sum + byId[i.id].price * i.qty }), { qty: 0, sum: 0 });
}
function saveCart() { store.set(CART_KEY, cart); renderCart(); }

function renderCart() {
  const { qty, sum } = cartTotals();
  cartCount.textContent = qty;
  cartCount.dataset.n = qty;
  cartTotal.textContent = brl(sum);
  cartEmpty.hidden = cart.length > 0;
  cartFoot.hidden = cart.length === 0;
  cartList.hidden = cart.length === 0;
  cartList.innerHTML = cart.map((i, idx) => {
    const p = byId[i.id];
    return `<li class="cart-item">
      <img src="${p.img}" alt="">
      <div>
        <h3>${p.name}</h3>
        <p>${p.sizes.length > 1 ? `Tamanho ${i.size}` : i.size} · ${brl(p.price)}</p>
        <div class="qty" aria-label="Quantidade de ${p.name}">
          <button data-q="-1" data-i="${idx}" aria-label="Diminuir">−</button>
          <output>${i.qty}</output>
          <button data-q="1" data-i="${idx}" aria-label="Aumentar">+</button>
        </div>
      </div>
      <div>
        <div class="cart-item__price">${brl(p.price * i.qty)}</div>
        <button class="cart-item__rm" data-rm="${idx}" aria-label="Remover ${p.name}"><svg class="ic" viewBox="0 0 24 24"><use href="#i-trash"/></svg></button>
      </div>
    </li>`;
  }).join('');
  const lines = cart.map((i) => { const p = byId[i.id]; return `• ${i.qty}x ${p.name}${p.sizes.length > 1 ? ` (tam. ${i.size})` : ''}: ${brl(p.price * i.qty)}`; });
  checkoutBtn.href = waLink(`Olá, Cronos Grife! Quero fazer este pedido pelo site:\n\n${lines.join('\n')}\n\nTotal: ${brl(sum)}\n\nPode confirmar o estoque e o frete?`);
}

cartList.addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
  if (q) {
    const i = +q.dataset.i; cart[i].qty += +q.dataset.q;
    if (cart[i].qty < 1) cart.splice(i, 1);
    saveCart();
  } else if (rm) {
    const li = rm.closest('.cart-item');
    const done = () => { cart.splice(+rm.dataset.rm, 1); saveCart(); };
    HAS_GSAP ? G.to(li, { x: 60, opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, duration: .35, ease: 'power2.in', onComplete: done }) : done();
  }
});
$('#clearCart').addEventListener('click', () => { cart = []; saveCart(); });

let lastFocus = null;
function openCart() {
  lastFocus = document.activeElement;
  overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('is-on'));
  cartEl.classList.add('is-open'); cartEl.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  if (HAS_GSAP) G.fromTo('.cart-item', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: .05, duration: .5, delay: .15, ease: 'expo.out' });
  $('#cartClose').focus();
}
function closeCart() {
  overlay.classList.remove('is-on'); setTimeout(() => { overlay.hidden = true; }, 350);
  cartEl.classList.remove('is-open'); cartEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  if (lastFocus) lastFocus.focus();
}
$('#cartBtn').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
$$('[data-close-cart]').forEach((a) => a.addEventListener('click', closeCart));

function addToCart(id, size, qty = 1, fromEl) {
  const p = byId[id];
  const found = cart.find((i) => i.id === id && i.size === size);
  found ? (found.qty += qty) : cart.push({ id, size, qty });
  saveCart();
  flyToCart(p, fromEl);
  toast(p, qty);
}

/* Imagem do produto "voa" até o carrinho + explosão dourada */
function flyToCart(p, fromEl) {
  const btn = $('#cartBtn');
  const bump = () => { btn.classList.remove('bump'); void btn.offsetWidth; btn.classList.add('bump'); };
  if (!HAS_GSAP || !fromEl) return bump();
  const src = fromEl.getBoundingClientRect();
  const dst = btn.getBoundingClientRect();
  const img = document.createElement('img');
  img.src = p.img; img.className = 'fly';
  const size = Math.min(src.width, 160);
  Object.assign(img.style, { width: `${size}px`, height: `${size * 1.2}px`, left: `${src.left + src.width / 2 - size / 2}px`, top: `${src.top + src.height / 2 - size * .6}px` });
  document.body.appendChild(img);
  const dx = dst.left + dst.width / 2 - (src.left + src.width / 2);
  const dy = dst.top + dst.height / 2 - (src.top + src.height / 2);
  G.timeline({ onComplete: () => { img.remove(); bump(); burst(dst.left + dst.width / 2, dst.top + dst.height / 2); } })
    .to(img, { scale: 1.1, rotate: -6, duration: .18, ease: 'power2.out' })
    .to(img, { x: dx, duration: .75, ease: 'power1.inOut' }, '>')
    .to(img, { y: dy, duration: .75, ease: 'back.in(1.6)' }, '<')
    .to(img, { scale: .12, opacity: .3, borderRadius: '50%', duration: .75, ease: 'power2.in' }, '<');
}
function burst(x, y) {
  for (let i = 0; i < 14; i++) {
    const d = document.createElement('span');
    d.className = 'burst'; d.style.left = `${x}px`; d.style.top = `${y}px`;
    document.body.appendChild(d);
    const a = (Math.PI * 2 * i) / 14, r = 30 + Math.random() * 30;
    G.to(d, { x: Math.cos(a) * r, y: Math.sin(a) * r, opacity: 0, scale: .3, duration: .7, ease: 'expo.out', onComplete: () => d.remove() });
  }
}
let toastT;
function toast(p, qty) {
  const t = $('#toast');
  t.innerHTML = `<img src="${p.img}" alt=""><span>${qty > 1 ? `${qty}x ` : ''}${p.name} no carrinho</span>`;
  t.classList.add('is-on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-on'), 2600);
}

/* =========================================================
   ESPIAR PRODUTO (quick view)
========================================================= */
const qv = $('#qv');
let qvProduct = null, qvSize = null, qvQty = 1, qvOpener = null;
function openQV(id, opener) {
  const p = byId[id]; if (!p) return;
  qvProduct = p; qvQty = 1; qvOpener = opener;
  qvSize = p.sizes.length === 1 ? p.sizes[0] : null;
  $('#qvMedia').innerHTML = p.video
    ? `<video src="${p.video}" ${p.img ? `poster="${p.img}"` : ''} autoplay muted loop playsinline></video>`
    : `<img src="${p.img}" alt="${p.name}">`;
  $('#qvCat').textContent = CAT_NAME[p.cat] + (p.ig ? ' · visto no Instagram' : '');
  $('#qvName').textContent = p.name;
  $('#qvSub').textContent = p.sub || '';
  $('#qvPrice').innerHTML = priceHTML(p);
  $('#qvDesc').textContent = p.desc;
  $('#qvNotes').innerHTML = (p.notes || []).map((n) => `<li>${n}</li>`).join('');
  $('#qvSizes').innerHTML = p.sizes.map((s) => `<button class="size${qvSize === s ? ' is-on' : ''}" data-size="${s}" aria-pressed="${qvSize === s}">${s}</button>`).join('');
  $('#qtyVal').textContent = 1;
  $('#qvErr').textContent = '';
  const addBtn = $('#qvAdd');
  addBtn.hidden = p.price == null;
  qv.hidden = false;
  document.body.classList.add('no-scroll');
  if (HAS_GSAP) {
    G.fromTo('.qv__box', { y: 40, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .55, ease: 'expo.out' });
    G.fromTo('.qv__body > *', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .5, stagger: .04, delay: .1, ease: 'expo.out' });
  }
  $('#qvClose').focus();
}
function closeQV() {
  qv.hidden = true; $('#qvMedia').innerHTML = '';
  document.body.classList.remove('no-scroll');
  if (qvOpener) qvOpener.focus();
}
$('#qvSizes').addEventListener('click', (e) => {
  const b = e.target.closest('[data-size]'); if (!b) return;
  qvSize = b.dataset.size; $('#qvErr').textContent = '';
  $$('.size', qv).forEach((s) => { const on = s === b; s.classList.toggle('is-on', on); s.setAttribute('aria-pressed', on); });
});
$('#qtyMinus').addEventListener('click', () => { qvQty = Math.max(1, qvQty - 1); $('#qtyVal').textContent = qvQty; });
$('#qtyPlus').addEventListener('click', () => { qvQty = Math.min(20, qvQty + 1); $('#qtyVal').textContent = qvQty; });
$('#qvAdd').addEventListener('click', () => {
  if (!qvSize) {
    $('#qvErr').textContent = 'Escolha um tamanho para continuar.';
    if (HAS_GSAP) G.fromTo('#qvSizes', { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
    return;
  }
  const from = $('#qvMedia');
  addToCart(qvProduct.id, qvSize, qvQty, from);
  setTimeout(closeQV, 120);
});
$('#qvClose').addEventListener('click', closeQV);
qv.addEventListener('click', (e) => { if (e.target === qv) closeQV(); });

/* Clique global em "abrir produto" / "adicionar" */
document.addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) { const p = byId[add.dataset.add]; addToCart(p.id, p.sizes[0], 1, add.closest('.card')?.querySelector('.card__media') || add); return; }
  const open = e.target.closest('[data-open]');
  if (open) openQV(open.dataset.open, open);
});

/* =========================================================
   REELS do Instagram
========================================================= */
const REELS = [
  { c: 'DgNcYyoRmPc', cat: 'humor', t: 'A cara dele é melhor kkk 🤣' },
  { c: 'DgNKCZjBLBU', cat: 'ofertas', t: 'MONTE SEU KIT POR APENAS R$ 150,00 👕🩳😍' },
  { c: 'DgLQLizhjXd', cat: 'ofertas', t: 'MONTE SEU KIT 🥳', local: true },
  { c: 'DgK0A_WRpFT', cat: 'ofertas', t: 'Monte seu kit final de ano 🥳', local: true },
  { c: 'DgI3XbdyBz_', cat: 'ofertas', t: '😍😍😍 Novidades na loja' },
  { c: 'DgIVSA_R9rC', cat: 'ofertas', t: 'Coisa boa: loja masculina em promoção 😱' },
  { c: 'Df26i4sS_HI', cat: 'humor', t: 'PEGUE GATO 🤣 kkkkk' },
  { c: 'DfvfB2HgzJw', cat: 'humor', t: 'BEXTÃO ou FIOTE 🤼‍♂️🥊' },
  { c: 'DfqRbexgBlU', cat: 'black', t: 'SEXTA E SÁBADO DE QUEIMA DE ESTOQUE! 😱🔥' },
  { c: 'DfqIJr7RUG5', cat: 'humor', t: 'ESSES GURY kkkkkkkk 🤣' },
  { c: 'DfqABWaRwTD', cat: 'black', t: 'SEXTA & SÁBADO 🥳💥 venha na loja, o online lota!' },
  { c: 'DffEBYHRIiH', cat: 'black', t: 'Novembro de queima de estoque: entre no grupo! 🔥' },
  { c: 'Dfc-owkR-eT', cat: 'ofertas', t: 'CAMISETA + BERMUDA R$ 99,90 🙀🔥', local: true },
  { c: 'Dfb7UMPxxdL', cat: 'black', t: '🚨 BLACK FRIDAY ANTECIPADA: toda a loja em promoção!' },
  { c: 'DfbDHGVg09F', cat: 'black', t: '🔥 Cuiabá, se prepara! A maior queima de estoque' },
  { c: 'DfatIWpRyax', cat: 'black', t: 'Kit calção importado + t-shirt: de R$ 240 por R$ 99,90!' },
  { c: 'DfYFYNVxReS', cat: 'humor', t: 'Não vou ver isso sozinho 😂' },
  { c: 'DfIghtNx1nC', cat: 'humor', t: 'Deu rede ❌ 😂' },
  { c: 'DfIB-cmx5AT', cat: 'ofertas', t: 'Polo Malha Chinesa Premium por R$ 75,00 😱' },
  { c: 'DfA56OIxphb', cat: 'humor', t: 'NÃO ACREDITO NISSO 😂' },
  { c: 'DfAhTZRRGq-', cat: 'ofertas', t: 'VEM PRA FONTE 🔥' },
  { c: 'De41amIx2dN', cat: 'humor', t: 'NÃO VOU VER ISSO SOZINHO 😂' },
  { c: 'De2tuMrxDoJ', cat: 'humor', t: 'NÃO VOU VER ISSO SOZINHO 😂' },
  { c: 'Deh1iE8hd_F', cat: 'humor', t: 'NÃO VOU VER ISSO SOZINHO KKKKKK 😂' },
  { c: 'DefmOzgAaEO', cat: 'ofertas', t: 'Ele comprou um kit com R$ 150 🙀😹' },
  { c: 'Decx5xMxetY', cat: 'humor', t: 'NÃO VOU VER ISSO SOZINHO 😹💦' },
  { c: 'DeQXh61g6p6', cat: 'ofertas', t: 'Eu quero essa promoção 🙏😍' },
  { c: 'DeQIjB0gKWh', cat: 'humor', t: 'Não vou ver isso sozinho 🙀' },
  { c: 'DePdox9R_sd', cat: 'inauguracao', t: 'Polos com 40% OFF na inauguração' },
  { c: 'DeNXeQjRuR6', cat: 'inauguracao', t: '10/10 sábado: inauguração 🙀😍' },
  { c: 'DeNQ3FIycyb', cat: 'inauguracao', t: '🚨 Cuiabá e VG, vocês estão convidados! 👑' },
  { c: 'DeKzI2Dxswx', cat: 'humor', t: 'Galalau tomou banho de loja 😹💦' },
  { c: 'DeKDU07xc_B', cat: 'inauguracao', t: 'Lasanha do disco na @cronosgrife 🔰' },
  { c: 'DeHpOV2RzH5', cat: 'inauguracao', t: 'Inauguração dia 10/10: promoções e novidades' },
  { c: 'DeCFJASRFSK', cat: 'inauguracao', t: '@cronosgrife, a loja que você procura' },
  { c: 'Dd95-1YBIJl', cat: 'humor', t: '🚨 Alerta de temporal 🚨' },
  { c: 'Dd9PArXhplT', cat: 'humor', t: 'Será que agora arrumo namorada 😂' },
];
const REEL_CAT = { ofertas: 'Oferta', black: 'Black Friday', inauguracao: 'Inauguração', humor: 'Humor' };
const embedSrc = (c) => `https://www.instagram.com/reel/${c}/embed/`;
const reelsGrid = $('#reelsGrid'), moreBtn = $('#moreBtn');
let reelFilter = 'all', reelShown = 8;

function renderReels() {
  const list = REELS.filter((r) => reelFilter === 'all' || r.cat === reelFilter);
  reelsGrid.innerHTML = '';
  list.slice(0, reelShown).forEach((r) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = r.local ? 'reel' : 'reel reel--embed';
    b.dataset.hover = ''; b.dataset.label = 'Play';
    b.setAttribute('aria-label', `Assistir: ${r.t}`);
    b.innerHTML = `<div class="reel__frame" aria-hidden="true">${r.local
      ? `<video src="media/${r.c}.mp4#t=0.6" muted playsinline preload="metadata"></video>`
      : `<iframe src="${embedSrc(r.c)}" loading="lazy" scrolling="no" tabindex="-1" title=""></iframe>`}</div>
      <span class="reel__cat">${REEL_CAT[r.cat]}</span>
      <span class="reel__play" aria-hidden="true"><svg class="ic" viewBox="0 0 24 24"><use href="#i-play"/></svg></span>
      <p class="reel__cap"></p>`;
    b.querySelector('.reel__cap').textContent = r.t;
    b.addEventListener('click', () => openVideo(r, b));
    reelsGrid.appendChild(b);
  });
  moreBtn.parentElement.hidden = reelShown >= list.length;
  bindHover(reelsGrid);
  if (HAS_GSAP) G.fromTo(reelsGrid.children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: .04, duration: .7, ease: 'expo.out' });
}
$('#reelChips').addEventListener('click', (e) => {
  const c = e.target.closest('[data-filter]'); if (!c) return;
  $$('#reelChips .chip').forEach((x) => { const on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-selected', on); });
  reelFilter = c.dataset.filter; reelShown = 8; renderReels();
});
moreBtn.addEventListener('click', () => { reelShown += 8; renderReels(); });

/* Modal de vídeo */
const modal = $('#modal'), modalFrame = $('#modalFrame');
let videoOpener = null;
function openVideo(r, opener) {
  videoOpener = opener;
  modalFrame.innerHTML = r.local
    ? `<video src="media/${r.c}.mp4" controls autoplay playsinline></video>`
    : `<iframe src="${embedSrc(r.c)}" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Vídeo do Instagram"></iframe>`;
  modal.hidden = false; document.body.classList.add('no-scroll');
  if (HAS_GSAP) G.fromTo('.modal__box', { scale: .85, opacity: 0, rotate: -3 }, { scale: 1, opacity: 1, rotate: 0, duration: .6, ease: 'expo.out' });
  $('#modalClose').focus();
}
function closeVideo() {
  modal.hidden = true; modalFrame.innerHTML = ''; document.body.classList.remove('no-scroll');
  if (videoOpener) videoOpener.focus();
}
$('#modalClose').addEventListener('click', closeVideo);
modal.addEventListener('click', (e) => { if (e.target === modal) closeVideo(); });

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!modal.hidden) closeVideo();
  else if (!qv.hidden) closeQV();
  else if (cartEl.classList.contains('is-open')) closeCart();
});

/* =========================================================
   Menu mobile, som do vídeo
========================================================= */
const menuBtn = $('#menuBtn'), nav = $('#nav');
menuBtn.addEventListener('click', () => { const o = nav.classList.toggle('is-open'); menuBtn.setAttribute('aria-expanded', o); });
nav.addEventListener('click', (e) => { if (e.target.closest('a')) { nav.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); } });
$$('[data-sound]').forEach((btn) => {
  const v = btn.parentElement.querySelector('video');
  btn.addEventListener('click', () => {
    v.muted = !v.muted; if (!v.muted) v.play();
    btn.querySelector('use').setAttribute('href', v.muted ? '#i-mute' : '#i-sound');
    btn.setAttribute('aria-label', v.muted ? 'Ativar som' : 'Desativar som');
  });
});

/* =========================================================
   Cursor personalizado + botões magnéticos
========================================================= */
const cursor = $('#cursor'), cursorLabel = $('#cursorLabel');
function bindHover(root = document) {
  if (!FINE) return;
  $$('[data-hover], a, button', root).forEach((el) => {
    if (el.dataset.cursorBound) return; el.dataset.cursorBound = '1';
    el.addEventListener('mouseenter', () => {
      const label = el.dataset.label;
      cursor.classList.toggle('is-label', !!label);
      cursor.classList.add('is-hover');
      cursorLabel.textContent = label || '';
    });
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover', 'is-label'));
  });
}
if (FINE && !REDUCED) {
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; cursor.classList.add('is-on'); }, { passive: true });
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-on'));
  (function loop() { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  bindHover();
  $$('.magnetic').forEach((m) => {
    m.addEventListener('mousemove', (e) => {
      const r = m.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      m.style.transform = `translate(${x * .25}px,${y * .35}px)`;
    });
    m.addEventListener('mouseleave', () => { m.style.transform = ''; });
  });
}

/* =========================================================
   Partículas douradas no hero
========================================================= */
(function particles() {
  const cv = $('#particles'); if (!cv || REDUCED) return;
  const ctx = cv.getContext('2d');
  let w, h, dots, mouse = { x: -999, y: -999 };
  const dpr = Math.min(devicePixelRatio || 1, 2);
  function resize() {
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(110, (w * h) / 14000));
    dots = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, vx: (Math.random() - .5) * .25, vy: -Math.random() * .4 - .1, a: Math.random() * .6 + .2, t: Math.random() * 6 }));
  }
  resize(); addEventListener('resize', resize);
  cv.parentElement.addEventListener('mousemove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(cv);
  (function draw() {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const d of dots) {
      d.t += .02; d.x += d.vx; d.y += d.vy;
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      if (dist < 120) { d.x += dx / dist * 1.6; d.y += dy / dist * 1.6; }
      if (d.y < -10) { d.y = h + 10; d.x = Math.random() * w; }
      if (d.x < -10) d.x = w + 10; if (d.x > w + 10) d.x = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(244,212,125,${d.a * (.6 + .4 * Math.sin(d.t))})`;
      ctx.shadowColor = 'rgba(244,212,125,.8)'; ctx.shadowBlur = 8;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
    }
  })();
})();

/* Paralaxe do palco do hero com o mouse */
if (FINE && !REDUCED) {
  const stage = $('#heroStage');
  const layers = $$('[data-depth]', stage);
  addEventListener('mousemove', (e) => {
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    layers.forEach((l) => {
      const d = +l.dataset.depth;
      l.style.transform = `translate3d(${x * d * -40}px,${y * d * -40}px,0)`;
    });
  }, { passive: true });
}

/* =========================================================
   Topo: fundo sólido, esconde ao descer, barra de progresso
========================================================= */
const topbar = $('#topbar'), prog = $('#scrollProgress');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  topbar.classList.toggle('is-solid', y > 40);
  topbar.classList.toggle('is-hidden', y > lastY && y > 500 && !nav.classList.contains('is-open'));
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  prog.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}, { passive: true });

/* =========================================================
   ANIMAÇÕES GSAP
========================================================= */
function splitChars(el) {
  $$('.line', el).forEach((line) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          [...n.textContent].forEach((ch) => {
            const s = document.createElement('span');
            s.className = 'char'; s.textContent = ch === ' ' ? ' ' : ch;
            frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(line);
  });
}
function splitWords(el) {
  const text = el.innerHTML.split(/<br\s*\/?>/i);
  el.innerHTML = text.map((part) => part.trim().split(/\s+/).map((w) => `<span class="word"><span>${w}</span></span>`).join(' ')).join('<br>');
}

function countUp(el) {
  const end = +el.dataset.count, suf = el.dataset.suffix || '';
  if (!HAS_GSAP) { el.textContent = end.toLocaleString('pt-BR') + suf; return; }
  const o = { v: 0 };
  G.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString('pt-BR') + suf; } });
}

function heroIntro() {
  const tl = G.timeline();
  tl.from('#heroTitle .char', { yPercent: 115, rotate: 8, duration: 1.1, ease: 'expo.out', stagger: .025 })
    .from('.hero .reveal-up', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08 }, '-=.8')
    .from('.phone', { y: 120, rotateX: 25, opacity: 0, duration: 1.3, ease: 'expo.out' }, '-=1.1')
    .from('.float', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(1.7)', stagger: .12 }, '-=.9')
    .from('.seal', { scale: 0, rotate: -180, duration: 1.2, ease: 'expo.out' }, '-=.8')
    .from('.hero__bigword', { yPercent: 40, opacity: 0, duration: 1.6, ease: 'expo.out' }, '-=1.4')
    .from('.topbar__in > *', { y: -30, opacity: 0, duration: .8, ease: 'expo.out', stagger: .06, clearProps: 'transform,opacity' }, '-=1.4')
    .add(() => $$('[data-count]').forEach(countUp), '-=1');
  return tl;
}

function runLoader(done) {
  const counter = $('#loaderCount');
  const o = { v: 0 };
  const tl = G.timeline({ onComplete: done });
  tl.to('.loader__word span', { y: 0, duration: .8, ease: 'expo.out', stagger: .06 })
    .from('.loader__logo', { scale: .6, opacity: 0, duration: .8, ease: 'expo.out' }, 0)
    .to(o, { v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: () => { counter.textContent = Math.round(o.v); } }, 0)
    .to('.loader__shine', { x: '120%', duration: .9, ease: 'power2.inOut' }, .5)
    .to('.loader__center', { scale: .9, opacity: 0, duration: .5, ease: 'power2.in' }, '+=.15')
    .to('.loader__panel--top', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '-=.1')
    .to('.loader__panel--bottom', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
    .add(() => { document.body.classList.remove('is-loading'); }, '-=.7')
    .set('#loader', { display: 'none' });
}

function scrollAnimations() {
  // títulos de seção: palavras sobem
  $$('.split').forEach((h) => {
    splitWords(h);
    G.from($$('.word > span', h), { yPercent: 110, rotate: 4, duration: 1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  // categorias entram em cascata com rotação
  G.from('.cat', { y: 80, opacity: 0, rotate: () => G.utils.random(-6, 6), duration: 1, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.cats', start: 'top 80%' } });
  // kits sobem com leve inclinação
  G.from('.kit', { y: 100, opacity: 0, rotateY: -15, transformPerspective: 900, duration: 1.1, ease: 'expo.out', stagger: .12, scrollTrigger: { trigger: '.kits', start: 'top 80%' } });
  // perfumes: frascos surgem com brilho
  G.from('.bottle', { y: 120, opacity: 0, scale: .9, duration: 1.2, ease: 'expo.out', stagger: .15, scrollTrigger: { trigger: '.bottles', start: 'top 80%' } });
  G.from('.perfumes__text > *:not(h2)', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.perfumes__text', start: 'top 80%' } });
  // diferenciais
  G.from('.perk', { y: 50, opacity: 0, duration: .9, ease: 'expo.out', stagger: .08, scrollTrigger: { trigger: '.perks', start: 'top 85%' } });
  // imagem da loja revelada como cortina
  G.from('.reveal-img', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '.reveal-img', start: 'top 80%' } });
  G.from('.reveal-img img', { scale: 1.3, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: '.reveal-img', start: 'top 80%' } });
  // cartão CTA
  G.from('.cta-card', { y: 60, opacity: 0, scale: .96, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.cta-card', start: 'top 85%' } });
  // letreiro gigante do rodapé
  G.from('.footer__big', { yPercent: 60, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 95%' } });
  // palavra gigante do hero desliza com o scroll
  G.to('.hero__bigword', { xPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  G.to('.hero__stage', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  // grade da loja ao aparecer pela 1ª vez
  ScrollTrigger.create({ trigger: '#shopGrid', start: 'top 85%', once: true, onEnter: () => G.fromTo('#shopGrid > *', { y: 60, opacity: 0 }, { y: 0, opacity: 1, stagger: .05, duration: .9, ease: 'expo.out', clearProps: 'transform' }) });

  // LOOKBOOK: rolagem horizontal fixada
  const track = $('#lookTrack');
  const dist = () => track.scrollWidth - innerWidth;
  const hs = G.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.lookbook', start: 'top top', end: () => `+=${dist()}`, pin: '.lookbook__pin', scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 } });
  $$('.look img').forEach((img) => {
    G.fromTo(img, { scale: 1.3, xPercent: 8 }, { scale: 1.05, xPercent: -8, ease: 'none', scrollTrigger: { trigger: img.closest('.look'), containerAnimation: hs, start: 'left right', end: 'right left', scrub: true } });
  });

  // FAIXA: velocidade reage ao scroll (e inclina)
  const ticker = $('#ticker');
  let x = 0, speed = 1, skew = 0;
  ScrollTrigger.create({ onUpdate: (self) => { const v = self.getVelocity(); speed = 1 + Math.min(Math.abs(v) / 250, 8); skew = G.utils.clamp(-10, 10, v / -180); } });
  G.ticker.add(() => {
    x -= speed; speed += (1 - speed) * .05; skew += (0 - skew) * .1;
    const half = ticker.scrollWidth / 2;
    if (-x >= half) x += half;
    ticker.style.transform = `translate3d(${x}px,0,0) skewX(${skew}deg)`;
  });
}

/* =========================================================
   INÍCIO
========================================================= */
renderShop(false);
renderReels();
renderCart();

if (HAS_GSAP) {
  splitChars($('#heroTitle'));
  G.set('.hero .reveal-up, .phone, .float, .seal', { visibility: 'visible' });
  scrollAnimations();
  const start = () => { heroIntro(); ScrollTrigger.refresh(); };
  if (sessionStorage.getItem('cg_seen')) {
    $('#loader').style.display = 'none'; document.body.classList.remove('is-loading'); start();
  } else {
    try { sessionStorage.setItem('cg_seen', '1'); } catch { /* ignore */ }
    runLoader(start);
  }
  addEventListener('load', () => ScrollTrigger.refresh());
} else {
  $('#loader').style.display = 'none';
  document.body.classList.remove('is-loading');
  $$('[data-count]').forEach(countUp);
  // sem GSAP: faixa animada simples por CSS
  const t = $('#ticker'); if (t && !REDUCED) t.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: 30000, iterations: Infinity });
}
})();
