(function (root) {
  'use strict';
  const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzzMBtY5QAcx0ynBJ7D_23IRIV9_Ic8xFka8v1H8eyvKfOCF6PuYYNZyhmMEyJDplNy4g/exec';
  const PHONE_RE = /^(?:0[5-7]\d{8}|(?:\+|00)?212[5-7]\d{8})$/;
  function buildOrder({ entries, customer, source, page, orderId }) {
    const c = Object.fromEntries(['name', 'phone', 'city', 'address'].map(key => [key, String(customer[key] || '').trim()]));
    if (!c.name || !c.city || !PHONE_RE.test(c.phone.replace(/[\s().-]/g, ''))) throw new Error('عافاك عمّري الاسم والمدينة ورقم هاتف صحيح (مثال: 0612345678).');
    if (!entries.length || entries.some(item => !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99)) throw new Error('عافاك اختاري المنتوج والكمية من 1 حتى 99.');
    const items = entries.map(item => ({ id: item.id, name: item.name, size: item.color, qty: item.qty, price: 119 }));
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const payload = { type: 'order', source, orderId, name: c.name, phone: c.phone, website: '', city: c.address ? `${c.city} — ${c.address}` : c.city, items, total, page };
    const lines = items.map(item => `• ${item.name} — ${item.size} × ${item.qty} = ${item.price * item.qty} DH`);
    const message = `السلام عليكم LOUNA BABY 👋\nطلب جديد رقم ${orderId}:\n${lines.join('\n')}\n\nالمجموع: ${total} DH\n\nالاسم: ${c.name}\nالهاتف: ${c.phone}\nالمدينة: ${c.city}${c.address ? `\nالعنوان: ${c.address}` : ''}\n\nعفاكم أكدو ليا الطلب وثمن التوصيل.`;
    return { payload, message };
  }
  async function sendOrder(payload, request = root.fetch.bind(root)) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      // Same Apps Script POST contract as al-hayba. Its cross-origin response
      // is opaque: completion confirms dispatch, not a successful sheet write.
      const response = await request(SHEET_URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: controller.signal });
      if (response.type !== 'opaque' && !response.ok) throw new Error('Sheet request failed');
    } finally { clearTimeout(timer); }
  }
  root.LounaOrders = { buildOrder, sendOrder };
})(typeof window === 'undefined' ? globalThis : window);
