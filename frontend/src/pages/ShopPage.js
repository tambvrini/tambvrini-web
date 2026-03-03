import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { queryProducts } from '@/data/productHelpers';
import catalogProducts from '@/data/products';

const CATEGORY_LABELS = {
  novedades: 'Novedades',
  '2026': '2026',
  polos: 'Polos',
  sueteres: 'Suéteres',
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

const HEADER_LABEL_OVERRIDES = {
  hombre: 'UOMO',
  mujer: 'DONNA',
};

const MUJER_HERO_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/udlexuwa_hf_20260222_200211_c5c76655-5b93-4052-adc1-45fea5a9cdc5.jpg";
const MUJER_CINEMATIC_VIDEO = "https://customer-assets.emergentagent.com/job_14c68bcb-ef5d-44c9-b883-bd8d392c855c/artifacts/b92rzs04_ANUNCIO%20TAMBVRINI%203.mov";
const HOMBRE_CINEMATIC_VIDEO = "https://customer-assets.emergentagent.com/job_14c68bcb-ef5d-44c9-b883-bd8d392c855c/artifacts/nqiyik78_video%20final%20tambvrini%202.mov";

const HOMBRE_CAMPAIGN_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/91b5s9c4_HOMBRE.jpg";

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [introVisible, setIntroVisible] = useState(false);
  const introRef = useRef(null);
  const videoRef = useRef(null);

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
        const isNew = category === 'novedades' || searchParams.get('filter') === 'novedades';
        const result = queryProducts({
          category: category || undefined,
          gender: gender || undefined,
          collection: collection || undefined,
          search: search || undefined,
          sort: sort || undefined,
          is_new: isNew || undefined,
          page,
          limit: 20,
        });
        setProducts(result.products);
        setTotal(result.total);
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
    if (gender) return HEADER_LABEL_OVERRIDES[gender] || CATEGORY_LABELS[gender] || gender;
    if (category) return HEADER_LABEL_OVERRIDES[category] || CATEGORY_LABELS[category] || category;
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

  const isMensView = gender === 'hombre';
  const isWomenView = gender === 'mujer';
  const mujerProducts = useMemo(() => {
    if (!isWomenView) return filteredProducts;
    const poloAureus = catalogProducts.find((p) => p.product_id === 'polo-aureus');
    const poloPatricius = catalogProducts.find((p) => p.product_id === 'polo-patricius');
    const ordered = [...filteredProducts];
    let imperiumIndex = -1;
    let umbraIndex = -1;
    let hasAureus = false;
    let hasPatricius = false;

    ordered.forEach((p, index) => {
      if (p.product_id === 'camiseta-imperium') imperiumIndex = index;
      if (p.product_id === 'americana-umbra') umbraIndex = index;
      if (p.product_id === 'polo-aureus') hasAureus = true;
      if (p.product_id === 'polo-patricius') hasPatricius = true;
    });

    if (poloAureus && !hasAureus && imperiumIndex !== -1) {
      ordered.splice(imperiumIndex, 0, poloAureus);
      if (umbraIndex >= imperiumIndex) {
        umbraIndex += 1;
      }
    }

    if (poloPatricius && !hasPatricius && umbraIndex !== -1) {
      ordered.splice(umbraIndex + 1, 0, poloPatricius);
    }

    return ordered;
  }, [filteredProducts, isWomenView]);
  const gridProducts = isWomenView ? mujerProducts : filteredProducts;
  const displayTotal = isMensView ? filteredProducts.length : isWomenView ? mujerProducts.length : total;
  const isCinematicView = isWomenView || isMensView;
  const mensFirst = isMensView ? filteredProducts.slice(0, 4) : filteredProducts;
  const mensRest = isMensView ? filteredProducts.slice(4) : [];
  const mujerImperiumIndex = isWomenView
    ? mujerProducts.findIndex((p) => p.product_id === 'camiseta-imperium')
    : -1;
  const mujerGridItems = isWomenView && mujerImperiumIndex !== -1
    ? [
        ...mujerProducts.slice(0, mujerImperiumIndex + 1),
        { type: 'editorial', id: 'mujer-editorial' },
        ...mujerProducts.slice(mujerImperiumIndex + 1),
      ]
    : gridProducts;

  useEffect(() => {
    if (!isCinematicView) {
      setIntroProgress(1);
      setIntroVisible(false);
      window.dispatchEvent(new CustomEvent('cinematicProgress', { detail: 1 }));
      return;
    }

    setIntroVisible(true);

    const handleScroll = () => {
      if (!introRef.current) return;
      const start = introRef.current.offsetTop;
      const end = start + introRef.current.offsetHeight - window.innerHeight;
      const progress = end > start ? (window.scrollY - start) / (end - start) : 1;
      const clamped = Math.min(1, Math.max(0, progress));
      setIntroProgress(clamped);
      if (videoRef.current) {
        const volume = Math.max(0, Math.pow(1 - clamped, 1.4));
        videoRef.current.volume = volume;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isCinematicView]);

  useEffect(() => {
    if (!isCinematicView) return;
    window.dispatchEvent(new CustomEvent('cinematicProgress', { detail: introProgress }));
  }, [introProgress, isCinematicView]);

  useEffect(() => {
    if (!isCinematicView || !videoRef.current) return;
    const video = videoRef.current;
    video.muted = false;
    video.volume = 1;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {});
    }
  }, [isCinematicView]);

  const cinematicBackground = useMemo(() => {
    if (!isCinematicView) return undefined;
    const mix = (start, end, t) => Math.round(start + (end - start) * t);
    const t = Math.min(1, Math.max(0, introProgress));
    const r = mix(7, 255, t);
    const g = mix(8, 255, t);
    const b = mix(12, 255, t);
    return `rgb(${r}, ${g}, ${b})`;
  }, [introProgress, isCinematicView]);

  const overlayOpacity = isCinematicView ? 0.75 * (1 - introProgress) : 0;
  const videoScale = 1 - introProgress * 0.06;
  const videoOpacity = introVisible ? 1 : 0;
  const productsReveal = isCinematicView ? introProgress : 1;
  const cinematicVideoSrc = isMensView ? HOMBRE_CINEMATIC_VIDEO : MUJER_CINEMATIC_VIDEO;

  return (
    <div
      data-testid="shop-page"
      className="min-h-screen pt-32 md:pt-40 pb-24 noise-overlay editorial-noise"
      style={cinematicBackground ? { backgroundColor: cinematicBackground } : undefined}
    >
      {isCinematicView && (
        <div
          data-testid="category-cinematic-overlay"
          className="fixed inset-0 pointer-events-none transition-opacity duration-500"
          style={{ backgroundColor: 'rgba(5, 6, 10, 1)', opacity: overlayOpacity, zIndex: 5 }}
        />
      )}
      {isCinematicView && (
        <div
          ref={introRef}
          data-testid="category-cinematic-intro"
          className="relative w-screen max-w-none left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-32 md:-mt-40 h-[160vh]"
        >
          <div className="sticky top-0 h-screen flex items-center justify-center bg-[#06070C] relative z-[20]">
            <div className="relative z-[40] flex items-center justify-center w-full h-full">
              <div
                className="w-[min(88vw,960px)] aspect-[4/3] transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: `scale(${videoScale})`, opacity: videoOpacity }}
              >
                <video
                  ref={videoRef}
                  data-testid="category-cinematic-video"
                  src={cinematicVideoSrc}
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover rounded-[22px] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Header */}
        <div className="relative flex flex-col md:flex-row justify-start items-start md:items-end mt-20 md:mt-24 mb-10 md:mb-14 gap-6">
          <div className="w-full text-left">
            <h1 data-testid="shop-title" className="font-cinzel text-3xl md:text-4xl lg:text-5xl tracking-[0.12em] text-editorial-red font-normal">{getTitle()}</h1>
            <p className="font-montserrat text-xxs md:text-xs text-obsidian/40 mt-2 tracking-[0.12em]">
              {displayTotal} {displayTotal === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <div className="flex items-center gap-4 md:absolute md:right-0 md:bottom-0">
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
              <SelectContent className="bg-white border-black/10">
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
        ) : gridProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-playfair text-xl text-obsidian/50">No se encontraron productos</p>
            <button onClick={clearFilters} className="mt-6 btn-luxury text-xs">Ver todos los productos</button>
          </div>
        ) : isMensView && filteredProducts.length > 4 ? (
          <div
            className="space-y-10 md:space-y-14"
            style={
              isCinematicView
                ? {
                    opacity: productsReveal,
                    transform: `translateY(${(1 - productsReveal) * 24}px)`,
                    transition: 'opacity 500ms ease-out, transform 800ms cubic-bezier(0.22,1,0.36,1)',
                  }
                : undefined
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
              {mensFirst.map((p, i) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  index={i}
                enableHoverVideo={p.product_id === 'camiseta-sport-club' || p.product_id === 'polo-domus' || p.product_id === 'sueter-sylva' || p.product_id === 'polo-patricius'}
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
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14"
            style={
              isWomenView
                ? {
                    opacity: productsReveal,
                    transform: `translateY(${(1 - productsReveal) * 24}px)`,
                    transition: 'opacity 500ms ease-out, transform 800ms cubic-bezier(0.22,1,0.36,1)',
                  }
                : undefined
            }
          >
            {mujerGridItems.map((item, i) => (
              item?.type === 'editorial' ? (
                <div
                  key={item.id}
                  data-testid="mujer-editorial-insert"
                  className="col-span-2 md:col-span-3 lg:col-span-2"
                >
                  <div className="relative aspect-[16/9] overflow-hidden rounded-[22px] shadow-[0_18px_46px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out hover:scale-[1.01]">
                    <img
                      data-testid="mujer-editorial-image"
                      src={MUJER_HERO_IMAGE}
                      alt="Editorial Mujer TAMBVRINI"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <ProductCard
                  key={item.product_id}
                  product={item}
                  index={i}
                  enableHoverVideo={item.product_id === 'camiseta-sport-club' || item.product_id === 'polo-domus' || item.product_id === 'sueter-sylva' || item.product_id === 'polo-patricius'}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
