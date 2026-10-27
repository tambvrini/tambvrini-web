export const STRIPE_PRODUCTS = {
  camisetaSportClub: 'price_1TCl8PJ4rLwO0r1guLpnCHo5',
  camisetaImperium: 'price_1TFNNnJ4rLwO0r1ggeZoeu4R',
  poloPatricius: 'price_1TFNUBJ4rLwO0r1g0V2ZBim1',
  poloRegius: 'price_1TFNVRJ4rLwO0r1gikHwgzHa',
  poloGolf: 'price_1TFNR5J4rLwO0r1gpn3j2oRM',
  poloAureus: 'price_1TFNPkJ4rLwO0r1gOCCiGyOW',
  sueterSylva: 'price_1TFNWPJ4rLwO0r1g6DRG5e6l',
  sueterCaptain: 'price_1TFNT5J4rLwO0r1gn9zTFGdM',
  sueterIgnatius: 'price_1TFNOtJ4rLwO0r1gnpY1exq7',
  americanaUmbra: 'price_1TFNKNJ4rLwO0r1gvinK2j39',
};

export const STRIPE_LINKS = {
  'Camiseta Imperium - Negro - S': 'https://buy.stripe.com/cNieVe3jNaKF4GM11L1Jm0g',
  'Camiseta Imperium - Negro - M': 'https://buy.stripe.com/cNi28s07B2e9a164dX1Jm0h',
  'Camiseta Imperium - Negro - L': 'https://buy.stripe.com/28E3cw2fJ3id2yEcKt1Jm0i',
  'Camiseta Imperium - Negro - XL': 'https://buy.stripe.com/3cIfZi9Ib9GBflqdOx1Jm0j',
  'Camiseta Imperium - Beige - S': 'https://buy.stripe.com/4gM14o4nRcSN8X239T1Jm0d',
  'Camiseta Imperium - Beige - M': 'https://buy.stripe.com/eVq00kg6zf0Vehm4dX1Jm0x',
  'Camiseta Imperium - Beige - L': 'https://buy.stripe.com/5kQdRaaMf5ql5KQeSB1Jm0e',
  'Camiseta Imperium - Beige - XL': 'https://buy.stripe.com/dRmbJ2aMf6up6OU11L1Jm0f',
  'Camiseta Sport Club - S': 'https://buy.stripe.com/7sYdRacUn5ql8X25i11Jm0a',
  'Camiseta Sport Club - M': 'https://buy.stripe.com/8x27sM7A34mh5KQbGp1Jm00',
  'Camiseta Sport Club - L': 'https://buy.stripe.com/fZu14obQjg4Z8X27q91Jm0b',
  'Camiseta Sport Club - XL': 'https://buy.stripe.com/9B6cN65rV3id7SYcKt1Jm0c',
  'Suéter Sylva - S': 'https://buy.stripe.com/28EeVe07BcSNc9eeSB1Jm09',
  'Suéter Sylva - M': 'https://buy.stripe.com/4gM6oI8E74mhb5abGp1Jm0t',
  'Suéter Sylva - L': 'https://buy.stripe.com/cNi28sbQj7yt5KQ39T1Jm0u',
  'Suéter Sylva - XL': 'https://buy.stripe.com/28E14o5rVdWR2yEdOx1Jm0v',
  'Suéter Captain - S': 'https://buy.stripe.com/bJe8wQ2fJ8CxgpubGp1Jm0n',
  'Suéter Captain - M': 'https://buy.stripe.com/cNi28sbQj5ql6OU6m51Jm0o',
  'Suéter Captain - L': 'https://buy.stripe.com/6oUeVef2vcSNgpu6m51Jm06',
  'Suéter Captain - XL': 'https://buy.stripe.com/5kQeVe7A3cSNflqcKt1Jm0p',
  'Polo Golf - S': 'https://buy.stripe.com/14A3cwbQjdWRb5a11L1Jm0w',
  'Polo Golf - M': 'https://buy.stripe.com/6oU00kf2v3idddi7q91Jm0k',
  'Polo Golf - L': 'https://buy.stripe.com/dRm8wQ2fJ1a5a16bGp1Jm0l',
  'Polo Golf - XL': 'https://buy.stripe.com/28EbJ2cUn061a166m51Jm0m',
  'Polo Patricius - S': 'https://buy.stripe.com/9B67sM8E7dWRa168ud1Jm0z',
  'Polo Patricius - M': 'https://buy.stripe.com/6oUeVe5rVf0V4GM11L1Jm0q',
  'Polo Patricius - L': 'https://buy.stripe.com/9B66oIf2v1a52yEh0J1Jm0r',
  'Polo Patricius - XL': 'https://buy.stripe.com/aFadRabQj7yt6OU11L1Jm0s',
  'Polo Regius': 'https://buy.stripe.com/3cIdRa5rV5qlehmfWF1Jm08',
  'Suéter Ignatius': 'https://buy.stripe.com/14A14o6vZcSNflq39T1Jm03',
  'Americana Umbra': 'https://buy.stripe.com/3cI00kf2vf0V1uA9yh1Jm01',
  'Polo Aureus - M': 'https://buy.stripe.com/7sY14o2fJ4mh7SY39T1Jm04',
};

const STRIPE_PRODUCT_NAME_ALIASES = {
  'Americana UMBRA': 'Americana Umbra',
};

const normalizeStripeProductName = (productName) => STRIPE_PRODUCT_NAME_ALIASES[productName] || productName;

export function getStripeLink(productName, size, color) {
  const normalizedProductName = normalizeStripeProductName(productName);

  if (normalizedProductName === 'Camiseta Imperium') {
    if (!color || !size) return null;
    return STRIPE_LINKS[`${normalizedProductName} - ${color} - ${size}`] || null;
  }

  if (size && STRIPE_LINKS[`${normalizedProductName} - ${size}`]) {
    return STRIPE_LINKS[`${normalizedProductName} - ${size}`];
  }

  return STRIPE_LINKS[normalizedProductName] || null;
}

export const STRIPE_PAYMENT_LINKS = {
  camisetaSportClub: 'https://buy.stripe.com/8x27sM7A34mh5KQbGp1Jm00',
  americanaUmbra: 'https://buy.stripe.com/3cI00kf2vf0V1uA9yh1Jm01',
  camisetaImperium: 'https://buy.stripe.com/cNibJ28E73id4GMcKt1Jm02',
  sueterIgnatius: 'https://buy.stripe.com/14A14o6vZcSNflq39T1Jm03',
  poloAureus: 'https://buy.stripe.com/7sY14o2fJ4mh7SY39T1Jm04',
  poloGolf: 'https://buy.stripe.com/eVq7sM5rVdWRb5ah0J1Jm05',
  sueterCaptain: 'https://buy.stripe.com/6oUeVef2vcSNgpu6m51Jm06',
  poloPatricius: 'https://buy.stripe.com/eVq00kbQj2e9flq25P1Jm07',
  poloRegius: 'https://buy.stripe.com/3cIdRa5rV5qlehmfWF1Jm08',
  sueterSylva: 'https://buy.stripe.com/28EeVe07BcSNc9eeSB1Jm09',
};
