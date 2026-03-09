import products from './products';
import { queryProducts } from './productHelpers';

describe('queryProducts', () => {
  it('returns all products for novedades category', () => {
    const result = queryProducts({ category: 'novedades', limit: 100 });

    expect(result.total).toBe(products.length);
    expect(result.products).toHaveLength(products.length);
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
});
