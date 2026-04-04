import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CategoryCard from './CategoryCard';

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
        link="/camisetas"
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
      card.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(mockNavigate).toHaveBeenCalledWith('/camisetas');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('supports keyboard activation and renders the image', async () => {
    const { container, root } = await renderCategoryCard({ title: 'POLOS', link: '/polos' });
    const card = container.querySelector('[data-testid="category-card"]');
    const image = container.querySelector('img[alt="POLOS"]');

    expect(image?.getAttribute('src')).toBe('/images/camisetas-header.png');

    act(() => {
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/polos');

    act(() => {
      root.unmount();
    });
    container.remove();
});
