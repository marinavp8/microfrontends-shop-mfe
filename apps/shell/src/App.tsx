import React, { Component, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { on } from '@shop/contracts';

const Home = React.lazy(() => import('home/Home'));
const Catalog = React.lazy(() => import('catalog/Catalog'));
const Cart = React.lazy(() => import('cart/Cart'));

class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Remote({ name, children }: { name: string; children: ReactNode }) {
  return (
    <ErrorBoundary fallback={<p>⚠️ El módulo «{name}» no está disponible ahora mismo.</p>}>
      <Suspense fallback={<p>Cargando {name}…</p>}>{children}</Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ count: 0, total: 0 });

  useEffect(() => {
    const offs = [
      on('cart:updated', setCart),
      on('nav:go', ({ path }) => navigate(path)),
      on('cart:checkout-started', ({ total }) => alert('Checkout iniciado: ' + total + ' €')),
    ];
    // La shell inicia SIEMPRE el cartStore (la trampa del carrito)
    import('cart/cartStore').then((m) => m.init()).catch((e) => console.warn('cartStore no disponible', e));
    return () => offs.forEach((off) => off());
  }, [navigate]);

  return (
    <div style={{ fontFamily: 'system-ui', maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', gap: 16, alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        <strong>🛍️ Shop</strong>
        <Link to="/">Home</Link>
        <Link to="/catalogo">Catálogo</Link>
        <Link to="/carrito">Carrito</Link>
        <span style={{ marginLeft: 'auto' }}>🛒 {cart.count} · {cart.total} €</span>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Remote name="home"><Home /></Remote>} />
          <Route path="/catalogo" element={<Remote name="catalog"><Catalog /></Remote>} />
          <Route path="/carrito" element={<Remote name="cart"><Cart /></Remote>} />
        </Routes>
      </main>
    </div>
  );
}
