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
      { product_id: 'polo-golf', stripePriceId: 'price_polo_golf', quantity: 2 },
      { product_id: 'polo-regius', stripePriceId: 'price_polo_regius', quantity: 1 },
      { product_id: 'invalid-1', quantity: 0 },
      { product_id: 'invalid-2', quantity: -1 },
    ]);

    expect(payload).toEqual([
      {
        price: 'price_polo_golf',
        quantity: 2,
      },
      {
        price: 'price_polo_regius',
        quantity: 1,
      },
    ]);
  });

  it('throws when an item has no stripe price id', () => {
    const { mapCartItemsToLineItems } = require('./stripeCheckout');
    expect(() => mapCartItemsToLineItems([
      { product_id: 'missing-price-id', quantity: 1 },
    ])).toThrow('Missing Stripe price ID for missing-price-id');
  });

  it('throws when an item has an invalid price for shipping calculation', async () => {
    const { redirectToStripeCheckout } = require('./stripeCheckout');

    await expect(redirectToStripeCheckout({
      items: [{ product_id: 'polo-golf', stripePriceId: 'price_polo_golf', quantity: 1 }],
    })).rejects.toThrow('Invalid product price for polo-golf');
  });

  it('redirects to Stripe checkout with paid shipping below the free-shipping threshold', async () => {
    const { redirectToStripeCheckout } = require('./stripeCheckout');
    redirectToCheckout.mockResolvedValue({});

    await redirectToStripeCheckout({
      items: [{ product_id: 'polo-golf', price: 30, stripePriceId: 'price_polo_golf', quantity: 1 }],
    });

    expect(redirectToCheckout).toHaveBeenCalledWith({
      lineItems: [{
        price: 'price_polo_golf',
        quantity: 1,
      }],
      mode: 'payment',
      successUrl: `${window.location.origin}/checkout-success`,
      cancelUrl: `${window.location.origin}/carrito`,
      billingAddressCollection: 'required',
      shippingAddressCollection: {
        allowedCountries: ['ES', 'FR', 'IT', 'DE'],
      },
      shippingOptions: [
        {
          shippingRateData: {
            type: 'fixed_amount',
            fixedAmount: {
              amount: 500,
              currency: 'eur',
            },
            displayName: 'Envío estándar',
            deliveryEstimate: {
              minimum: { unit: 'business_day', value: 2 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      automaticTax: { enabled: true },
    });
  });

  it('redirects to Stripe checkout with free shipping at the free-shipping threshold', async () => {
    const { redirectToStripeCheckout } = require('./stripeCheckout');
    redirectToCheckout.mockResolvedValue({});

    await redirectToStripeCheckout({
      items: [{ product_id: 'polo-regius', price: 75, stripePriceId: 'price_polo_regius', quantity: 1 }],
    });

    expect(redirectToCheckout).toHaveBeenCalledWith({
      lineItems: [{
        price: 'price_polo_regius',
        quantity: 1,
      }],
      mode: 'payment',
      successUrl: `${window.location.origin}/checkout-success`,
      cancelUrl: `${window.location.origin}/carrito`,
      billingAddressCollection: 'required',
      shippingAddressCollection: {
        allowedCountries: ['ES', 'FR', 'IT', 'DE'],
      },
      shippingOptions: [
        {
          shippingRateData: {
            type: 'fixed_amount',
            fixedAmount: {
              amount: 0,
              currency: 'eur',
            },
            displayName: 'Envío gratuito',
          },
        },
      ],
      automaticTax: { enabled: true },
    });
  });
});
