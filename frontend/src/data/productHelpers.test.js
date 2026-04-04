import products from './products';
import { queryProducts } from './productHelpers';

describe('queryProducts', () => {
  it('returns all products for novedades category', () => {
    const result = queryProducts({ category: 'novedades', limit: 100 });
    const nonTaggedProduct = products.find((product) => !product.category?.includes('novedades'));

    expect(result.total).toBe(products.length);
    expect(result.products).toHaveLength(products.length);
    expect(nonTaggedProduct).toBeDefined();
    if (nonTaggedProduct) {
      expect(result.products.some((product) => product.product_id === nonTaggedProduct.product_id)).toBe(true);
    }
  });

  it('orders novedades by created_at desc when available', () => {
    const result = queryProducts({ category: 'novedades', limit: 100 });
    const times = result.products.map((p) => new Date(p.created_at).getTime());

    expect(times.every((time) => Number.isFinite(time))).toBe(true);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('keeps other category filters unchanged', () => {
    const result = queryProducts({ category: 'polos', limit: 100 });

    expect(result.products.length).toBeGreaterThan(0);
    expect(result.products.every((product) => product.category?.includes('polos'))).toBe(true);
  });

  it('supports the accented suéteres category alias', () => {
    const accentedResult = queryProducts({ category: 'suéteres', limit: 100 });
    const plainResult = queryProducts({ category: 'sueteres', limit: 100 });

    expect(accentedResult.total).toBe(plainResult.total);
    expect(accentedResult.products.map((product) => product.product_id)).toEqual(
      plainResult.products.map((product) => product.product_id),
    );
  });

  it('maps marroquineria filter to accesorios without removing products', () => {
    const accesoriosResult = queryProducts({ category: 'accesorios', limit: 100 });
    const marroquineriaResult = queryProducts({ category: 'marroquineria', limit: 100 });

    expect(marroquineriaResult.total).toBe(accesoriosResult.total);
    expect(marroquineriaResult.products.map((product) => product.product_id)).toEqual(
      accesoriosResult.products.map((product) => product.product_id),
    );
  });

  it('returns only the dedicated Sport Club products for the sport-club category', () => {
    const result = queryProducts({ category: 'sport-club', limit: 100 });

    expect(result.products.map((product) => product.product_id)).toEqual([
      'camiseta-sport-club',
      'polo-golf',
    ]);
    expect(result.total).toBe(2);
  });
});
