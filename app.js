const STORE_WHATSAPP = '212700430167';
const selected = new Map();
const cart = document.querySelector('#cart');
const dialog = document.querySelector('#order-dialog');
const status = document.querySelector('#status');
const send = document.querySelector('#send-order');
const arabicNumber = value => new Intl.NumberFormat('ar-MA', {numberingSystem: 'latn', useGrouping: false}).format(value);
const pricedProduct = name => name.startsWith('كاش بيبي الدبدوب');
const expressForm = document.querySelector('#express-form');
const expressProduct = document.querySelector('#express-product');
const expressQuantity = document.querySelector('#express-quantity');
document.querySelectorAll('.color-product [data-product]').forEach(button => {
  const option = document.createElement('option');
  option.value = button.dataset.product;
  option.textContent = button.dataset.product.replace('كاش بيبي الدبدوب — ', '') + ' — 119 درهم';
  expressProduct.append(option);
});
expressQuantity.addEventListener('input', () => {
  const quantity = Math.max(1, Math.min(99, Math.floor(Number(expressQuantity.value) || 1)));
  document.querySelector('#express-total').textContent = `${quantity * 119} درهم`;
});
expressForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!expressForm.reportValidity()) return;
  const quantity = Math.max(1, Math.min(99, Math.floor(Number(expressQuantity.value) || 1)));
  const name = document.querySelector('#customer-name').value.trim();
  const city = document.querySelector('#customer-city').value.trim();
  const phone = document.querySelector('#customer-phone').value.trim();
  const message = `السلام عليكم الهيبة 🧸❤️\nبغيت نطلب:\n• ${expressProduct.value}\n• الكمية: ${quantity}\n• الثمن: 119 درهم للقطعة\n• مجموع المنتجات: ${quantity * 119} درهم (بلا توصيل)\n\n• الاسم: ${name}\n• المدينة: ${city}\n• الهاتف: ${phone}\n\nعافاكم أكدوا ليا المقاس، التوفر وثمن التوصيل. الدفع عند الاستلام.`;
  window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});
function orderMessage(items) {
  const city = document.querySelector('#city')?.value.trim() || '…';
  const notes = document.querySelector('#notes')?.value.trim();
  const details = [...items].map(([name, quantity]) => {
    if (!pricedProduct(name)) return `• المنتوج: ${name}\n• الكمية: ${quantity}\n• الثمن: عند الاستفسار`;
    const color = name.split('—').slice(1).join('—').trim();
    return `• اللون: ${color}\n• الكمية: ${quantity}\n• الثمن: 119 درهم للقطعة`;
  }).join('\n\n');
  return `السلام عليكم الهيبة 🧸❤️\nبغيت نطلب كاش بيبي الشتوي:\n${details}\n• المدينة: ${city}\n${notes ? `\nملاحظة: ${notes}\n` : ''}\nعافاكم أكدوا ليا المقاس، التوفر وثمن التوصيل.`;
}
function render() {
  cart.hidden = false;
  document.querySelector('#count').textContent = [...selected.values()].reduce((sum, quantity) => sum + quantity, 0);
  cart.setAttribute('aria-label', `فتح السلة، ${[...selected.values()].reduce((sum, quantity) => sum + quantity, 0)} منتجات`);
  document.querySelectorAll('.product').forEach(card => {
    const button = card.querySelector('[data-product]');
    if (button && card.syncQuantity) card.syncQuantity(selected.get(button.dataset.product) || 0);
  });
  send.disabled = selected.size === 0;
  const list = document.querySelector('#order-items');
  list.replaceChildren();
  for (const [name, quantity] of selected) {
    const row = document.createElement('div');
    row.className = 'basket-item';
    const sourceCard = [...document.querySelectorAll('.product')].find(card => card.querySelector('[data-product]')?.dataset.product === name);
    const sourceImage = sourceCard?.querySelector('img');
    if (sourceImage) {
      const image = document.createElement('img');
      image.src = sourceImage.getAttribute('src');
      image.alt = sourceImage.alt;
      image.className = 'basket-image';
      row.append(image);
    }
    const details = document.createElement('div');
    details.className = 'basket-details';
    const text = document.createElement('span');
    text.className = 'basket-name';
    text.textContent = name;
    const subtitle = document.createElement('small');
    subtitle.textContent = pricedProduct(name)
      ? `119 درهم للواحد · المجموع ${arabicNumber(quantity * 119)} درهم`
      : 'الثمن كيتأكد معاك فواتساب';
    const controls = document.createElement('div');
    controls.className = 'quantity-controls';
    const less = document.createElement('button');
    less.textContent = '−';
    less.setAttribute('aria-label', `نقص كمية ${name}`);
    less.onclick = () => { quantity > 1 ? selected.set(name, quantity - 1) : selected.delete(name); render(); };
    const more = document.createElement('button');
    more.textContent = '+';
    more.setAttribute('aria-label', `زيادة كمية ${name}`);
    more.disabled = quantity >= 99;
    more.onclick = () => { selected.set(name, Math.min(99, quantity + 1)); render(); };
    const remove = document.createElement('button');
    remove.textContent = 'حذف';
    remove.setAttribute('aria-label', `حذف ${name}`);
    remove.onclick = () => { selected.delete(name); render(); };
    const number = document.createElement('b');
    number.textContent = quantity;
    number.setAttribute('aria-label', `الكمية ${quantity}`);
    controls.append(less, number, more, remove);
    details.append(text, subtitle, controls);
    row.append(details); list.append(row);
  }
  if (!selected.size) list.textContent = 'السلة خاوية دابا. اختاري اللون اللي عجبك وزيديه للسلة.';
}
document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
  document.querySelectorAll('[data-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active); item.setAttribute('aria-pressed', active);
  });
  document.querySelectorAll('[data-category]').forEach(item => {
    item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter;
  });
});
document.querySelectorAll('.product').forEach((card, index) => {
  const productButton = card.querySelector('[data-product]');
  if (!productButton) return;
  const name = productButton.dataset.product;
  const rating = [5, 4, 3, 5, 4, 3, 4, 5, 2, 4, 3, 4, 5][index % 13];
  const stars = document.createElement('div');
  stars.className = 'product-rating';
  stars.setAttribute('aria-label', `تقييم توضيحي: ${rating} من 5 نجوم، ليس من آراء الزبناء`);
  const symbols = document.createElement('span');
  symbols.className = 'stars';
  symbols.setAttribute('aria-hidden', 'true');
  symbols.textContent = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const caption = document.createElement('small');
  caption.textContent = 'تقييم توضيحي';
  stars.append(symbols, caption);
  const picker = document.createElement('div');
  picker.className = 'product-quantity';
  const label = document.createElement('label');
  const id = `quantity-${index}`;
  label.htmlFor = id;
  label.textContent = 'الكمية';
  const controls = document.createElement('div');
  controls.className = 'quantity-picker';
  const minus = document.createElement('button');
  minus.type = 'button'; minus.textContent = '−';
  minus.setAttribute('aria-label', `نقص كمية ${name}`);
  const input = document.createElement('input');
  input.id = id; input.type = 'number'; input.min = '0'; input.max = '99'; input.step = '1'; input.value = '0';
  input.setAttribute('aria-label', `كمية ${name}`);
  card.readQuantity = () => {
    const quantity = Math.max(0, Math.min(99, Math.floor(Number(input.value) || 0)));
    input.value = quantity;
    return quantity;
  };
  const plus = document.createElement('button');
  plus.type = 'button'; plus.textContent = '+';
  plus.setAttribute('aria-label', `زيادة كمية ${name}`);
  const direct = card.querySelector('.whatsapp-order');
  const update = () => {
    const quantity = card.readQuantity();
    minus.disabled = quantity <= 0; plus.disabled = quantity >= 99;
    if (direct) {
      const message = orderMessage([[name, Math.max(1, quantity)]]);
      direct.href = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
    }
  };
  card.syncQuantity = quantity => { input.value = quantity; update(); };
  const syncCart = () => {
    const quantity = card.readQuantity();
    if (quantity > 0) selected.set(name, quantity); else selected.delete(name);
    render();
    cart.classList.remove('just-added');
    void cart.offsetWidth;
    cart.classList.add('just-added');
  };
  minus.onclick = () => { input.value = card.readQuantity() - 1; syncCart(); };
  plus.onclick = () => { input.value = card.readQuantity() + 1; syncCart(); };
  input.onchange = syncCart;
  input.oninput = () => { if (input.value !== '') syncCart(); };
  if (direct) direct.addEventListener('click', () => {
    if (!card.readQuantity()) input.value = 1;
    syncCart();
  });
  controls.append(minus, input, plus);
  picker.append(label, controls);
  card.querySelector('.product-info').after(stars, picker);
  update();
});
document.querySelectorAll('[data-product]').forEach(button => button.onclick = () => {
  const name = button.dataset.product;
  const card = button.closest('.product');
  const quantity = Math.max(1, card.readQuantity ? card.readQuantity() : 1);
  selected.set(name, quantity); render();
  const confirmation = document.querySelector('#cart-feedback');
  confirmation.textContent = `تزاد ${name} × ${quantity} فالسلة`;
  cart.classList.remove('just-added');
  void cart.offsetWidth;
  cart.classList.add('just-added');
});
cart.onclick = () => { status.textContent = ''; render(); dialog.showModal(); };
document.querySelector('.close').onclick = () => dialog.close();
if (STORE_WHATSAPP) {
  send.textContent = 'تأكيد الطلب عبر واتساب ↗';
  document.querySelector('#order-notice').textContent = 'ثمن الكاش بيبي 119 درهم للواحد. التوفر وثمن التوصيل كيتأكدو فواتساب قبل إتمام الطلب.';
}
send.onclick = async () => {
  if (!selected.size) return;
  const message = orderMessage(selected);
  if (STORE_WHATSAPP) { window.open(`https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener'); return; }
  try { await navigator.clipboard.writeText(message); status.textContent = 'تنسخ الاستفسار. ما تصيفط حتى طلب دابا.'; }
  catch { status.textContent = message; status.style.whiteSpace = 'pre-wrap'; }
};
const feedback = document.createElement('p');
feedback.id = 'cart-feedback';
feedback.className = 'cart-feedback';
feedback.setAttribute('role', 'status');
feedback.setAttribute('aria-live', 'polite');
document.querySelector('header').after(feedback);
dialog.setAttribute('aria-labelledby', 'basket-title');
const basketTitle = dialog.querySelector('h2');
basketTitle.id = 'basket-title';
basketTitle.textContent = 'سلة مليانة حنان';
dialog.querySelector('.eyebrow').textContent = 'الهيبة · اختياراتك الحلوة';
const basketHeader = document.createElement('div');
basketHeader.className = 'basket-heading';
const basketMark = document.createElement('span');
basketMark.className = 'basket-mark';
basketMark.setAttribute('aria-hidden', 'true');
basketMark.textContent = '♡';
basketHeader.append(basketMark, dialog.querySelector('.eyebrow'), basketTitle);
dialog.querySelector('.close').after(basketHeader);
const basketFooter = document.createElement('div');
basketFooter.className = 'basket-footer';
basketFooter.append(document.querySelector('#order-notice'), send, status);
dialog.append(basketFooter);
const cityLabel = document.createElement('label');
cityLabel.htmlFor = 'city';
cityLabel.textContent = 'المدينة';
const cityInput = document.createElement('input');
cityInput.id = 'city';
cityInput.type = 'text';
cityInput.autocomplete = 'address-level2';
cityInput.placeholder = 'مثلاً: برشيد، سطات…';
cityInput.maxLength = 100;
const notesLabel = dialog.querySelector('label[for="notes"]');
notesLabel.before(cityLabel, cityInput);
render();

// Product photos follow the pointer while preserving normal touch scrolling.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.color-product .product-photo').forEach(photo => {
  let frame = 0;
  let pointer = null;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    photo.classList.remove('photo-interacting');
    ['--photo-rx', '--photo-ry', '--photo-x', '--photo-y', '--glow-x', '--glow-y'].forEach(property => photo.style.removeProperty(property));
  };
  const follow = event => {
    if (reducedMotion.matches || (event.pointerType === 'touch' && event.type !== 'pointerdown' && pointer !== event.pointerId)) return;
    if (event.type === 'pointerdown') pointer = event.pointerId;
    const bounds = photo.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      photo.classList.add('photo-interacting');
      photo.style.setProperty('--photo-rx', `${(0.5 - y) * 11}deg`);
      photo.style.setProperty('--photo-ry', `${(x - 0.5) * 11}deg`);
      photo.style.setProperty('--photo-x', `${(x - 0.5) * 14}px`);
      photo.style.setProperty('--photo-y', `${(y - 0.5) * 14}px`);
      photo.style.setProperty('--glow-x', `${x * 100}%`);
      photo.style.setProperty('--glow-y', `${y * 100}%`);
    });
  };
  photo.addEventListener('pointerdown', follow, {passive: true});
  photo.addEventListener('pointermove', follow, {passive: true});
  ['pointerleave', 'pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => photo.addEventListener(type, reset, {passive: true}));
  reducedMotion.addEventListener('change', reset);
});

// Reveal sections once as they enter the viewport.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {threshold: 0.08});
  document.querySelectorAll('.color-product, .story, .steps article, .express-section').forEach((element, index) => {
    element.classList.add('reveal-item');
    element.style.setProperty('--reveal-delay', `${(index % 3) * 65}ms`);
    revealObserver.observe(element);
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) {
      document.querySelectorAll('.reveal-item').forEach(element => element.classList.add('is-visible'));
      revealObserver.disconnect();
    }
  });
}
