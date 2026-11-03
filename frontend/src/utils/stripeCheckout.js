import products from '../data/products';

const MULTI_ITEM_CHECKOUT_MESSAGE = 'Compra múltiple en preparación. Por favor, compra productos individualmente.';

// The cart keeps a snapshot of each product from when it was added, so check
// the current catalogue: a product can be sold out or have a new payment link since.
const findCurrentProduct = (productId) => products.find((p) => p.product_id === productId);

export const getSingleItemPaymentLink = (item) => {
  const link = findCurrentProduct(item?.product_id)?.stripePaymentLink || item?.stripePaymentLink;

  if (!link) {
    throw new Error(`Missing Stripe payment link for ${item?.product_id || 'product'}`);
  }

  return link;
};

export const getCartCheckoutState = (items = []) => {
  const checkoutItems = items.filter((item) => item && item.quantity > 0);

  if (checkoutItems.length === 0) {
    return { type: 'empty' };
  }

  if (checkoutItems.length > 1) {
    return { type: 'multi', message: MULTI_ITEM_CHECKOUT_MESSAGE };
  }

  const current = findCurrentProduct(checkoutItems[0].product_id);
  if (current?.is_sold_out) {
    return { type: 'sold_out', message: `${current.name} está agotado.` };
  }

  return {
    type: 'single',
    url: getSingleItemPaymentLink(checkoutItems[0]),
  };
};

export const processCartCheckout = async ({ items, navigate = (url) => window.location.assign(url) }) => {
  const checkoutState = getCartCheckoutState(items);

  if (checkoutState.type !== 'single') {
    return checkoutState;
  }

  navigate(checkoutState.url);
  return checkoutState;
};
