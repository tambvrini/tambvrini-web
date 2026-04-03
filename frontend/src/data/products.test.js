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

  it('loads the Suéter Captain gallery images in order', () => {
    const captain = products.find((product) => product.product_id === 'sueter-captain');

    expect(captain).toBeDefined();
    expect(captain.images).toEqual([
      '/products/sueter-captain/sueter-captain-look-01.jpg',
      '/products/sueter-captain/sueter-captain-look-02.jpg',
      '/products/sueter-captain/sueter-captain-look-03.jpg',
      '/products/sueter-captain/sueter-captain-look-04.jpg',
      '/products/sueter-captain/sueter-captain-look-05.jpg',
    ]);
  });

  it('loads the Suéter Sylva gallery images in order', () => {
    const sylva = products.find((product) => product.product_id === 'sueter-sylva');

    expect(sylva).toBeDefined();
    expect(sylva.images).toEqual([
      '/products/sueter-sylva/sueter-sylva-look-01.jpg',
      '/products/sueter-sylva/sueter-sylva-look-02.jpg',
      '/products/sueter-sylva/sueter-sylva-look-03.jpg',
      '/products/sueter-sylva/sueter-sylva-look-04.jpg',
      '/products/sueter-sylva/sueter-sylva-look-05.jpg',
      '/products/sueter-sylva/sueter-sylva-look-07.jpg',
      '/products/sueter-sylva/sueter-sylva-look-08.jpg',
    ]);
  });

  it('loads the Polo Patricius gallery images in order', () => {
    const patricius = products.find((product) => product.product_id === 'polo-patricius');

    expect(patricius).toBeDefined();
    expect(patricius.images).toEqual([
      '/products/polo-patricius/polo-patricius-look-01.jpg',
      '/products/polo-patricius/polo-patricius-look-02.jpg',
      '/products/polo-patricius/polo-patricius-look-03.jpg',
      '/products/polo-patricius/polo-patricius-look-04.jpg',
      '/products/polo-patricius/polo-patricius-look-05.jpg',
      '/products/polo-patricius/polo-patricius-look-06.jpg',
      '/products/polo-patricius/polo-patricius-look-07.jpg',
    ]);
  });

  it('loads the Polo Regius gallery images in order', () => {
    const regius = products.find((product) => product.product_id === 'polo-regius');

    expect(regius).toBeDefined();
    expect(regius.images).toEqual([
      '/products/polo-regius/polo-regius-look-01.jpg',
      '/products/polo-regius/polo-regius-look-02.jpg',
      '/products/polo-regius/polo-regius-look-03.jpg',
      '/products/polo-regius/polo-regius-look-04.jpg',
      '/products/polo-regius/polo-regius-look-05.jpg',
      '/products/polo-regius/polo-regius-look-06.jpg',
    ]);
  });

  it('includes stripe price ids for each product', () => {
    products.forEach((product) => {
      expect(product.stripePriceId).toBe(product.stripe_price_id);
      expect(product.stripePriceId).toEqual(expect.stringMatching(/^price_/));
      expect(product.stripe_price_id).toEqual(expect.stringMatching(/^price_/));
    });
  });
});
