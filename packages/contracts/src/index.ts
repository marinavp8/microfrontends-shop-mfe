// Contrato de eventos: lo único que comparten los microfrontends.
export type ShopEvents = {
  'cart:add-item': { sku: string; name: string; price: number; qty: number };
  'cart:updated': { count: number; total: number };
  'nav:go': { path: string };
  'cart:checkout-started': { total: number };
};

export type EventName = keyof ShopEvents;

export function emit<K extends EventName>(name: K, detail: ShopEvents[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends EventName>(name: K, handler: (detail: ShopEvents[K]) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<ShopEvents[K]>).detail);
  window.addEventListener(name, fn);
  return () => window.removeEventListener(name, fn);
}
