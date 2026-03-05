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

jest.mock('../components/ProductCard', () => () => <div data-testid="related-product" />);

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
    const viewer = container.querySelector('model-viewer');
    const galleryImageElements = container.querySelectorAll('[data-testid^="product-gallery-image-"]');

    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute('src')).toBe('/models/ignatius.glb');
    expect(galleryImageElements.length).toBe(0);

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
    const viewer = container.querySelector('model-viewer');
    const mainImage = container.querySelector('[data-testid="product-gallery-image-0"]');

    expect(viewer).toBeNull();
    expect(mainImage).not.toBeNull();

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

  it('renders the UMBRA model and images in the gallery', async () => {
    mockProductId = 'americana-umbra';
    getProductById.mockReturnValue(umbraProduct);

    const { container, root } = await renderProductPage();
    const modelViewer = container.querySelector('[data-testid="product-model-viewer"]');
    const firstGalleryImage = container.querySelector('[data-testid="product-gallery-image-1"]');
    const firstGalleryItem = container.querySelector('[data-testid="product-gallery-item-0"]');

    expect(modelViewer).not.toBeNull();
    expect(firstGalleryItem.querySelector('model-viewer')).not.toBeNull();
    expect(firstGalleryImage).not.toBeNull();
    expect(firstGalleryImage.getAttribute('src'))
      .toBe('/products/americana-umbra/americana-umbra-main.jpg');

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
});
