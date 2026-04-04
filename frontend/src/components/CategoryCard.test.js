import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CategoryCard from './CategoryCard';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mockNavigate = jest.fn();

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

const renderCategoryCard = async (props = {}) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <CategoryCard
        title="CAMISETAS"
        image="/images/camisetas-header.png"
        link="/tienda?category=camisetas"
        testId="category-card"
        {...props}
      />
    );
  });

  await act(async () => {});

  return { container, root };
};

describe('CategoryCard', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    window.scrollTo = jest.fn();
    global.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        this.callback([{ isIntersecting: true }]);
      }
      disconnect() {}
    };
  });

  it('navigates when the card is clicked', async () => {
    const { container, root } = await renderCategoryCard();
    const card = container.querySelector('[data-testid="category-card"]');

    act(() => {
      card.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(mockNavigate).toHaveBeenCalledWith('/tienda?category=camisetas');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the image and exposes the destination href', async () => {
    const { container, root } = await renderCategoryCard({
      title: 'POLOS',
      image: '/images/polos-header.png',
      link: '/tienda?category=polos',
    });
    const card = container.querySelector('[data-testid="category-card"]');
    const image = container.querySelector('img[alt="POLOS"]');

    expect(image?.getAttribute('src')).toBe('/images/polos-header.png');
    expect(card?.getAttribute('href')).toBe('/tienda?category=polos');
    expect(image?.style.width).toBe('100%');
    expect(image?.style.height).toBe('auto');
    expect(image?.style.aspectRatio).toBe('4 / 5');
    expect(image?.style.display).toBe('block');
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
