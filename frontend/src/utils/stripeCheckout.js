import { loadStripe } from '@stripe/stripe-js';
import products from '../data/products';

const STRIPE_PUBLISHABLE_KEY =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const CHECKOUT_PENDING_STORAGE_KEY = 'stripe_checkout_pending';
const CHECKOUT_PENDING_VALUE = 'true';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const priceIdByProductId = products.reduce((acc, product) => {
  if (product?.product_id && product?.stripe_price_id) {
    acc[product.product_id] = product.stripe_price_id;
  }
  return acc;
}, {});

export const mapCartItemsToLineItems = (items = []) => (
  items
    .filter((item) => item && item.quantity > 0)
    .map((item) => {
      // Keep product lookup fallback for carts persisted before stripe_price_id existed.
      const stripePriceId = item.stripe_price_id || priceIdByProductId[item.product_id];
      if (!stripePriceId) {
        throw new Error(`Missing stripe_price_id for ${item.product_id || item.name || 'product'}`);
      }
      return {
        price: stripePriceId,
        quantity: item.quantity,
      };
    })
);

export const redirectToStripeCheckout = async ({ items }) => {
  const lineItems = mapCartItemsToLineItems(items);
  if (lineItems.length === 0) return;
  if (!stripePromise) {
    throw new Error('Stripe publishable key is not configured');
  }

  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Failed to initialize Stripe');
  }

  sessionStorage.setItem(CHECKOUT_PENDING_STORAGE_KEY, CHECKOUT_PENDING_VALUE);

  const { error } = await stripe.redirectToCheckout({
    lineItems,
    mode: 'payment',
    successUrl: `${window.location.origin}/checkout-success`,
    cancelUrl: `${window.location.origin}/carrito`,
  });

  if (error) {
    throw new Error(error.message || 'Stripe checkout redirection failed');
  }
};
