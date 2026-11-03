describe('stripeCheckout', () => {
  it('returns an empty checkout state when the cart has no purchasable items', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');

    expect(getCartCheckoutState([])).toEqual({ type: 'empty' });
    expect(getCartCheckoutState([{ product_id: 'empty', quantity: 0 }])).toEqual({ type: 'empty' });
  });

  it('returns a direct payment-link checkout state for single-product carts', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');

    expect(getCartCheckoutState([
      {
        product_id: 'test-product',
        stripePaymentLink: 'https://buy.stripe.com/polo-golf',
        quantity: 1,
      },
    ])).toEqual({
      type: 'single',
      url: 'https://buy.stripe.com/polo-golf',
    });
  });

  it('returns the temporary fallback message for multi-product carts', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');

    expect(getCartCheckoutState([
      {
        product_id: 'polo-golf',
        stripePaymentLink: 'https://buy.stripe.com/polo-golf',
        quantity: 1,
      },
      {
        product_id: 'polo-regius',
        stripePaymentLink: 'https://buy.stripe.com/polo-regius',
        quantity: 1,
      },
    ])).toEqual({
      type: 'multi',
      message: 'Compra múltiple en preparación. Por favor, compra productos individualmente.',
    });
  });

  it('throws when a single cart item has no payment link', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');

    expect(() => getCartCheckoutState([
      { product_id: 'missing-link', quantity: 1 },
    ])).toThrow('Missing Stripe payment link for missing-link');
  });

  it('navigates to the payment link for single-product carts', async () => {
    const { processCartCheckout } = require('./stripeCheckout');
    const navigate = jest.fn();

    await expect(processCartCheckout({
      items: [{
        product_id: 'test-product',
        stripePaymentLink: 'https://buy.stripe.com/polo-golf',
        quantity: 1,
      }],
      navigate,
    })).resolves.toEqual({
      type: 'single',
      url: 'https://buy.stripe.com/polo-golf',
    });

    expect(navigate).toHaveBeenCalledWith('https://buy.stripe.com/polo-golf');
  });

  it('does not navigate for multi-product carts', async () => {
    const { processCartCheckout } = require('./stripeCheckout');
    const navigate = jest.fn();

    await expect(processCartCheckout({
      items: [
        {
          product_id: 'polo-golf',
          stripePaymentLink: 'https://buy.stripe.com/polo-golf',
          quantity: 1,
        },
        {
          product_id: 'polo-regius',
          stripePaymentLink: 'https://buy.stripe.com/polo-regius',
          quantity: 1,
        },
      ],
      navigate,
    })).resolves.toEqual({
      type: 'multi',
      message: 'Compra múltiple en preparación. Por favor, compra productos individualmente.',
    });

    expect(navigate).not.toHaveBeenCalled();
  });

  it('blocks checkout for a product that is now sold out, even from an old cart', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');

    expect(getCartCheckoutState([
      {
        product_id: 'americana-umbra',
        stripePaymentLink: 'https://buy.stripe.com/old-link',
        quantity: 1,
      },
    ])).toEqual({
      type: 'sold_out',
      message: 'Americana UMBRA está agotado.',
    });
  });

  it('uses the current catalogue payment link over the one saved in the cart', () => {
    const { getCartCheckoutState } = require('./stripeCheckout');
    const products = require('../data/products').default;
    const poloGolf = products.find((p) => p.product_id === 'polo-golf');

    expect(getCartCheckoutState([
      {
        product_id: 'polo-golf',
        stripePaymentLink: 'https://buy.stripe.com/old-link',
        quantity: 1,
      },
    ])).toEqual({ type: 'single', url: poloGolf.stripePaymentLink });
  });
});
