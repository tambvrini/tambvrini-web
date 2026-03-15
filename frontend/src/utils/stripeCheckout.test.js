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

  it('maps cart items to checkout payload with cents and optional image', () => {
    const payload = mapCartItemsToCheckoutItems([
      { name: 'Polo Golf', price: 30, quantity: 2, image: '/img-1.jpg' },
      { name: 'Polo Regius', price: 20.5, quantity: 1 },
      { name: 'Invalid', price: 10, quantity: 0 },
      { name: 'Invalid 2', price: 10, quantity: -1 },
    ]);

    expect(payload).toEqual([
      { name: 'Polo Golf', price: 3000, quantity: 2, image: '/img-1.jpg' },
      { name: 'Polo Regius', price: 2050, quantity: 1 },
    ]);
  });

  it('throws when Stripe public key is missing', () => {
    const originalNextKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
    const originalReactKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

    delete process.env.NEXT_PUBLIC_STRIPE_KEY;
    delete process.env.REACT_APP_STRIPE_PUBLIC_KEY;

    expect(() => getStripePublicKey()).toThrow(
      'Missing Stripe public key: set NEXT_PUBLIC_STRIPE_KEY or REACT_APP_STRIPE_PUBLIC_KEY'
    );

    if (typeof originalNextKey === 'undefined') {
      delete process.env.NEXT_PUBLIC_STRIPE_KEY;
    } else {
      process.env.NEXT_PUBLIC_STRIPE_KEY = originalNextKey;
    }
    if (typeof originalReactKey === 'undefined') {
      delete process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    } else {
      process.env.REACT_APP_STRIPE_PUBLIC_KEY = originalReactKey;
    }
  });

  it('posts items and redirects to Stripe Checkout using returned session id', async () => {
    const redirectToCheckout = jest.fn().mockResolvedValue({});
    loadStripe.mockResolvedValue({ redirectToCheckout });
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ sessionId: 'cs_test_123' }),
    });

    await redirectToStripeCheckout({
      items: [{ name: 'Polo Golf', price: 30, quantity: 1, image: '/img.jpg' }],
      headers: { Authorization: 'Bearer token' },
    });

    expect(fetch).toHaveBeenCalledWith(
      `${process.env.REACT_APP_BACKEND_URL}/api/create-checkout-session`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({ items: [{ name: 'Polo Golf', price: 3000, quantity: 1, image: '/img.jpg' }] }),
      }
    );
    expect(redirectToCheckout).toHaveBeenCalledWith({ sessionId: 'cs_test_123' });
  });
});
