import { loadStripe } from '@stripe/stripe-js';
import { getStripePublicKey, mapCartItemsToCheckoutItems, redirectToStripeCheckout } from './stripeCheckout';

jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

describe('stripeCheckout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_STRIPE_KEY = 'pk_test_123';
  });

  it('maps cart items to checkout payload with product data and optional attributes', () => {
    const payload = mapCartItemsToCheckoutItems([
      { product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 2, image: '/img-1.jpg', size: 'M', color: 'navy' },
      { product_id: 'polo-regius', name: 'Polo Regius', price: 20.5, quantity: 1 },
      { name: 'Invalid', price: 10, quantity: 0 },
      { name: 'Invalid 2', price: 10, quantity: -1 },
    ]);

    expect(payload).toEqual([
      { product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 2, image: '/img-1.jpg', size: 'M', color: 'navy' },
      { product_id: 'polo-regius', name: 'Polo Regius', price: 20.5, quantity: 1 },
    ]);
  });

  it('throws when an item has an invalid price', () => {
    expect(() => mapCartItemsToCheckoutItems([
      { product_id: 'polo-golf', name: 'Polo Golf', price: 'invalid', quantity: 1 },
    ])).toThrow('Invalid cart item price for polo-golf');
  });

  it('throws when Stripe public key is missing', () => {
    const originalNextKey = process.env.NEXT_PUBLIC_STRIPE_KEY;

    delete process.env.NEXT_PUBLIC_STRIPE_KEY;

    expect(() => getStripePublicKey()).toThrow(
      'Missing Stripe public key: set NEXT_PUBLIC_STRIPE_KEY'
    );

    if (typeof originalNextKey === 'undefined') {
      delete process.env.NEXT_PUBLIC_STRIPE_KEY;
    } else {
      process.env.NEXT_PUBLIC_STRIPE_KEY = originalNextKey;
    }
  });

  it('posts items and redirects to Stripe Checkout using returned session id', async () => {
    const redirectToCheckout = jest.fn().mockResolvedValue({});
    loadStripe.mockResolvedValue({ redirectToCheckout });
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ session_id: 'cs_test_123' }),
    });

    await redirectToStripeCheckout({
      items: [{ product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 1, image: '/img.jpg', size: 'M', color: 'navy' }],
      headers: { Authorization: 'Bearer token' },
    });

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_BACKEND_URL}/api/checkout/create-session`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({
          items: [{ product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 1, size: 'M', color: 'navy', image: '/img.jpg' }],
          origin_url: window.location.origin,
        }),
      }
    );
    expect(redirectToCheckout).toHaveBeenCalledWith({ sessionId: 'cs_test_123' });
  });
});
