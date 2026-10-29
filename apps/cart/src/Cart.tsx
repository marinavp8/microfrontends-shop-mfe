import { useEffect, useState } from 'react';
import { emit, on } from '@shop/contracts';
import { clear, getCart, init, type CartItem } from './cartStore';

const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const th = { textAlign: 'left' as const, padding: '10px 12px', background: '#f3f4f6', borderBottom: '2px solid #d1d5db', fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 0.4 };
const td = { padding: '10px 12px', borderBottom: '1px solid #e5e7eb' };
const num = { textAlign: 'right' as const };

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const refresh = () => getCart().then((c) => setItems(c.items)).catch(() => {});

  useEffect(() => {
    init(); // idempotente; necesario en modo standalone
    refresh();
    return on('cart:updated', refresh);
  }, []);

  const units = items.reduce((a, i) => a + i.qty, 0);
  const total = items.reduce((a, i) => a + i.qty * i.price, 0);

  return (
    <section>
      <h2>🛒 Tu carrito</h2>
      {items.length === 0 ? (
        <p style={{ color: '#6b7280' }}>Tu carrito está vacío.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 0 1px #e5e7eb' }}>
          <thead>
            <tr>
              <th style={th}>SKU</th>
              <th style={th}>Producto</th>
              <th style={{ ...th, ...num }}>Precio</th>
              <th style={{ ...th, ...num }}>Cant.</th>
              <th style={{ ...th, ...num }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.sku}>
                <td style={{ ...td, color: '#6b7280', fontFamily: 'monospace' }}>{i.sku}</td>
                <td style={td}>{i.name}</td>
                <td style={{ ...td, ...num }}>{eur(i.price)}</td>
                <td style={{ ...td, ...num }}>{i.qty}</td>
                <td style={{ ...td, ...num, fontWeight: 600 }}>{eur(i.qty * i.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ ...td, fontWeight: 600 }} colSpan={3}>Total</td>
              <td style={{ ...td, ...num, fontWeight: 600 }}>{units}</td>
              <td style={{ ...td, ...num, fontWeight: 700, fontSize: 18 }}>{eur(total)}</td>
            </tr>
          </tfoot>
        </table>
      )}
      <div style={{ textAlign: 'right', marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button
          disabled={!items.length}
          onClick={() => clear()}
          style={{ padding: '10px 24px', fontSize: 16, borderRadius: 6, border: '1px solid #dc2626', color: '#dc2626', background: '#fff', cursor: items.length ? 'pointer' : 'not-allowed', opacity: items.length ? 1 : 0.5 }}
        >
          Vaciar carrito
        </button>
        <button
          disabled={!items.length}
          onClick={() => emit('cart:checkout-started', { total })}
          style={{ padding: '10px 24px', fontSize: 16, border: 0, borderRadius: 6, color: '#fff', background: items.length ? '#2563eb' : '#9ca3af', cursor: items.length ? 'pointer' : 'not-allowed' }}
        >
          Checkout
        </button>
      </div>
    </section>
  );
}
