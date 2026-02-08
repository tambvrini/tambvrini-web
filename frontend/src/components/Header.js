import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '../components/ui/sheet';

const LOGO_WHITE = "/logo-letras-final-blanco.svg";

const SCROLL_THRESHOLD = 500;

const NAV_LINKS = [
  { label: 'Novedades', href: '/tienda?filter=novedades' },
  { label: 'Hombre', href: '/tienda?gender=hombre' },
  { label: 'Mujer', href: '/tienda?gender=mujer' },
  { label: 'Tennis Club', href: '/tienda?filter=tennis-club' },
  { label: 'Colecciones', href: '/tienda?collection=resort-2026' },
];

const MENU_SECTIONS = [
  {
    title: 'Tienda',
    links: [
      { label: 'Novedades', href: '/tienda?filter=novedades' },
      { label: 'Hombre', href: '/tienda?gender=hombre' },
      { label: 'Mujer', href: '/tienda?gender=mujer' },
      { label: 'Accesorios', href: '/tienda?category=accesorios' },
      { label: 'Marroquinería', href: '/tienda?category=marroquineria' },
      { label: 'Calzado', href: '/tienda?category=calzado' },
      { label: 'Resort de Verano', href: '/tienda?category=resort' },
      { label: 'Tennis Club', href: '/tienda?filter=tennis-club' },
    ]
  },
  {
    title: 'Colecciones',
    links: [
      { label: 'Resort 2026', href: '/tienda?collection=resort-2026' },
      { label: 'Tennis Club', href: '/tienda?collection=tennis-club' },
      { label: 'Roma', href: '/tienda?collection=roma' },
      { label: 'Atelier', href: '/tienda?collection=atelier' },
      { label: 'Piezas Limitadas', href: '/tienda?collection=limited' },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
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

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tienda?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

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

  return (
    <>
      <header
        data-testid="main-header"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-obsidian/95 backdrop-blur-md py-5 border-b border-white/5'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between">
          {/* Left: Search + Menu */}
          <div className="flex items-center gap-5 w-[200px]">
            <button
              data-testid="search-toggle-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-marble/80 hover:text-gold transition-colors duration-300"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  data-testid="menu-toggle-btn"
                  className="text-marble/80 hover:text-gold transition-colors duration-300"
                >
                  <Menu size={20} strokeWidth={1.5} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" hideClose className="w-full sm:w-[480px] bg-obsidian border-r border-white/5 p-0 overflow-y-auto">
                <div className="p-8 md:p-12">
                  <div className="flex justify-between items-center mb-16">
                    <img src={LOGO_WHITE} alt="TAMBVRINI" className="h-5" />
                    <SheetClose asChild>
                      <button data-testid="menu-close-btn">
                        <X size={24} className="text-marble/60 hover:text-marble" />
                      </button>
                    </SheetClose>
                  </div>
                  {MENU_SECTIONS.map((section, i) => (
                    <div key={i} className="mb-12">
                      <h3 className="font-cinzel text-xs tracking-[0.3em] uppercase text-gold mb-6">{section.title}</h3>
                      <ul className="space-y-4">
                        {section.links.map((link, j) => (
                          <li key={j}>
                            <Link
                              to={link.href}
                              onClick={() => setMenuOpen(false)}
                              className="font-montserrat text-sm text-marble/70 hover:text-marble tracking-wide transition-colors duration-300 block"
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
              src={LOGO_WHITE}
              alt="TAMBVRINI"
              className={`transition-all duration-500 ${isHomePage ? 'h-10 md:h-12' : (scrolled ? 'h-10 md:h-12' : 'h-16 md:h-28')}`}
            />
          </Link>

          {/* Right: Account + Wishlist + Cart */}
          <div className="flex items-center gap-5 w-[200px] justify-end">
            <Link
              to="/cuenta"
              data-testid="account-link"
              className="text-marble/80 hover:text-gold transition-colors duration-300 hidden sm:block"
            >
              <User size={20} strokeWidth={1.5} />
            </Link>
            <Link
              to="/favoritos"
              data-testid="wishlist-link"
              className="text-marble/80 hover:text-gold transition-colors duration-300 relative"
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
              className="text-marble/80 hover:text-gold transition-colors duration-300 relative"
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

        {/* Subnav links - desktop only, visible only when header is solid */}
        <nav
          className={`hidden lg:flex justify-center gap-10 mt-3 transition-all duration-500 ${
            scrolled ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
          }`}
        >
          {NAV_LINKS.map((link, i) => (
            <Link
              key={i}
              to={link.href}
              className="font-montserrat text-[11px] tracking-[0.2em] uppercase text-marble/50 hover:text-marble transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-obsidian/95 backdrop-blur-lg flex items-start justify-center pt-32">
          <div className="w-full max-w-2xl px-6">
            <form onSubmit={handleSearch}>
              <input
                ref={searchRef}
                data-testid="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full bg-transparent border-b border-white/20 pb-4 text-2xl md:text-4xl font-playfair text-marble focus:outline-none focus:border-gold placeholder:text-white/20"
              />
            </form>
            <button
              data-testid="search-close-btn"
              onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
              className="absolute top-8 right-8 text-marble/60 hover:text-marble"
            >
              <X size={28} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
