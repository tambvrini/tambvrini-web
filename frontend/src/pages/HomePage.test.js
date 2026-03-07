import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './HomePage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  '@/data/productHelpers',
  () => ({
    queryProducts: () => ({
      products: [
        { product_id: 'sueter-captain', category: [] },
        { product_id: 'polo-domus', category: [] },
        { product_id: 'sueter-ignatius', category: [] },
        { product_id: 'sueter-sylva', category: [] },
        { product_id: 'polo-patricius', category: [] },
        { product_id: 'polo-regius', category: [] },
        { product_id: 'camiseta-sport-club', category: [] },
        { product_id: 'polo-golf', category: [] },
        { product_id: 'camiseta-imperium', category: [] },
        { product_id: 'americana-umbra', category: [] },
        { product_id: 'polo-aureus', category: [] },
        { product_id: 'traje-monograma-tambvrini', category: [] },
        { product_id: 'bolso-monograma-tambvrini', category: [] },
      ],
    }),
  }),
  { virtual: true }
);

jest.mock('../components/ProductCard', () => (props) => (
  <div data-testid={`product-card-${props.product.product_id}`} />
));

jest.mock('../components/IntroVideoSection.tsx', () => () => (
  <div data-testid="intro-video" />
));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right" />,
}));

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('framer-motion', () => {
  const React = require('react');
  const createMotionComponent = (tag) =>
    React.forwardRef(({ children, ...props }, ref) =>
      React.createElement(tag, { ...props, ref }, children)
    );
  const motion = new Proxy(
    {},
    {
      get: (_, prop) => createMotionComponent(prop),
    }
  );

  return {
    motion,
    useScroll: () => ({ scrollY: 0 }),
    useSpring: (value) => value,
    useTransform: () => 0,
  };
});

const renderHomePage = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<HomePage />);
  });

  await act(async () => {});

  return { container, root };
};

describe('HomePage featured grid', () => {
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
    window.scrollTo = jest.fn();
    global.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe() {
        this.callback([{ isIntersecting: false }]);
      }
      unobserve() {}
      disconnect() {}
    };
  });

  it('shows Suéter Ignatius instead of Polo Domus', async () => {
    const { container, root } = await renderHomePage();

    expect(
      container.querySelector('[data-testid="product-card-sueter-ignatius"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[data-testid="product-card-polo-domus"]')
    ).toBeNull();
    expect(
      container.querySelector('[data-testid="limited-editions-banner-image"]')
        ?.getAttribute('src')
    ).toBe('/images/limited-editions-banner.jpeg');
    const dropGrid = container.querySelector('[data-testid="drop-grid"]');
    const novedadesSection = container.querySelector('[data-testid="novedades-section"]');
    const editorialEagleDivider = container.querySelector('[data-testid="editorial-eagle-divider"]');
    const mysticDivider = container.querySelector('[data-testid="mystic-divider-image"]');
    const mysticWrapper = container.querySelector('[data-testid="mystic-divider-wrapper"]');
    const mysticImage = mysticDivider?.querySelector('img');

    expect(dropGrid?.className).toContain('pt-6');
    expect(dropGrid?.className).toContain('md:pt-8');
    expect(novedadesSection?.className).toContain('mt-6');
    expect(novedadesSection?.className).toContain('md:mt-8');
    expect(novedadesSection?.className).toContain('gap-y-6');
    expect(novedadesSection?.className).toContain('md:gap-y-8');
    expect(editorialEagleDivider?.className).toContain('my-6');
    expect(editorialEagleDivider?.className).toContain('md:my-8');
    expect(mysticDivider?.className).toContain('mt-6');
    expect(mysticDivider?.className).toContain('md:mt-8');
    expect(mysticDivider?.className).toContain('-mb-[4.5rem]');
    expect(mysticDivider?.className).toContain('md:-mb-24');
    expect(mysticWrapper?.className).toContain('w-screen');
    expect(mysticWrapper?.className).toContain('max-w-none');
    expect(mysticWrapper?.className).toContain('left-1/2');
    expect(mysticWrapper?.className).toContain('right-1/2');
    expect(mysticWrapper?.className).toContain('-ml-[50vw]');
    expect(mysticWrapper?.className).toContain('-mr-[50vw]');
    expect(mysticImage?.getAttribute('src')).toBe('/images/header-mistico-ultrawide.png');
    expect(mysticImage?.getAttribute('alt')).toBe('editorial mystic divider');
    expect(mysticImage?.className).toContain('w-full');
    expect(mysticImage?.className).toContain('h-auto');
    expect(mysticImage?.className).toContain('object-contain');
    expect(mysticImage?.className).toContain('object-center');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the hero header image with cover fit', async () => {
    const { container, root } = await renderHomePage();

    const heroImage = container.querySelector(
      'img[alt="TAMBVRINI Campaign"]'
    );

    expect(heroImage?.getAttribute('src')).toBe('/images/header-final.jpg');
    expect(heroImage?.className).toContain('hero-image-cinematic');
    expect(heroImage?.className).toContain('object-cover');
    expect(heroImage?.className).toContain('object-center');
    expect(heroImage?.className).not.toContain('brightness-105');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders the primavera editorial hero image and title', async () => {
    const { container, root } = await renderHomePage();

    const editorialImage = container.querySelector(
      '[data-testid="editorial-hero-image"]'
    );
    const editorialTitle = container.querySelector(
      '[data-testid="editorial-hero-title"]'
    );

    expect(editorialImage?.getAttribute('src')).toBe(
      '/images/header-primavera.jpeg'
    );
    expect(editorialImage?.className).toContain('object-cover');
    expect(editorialImage?.className).toContain('object-center');
    expect(editorialTitle?.textContent).toContain('PRIMAVERA — VERANO');
    expect(editorialTitle?.className).toContain('primavera-editorial-title');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
