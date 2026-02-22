import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const scrollToDrops = () => {
  // Works both for same-page navigation and after route changes.
  requestAnimationFrame(() => {
    const el = document.getElementById('drops');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
};

import { Menu, X, User, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../components/ui/sheet';

const LOGO_WHITE = "/logo-letras-final-blanco.svg";
const LOGO_DARK = "/logo-letras-final-blanco.svg";

const SCROLL_THRESHOLD = 500;

// Minimal header: no visible navigation links (drop-first homepage)

const MENU_SECTIONS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Novedades', href: '/#drops' },
      { label: 'Hombre', href: '/tienda?gender=hombre' },
      { label: 'Mujer', href: '/tienda?gender=mujer' },
    ]
  },

  {
    title: 'Marca',
    links: [
      { label: 'Sobre TAMBVRINI', href: '/marca' },
      { label: 'Filosofía', href: '/marca' },
      { label: 'Artesanía', href: '/marca' },
      { label: 'Editorial', href: '/marca' },
    ]
  }
];

export const Header = () => {
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  const { user } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If we land on home with #drops, smooth scroll to the drop grid.
  useEffect(() => {
    if (location.pathname === '/' && location.hash === '#drops') {
      scrollToDrops();
    }
  }, [location.pathname, location.hash]);



  // On homepage, header logo hidden until scroll passes threshold
  // On other pages, header logo always visible
  const scrolled = isHomePage ? scrollY > SCROLL_THRESHOLD : scrollY > 80;
  // Delay header logo reveal so we don't see a duplicated "medium" logo during the hero shrink.
  // We fade the header logo in right at the end of the hero animation.
  const headerFadeStart = SCROLL_THRESHOLD - 40; // ~460
  const headerFadeEnd = SCROLL_THRESHOLD + 80;   // ~580

  const headerLogoVisible = isHomePage ? scrollY > headerFadeStart : true;
  const headerLogoOpacity = isHomePage
    ? Math.min(1, Math.max(0, (scrollY - headerFadeStart) / (headerFadeEnd - headerFadeStart)))
    : 1;

  const logoSrc = LOGO_DARK;

  return (
    <>
      <header
        data-testid="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#F5F2EA]/95 backdrop-blur-md py-5 border-b border-black/5'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          {/* Left: Menu */}
          <div className="flex items-center gap-5 w-[120px]">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  data-testid="menu-toggle-btn"
                  className="text-obsidian/80 hover:text-obsidian transition-colors duration-300"
                >
                  <Menu size={20} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" hideClose className="w-full sm:w-[480px] bg-[#F5F2EA] border-r border-black/5 p-0 overflow-y-auto">
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-16">
                    <img src={logoSrc} alt="TAMBVRINI" className="h-5" />
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
                              onClick={() => {
                                setMenuOpen(false);
                                if (link.href === '/#drops') scrollToDrops();
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
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Header Logo — fades in after hero logo shrinks (homepage) or always visible (other pages) */}
          <Link
            to="/"
            data-testid="header-logo-link"
            className="flex-shrink-0 transition-opacity duration-500"
            style={{ opacity: headerLogoOpacity, pointerEvents: headerLogoVisible ? 'auto' : 'none' }}
          >
            <img
              src={logoSrc}
              alt="TAMBVRINI"
              className={`transition-all duration-500 ${isHomePage ? 'h-10 md:h-12' : (scrolled ? 'h-10 md:h-12' : 'h-16 md:h-28')}`}
            />
          </Link>

          {/* Right: Account + Wishlist + Cart */}
          <div className="flex items-center gap-5 w-[120px] justify-end">
            <Link
              to="/cuenta"
              data-testid="account-link"
              className="text-obsidian/80 hover:text-obsidian transition-colors duration-300 hidden sm:block"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link
              to="/favoritos"
              data-testid="wishlist-link"
              className="text-obsidian/80 hover:text-obsidian transition-colors duration-300 relative"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-obsidian text-[9px] font-montserrat font-medium flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <button
              data-testid="cart-toggle-btn"
              onClick={() => setIsOpen(true)}
              className="text-obsidian/80 hover:text-obsidian transition-colors duration-300 relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold text-obsidian text-[9px] font-montserrat font-medium flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>


      </header>


    </>
  );
};

export default Header;
