import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY =
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const CHECKOUT_PENDING_STORAGE_KEY = 'stripe_checkout_pending';
const CHECKOUT_PENDING_VALUE = 'true';
const FREE_SHIPPING_THRESHOLD_CENTS = 7500;

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export const mapCartItemsToLineItems = (items = []) => (
  items
    .filter((item) => item && item.quantity > 0)
    .map((item) => {
      if (!item.name) {
        throw new Error(`Missing product name for ${item.product_id || 'product'}`);
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        throw new Error(`Invalid product price for ${item.product_id || item.name || 'product'}`);
      }

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    })
);

export const redirectToStripeCheckout = async ({ items }) => {
  const lineItems = mapCartItemsToLineItems(items);
  let shippingOptions = [];
  if (lineItems.length === 0) return;
  const totalAmount = lineItems.reduce(
    (sum, item) => sum + (item.price_data.unit_amount * item.quantity),
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
