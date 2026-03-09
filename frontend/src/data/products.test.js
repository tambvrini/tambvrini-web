import products from './products';

describe('products data', () => {
  it('removes the duplicate sleeve detail image from Traje Monograma Tambvrini', () => {
    const traje = products.find((product) => product.product_id === 'traje-monograma-tambvrini');

    expect(traje).toBeDefined();
    expect(traje.images).toHaveLength(6);
    expect(traje.images.find((image) => image.includes('%20%282%29'))).toBeUndefined();
    expect(traje.images[traje.images.length - 1]).toBe(
      '/products/traje-monograma-tambvrini/traje-monograma-tambvrini (1).jpg'
    );
    expect(traje.thumbnail_image).toBeDefined();
    expect(traje.thumbnail_image.includes('%20%282%29')).toBe(false);
  });

  it('loads the Polo Aureus gallery images in order', () => {
    const polo = products.find((product) => product.product_id === 'polo-aureus');

    expect(polo).toBeDefined();
    expect(polo.images).toEqual([
      '/products/polo-aureus/polo-aureus-look-01.jpg',
      '/products/polo-aureus/polo-aureus-look-02.jpg',
      '/products/polo-aureus/polo-aureus-look-03.jpg',
      '/products/polo-aureus/polo-aureus-look-04.jpg',
      '/products/polo-aureus/polo-aureus-look-05.jpg',
      '/products/polo-aureus/polo-aureus-look-06.jpg',
    ]);
  });
});
