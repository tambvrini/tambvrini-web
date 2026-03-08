import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const scrollToDrops = () => {
  // Works both for same-page navigation and after route changes.
  requestAnimationFrame(() => {
    const el = document.getElementById('drops');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

import { X, User, Heart, ShoppingBag, Search, Phone } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../components/ui/sheet';
import SearchOverlay from './SearchOverlay';
import ContactPanel from './ContactPanel';

const SCROLL_THRESHOLD = 500;

// Minimal header: no visible navigation links (drop-first homepage)

const MENU_SECTIONS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Novedades', href: '/tienda?category=novedades', testId: 'menu-link-novedades' },
      { label: 'Hombre', href: '/tienda?gender=hombre', testId: 'menu-link-hombre' },
      { label: 'Mujer', href: '/tienda?gender=mujer', testId: 'menu-link-mujer' },
      { label: 'Limited Editions', href: '/limited-editions', testId: 'menu-link-limited-editions' },
    ]
  },

  {
    title: 'Marca',
    links: [
      { label: 'Sobre TAMBVRINI', href: '/marca', testId: 'menu-link-sobre-tambvrini' },
      { label: 'Filosofía', href: '/marca', testId: 'menu-link-filosofia' },
      { label: 'Artesanía', href: '/marca', testId: 'menu-link-artesania' },
      { label: 'Editorial', href: '/marca', testId: 'menu-link-editorial' },
    ]
  }
];

export const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [cinematicProgress, setCinematicProgress] = useState(1);

  const location = useLocation();
  const { user } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const isHomePage = location.pathname === '/';
  const isProductPage = location.pathname.startsWith('/producto');
  const isWomenCategory =
    location.pathname === '/tienda' && new URLSearchParams(location.search).get('gender') === 'mujer';
  const isMenCategory =
    location.pathname === '/tienda' && new URLSearchParams(location.search).get('gender') === 'hombre';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const handleMenuOpenChange = (open) => {
    setMenuOpen(open);
    if (open) {
      setSearchOpen(false);
      setContactOpen(false);
    }
  };

  const handleContactOpenChange = (open) => {
    setContactOpen(open);
    if (open) {
      setMenuOpen(false);
      setSearchOpen(false);
    }
  };

  useEffect(() => {
    const handleCinematic = (event) => {
      if (typeof event.detail === 'number') {
        setCinematicProgress(event.detail);
      }
    };
    window.addEventListener('cinematicProgress', handleCinematic);
    return () => window.removeEventListener('cinematicProgress', handleCinematic);
  }, []);

  // If we land on home with #drops, smooth scroll to the drop grid.
  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#drops') {
      scrollToDrops();
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    setSearchOpen(false);
    setContactOpen(false);
  }, [location.pathname]);



  // On homepage, header logo hidden until scroll passes threshold
  // On other pages, header logo always visible
  let scrolled = scrollY > 80;
  if (isHomePage) {
    scrolled = scrollY > SCROLL_THRESHOLD;
  } else if (isProductPage) {
    scrolled = true;
  }
  // Delay header logo reveal so we don't see a duplicated "medium" logo during the hero shrink.
  // We fade the header logo in right at the end of the hero animation.
  const headerFadeStart = SCROLL_THRESHOLD - 40; // ~460
  const headerFadeEnd = SCROLL_THRESHOLD + 80;   // ~580

  const headerLogoVisible = isHomePage ? scrollY > headerFadeStart : true;
  const headerLogoOpacity = isHomePage
    ? Math.min(1, Math.max(0, (scrollY - headerFadeStart) / (headerFadeEnd - headerFadeStart)))
    : 1;

  const cinematicHidden = (isWomenCategory || isMenCategory) && cinematicProgress < 0.85;
  const navToneClass = cinematicHidden ? 'text-white/70 hover:text-white' : 'text-obsidian/80 hover:text-obsidian';

  return (
    <>
      <header
        data-testid="main-header"
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
          scrolled
            ? `${isHomePage ? 'bg-white/95' : 'bg-white/95'} backdrop-blur-md py-5 border-b border-black/5`
            : 'bg-transparent py-6'
        } ${cinematicHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          {/* Left: Menu */}
          <div className="flex items-center gap-5 w-[120px]" style={{ opacity: cinematicHidden ? 0.7 : 1 }}>
            <Sheet open={menuOpen} onOpenChange={handleMenuOpenChange}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="site-menu"
                  aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                  data-testid="menu-toggle-btn"
                  className={`menu-toggle ${menuOpen ? 'is-open' : ''} ${navToneClass} transition-colors duration-300`}
                >
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                  <span aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent
                id="site-menu"
                side="left"
                hideClose
                overlayClassName="menu-overlay"
                className="side-menu w-[320px] bg-white border-r border-black/5 p-0 overflow-y-auto"
              >
                <div className="flex flex-col h-full p-8 md:p-12">
                  <div className="flex justify-between items-center mb-16">
                    <Logo className="logo h-5 w-auto" />
                    <SheetClose asChild>
                      <button data-testid="menu-close-btn">
                        <X size={24} className="text-obsidian/60 hover:text-obsidian" />
                      </button>
                    </SheetClose>
                  </div>
                  {MENU_SECTIONS.map((section, i) => (
                    <div key={i} className="mb-12">
                      <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-obsidian/50 mb-6">{section.title}</h3>
                      <ul className="space-y-4">
                        {section.links.map((link, j) => (
                          <li key={j}>
                            <Link
                              to={link.href}
                              data-testid={link.testId}
                              onClick={() => {
                                setMenuOpen(false);
                                if (link.href === '/#drops') {
                                  scrollToDrops();
                                  return;
                                }
                                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                              }}
                              className="font-montserrat text-sm text-obsidian/70 hover:text-obsidian tracking-wide transition-colors duration-300 block"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="mt-auto pt-10">
                    <div className="-mx-8 md:-mx-12 px-8 md:px-12 py-6 bg-black/[0.03] border-t border-black/5">
                      <div className="space-y-4">
                        <Link
                          to="/cuenta"
                          onClick={() => setMenuOpen(false)}
                          className="premium-scale flex items-center gap-3 text-obsidian/70 hover:text-obsidian transition-colors duration-300"
                        >
                          <User size={16} strokeWidth={1.5} />
                          <span className="font-montserrat text-sm tracking-wide">Login</span>
                        </Link>
                        <button
                          type="button"
                          data-testid="contact-toggle-btn"
                          onClick={() => {
                            setMenuOpen(false);
                            setContactOpen(true);
                          }}
                          className="flex items-center gap-3 text-obsidian/70 hover:text-obsidian transition-colors duration-300"
                        >
                          <Phone size={16} strokeWidth={1.5} />
                          <span className="font-montserrat text-sm tracking-wide">Contáctanos</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <button
              type="button"
              data-testid="search-toggle-btn"
              aria-label="Abrir búsqueda"
              onClick={() => {
                setMenuOpen(false);
                setContactOpen(false);
                setSearchOpen(true);
              }}
              className={`header-icon ${navToneClass} transition-colors duration-300`}
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Center: Header Logo — fades in after hero logo shrinks (homepage) or always visible (other pages) */}
          <Link
            to="/"
            data-testid="header-logo-link"
            className="flex-shrink-0 transition-opacity duration-500"
            style={{ opacity: headerLogoOpacity, pointerEvents: headerLogoVisible ? 'auto' : 'none' }}
          >
            <Logo
              className={`logo transition-all duration-500 w-auto ${isHomePage ? 'h-10 md:h-12' : (scrolled ? 'h-10 md:h-12' : 'h-16 md:h-28')}`}
            />
          </Link>

          {/* Right: Account + Wishlist + Cart */}
          <div className="flex items-center gap-5 w-[120px] justify-end" style={{ opacity: cinematicHidden ? 0.7 : 1 }}>
            <Link
              to="/cuenta"
              data-testid="account-link"
              className={`header-icon ${navToneClass} transition-colors duration-300 hidden sm:block`}
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link
              to="/favoritos"
              data-testid="wishlist-link"
              className={`header-icon ${navToneClass} transition-colors duration-300 relative`}
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-obsidian text-[#F5F2EA] text-[9px] font-montserrat font-medium flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              data-testid="cart-toggle-btn"
              onClick={() => setIsOpen(true)}
              className={`header-icon ${navToneClass} transition-colors duration-300 relative`}
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-obsidian text-[#F5F2EA] text-[9px] font-montserrat font-medium flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>


      </header>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ContactPanel open={contactOpen} onOpenChange={handleContactOpenChange} />
    </>
  );
};

export default Header;
