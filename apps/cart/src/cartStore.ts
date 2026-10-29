import { on, emit } from '@shop/contracts';

const API = 'http://localhost:4002';
export const cartId: string = (() => {
  let id = localStorage.getItem('shop:cartId');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('shop:cartId', id); }
  return id;
})();

export type CartItem = { sku: string; name: string; price: number; qty: number };
export type CartData = { cartId: string; items: CartItem[] };

export const getCart = (): Promise<CartData> => fetch(API + '/api/carts/' + cartId).then((r) => r.json());

function publish(cart: CartData) {
  emit('cart:updated', {
    count: cart.items.reduce((a, i) => a + i.qty, 0),
    total: cart.items.reduce((a, i) => a + i.qty * i.price, 0),
  });
}

export async function clear() {
  const cart = await fetch(API + '/api/carts/' + cartId, { method: 'DELETE' }).then((r) => r.json());
  publish(cart);
}

let started = false;
// Módulo sin UI: la shell lo inicia siempre, así "Añadir" funciona desde /catalogo
export async function init() {
  if (started) return;
  started = true;
  on('cart:add-item', async (item) => {
    const cart = await fetch(API + '/api/carts/' + cartId + '/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then((r) => r.json());
    publish(cart);
  });
  publish(await getCart());
}
