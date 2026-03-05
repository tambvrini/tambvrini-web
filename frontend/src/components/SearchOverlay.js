import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import products from '../data/products';

const POPULAR_SEARCHES = [
  { label: 'Polos', query: 'Polo' },
  { label: 'Suéteres', query: 'Suéter' },
  { label: 'Camisetas', query: 'Camiseta' },
  { label: 'Trajes', query: 'Traje' },
  { label: 'Bolsos', query: 'Bolso' },
];

const resolveThumbnail = (product) => product.thumbnail_image || product.images?.[0] || '';

const resolveCategoryLabel = (product) => {
  if (!product.category?.length) return '';
  return product.category.join(' / ');
};

const SearchOverlay = ({ open, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setSearchQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      return undefined;
    }

    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const normalizedQuery = searchQuery.trim();
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    const lowered = normalizedQuery.toLowerCase();
    return products
      .filter(
        (product) =>
          product.name?.toLowerCase().includes(lowered) ||
          product.description?.toLowerCase().includes(lowered)
      )
      .slice(0, 6);
  }, [normalizedQuery]);

  const trendingProducts = useMemo(() => {
    const featured = products.filter((product) => product.is_featured);
    const picks = featured.length > 0 ? featured : products;
    return picks.slice(0, 4);
  }, []);

  const showResults = normalizedQuery.length > 0;

  return (
    <div
      data-testid="search-overlay"
      data-state={open ? 'open' : 'closed'}
      className={`fixed inset-0 z-[70] bg-white transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-w-[1280px] mx-auto px-6 md:px-12 lg:px-24 pt-24 pb-16 transition-transform duration-300 ${
          open ? 'translate-y-0' : '-translate-y-4'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="w-full max-w-3xl">
            <label htmlFor="search-input" className="sr-only">
              Buscar productos
            </label>
            <input
              id="search-input"
              ref={inputRef}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="¿Qué está buscando?"
              className="w-full text-3xl md:text-4xl font-playfair text-obsidian placeholder:text-obsidian/30 border-b border-black/10 focus:outline-none focus:border-black/30 pb-4"
            />
          </div>
          <button
            type="button"
            data-testid="search-close-btn"
            onClick={onClose}
            className="mt-2 text-obsidian/60 hover:text-obsidian transition-colors duration-300"
            aria-label="Cerrar búsqueda"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-12">
          <div className="space-y-10">
            {showResults ? (
              <div className="space-y-6 transition-opacity duration-300">
                <p className="font-cinzel text-[11px] tracking-[0.3em] uppercase text-obsidian/50">
                  Resultados
                </p>
                {results.length > 0 ? (
                  <div className="space-y-5">
                    {results.map((product) => (
                      <Link
                        key={product.product_id}
                        to={`/producto/${product.product_id}`}
                        onClick={onClose}
                        className="flex items-center gap-4 group"
                      >
                        <div className="w-16 h-20 border border-black/10 overflow-hidden bg-white">
                          {resolveThumbnail(product) ? (
                            <img
                              src={resolveThumbnail(product)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-black/5" />
                          )}
                        </div>
                        <div>
                          <p className="font-montserrat text-sm text-obsidian group-hover:text-obsidian transition-colors duration-300">
                            {product.name}
                          </p>
                          <p className="font-montserrat text-[10px] uppercase tracking-[0.25em] text-obsidian/40 mt-1">
                            {resolveCategoryLabel(product)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="font-montserrat text-sm text-obsidian/40">
                    No hay resultados para esta búsqueda.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6 transition-opacity duration-300">
                <p className="font-cinzel text-[11px] tracking-[0.3em] uppercase text-obsidian/50">
                  Búsquedas populares
                </p>
                <div className="flex flex-wrap gap-3">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term.label}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term.query);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2 border border-black/10 text-obsidian/60 font-montserrat text-[11px] tracking-[0.2em] uppercase hover:border-black/30 hover:text-obsidian transition-colors duration-300"
                    >
                      {term.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <p className="font-cinzel text-[11px] tracking-[0.3em] uppercase text-obsidian/50">
              Productos en tendencia
            </p>
            <div className="space-y-5">
              {trendingProducts.map((product) => (
                <Link
                  key={product.product_id}
                  to={`/producto/${product.product_id}`}
                  onClick={onClose}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-14 h-16 border border-black/10 overflow-hidden bg-white">
                    {resolveThumbnail(product) ? (
                      <img
                        src={resolveThumbnail(product)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black/5" />
                    )}
                  </div>
                  <div>
                    <p className="font-montserrat text-sm text-obsidian group-hover:text-obsidian transition-colors duration-300">
                      {product.name}
                    </p>
                    <p className="font-montserrat text-[11px] text-obsidian/50">
                      {product.price?.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
