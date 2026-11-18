const assert = require('node:assert/strict');
require('../order-service.js');
const { buildOrder, sendOrder } = globalThis.LounaOrders;
const input = {
  entries: [
    { id: 'wrap-pink', name: 'كاش بيبي الدبدوب', color: 'وردي', qty: 2 },
    { id: 'wrap-blue', name: 'كاش بيبي الدبدوب', color: 'أزرق فاتح', qty: 1 }
  ],
  customer: { name: ' Test Customer ', city: ' Settat ', phone: '0612345678', address: ' Test address ' },
  source: 'cart', orderId: 'LB-TEST', page: 'https://example.test/'
};
(async () => {
  const {payload, message} = buildOrder(input);
  assert.equal(payload.total, 357);
  assert.equal(payload.name, 'Test Customer');
  assert.equal(payload.city, 'Settat — Test address');
  assert.equal(payload.phone, '0612345678');
  assert.equal(payload.type, 'order');
  assert.deepEqual(payload.items.map(i => [i.size, i.qty, i.price]), [['وردي', 2, 119], ['أزرق فاتح', 1, 119]]);
  assert.ok(message.includes('طلب جديد رقم LB-TEST:'));
  assert.ok(message.includes('المجموع: 357 DH'));
  assert.ok(message.includes('الهاتف: 0612345678'));
  assert.throws(() => buildOrder({...input, customer: {...input.customer, phone: 'bad'}}));
  assert.throws(() => buildOrder({...input, entries: []}));
  assert.throws(() => buildOrder({...input, entries: [{...input.entries[0], qty: 0}]}));
  assert.throws(() => buildOrder({...input, entries: [{...input.entries[0], qty: 100}]}));
  let completeRequest;
  let completed = false;
  const pending = sendOrder(payload, (url, options) => {
    assert.match(url, /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/);
    assert.equal(options.method, 'POST');
    assert.equal(options.mode, 'no-cors');
    assert.deepEqual(JSON.parse(options.body), payload);
    return new Promise(resolve => {completeRequest = resolve;});
  }).then(() => {completed = true;});
  await Promise.resolve();
  assert.equal(completed, false, 'must wait before redirect');
  completeRequest({type: 'opaque'});
  await pending;
  assert.equal(completed, true);
  await assert.rejects(sendOrder(payload, async () => {throw Error('offline');}), /offline/);
  await assert.rejects(sendOrder(payload, async () => ({type: 'basic', ok: false})), /failed/);
  console.log('Order payload, message format, validation, request sequencing and failure checks passed. No live requests sent.');
})().catch(error => {console.error(error); process.exitCode = 1;});
