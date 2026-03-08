import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Header from './Header';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock('../contexts/CartContext', () => ({
  useCart: () => ({
    totalItems: 0,
    setIsOpen: jest.fn(),
  }),
}));

jest.mock('../contexts/WishlistContext', () => ({
  useWishlist: () => ({ items: [] }),
}));

jest.mock('../components/ui/sheet', () => {
  const React = require('react');
  const SheetContext = React.createContext({ open: false, onOpenChange: () => {} });

  const Sheet = ({ open, onOpenChange, children }) => (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      <div data-open={open ? 'true' : 'false'}>{children}</div>
    </SheetContext.Provider>
  );

  const SheetTrigger = ({ children }) => {
    const { open, onOpenChange } = React.useContext(SheetContext);
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      onClick: (event) => {
        child.props.onClick?.(event);
        onOpenChange(!open);
      },
    });
  };

  const SheetClose = ({ children }) => {
    const { onOpenChange } = React.useContext(SheetContext);
    const child = React.Children.only(children);
    return React.cloneElement(child, {
      onClick: (event) => {
        child.props.onClick?.(event);
        onOpenChange(false);
      },
    });
  };

  const SheetContent = ({ children, hideClose, overlayClassName, ...props }) => (
    <div {...props}>{children}</div>
  );

  return { Sheet, SheetTrigger, SheetContent, SheetClose };
});

jest.mock(
  'react-router-dom',
  () => ({
    useLocation: () => ({ pathname: '/', search: '', hash: '' }),
    Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  }),
  { virtual: true }
);

const renderHeader = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(<Header />);
  });
  return { container, root };
};

describe('Header menu', () => {
  afterEach(() => {
    document.body.classList.remove('menu-open');
  });

  it('toggles aria-expanded and body class when menu opens', async () => {
    const { container, root } = await renderHeader();
    const menuButton = container.querySelector('[data-testid="menu-toggle-btn"]');

    expect(menuButton).not.toBeNull();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.classList.contains('menu-open')).toBe(false);

    await act(async () => {
      menuButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(document.body.classList.contains('menu-open')).toBe(true);

    await act(async () => {
      menuButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    expect(document.body.classList.contains('menu-open')).toBe(false);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('opens and closes the search overlay', async () => {
    const { container, root } = await renderHeader();
    const searchButton = container.querySelector('[data-testid="search-toggle-btn"]');
    const overlay = container.querySelector('[data-testid="search-overlay"]');

    expect(searchButton).not.toBeNull();
    expect(overlay).not.toBeNull();
    expect(overlay.getAttribute('data-state')).toBe('closed');

    await act(async () => {
      searchButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(overlay.getAttribute('data-state')).toBe('open');

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(overlay.getAttribute('data-state')).toBe('closed');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('opens and closes the contact panel', async () => {
    const { container, root } = await renderHeader();
    const contactButton = container.querySelector('[data-testid="contact-toggle-btn"]');
    const contactPanel = container.querySelector('[data-testid="contact-panel"]');
    const contactClose = container.querySelector('[data-testid="contact-close-btn"]');

    expect(contactButton).not.toBeNull();
    expect(contactPanel).not.toBeNull();
    expect(contactPanel.getAttribute('data-state')).toBe('closed');

    await act(async () => {
      contactButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(contactPanel.getAttribute('data-state')).toBe('open');

    await act(async () => {
      contactClose.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(contactPanel.getAttribute('data-state')).toBe('closed');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders updated tienda menu links in order', async () => {
    const { container, root } = await renderHeader();

    const novedadesLink = container.querySelector('[data-testid="menu-link-novedades"]');
    const hombreLink = container.querySelector('[data-testid="menu-link-hombre"]');
    const mujerLink = container.querySelector('[data-testid="menu-link-mujer"]');
    const limitedLink = container.querySelector('[data-testid="menu-link-limited-editions"]');

    expect(novedadesLink).not.toBeNull();
    expect(hombreLink).not.toBeNull();
    expect(mujerLink).not.toBeNull();
    expect(limitedLink).not.toBeNull();
    expect(novedadesLink.getAttribute('to')).toBe('/tienda?category=novedades');
    expect(limitedLink.getAttribute('to')).toBe('/limited-editions');

    const tiendaList = novedadesLink.closest('ul');
    const tiendaLabels = Array.from(tiendaList?.querySelectorAll('a') ?? []).map(
      (link) => link.textContent?.trim()
    );

    expect(tiendaLabels).toEqual(['Novedades', 'Hombre', 'Mujer', 'Limited Editions']);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
