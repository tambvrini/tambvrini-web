import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductPage from './ProductPage';
import { getProductById } from '../data/productHelpers';

jest.mock('@google/model-viewer', () => ({}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../contexts/CartContext', () => ({
  useCart: () => ({ addItem: jest.fn() }),
}));

jest.mock('../contexts/WishlistContext', () => ({
  useWishlist: () => ({
    toggleItem: jest.fn(),
    isInWishlist: () => false,
  }),
}));

const mockProductCard = jest.fn();

jest.mock('../components/ProductCard', () => ({
  __esModule: true,
  default: (props) => {
    mockProductCard(props);
    return <div data-testid="related-product" />;
  },
}));

jest.mock('../data/productHelpers', () => ({
  getProductById: jest.fn(),
}));

let mockProductId = 'sueter-ignatius';

jest.mock(
  'react-router-dom',
  () => ({
    useParams: () => ({ productId: mockProductId }),
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  }),
  { virtual: true }
);

const baseProduct = {
  product_id: 'sueter-ignatius',
  name: 'Suéter Ignatius',
  description: 'Descripción',
  price: 300,
  currency: 'EUR',
  images: [],
  category: ['knitwear', 'apparel'],
  gender: 'hombre',
  sizes: ['S', 'M'],
  colors: [{ name: 'Magma', hex: '#0A0A0A' }],
  composition: 'Algodón',
  care: 'Lavado a mano',
  is_sold_out: false,
  stripePaymentLink: 'https://buy.stripe.com/14A14o6vZcSNflq39T1Jm03',
  related_products: [],
};

const umbraProduct = {
  product_id: 'americana-umbra',
  name: 'Americana UMBRA',
  description: 'Descripción',
  price: 150,
  currency: 'EUR',
  images: [],
  model_url: '/models/umbra.glb',
  model_poster: '/thumbnails/americana-umbra.jpg',
  category: ['sastrería', 'apparel'],
  gender: 'mujer',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [{ name: 'Negro', hex: '#0A0A0A' }],
  composition: 'Lana premium',
  care: 'Solo limpieza en seco',
  is_sold_out: false,
  stripePaymentLink: 'https://buy.stripe.com/3cI00kf2vf0V1uA9yh1Jm01',
  related_products: [],
};

const poloGolfProduct = {
  product_id: 'polo-golf',
  name: 'Polo Golf',
  description: 'Descripción',
  price: 30,
  currency: 'EUR',
  images: [
    '/products/polo-golf/polo-golf-look-01.jpg',
    '/products/polo-golf/polo-golf-look-02.jpg',
    '/products/polo-golf/polo-golf-look-03.jpg',
    '/products/polo-golf/polo-golf-look-04.jpg',
    '/products/polo-golf/polo-golf-look-05.jpg',
  ],
  category: ['polos', 'apparel'],
  gender: 'hombre',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [{ name: 'Blanco', hex: '#FFFFFF' }],
  composition: 'Algodón',
  care: 'Lavado',
  is_sold_out: false,
  stripePaymentLink: 'https://buy.stripe.com/eVq7sM5rVdWRb5ah0J1Jm05',
  related_products: [],
};

const camisetaImperiumProduct = {
  product_id: 'camiseta-imperium',
  name: 'Camiseta Imperium',
  description: 'Descripción',
  price: 20,
  currency: 'EUR',
  images: [
    '/products/camiseta-imperium/camiseta-imperium-look-01.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-02.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-03.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-04.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-05.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-06.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-07.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-08.jpg',
    '/products/camiseta-imperium/camiseta-imperium-look-09.jpg',
  ],
  category: ['camisetas', 'apparel'],
  gender: 'mujer',
  sizes: ['XS', 'S', 'M', 'L'],
  colors: [{ name: 'Negro', hex: '#0A0A0A' }],
  composition: 'Algodón',
  care: 'Lavado',
  is_sold_out: false,
  stripePaymentLink: 'https://buy.stripe.com/cNibJ28E73id4GMcKt1Jm02',
  related_products: [],
};

const camisetaSportClubProduct = {
  product_id: 'camiseta-sport-club',
  name: 'Camiseta Sport Club',
  description: 'Descripción',
  price: 20,
  currency: 'EUR',
  images: ['/products/camiseta-sport-club/camiseta-sport-club-look-01.jpg'],
  category: ['camisetas', 'apparel'],
  gender: 'hombre',
  sizes: ['S', 'M', 'L'],
  colors: [{ name: 'Blanco', hex: '#FFFFFF' }],
  composition: 'Algodón',
  care: 'Lavado',
  is_sold_out: false,
  stripePaymentLink: 'https://buy.stripe.com/8x27sM7A34mh5KQbGp1Jm00',
  related_products: [],
};

const relatedProduct = {
  product_id: 'related-product',
  name: 'Producto Relacionado',
  description: 'Descripción',
  price: 60,
  currency: 'EUR',
  images: ['/products/related/related.jpg'],
  category: ['camisetas', 'apparel'],
  gender: 'mujer',
  sizes: ['M'],
  colors: [{ name: 'Negro', hex: '#0A0A0A' }],
  composition: 'Algodón',
  care: 'Lavado',
  is_sold_out: false,
  related_products: [],
};

const extraRelatedProduct = {
  product_id: 'extra-related-product',
  name: 'Producto Extra',
  description: 'Descripción',
  price: 80,
  currency: 'EUR',
  images: ['/products/related/extra.jpg'],
  category: ['camisetas', 'apparel'],
  gender: 'mujer',
  sizes: ['L'],
  colors: [{ name: 'Blanco', hex: '#FFFFFF' }],
  composition: 'Algodón',
  care: 'Lavado',
  is_sold_out: false,
  related_products: [],
};

const renderProductPage = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<ProductPage />);
  });
  act(() => {
    jest.runOnlyPendingTimers();
  });
  return { container, root };
};

describe('ProductPage', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.scrollTo = jest.fn();
    mockProductId = 'sueter-ignatius';
    mockProductCard.mockClear();
    getProductById.mockReset();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('renders the model viewer when model_url is provided', async () => {
    getProductById.mockReturnValue({
      ...baseProduct,
      model_url: '/models/ignatius.glb',
    });

    const { container, root } = await renderProductPage();
    const viewer = container.querySelector('[data-testid="product-model-viewer"]');
    const galleryImageElements = container.querySelectorAll('[data-testid^="product-gallery-image-"]');
    const productPage = container.querySelector('[data-testid="product-page"]');

    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute('data-model-src')).toBe('/models/ignatius.glb');
    expect(viewer.getAttribute('data-viewer-preset')).toBe('ignatius');
    expect(galleryImageElements.length).toBe(0);
    expect(productPage).not.toBeNull();
    expect(productPage.className).toContain('mb-12');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the image gallery when no model_url is provided', async () => {
    getProductById.mockReturnValue({
      ...baseProduct,
      images: ['/products/ignatius/ignatius-main.jpg'],
    });

    const { container, root } = await renderProductPage();
    const viewer = container.querySelector('[data-testid="product-model-viewer"]');
    const mainImage = container.querySelector('[data-testid="product-gallery-image-0"]');
    const mediaContainer = container.querySelector('.product-gallery-media');
    const galleryItem = container.querySelector('[data-testid="product-gallery-item-0"]');

    expect(viewer).toBeNull();
    expect(mainImage).not.toBeNull();
    expect(mediaContainer).not.toBeNull();
    expect(galleryItem).not.toBeNull();
    expect(galleryItem.className).toContain('product-gallery-item');
    expect(galleryItem.childElementCount).toBe(1);
    expect(mainImage.className).toContain('product-gallery-image');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the color label from product data', async () => {
    getProductById.mockReturnValue(baseProduct);

    const { container, root } = await renderProductPage();
    const colorButton = container.querySelector('[data-testid="color-btn-0"]');

    expect(colorButton).not.toBeNull();
    expect(colorButton.textContent).toContain('Magma');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the umbra model and images in the gallery', async () => {
    mockProductId = 'americana-umbra';
    getProductById.mockReturnValue(umbraProduct);

    const { container, root } = await renderProductPage();
    const modelViewer = container.querySelector('[data-testid="product-model-viewer"]');
    const firstGalleryImage = container.querySelector('[data-testid="product-gallery-image-0"]');
    const firstGalleryItem = container.querySelector('[data-testid="product-gallery-item-0"]');
    const thumbnailButtons = container.querySelectorAll('[data-testid^="product-thumb-"]');

    expect(modelViewer).not.toBeNull();
    expect(firstGalleryItem.querySelector('[data-testid="product-model-viewer"]')).not.toBeNull();
    expect(modelViewer.getAttribute('data-viewer-preset')).toBe('default');
    expect(firstGalleryImage).not.toBeNull();
    expect(thumbnailButtons.length).toBe(0);
    expect(firstGalleryImage.getAttribute('src'))
      .toBe('/products/americana-umbra/americana-umbra-main.jpg');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('uses the product layout grid and opens the details panel', async () => {
    getProductById.mockReturnValue(baseProduct);

    const { container, root } = await renderProductPage();
    const productContent = container.querySelector('.product-content');
    const pageGrid = container.querySelector('.product-page');
    const infoPanel = container.querySelector('.product-info');
    const breadcrumb = container.querySelector('[data-testid="product-breadcrumb"]');
    const title = container.querySelector('[data-testid="product-name"]');
    const detailButton = container.querySelector('[data-testid="tab-details"]');
    const sizeButton = container.querySelector('[data-testid="tab-size"]');
    const shippingButton = container.querySelector('[data-testid="tab-shipping"]');
    const quantityValue = container.querySelector('[data-testid="quantity-value"]');
    const decreaseButton = container.querySelector('[data-testid="quantity-decrease-btn"]');
    const increaseButton = container.querySelector('[data-testid="quantity-increase-btn"]');

    expect(productContent).not.toBeNull();
    const productContentClasses = productContent.className.split(/\s+/);

    expect(productContentClasses).not.toContain('max-w-[1920px]');
    expect(productContentClasses).not.toContain('mx-auto');
    expect(pageGrid).not.toBeNull();
    expect(infoPanel).not.toBeNull();
    expect(infoPanel.className).toContain('product-info');
    expect(breadcrumb).not.toBeNull();
    expect(breadcrumb.textContent.trim()).toBe(baseProduct.category.slice(0, 2).join(' / ').toUpperCase());
    expect(breadcrumb.childElementCount).toBe(1);
    expect(breadcrumb.querySelector('span')).not.toBeNull();
    expect(breadcrumb.querySelectorAll('a').length).toBe(0);
    expect(title).not.toBeNull();
    expect(title.className).toContain('break-words');
    expect(title.className).toContain('text-center');
    expect(detailButton).not.toBeNull();
    expect(sizeButton).toBeNull();
    expect(shippingButton).toBeNull();
    expect(container.querySelectorAll('[data-testid^="tab-"]').length).toBe(1);
    expect(quantityValue).not.toBeNull();
    expect(quantityValue.className).toContain('quantity-selector__value');
    expect(decreaseButton.className).toContain('quantity-selector__button');
    expect(increaseButton.className).toContain('quantity-selector__button');

    act(() => {
      detailButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(document.body.textContent).toContain('Detalles');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders up to four recommended products and passes product data', async () => {
    const relatedProducts = [
      poloGolfProduct,
      camisetaImperiumProduct,
      umbraProduct,
      relatedProduct,
      extraRelatedProduct,
    ];

    getProductById.mockReturnValue({
      ...baseProduct,
      related_products: relatedProducts,
    });

    const { container, root } = await renderProductPage();
    const recommendations = container.querySelector('[data-testid="product-recommendations"]');
    const recommendationCards = container.querySelectorAll('[data-testid="related-product"]');

    expect(recommendations).not.toBeNull();
    expect(recommendationCards.length).toBe(4);
    expect(mockProductCard.mock.calls.length).toBeGreaterThanOrEqual(4);
    expect(mockProductCard.mock.calls[0][0].product.product_id).toBe(relatedProducts[0].product_id);
    expect(mockProductCard.mock.calls[0][0].index).toBe(0);
    expect(mockProductCard.mock.calls[0][0].enableHoverVideo).toBe(true);
    expect(mockProductCard.mock.calls[3][0].product.product_id).toBe(relatedProducts[3].product_id);
    expect(mockProductCard.mock.calls[3][0].index).toBe(3);
    expect(mockProductCard.mock.calls[3][0].enableHoverVideo).toBe(false);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows Polo Golf gallery images in the provided order', async () => {
    mockProductId = 'polo-golf';
    getProductById.mockReturnValue(poloGolfProduct);

    const { container, root } = await renderProductPage();
    const mainImage = container.querySelector('[data-testid="product-gallery-image-0"]');
    const thirdImage = container.querySelector('[data-testid="product-gallery-image-2"]');

    expect(mainImage).not.toBeNull();
    expect(mainImage.getAttribute('src')).toBe(poloGolfProduct.images[0]);
    expect(thirdImage).not.toBeNull();
    expect(thirdImage.getAttribute('src')).toBe(poloGolfProduct.images[2]);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows Camiseta Imperium gallery images in the provided order', async () => {
    mockProductId = 'camiseta-imperium';
    getProductById.mockReturnValue(camisetaImperiumProduct);

    const { container, root } = await renderProductPage();
    const mainImage = container.querySelector('[data-testid="product-gallery-image-0"]');
    const fifthImage = container.querySelector('[data-testid="product-gallery-image-4"]');

    expect(mainImage).not.toBeNull();
    expect(mainImage.getAttribute('src')).toBe(camisetaImperiumProduct.images[0]);
    expect(fifthImage).not.toBeNull();
    expect(fifthImage.getAttribute('src')).toBe(camisetaImperiumProduct.images[4]);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows a Comprar Ahora stripe link for available products', async () => {
    mockProductId = 'camiseta-sport-club';
    getProductById.mockReturnValue(camisetaSportClubProduct);

    const { container, root } = await renderProductPage();
    const buyLink = container.querySelector('[data-testid="buy-now-btn"]');
    const addToCartButton = container.querySelector('[data-testid="add-to-cart-btn"]');

    expect(buyLink).not.toBeNull();
    expect(buyLink.getAttribute('href')).toBe('https://buy.stripe.com/8x27sM7A34mh5KQbGp1Jm00');
    expect(buyLink.getAttribute('target')).toBe('_blank');
    expect(buyLink.getAttribute('rel')).toBe('noopener noreferrer');
    expect(buyLink.className).toContain('buy-btn');
    expect(addToCartButton).not.toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows the direct Stripe link for other available products too', async () => {
    mockProductId = 'sueter-ignatius';
    getProductById.mockReturnValue(baseProduct);

    const { container, root } = await renderProductPage();
    const buyLink = container.querySelector('[data-testid="buy-now-btn"]');

    expect(buyLink).not.toBeNull();
    expect(buyLink.getAttribute('href')).toBe(baseProduct.stripePaymentLink);
    expect(buyLink.textContent.trim()).toBe('COMPRAR AHORA');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows Agotado and hides direct purchase actions for sold out products', async () => {
    mockProductId = 'camiseta-sport-club';
    getProductById.mockReturnValue({
      ...camisetaSportClubProduct,
      is_sold_out: true,
    });

    const { container, root } = await renderProductPage();
    const buyLink = container.querySelector('[data-testid="buy-now-btn"]');
    const addToCartButton = container.querySelector('[data-testid="add-to-cart-btn"]');
    const soldOutButton = container.querySelector('[data-testid="sold-out-btn"]');

    expect(buyLink).toBeNull();
    expect(addToCartButton).toBeNull();
    expect(soldOutButton).not.toBeNull();
    expect(soldOutButton.textContent.trim()).toBe('AGOTADO');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('adds the umbra background only for Americana Umbra', async () => {
    mockProductId = 'americana-umbra';
    getProductById.mockReturnValue(umbraProduct);

    const { container, root } = await renderProductPage();
    const page = container.querySelector('[data-testid="product-page"]');
    const umbraBackground = container.querySelector('.umbra-background');
    const ignatiusBackground = container.querySelector('.ignatius-background');

    expect(page.classList.contains('umbra-product-page')).toBe(true);
    expect(page.classList.contains('product-page-ignatius')).toBe(false);
    expect(umbraBackground).not.toBeNull();
    expect(ignatiusBackground).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('adds the ignatius background only for Suéter Ignatius', async () => {
    mockProductId = 'sueter-ignatius';
    getProductById.mockReturnValue(baseProduct);

    const { container, root } = await renderProductPage();
    const page = container.querySelector('[data-testid="product-page"]');
    const umbraBackground = container.querySelector('.umbra-background');
    const ignatiusBackground = container.querySelector('.ignatius-background');

    expect(page.classList.contains('product-page-ignatius')).toBe(true);
    expect(page.classList.contains('umbra-product-page')).toBe(false);
    expect(ignatiusBackground).not.toBeNull();
    expect(umbraBackground).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('keeps the default background for standard products', async () => {
    mockProductId = 'polo-golf';
    getProductById.mockReturnValue(poloGolfProduct);

    const { container, root } = await renderProductPage();
    const page = container.querySelector('[data-testid="product-page"]');
    const umbraBackground = container.querySelector('.umbra-background');
    const ignatiusBackground = container.querySelector('.ignatius-background');

    expect(page.classList.contains('umbra-product-page')).toBe(false);
    expect(page.classList.contains('product-page-ignatius')).toBe(false);
    expect(umbraBackground).toBeNull();
    expect(ignatiusBackground).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
