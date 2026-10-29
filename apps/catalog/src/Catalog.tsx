import { useEffect, useState } from 'react';
import { emit } from '@shop/contracts';
import { getProducts } from './api';

type Product = { sku: string; name: string; price: number; category: string; stock: number };
const CATEGORIES = ['teclados', 'monitores', 'audio', 'video'];

const eur = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
const th = { textAlign: 'left' as const, padding: '10px 12px', background: '#f3f4f6', borderBottom: '2px solid #d1d5db', fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: 0.4 };
const td = { padding: '10px 12px', borderBottom: '1px solid #e5e7eb' };
const num = { textAlign: 'right' as const };

export default function Catalog() {
  const [category, setCategory] = useState<string>();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => { getProducts(category).then(setProducts).catch(() => setProducts([])); }, [category]);

  return (
    <section>
      <h2>📚 Catálogo</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setCategory(undefined)} disabled={!category}>Todas</button>{' '}
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} disabled={category === c}>{c}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 0 1px #e5e7eb' }}>
        <thead>
          <tr>
            <th style={th}>SKU</th>
            <th style={th}>Producto</th>
            <th style={th}>Categoría</th>
            <th style={{ ...th, ...num }}>Precio</th>
            <th style={{ ...th, ...num }}>Stock</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.sku}>
              <td style={{ ...td, color: '#6b7280', fontFamily: 'monospace' }}>{p.sku}</td>
              <td style={td}>{p.name}</td>
              <td style={td}>{p.category}</td>
              <td style={{ ...td, ...num, fontWeight: 600 }}>{eur(p.price)}</td>
              <td style={{ ...td, ...num }}>{p.stock}</td>
              <td style={{ ...td, ...num }}>
                <button
                  disabled={p.stock === 0}
                  onClick={() => emit('cart:add-item', { sku: p.sku, name: p.name, price: p.price, qty: 1 })}
                  style={{ padding: '6px 14px', border: 0, borderRadius: 6, color: '#fff', background: p.stock ? '#2563eb' : '#9ca3af', cursor: p.stock ? 'pointer' : 'not-allowed' }}
                >
                  Añadir
                </button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td style={{ ...td, color: '#6b7280' }} colSpan={6}>Sin productos.</td></tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
