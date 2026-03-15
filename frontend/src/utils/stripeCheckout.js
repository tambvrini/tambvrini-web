import { loadStripe } from '@stripe/stripe-js';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
let stripePromise;

export const getStripePublicKey = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_KEY;
  if (!key) {
    throw new Error('Missing Stripe public key: set NEXT_PUBLIC_STRIPE_KEY');
  }
  return key;
};

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(getStripePublicKey());
  }
  return stripePromise;
};

export const mapCartItemsToCheckoutItems = (items = []) => (
  items
    .filter((item) => item && item.quantity > 0)
    .map((item) => ({
      name: item.name,
      price: Math.round(Number(item.price || 0) * 100),
      quantity: item.quantity,
      slug: item.slug || item.product_id,
      ...(item.image ? { image: item.image } : {}),
    }))
);

export const redirectToStripeCheckout = async ({ items, headers = {} }) => {
  const checkoutItems = mapCartItemsToCheckoutItems(items);
  if (checkoutItems.length === 0) return;

  const response = await fetch(`${API}/create-checkout-session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ items: checkoutItems }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Checkout session request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const sessionId = data?.sessionId;
  if (!sessionId) {
    throw new Error('No session id returned from checkout session endpoint');
  }

  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Stripe.js could not be initialized');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
};
