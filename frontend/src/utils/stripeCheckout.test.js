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
      { product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 2 },
      { product_id: 'polo-regius', name: 'Polo Regius', price: 70.5, quantity: 1 },
      { product_id: 'invalid-1', name: 'Invalid 1', price: 99, quantity: 0 },
      { product_id: 'invalid-2', name: 'Invalid 2', price: 99, quantity: -1 },
    ]);

    expect(payload).toEqual([
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Polo Golf' },
          unit_amount: 3000,
        },
        quantity: 2,
      },
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Polo Regius' },
          unit_amount: 7050,
        },
        quantity: 1,
      },
    ]);
  });

  it('throws when an item has no name', () => {
    const { mapCartItemsToLineItems } = require('./stripeCheckout');
    expect(() => mapCartItemsToLineItems([
      { product_id: 'missing-name', price: 30, quantity: 1 },
    ])).toThrow('Missing product name for missing-name');
  });

  it('throws when an item has an invalid price', () => {
    const { mapCartItemsToLineItems } = require('./stripeCheckout');
    expect(() => mapCartItemsToLineItems([
      { product_id: 'missing-price', name: 'Missing price', quantity: 1 },
    ])).toThrow('Invalid product price for missing-price');
  });

  it('redirects to Stripe checkout with paid shipping below the free-shipping threshold', async () => {
    const { redirectToStripeCheckout } = require('./stripeCheckout');
    redirectToCheckout.mockResolvedValue({});

    await redirectToStripeCheckout({
      items: [{ product_id: 'polo-golf', name: 'Polo Golf', price: 30, quantity: 1 }],
    });

    expect(redirectToCheckout).toHaveBeenCalledWith({
      lineItems: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Polo Golf' },
          unit_amount: 3000,
        },
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
      items: [{ product_id: 'polo-regius', name: 'Polo Regius', price: 75, quantity: 1 }],
    });

    expect(redirectToCheckout).toHaveBeenCalledWith({
      lineItems: [{
        price_data: {
          currency: 'eur',
          product_data: { name: 'Polo Regius' },
          unit_amount: 7500,
        },
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
