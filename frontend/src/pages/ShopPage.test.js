import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import ShopPage from './ShopPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockQueryProducts = jest.fn();

jest.mock(
  '@/data/productHelpers',
  () => ({
    queryProducts: (...args) => mockQueryProducts(...args),
  }),
  { virtual: true }
);

jest.mock(
  '@/data/products',
  () => [],
  { virtual: true }
);

jest.mock('../components/ProductCard', () => ({ product }) => (
  <div data-testid={`product-card-${product.product_id}`}>{product.name}</div>
));

jest.mock('../components/ui/select', () => ({
  Select: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }) => <button type="button" {...props}>{children}</button>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
}));

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => jest.fn(),
    useSearchParams: () => [new URLSearchParams('category=2026'), jest.fn()],
  }),
  { virtual: true }
);

describe('ShopPage 2026 editorial image', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('inserts the 2026 editorial block after Suéter Captain in the 2026 grid', async () => {
    mockQueryProducts.mockReturnValue({
      products: [
        { product_id: 'camiseta-sport-club', name: 'Camiseta Sport Club' },
        { product_id: 'polo-golf', name: 'Polo Golf' },
        { product_id: 'sueter-captain', name: 'Suéter Captain' },
        { product_id: 'polo-regius', name: 'Polo Regius' },
      ],
      total: 4,
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<ShopPage />);
    });

    act(() => {
      jest.runOnlyPendingTimers();
    });

    const captainCard = container.querySelector('[data-testid="product-card-sueter-captain"]');
    const editorialInsert = container.querySelector('[data-testid="editorial-2026-insert"]');
    const editorialImage = container.querySelector('[data-testid="editorial-2026-image"]');
    const nextProduct = container.querySelector('[data-testid="product-card-polo-regius"]');

    expect(captainCard).not.toBeNull();
    expect(editorialInsert).not.toBeNull();
    expect(editorialImage).not.toBeNull();
    expect(nextProduct).not.toBeNull();
    expect(editorialImage.getAttribute('src')).toBe('/images/2026.PNG');
    expect(editorialInsert.className.includes('lg:row-span-2')).toBe(true);
    const gridChildren = Array.from(captainCard.parentElement.children);
    const captainIndex = gridChildren.indexOf(captainCard);
    const editorialIndex = gridChildren.indexOf(editorialInsert);
    const nextProductIndex = gridChildren.indexOf(nextProduct);
    expect(editorialIndex).toBe(captainIndex + 1);
    expect(nextProductIndex).toBeGreaterThan(editorialIndex);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
