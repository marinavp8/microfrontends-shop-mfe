import { useEffect, useState } from 'react';
import { emit, on } from '@shop/contracts';
import { getBanners, getFeatured } from './api';

type Banner = { title: string; subtitle?: string; cta?: { label: string; path: string } };
type Product = { sku: string; name: string; price: number; category: string };

const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const ICONS: Record<string, string> = { teclados: '⌨️', monitores: '🖥️', audio: '🎧', video: '📹' };
const GRADIENTS = [
  'linear-gradient(135deg,#2563eb,#7c3aed)',
  'linear-gradient(135deg,#059669,#0ea5e9)',
  'linear-gradient(135deg,#ea580c,#db2777)',
];

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [cart, setCart] = useState({ count: 0, total: 0 });

  useEffect(() => {
    getBanners().then(setBanners).catch(() => {});
    getFeatured().then(setFeatured).catch(() => {});
    return on('cart:updated', setCart);
  }, []);

  return (
    <section>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {banners.map((b, i) => (
          <div key={b.title} style={{ background: GRADIENTS[i % GRADIENTS.length], color: '#fff', padding: '28px 32px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>{b.title}</div>
              {b.subtitle && <div style={{ opacity: 0.9, marginTop: 4 }}>{b.subtitle}</div>}
            </div>
            {b.cta && (
              <button
                onClick={() => emit('nav:go', { path: b.cta!.path })}
                style={{ padding: '10px 20px', border: 0, borderRadius: 999, background: '#fff', color: '#111', fontWeight: 600, cursor: 'pointer' }}
              >
                {b.cta.label} →
              </button>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 28 }}>⭐ Productos destacados</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
        {featured.map((p) => (
          <div key={p.sku} style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 6, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 44, textAlign: 'center', background: '#f3f4f6', borderRadius: 8, padding: '14px 0' }}>{ICONS[p.category] ?? '📦'}</div>
            <div style={{ fontWeight: 600, marginTop: 6 }}>{p.name}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{eur(p.price)}</div>
            <button
              onClick={() => emit('cart:add-item', { sku: p.sku, name: p.name, price: p.price, qty: 1 })}
              style={{ marginTop: 'auto', padding: '8px 0', border: 0, borderRadius: 6, background: '#2563eb', color: '#fff', cursor: 'pointer' }}
            >
              Añadir al carrito
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 20, color: '#6b7280' }}>
        🛒 Tu carrito: <b>{cart.count}</b> artículos · <b>{eur(cart.total)}</b>
        {cart.count > 0 && (
          <button onClick={() => emit('nav:go', { path: '/carrito' })} style={{ marginLeft: 12 }}>Ver carrito</button>
        )}
      </p>
    </section>
  );
}
