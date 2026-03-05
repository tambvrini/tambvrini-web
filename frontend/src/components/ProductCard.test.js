import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProductCard from './ProductCard';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../contexts/WishlistContext', () => ({
  useWishlist: () => ({
    toggleItem: jest.fn(),
    isInWishlist: () => false,
  }),
}));

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  }),
  { virtual: true }
);

const baseProduct = {
  product_id: 'polo-golf',
  slug: 'polo-golf',
  name: 'Polo Golf',
  price: 30,
  images: ['/products/polo-golf/polo-golf-look-01.jpg', '/products/polo-golf/polo-golf-look-02.jpg'],
  thumbnail_image: '/thumbnails/polo-golf.jpg',
  is_sold_out: false,
};

const renderProductCard = async (productOverrides = {}, propsOverrides = {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const product = { ...baseProduct, ...productOverrides };

  await act(async () => {
    root.render(<ProductCard product={product} enableHoverVideo {...propsOverrides} />);
  });

  return { container, root, product };
};

describe('ProductCard', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: jest.fn(() => Promise.resolve()),
    });
    Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: jest.fn(),
    });
  });

  beforeEach(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('shows navigation arrows when multiple images are available', async () => {
    const { container, root } = await renderProductCard();
    const leftArrow = container.querySelector('[data-testid="product-card-arrow-left"]');
    const rightArrow = container.querySelector('[data-testid="product-card-arrow-right"]');

    expect(leftArrow).not.toBeNull();
    expect(rightArrow).not.toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('does not show navigation arrows for a single image', async () => {
    const { container, root } = await renderProductCard({ images: ['/products/polo-golf/polo-golf-look-01.jpg'] });
    const leftArrow = container.querySelector('[data-testid="product-card-arrow-left"]');
    const rightArrow = container.querySelector('[data-testid="product-card-arrow-right"]');

    expect(leftArrow).toBeNull();
    expect(rightArrow).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('switches the image and hides the hover video after clicking an arrow', async () => {
    const { container, root, product } = await renderProductCard();
    const card = container.querySelector('[data-testid="product-card-polo-golf"]');
    const video = container.querySelector('[data-testid="product-card-video"]');
    const rightArrow = container.querySelector('[data-testid="product-card-arrow-right"]');

    act(() => {
      card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });

    expect(video.className).toContain('opacity-100');

    act(() => {
      rightArrow.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const updatedImage = container.querySelector('[data-testid="product-card-image"]');
    expect(updatedImage.getAttribute('src')).toBe(product.images[1]);
    expect(video.className).toContain('opacity-0');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
