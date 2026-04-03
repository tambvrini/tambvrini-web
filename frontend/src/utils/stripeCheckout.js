import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PRODUCTS } from '../constants/stripeProducts';

const STRIPE_PUBLISHABLE_KEY =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const CHECKOUT_PENDING_STORAGE_KEY = 'stripe_checkout_pending';
const CHECKOUT_PENDING_VALUE = 'true';
const FREE_SHIPPING_THRESHOLD_CENTS = 7500;
const HAS_CONFIGURED_STRIPE_PRODUCTS = Object.keys(STRIPE_PRODUCTS).length > 0;

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export const mapCartItemsToLineItems = (items = []) => (
  items
    .filter((item) => item && item.quantity > 0)
    .map((item) => {
      if (!item.stripePriceId) {
        throw new Error(
          HAS_CONFIGURED_STRIPE_PRODUCTS
            ? `Missing Stripe price ID for ${item.product_id || 'product'}`
            : 'Stripe products are not configured'
        );
      }

      return {
        price: item.stripePriceId,
        quantity: item.quantity,
      };
    })
);

export const redirectToStripeCheckout = async ({ items }) => {
  const lineItems = mapCartItemsToLineItems(items);
  if (lineItems.length === 0) return;
  let shippingOptions = [];
  const totalAmount = items.reduce(
    (sum, item) => sum + (Math.round(item.price * 100) * item.quantity),
    0
  );
  if (!stripePromise) {
    throw new Error('Stripe publishable key is not configured');
  }

  if (totalAmount >= FREE_SHIPPING_THRESHOLD_CENTS) {
    shippingOptions = [
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
    ];
  } else {
    shippingOptions = [
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
    ];
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
    billingAddressCollection: 'required',
    shippingAddressCollection: {
      allowedCountries: ['ES', 'FR', 'IT', 'DE'],
    },
    shippingOptions,
    automaticTax: { enabled: true },
  });

  if (error) {
    throw new Error(error.message || 'Stripe checkout redirection failed');
  }
};
