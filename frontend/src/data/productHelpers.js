import products from './products';

const productList = Array.isArray(products)
  ? products
  : Object.values(products);

export function getAllProducts() {
  return productList;
}

export function getProductById(id) {
  return productList.find((p) => p.product_id === id) || null;
}

export function getProductImages(id) {
  const product = getProductById(id);
  return product ? product.images : [];
}

export function filterProducts(fn) {
  return productList.filter(fn);
}

export { productList };
export default productList;
