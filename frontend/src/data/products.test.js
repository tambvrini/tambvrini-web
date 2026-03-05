import products from './products';

describe('products data', () => {
  it('removes the duplicate sleeve detail image from Traje Monograma Tambvrini', () => {
    const traje = products.find((product) => product.product_id === 'traje-monograma-tambvrini');

    expect(traje).toBeDefined();
    expect(traje.images).toHaveLength(6);
    expect(traje.images.find((image) => image.includes('%20%282%29'))).toBeUndefined();
    expect(traje.thumbnail_image).toBeDefined();
    expect(traje.thumbnail_image.includes('%20%282%29')).toBe(false);
  });
});
