const MULTI_ITEM_CHECKOUT_MESSAGE = 'Compra múltiple en preparación. Por favor, compra productos individualmente.';

export const getSingleItemPaymentLink = (item) => {
  if (!item?.stripePaymentLink) {
    throw new Error(`Missing Stripe payment link for ${item?.product_id || 'product'}`);
  }

  return item.stripePaymentLink;
};

export const getCartCheckoutState = (items = []) => {
  const checkoutItems = items.filter((item) => item && item.quantity > 0);

  if (checkoutItems.length === 0) {
    return { type: 'empty' };
  }

  if (checkoutItems.length > 1) {
    return { type: 'multi', message: MULTI_ITEM_CHECKOUT_MESSAGE };
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
