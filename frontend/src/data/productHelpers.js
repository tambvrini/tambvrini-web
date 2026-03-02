import products from './products';

// Universal safe source — handles both array and object exports
const productList = Array.isArray(products)
  ? products
  : Object.values(products || {});

if (process.env.NODE_ENV === 'development') {
  console.log("PRODUCT COUNT:", productList.length);
}

/**
 * Query products with optional filters.
 * If filters produce empty results, fallback to returning all products.
 */
export function queryProducts(filters = {}) {
  let results = [...productList];

  if (filters.category) {
    results = results.filter((p) => {
      const cats = Array.isArray(p.category) ? p.category : [];
      return cats.includes(filters.category);
    });
  }

  if (filters.gender) {
    results = results.filter(
      (p) => p.gender === filters.gender || p.gender === 'unisex'
    );
  }

  if (filters.collection) {
    results = results.filter((p) => {
      const cols = Array.isArray(p.collections) ? p.collections : [];
      return cols.includes(filters.collection);
    });
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
    );
  }

  if (filters.is_new) {
    results = results.filter((p) => p.is_new === true);
  }

  if (filters.is_featured) {
    results = results.filter((p) => p.is_featured === true);
  }

  // Fallback: if filters produce empty results, return all products
  if (!results.length) {
    return productList;
  }

  return results;
}

/**
 * Get a single product by its product_id.
 */
export function getProductById(productId) {
  return productList.find((p) => p.product_id === productId);
}

/**
 * Get all products (unfiltered).
 */
export function getAllProducts() {
  return productList;
}
