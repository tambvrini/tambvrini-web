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

    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute('src')).toBe('/models/ignatius.glb');
    expect(container.querySelector('[data-testid="product-main-image"]')).toBeNull();

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
    const mainImage = container.querySelector('[data-testid="product-main-image"]');

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

  it('toggles between the UMBRA model and images in the gallery', async () => {
    mockProductId = 'americana-umbra';
    getProductById.mockReturnValue(umbraProduct);

    const { container, root } = await renderProductPage();
    const modelViewer = container.querySelector('[data-testid="product-model-viewer"]');
    const firstImageThumb = container.querySelector('[data-testid="product-thumb-1"]');

    expect(modelViewer).not.toBeNull();
    expect(firstImageThumb).not.toBeNull();

    act(() => {
      firstImageThumb.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="product-main-image"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="product-model-viewer"]')).toBeNull();

    const modelThumb = container.querySelector('[data-testid="product-thumb-0"]');
    expect(modelThumb).not.toBeNull();
    act(() => {
      modelThumb.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.querySelector('[data-testid="product-model-viewer"]')).not.toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
