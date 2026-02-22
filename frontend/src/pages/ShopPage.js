import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CATEGORY_LABELS = {
  novedades: 'Novedades',
  hombre: 'Hombre',
  mujer: 'Mujer',
  accesorios: 'Accesorios',
  marroquineria: 'Marroquinería',
  calzado: 'Calzado',
};

const COLLECTION_LABELS = {
  roma: 'Roma',
  atelier: 'Atelier',
  limited: 'Piezas Limitadas',
};

const HOMBRE_CAMPAIGN_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/91b5s9c4_HOMBRE.jpg";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || searchParams.get('filter') || '';
  const gender = searchParams.get('gender') || '';
  const collection = searchParams.get('collection') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [category, gender, collection, search, sort, page]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (gender) params.set('gender', gender);
        if (collection) params.set('collection', collection);
        if (search) params.set('search', search);
        if (sort) params.set('sort', sort);
        if (category === 'novedades' || searchParams.get('filter') === 'novedades') params.set('is_new', 'true');
        params.set('page', page.toString());
        params.set('limit', '20');
        const res = await axios.get(`${API}/products?${params.toString()}`);
        setProducts(res.data.products);
        setTotal(res.data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, gender, collection, search, sort, page]);

  const getTitle = () => {
    if (search) return `Resultados: "${search}"`;
    if (gender) return CATEGORY_LABELS[gender] || gender;
    if (category) return CATEGORY_LABELS[category] || category;
    if (collection) return COLLECTION_LABELS[collection] || collection;
    return 'Tienda';
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = category || gender || collection || search;

  const filteredProducts = gender === 'hombre'
    ? products.filter((p) => p.product_id !== 'bolso-monograma-tambvrini' && p.product_id !== 'americana-umbra')
    : gender === 'mujer'
      ? products.filter((p) => p.product_id !== 'traje-monograma-tambvrini')
      : products;

  const displayTotal = gender === 'hombre' ? filteredProducts.length : total;
  const isMensView = gender === 'hombre';
  const mensFirst = isMensView ? filteredProducts.slice(0, 4) : filteredProducts;
  const mensRest = isMensView ? filteredProducts.slice(4) : [];

  return (
    <div data-testid="shop-page" className="min-h-screen pt-32 md:pt-40 pb-24 noise-overlay editorial-noise">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div>
            <h1 data-testid="shop-title" className="font-cinzel text-3xl md:text-4xl lg:text-5xl tracking-[0.1em] text-obsidian">{getTitle()}</h1>
            <p className="font-montserrat text-xs text-obsidian/50 mt-3 tracking-wide">
              {displayTotal} {displayTotal === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <button
                data-testid="clear-filters-btn"
                onClick={clearFilters}
                className="flex items-center gap-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/50 hover:text-obsidian transition-colors duration-300"
              >
                <X size={12} /> Limpiar filtros
              </button>
            )}
            <Select value={sort} onValueChange={(v) => { const p = new URLSearchParams(searchParams); p.set('sort', v); setSearchParams(p); }}>
              <SelectTrigger data-testid="sort-select" className="w-[200px] bg-transparent border-black/10 text-obsidian/60 font-montserrat text-xs">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-[#F5F2EA] border-black/10">
                <SelectItem value="newest" className="text-obsidian/80 font-montserrat text-xs">Más recientes</SelectItem>
                <SelectItem value="price_asc" className="text-obsidian/80 font-montserrat text-xs">Precio: menor a mayor</SelectItem>
                <SelectItem value="price_desc" className="text-obsidian/80 font-montserrat text-xs">Precio: mayor a menor</SelectItem>
                <SelectItem value="name" className="text-obsidian/80 font-montserrat text-xs">Nombre A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-12">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              data-testid={`filter-${key}`}
              onClick={() => {
                const p = new URLSearchParams();
                if (key === 'hombre' || key === 'mujer') p.set('gender', key);
                else p.set('category', key);
                setSearchParams(p);
              }}
              className={`font-montserrat text-[10px] tracking-[0.15em] uppercase py-2 px-5 border transition-colors duration-300 ${
                category === key || gender === key
                  ? 'border-gold text-gold'
                  : 'border-black/10 text-obsidian/50 hover:text-obsidian hover:border-black/30'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/5 mb-4" />
                <div className="h-3 bg-white/5 w-2/3 mb-2" />
                <div className="h-3 bg-white/5 w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-xl text-obsidian/50">No se encontraron productos</p>
            <button onClick={clearFilters} className="mt-6 btn-luxury text-xs">Ver todos los productos</button>
          </div>
        ) : isMensView && filteredProducts.length > 4 ? (
          <div className="space-y-10 md:space-y-14">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {mensFirst.map((p, i) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  index={i}
                  enableHoverVideo={p.product_id === 'camiseta-sport-club'}
                />
              ))}
            </div>
            <div className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
              <img
                data-testid="mens-campaign-image"
                src={HOMBRE_CAMPAIGN_IMAGE}
                alt="Campaña Hombre TAMBVRINI"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {mensRest.map((p, i) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  index={i + mensFirst.length}
                  enableHoverVideo={p.product_id === 'camiseta-sport-club'}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
            {filteredProducts.map((p, i) => (
              <ProductCard
                key={p.product_id}
                product={p}
                index={i}
                enableHoverVideo={p.product_id === 'camiseta-sport-club'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
