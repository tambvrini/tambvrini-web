import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage, { LIMITED_EDITIONS_SYNC_THRESHOLD_SECONDS } from './HomePage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const mockNavigate = jest.fn();

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

jest.mock('../components/ProductCard', () => ({
  __esModule: true,
  default: (props) => <div data-testid={`product-card-${props.product.product_id}`} />,
}));

jest.mock('../components/IntroVideoSection.tsx', () => () => (
  <div data-testid="intro-video" />
));

jest.mock('lucide-react', () => ({
  ArrowRight: () => <span data-testid="arrow-right" />,
}));

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
    useNavigate: () => mockNavigate,
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
    mockNavigate.mockReset();
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
    const limitedEditionsLink = container.querySelector(
      '[data-testid="limited-editions-left-wrapper"]'
    );
    const limitedEditionsRightLink = container.querySelector(
      '[data-testid="limited-editions-right-wrapper"]'
    );
    const limitedEditionsLabel = container.querySelector(
      '[data-testid="limited-editions-label"]'
    );
    const leftVideo = container.querySelector(
      '[data-testid="limited-editions-left-video"]'
    );
    const rightVideo = container.querySelector(
      '[data-testid="limited-editions-right-video"]'
    );
    expect(limitedEditionsLink).not.toBeNull();
    expect(limitedEditionsRightLink).not.toBeNull();
    expect(limitedEditionsLink.tagName).toBe('DIV');
    expect(limitedEditionsRightLink.tagName).toBe('DIV');
    expect(limitedEditionsLabel?.tagName).toBe('A');
    expect(limitedEditionsLabel?.getAttribute('href')).toBe('/limited-editions');
    expect(limitedEditionsLabel?.textContent).toContain('Limited Editions');
    expect(leftVideo?.getAttribute('src')).toBe('/videos/pasarela-video-web.mp4');
    expect(rightVideo?.getAttribute('src')).toBe('/videos/eden-video-web.mp4');
    const dropGrid = container.querySelector('[data-testid="drop-grid"]');
    const novedadesSection = container.querySelector('[data-testid="novedades-section"]');
    const editorialEagleDivider = container.querySelector('[data-testid="editorial-eagle-divider"]');
    const mysticDivider = container.querySelector('[data-testid="mystic-divider-image"]');
    const mysticWrapper = container.querySelector('[data-testid="mystic-divider-wrapper"]');
    const mysticImage = mysticDivider?.querySelector('img');
    const limitedEditionsSection = container.querySelector('[data-testid="limited-editions-section"]');
    const spotlightGrid = container.querySelector('[data-testid="homepage-spotlight-grid"]');

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
    expect(spotlightGrid?.className).toContain('mt-6');
    expect(spotlightGrid?.className).toContain('md:mt-8');
    expect(limitedEditionsSection?.className).toContain('mt-6');
    expect(limitedEditionsSection?.className).toContain('md:mt-8');
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

  it('renders limited editions videos without links', async () => {
    const { container, root } = await renderHomePage();

    const leftWrapper = container.querySelector(
      '[data-testid="limited-editions-left-wrapper"]'
    );
    const rightWrapper = container.querySelector(
      '[data-testid="limited-editions-right-wrapper"]'
    );
    const leftVideo = container.querySelector(
      '[data-testid="limited-editions-left-video"]'
    );
    const rightVideo = container.querySelector(
      '[data-testid="limited-editions-right-video"]'
    );
    const limitedEditionsLabel = container.querySelector(
      '[data-testid="limited-editions-label"]'
    );

    expect(leftWrapper).not.toBeNull();
    expect(rightWrapper).not.toBeNull();
    expect(leftVideo).not.toBeNull();
    expect(rightVideo).not.toBeNull();
    expect(leftWrapper.tagName).toBe('DIV');
    expect(rightWrapper.tagName).toBe('DIV');
    expect(limitedEditionsLabel?.tagName).toBe('A');
    expect(leftVideo.closest('a')).toBeNull();
    expect(rightVideo.closest('a')).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('syncs limited editions videos once both load', async () => {
    jest.useFakeTimers();
    const { container, root } = await renderHomePage();

    const leftVideo = container.querySelector(
      '[data-testid="limited-editions-left-video"]'
    );
    const rightVideo = container.querySelector(
      '[data-testid="limited-editions-right-video"]'
    );

    expect(leftVideo).not.toBeNull();
    expect(rightVideo).not.toBeNull();

    const leftPlaySpy = jest.spyOn(leftVideo, 'play');
    const rightPlaySpy = jest.spyOn(rightVideo, 'play');
    const leftPausedDescriptor = Object.getOwnPropertyDescriptor(leftVideo, 'paused');
    const rightPausedDescriptor = Object.getOwnPropertyDescriptor(rightVideo, 'paused');
    const pausedDriftThresholdSeconds = 0.9;
    // When paused, drift should remain ~1s; 0.9s confirms no correction occurred.

    try {
      await act(async () => {
        leftVideo.dispatchEvent(new Event('loadeddata'));
        rightVideo.dispatchEvent(new Event('loadeddata'));
        await Promise.resolve();
      });

      expect(leftPlaySpy).toHaveBeenCalled();
      expect(rightPlaySpy).toHaveBeenCalled();
      expect(leftVideo.currentTime).toBe(0);
      expect(rightVideo.currentTime).toBe(0);

      Object.defineProperty(leftVideo, 'paused', { configurable: true, value: false });
      Object.defineProperty(rightVideo, 'paused', { configurable: true, value: false });
      rightVideo.currentTime = leftVideo.currentTime + 1;

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(Math.abs(rightVideo.currentTime - leftVideo.currentTime))
        .toBeLessThan(LIMITED_EDITIONS_SYNC_THRESHOLD_SECONDS);

      Object.defineProperty(rightVideo, 'paused', { configurable: true, value: true });
      rightVideo.currentTime = leftVideo.currentTime + 1;

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(Math.abs(rightVideo.currentTime - leftVideo.currentTime))
        .toBeGreaterThan(pausedDriftThresholdSeconds);
    } finally {
      act(() => {
        root.unmount();
      });
      leftPlaySpy.mockRestore();
      rightPlaySpy.mockRestore();
      if (leftPausedDescriptor) {
        Object.defineProperty(leftVideo, 'paused', leftPausedDescriptor);
      } else {
        delete leftVideo.paused;
      }
      if (rightPausedDescriptor) {
        Object.defineProperty(rightVideo, 'paused', rightPausedDescriptor);
      } else {
        delete rightVideo.paused;
      }
      container.remove();
      jest.useRealTimers();
    }
  });

  it('renders the hero header image with cover fit', async () => {
    const { container, root } = await renderHomePage();

    const heroSource = container.querySelector(
      'picture source[media="(max-width: 767px)"]'
    );
    const heroImage = container.querySelector(
      'img[alt="TAMBVRINI Campaign"]'
    );

    expect(heroSource?.getAttribute('srcset')).toBe('/images/header-vertical-final.jpg.jpeg');
    expect(heroSource?.getAttribute('media')).toBe('(max-width: 767px)');
    expect(heroSource?.getAttribute('type')).toBe('image/jpeg');
    expect(heroImage?.getAttribute('src')).toBe('/images/header-tambvrini-yo.jpg');
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

  it('renders the premium category cards section with the three homepage links', async () => {
    const { container, root } = await renderHomePage();

    const categorySection = container.querySelector('[data-testid="editorial-collections-section"]');
    const camisetasCard = container.querySelector('[data-testid="homepage-category-card-camisetas"]');
    const sueteresCard = container.querySelector('[data-testid="homepage-category-card-sueteres"]');
    const polosCard = container.querySelector('[data-testid="homepage-category-card-polos"]');
    const oldPolosLink = container.querySelector('[data-testid="editorial-polos-link"]');
    const oldSueteresLink = container.querySelector('[data-testid="editorial-sueteres-link"]');

    expect(categorySection).not.toBeNull();
    expect(camisetasCard?.textContent).toContain('CAMISETAS');
    expect(sueteresCard?.textContent).toContain('SUÉTERES');
    expect(polosCard?.textContent).toContain('POLOS');
    expect(container.querySelector('img[alt="CAMISETAS"]')?.getAttribute('src')).toBe('/images/camisetas-header.png');
    expect(container.querySelector('img[alt="SUÉTERES"]')?.getAttribute('src')).toBe('/images/sueteres-header.png');
    expect(container.querySelector('img[alt="POLOS"]')?.getAttribute('src')).toBe('/images/polos-header.png');
    expect(oldPolosLink).toBeNull();
    expect(oldSueteresLink).toBeNull();

    act(() => {
      polosCard.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(mockNavigate).toHaveBeenCalledWith('/polos');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('does not render the Sport Club homepage campaign banner anymore', async () => {
    const { container, root } = await renderHomePage();

    expect(container.querySelector('[data-testid="campaign-divider-image"]')).toBeNull();
    expect(container.querySelector('[data-testid="campaign-collection-title"]')).toBeNull();
    expect(container.querySelector('[data-testid="campaign-collection-button"]')).toBeNull();
    expect(container.querySelector('[data-testid="collection-transition"]')).toBeNull();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
