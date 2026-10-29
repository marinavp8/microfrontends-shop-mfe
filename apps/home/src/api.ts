export const getBanners = () => fetch('http://localhost:4003/api/banners').then((r) => r.json());
export const getFeatured = () => fetch('http://localhost:4001/api/products?featured=true').then((r) => r.json());
