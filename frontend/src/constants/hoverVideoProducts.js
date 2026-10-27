export const HOVER_VIDEO_PRODUCT_IDS = new Set([
  // Products with dedicated hover-video assets in ProductCard.
  'traje-monograma-tambvrini',
  'polo-aureus',
  'bolso-monograma-tambvrini',
  'camiseta-sport-club',
  'polo-golf',
  'camiseta-imperium',
  'americana-umbra',
  'sueter-captain',
]);

export const supportsHoverVideo = (productId) => HOVER_VIDEO_PRODUCT_IDS.has(productId);
