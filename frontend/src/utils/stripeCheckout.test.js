jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(),
}));

describe('stripeCheckout', () => {
  const redirectToCheckout = jest.fn();
  let loadStripe;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY = 'pk_test_tambvrini';
    ({ loadStripe } = require('@stripe/stripe-js'));
    loadStripe.mockResolvedValue({ redirectToCheckout });
  });

  it('maps cart items to stripe line items', () => {
    const { mapCartItemsToLineItems } = require('./stripeCheckout');
    const payload = mapCartItemsToLineItems([
      { product_id: 'polo-golf', stripe_price_id: 'price_polo_golf', quantity: 2 },
      { product_id: 'polo-regius', stripe_price_id: 'price_polo_regius', quantity: 1 },
      { product_id: 'invalid-1', stripe_price_id: 'price_invalid_1', quantity: 0 },
      { product_id: 'invalid-2', stripe_price_id: 'price_invalid_2', quantity: -1 },
    ]);

    expect(payload).toEqual([
      { price: 'price_polo_golf', quantity: 2 },
      { price: 'price_polo_regius', quantity: 1 },
    ]);
  });

  it('throws when an item has no stripe_price_id', () => {
    const { mapCartItemsToLineItems } = require('./stripeCheckout');
    expect(() => mapCartItemsToLineItems([
      { product_id: 'missing-price-id', quantity: 1 },
    ])).toThrow('Missing stripe_price_id for missing-price-id');
  });

  it('redirects to Stripe checkout with lineItems', async () => {
    const { redirectToStripeCheckout } = require('./stripeCheckout');
    redirectToCheckout.mockResolvedValue({});

    await redirectToStripeCheckout({
      items: [{ product_id: 'polo-golf', stripe_price_id: 'price_polo_golf', quantity: 1 }],
    });

    expect(redirectToCheckout).toHaveBeenCalledWith({
      lineItems: [{ price: 'price_polo_golf', quantity: 1 }],
      mode: 'payment',
      successUrl: `${window.location.origin}/checkout-success`,
      cancelUrl: `${window.location.origin}/carrito`,
    });
  });
});
