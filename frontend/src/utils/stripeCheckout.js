const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const mapCartItemsToCheckoutItems = (items = []) => (
  items
    .filter((item) => item && item.quantity > 0)
    .map((item) => {
      const price = Number(item.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`Invalid cart item price for ${item.product_id || item.name}`);
      }
      return {
        product_id: item.product_id,
        name: item.name,
        price,
        quantity: item.quantity,
        ...(item.size ? { size: item.size } : {}),
        ...(item.color ? { color: item.color } : {}),
        ...(item.image ? { image: item.image } : {}),
      };
    })
);

export const redirectToStripeCheckout = async ({ items, headers = {} }) => {
  const checkoutItems = mapCartItemsToCheckoutItems(items);
  if (checkoutItems.length === 0) return;

  const response = await fetch(`${API}/checkout/create-session`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      items: checkoutItems,
      origin_url: window.location.origin,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Checkout session request failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const checkoutUrl = data?.url;
  if (!checkoutUrl) {
    throw new Error('No checkout url returned from checkout session endpoint');
  }
  window.location.href = checkoutUrl;
};
