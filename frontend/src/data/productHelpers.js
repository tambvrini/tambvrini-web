/**
 * Client-side product helpers that replicate the backend query logic
 * so the shop pages can read ONLY from the local data file.
 */
import products from "./products";

/**
 * Return a single product by its product_id, plus up to 4 related products
 * that share at least one category.
 */
export function getProductById(productId) {
  const product = products.find((p) => p.product_id === productId);
  if (!product) return null;

  const related = products
    .filter(
      (p) =>
        p.product_id !== productId &&
        product.category?.length > 0 &&
        p.category?.length > 0 &&
        p.category.some((c) => product.category.includes(c))
    )
    .slice(0, 4);

  return { ...product, related_products: related };
}

/**
 * Query products with the same filter / sort / pagination parameters
 * the backend used to accept.
 */
export function queryProducts({
  category,
  gender,
  collection,
  search,
  sort,
  is_new,
  page = 1,
  limit = 20,
} = {}) {
  let filtered = [...products];
  const isNovedadesCategory = category === "novedades";

  // Category filters (mirrors backend logic)
  if (category) {
    if (isNovedadesCategory) {
      const hasCreationDates = filtered.every(
        (p) => p.created_at && !Number.isNaN(new Date(p.created_at).getTime())
      );
      if (hasCreationDates) {
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    } else if (category === "2026") {
      filtered = filtered.filter((p) =>
        ["camiseta-sport-club", "polo-golf", "sueter-captain"].includes(
          p.product_id
        )
      );
    } else if (category === "sueteres") {
      filtered = filtered.filter((p) => p.category?.includes("knitwear"));
    } else if (category === "polos") {
      filtered = filtered.filter((p) => p.category?.includes("polos"));
    } else {
      filtered = filtered.filter((p) => p.category?.includes(category));
    }
  }

  if (gender) {
    filtered = filtered.filter(
      (p) => p.gender === gender || p.gender === "unisex"
    );
  }

  if (collection) {
    filtered = filtered.filter((p) => p.collections?.includes(collection));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  if (is_new && !isNovedadesCategory) {
    filtered = filtered.filter((p) => p.is_new);
  }

  // Sort
  if (sort === "price_asc") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sort === "price_desc") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sort === "name") {
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }
  // default: keep original order (newest / created_at desc equivalent)

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;
  const paged = filtered.slice(skip, skip + limit);

  return { products: paged, total, page, pages };
}
