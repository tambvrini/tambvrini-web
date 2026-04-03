import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SportClubPage from './SportClubPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockQueryProducts = jest.fn();
const mockProductCard = jest.fn();

jest.mock(
  '@/data/productHelpers',
  () => ({
    queryProducts: (...args) => mockQueryProducts(...args),
  }),
  { virtual: true }
);

jest.mock('../components/ProductCard', () => ({
  __esModule: true,
  default: (props) => {
    mockProductCard(props);
    return <div data-testid={`product-card-${props.product.product_id}`}>{props.product.name}</div>;
  },
}));

describe('SportClubPage', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
    mockProductCard.mockClear();
    mockQueryProducts.mockReturnValue({
      products: [
        { product_id: 'camiseta-sport-club', name: 'Camiseta Sport Club' },
        { product_id: 'polo-golf', name: 'Polo Golf' },
      ],
      total: 2,
    });
  });

  it('renders the Sport Club hero and only the dedicated collection products', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<SportClubPage />);
    });

    const heroImage = container.querySelector('[data-testid="sport-club-hero-image"]');
    const heroTitle = container.querySelector('[data-testid="sport-club-hero-title"]');
    const pageTitle = container.querySelector('[data-testid="sport-club-page-title"]');
    const heroButton = container.querySelector('[data-testid="sport-club-hero-button"]');
    const productsGrid = container.querySelector('[data-testid="sport-club-products-grid"]');

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(mockQueryProducts).toHaveBeenCalledWith({ category: 'sport-club', limit: 20 });
    expect(heroImage?.getAttribute('src')).toBe(
      'https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/74ejw418_campa%C3%B1a%202.jpg'
    );
    expect(heroTitle?.textContent).toContain('Sport Club 2026');
    expect(pageTitle?.textContent).toBe('Sport Club');
    expect(productsGrid).not.toBeNull();
    expect(container.querySelector('[data-testid="product-card-camiseta-sport-club"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="product-card-polo-golf"]')).not.toBeNull();
    expect(mockProductCard).toHaveBeenCalledTimes(2);
    expect(mockProductCard.mock.calls[0][0].enableHoverVideo).toBe(true);
    expect(mockProductCard.mock.calls[1][0].enableHoverVideo).toBe(true);

    await act(async () => {
      heroButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
