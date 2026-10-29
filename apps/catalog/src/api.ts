export const getProducts = (category?: string) =>
  fetch('http://localhost:4001/api/products' + (category ? '?category=' + encodeURIComponent(category) : ''))
    .then((r) => r.json());
