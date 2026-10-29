# shop-mfe — Tienda con Module Federation (Home, Catálogo y Carrito)

Caso de uso del directo: tienda online dividida en tres microfrontends (más una shell) integrados en tiempo de ejecución con **Webpack 5 Module Federation**.

📖 Guía y simulador de referencia: https://estaticos.codecrypto.academy/directosmiseia/microfrontends.html#sim
(sección «Caso de uso para el directo: tienda con Home, Catálogo y Carrito», `#caso`)

Repositorio: https://gitlab.codecrypto.academy/jviejo/micro-frontend-module-federation (internal)

## Arquitectura

| Proyecto | Capa | Puerto | Responsabilidad | Datos |
|---|---|---|---|---|
| `apps/shell` | Frontend (host) | 3000 (`PORT`) | Layout, router, header con contador, error boundaries, inicio de `cartStore` | — |
| `apps/home` | Frontend (remote `./Home`) | 3001 | Banners y productos destacados | content-api, catalog-api |
| `apps/catalog` | Frontend (remote `./Catalog`) | 3002 | Tabla de productos y filtro por categoría | catalog-api |
| `apps/cart` | Frontend (remotes `./Cart`, `./cartStore`) | 3003 | Tabla del carrito, vaciar, checkout | cart-api |
| `packages/contracts` | Librería | — | Eventos tipados + `emit` / `on` | — |
| `services/catalog-api` | Backend | 4001 | `GET /api/products`, `GET /api/products/:sku` | `shop_catalog.products` |
| `services/cart-api` | Backend | 4002 | `GET/DELETE /api/carts/:id`, `POST /api/carts/:id/items` | `shop_cart.carts` |
| `services/content-api` | Backend | 4003 | `GET /api/banners` | `shop_content.banners` |

`react`, `react-dom`, `react-router-dom` y `@shop/contracts` se comparten como **singleton**.

### Contrato de eventos (`CustomEvent` en `window`)

| Evento | Emiten | Escuchan | Payload |
|---|---|---|---|
| `cart:add-item` | catalog, home | cart (cartStore) | `{ sku, name, price, qty }` |
| `cart:updated` | cart (cartStore) | shell (contador), home | `{ count, total }` |
| `nav:go` | home | shell (router) | `{ path }` |
| `cart:checkout-started` | cart | shell | `{ total }` |

**La trampa del carrito:** si `cartStore` solo se cargara en `/carrito`, un «Añadir» desde `/catalogo` no tendría quién lo escuchara. Por eso `cart` expone un módulo sin UI (`./cartStore`) y la shell lo inicia siempre.

## Arranque

Requisitos: Node 20+ y un MongoDB sin autenticación (en esta sesión, el `mongod` local de Homebrew en `127.0.0.1:27017`; alternativa con Docker: `npm run infra:up`).

```bash
npm install
export MONGO_URL=mongodb://127.0.0.1:27017
npm run seed          # crea colecciones, índices y datos de ejemplo
npm run dev:api       # catalog-api :4001, cart-api :4002, content-api :4003
npm run dev:web       # shell :3000, home :3001, catalog :3002, cart :3003
```

Si el 3000 está ocupado (como en la sesión, con otras apps Next), cambia el puerto de la shell y el CORS de las APIs:

```bash
PORT=3010 CORS_ORIGIN=http://localhost:3010 npm run dev:api
PORT=3010 npm run dev:web      # tienda en http://localhost:3010
```

Cada remote también funciona en standalone en su puerto. Si apagas uno, la shell muestra el fallback del error boundary.

## Datos de la sesión

- **Fecha:** 2026-10-29 · Claude Code (Sonnet 5.5) · macOS, zsh.
- **Directorio de trabajo:** `~/2026/29-oct/shop-mfe`.
- **Puertos usados:** shell **3010** (el 3000 estaba ocupado por otras apps Next), remotes 3001–3003, APIs 4001–4003.
- **MongoDB:** `mongod` de Homebrew en `127.0.0.1:27017`, sin password. El contenedor Docker propio se eliminó para evitar el conflicto de puerto. Bases: `shop_catalog`, `shop_cart`, `shop_content`. Seed: 4 productos y 2 banners.
- **Cambios de diseño hechos en la sesión:**
  1. Carrito con tabla de productos (SKU, producto, precio, cantidad, subtotal, total) y botón **Checkout** (antes «Fin compra»).
  2. Catálogo en tabla (SKU, producto, categoría, precio, stock, botón Añadir).
  3. Home rediseñada: banners con degradado y tarjetas de destacados.
  4. Botón **Vaciar carrito** (`DELETE /api/carts/:id` + `clear()` en `cartStore`).
- **GitLab:** proyecto `jviejo/micro-frontend-module-federation` en `gitlab.codecrypto.academy`, visibilidad internal, rama `main`.

## Retos extra (de la guía)

1. Mini-carrito en el header sin tocar los otros remotes. 2. Apagar `catalog` y ver el fallback. 3. Subir `react` en un solo remote y observar el singleton. 4. Cambiar `price` a string y romper el contrato. 5. Añadir `cart:remove-item` sin romper a nadie. 6. Quinto remote `checkout` (con `orders-api` :4004 y base `shop_orders`).

> Las versiones y URLs de la guía son didácticas; contrasta con la documentación oficial de Module Federation (https://module-federation.io).
