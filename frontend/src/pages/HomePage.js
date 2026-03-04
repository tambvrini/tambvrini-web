import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import IntroVideoSection from '../components/IntroVideoSection.tsx';
import { queryProducts } from '@/data/productHelpers';

const LOGO_WHITE = "/logo-letras-final-blanco.svg";
const HERO_IMAGE = "/hero-main.jpg";
const HERO_ASPECT_RATIO_CLASS = "h-screen";

const NOVEDADES_HOMBRE_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/had86o8r_hf_20260213_213626_2abfbed4-aa1c-4aef-9cbb-2f94a6ca4225.png";
const NOVEDADES_MUJER_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/gmhgobyc_hf_20260213_214633_0565b32b-1650-49f6-87d1-ae0424c2505d.png";
const NOVEDADES_HOMBRE_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/sbeaj2rx_video%20hombre.mp4";
const NOVEDADES_MUJER_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/mzrddski_video%20mujer.mp4";
const DROP_EDITORIAL_IMAGE = "https://customer-assets.emergentagent.com/job_ed531f3b-442c-4069-8f9a-a4817ba88a48/artifacts/jaoxpz4f_10.jpg";
const EDITORIAL_HERO_IMAGE = "https://customer-assets.emergentagent.com/job_602a5873-5674-439a-a044-350968db276c/artifacts/l2b60pgp_Sin%20t%C3%ADtulo-122222.jpg";
const DROP_CAMPAIGN_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/74ejw418_campa%C3%B1a%202.jpg";
const LIMITED_EDITIONS_BANNER_IMAGE = `${process.env.PUBLIC_URL}/images/limited-editions-banner.jpg`;
const EDITORIAL_POLOS_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/v4zs6ugs_hf_20260222_181550_e58e110a-c888-46f9-818a-7daac73fbd28.jpeg";
const EDITORIAL_SUETERES_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/lks43ws5_hf_20260222_183135_094a5ad6-f6e8-407f-8fd4-6dceef064698.jpeg";
const LIMITED_BANNER_FALLBACK_MS = 2000;
// (Campaign/categories/tennis/story visuals removed for simplified DROP-style homepage)


/* ============ HERO with GUCCI-style animated logo ============ */
const SCROLL_THRESHOLD = 500;

const HeroSection = () => {
  const { scrollY } = useScroll();
  const [viewportH, setViewportH] = useState(800);

  useEffect(() => {
    setViewportH(window.innerHeight);
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Hero logo: starts GIANT centered, shrinks + moves up, fades out before reaching header
  // We smooth the scroll progress with a spring to get a more premium, Gucci-like feel.
  const rawProgress = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, 1]);
  const progress = useSpring(rawProgress, {
    // More critically damped to avoid any "bounce back" feeling.
    stiffness: 110,
    damping: 32,
    mass: 0.9,
    restDelta: 0.001,
  });

  // Scale end tuned to match the (now smaller) header logo size more proportionally.
  const logoScale = useTransform(progress, [0, 1], [1, 0.06]);
  const logoY = useTransform(progress, [0, 1], [0, -(viewportH * 0.44)]);
  // Keep the hero logo fully visible until it's nearly at the final (small) size,
  // so we avoid the unwanted "medium logo" handoff step.
  const heroLogoOpacity = useTransform(progress, [0.9, 1], [1, 0]);

  // Hero overlay darkens as you scroll
  const overlayOpacity = useTransform(progress, [0, 1], [0.08, 0.22]);

  // CTA buttons fade out quickly
  const buttonsOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const buttonsY = useTransform(scrollY, [0, 250], [0, 40]);

  return (
      <section data-testid="hero-section" className="relative w-full">
        {/* Background image */}
        <div className={`relative w-full ${HERO_ASPECT_RATIO_CLASS}`}>
          <img src={HERO_IMAGE} alt="TAMBVRINI Campaign" className="block w-full h-full object-cover object-center brightness-105" />
          <motion.div className="absolute inset-0 bg-white" style={{ opacity: overlayOpacity }} />
          <div className="absolute inset-0 z-10">
            <div className="relative w-full h-full">
              {/* CTA Buttons at bottom of hero */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-20 md:bottom-24 left-0 right-0 z-10 flex flex-col sm:flex-row justify-center gap-4 px-6"
                style={{ opacity: buttonsOpacity, y: buttonsY }}
              >
                <Link
                  to="/tienda?gender=hombre"
                  data-testid="hero-shop-men"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                  className="btn-luxury text-center"
                >
                  Comprar Hombre
                </Link>
                <Link
                  to="/tienda?gender=mujer"
                  data-testid="hero-shop-women"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                  className="btn-luxury text-center"
                >
                  Comprar Mujer
                </Link>
                <button
                  type="button"
                  data-testid="hero-explore"
                  onClick={() => {
                    const el = document.getElementById('drops');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="btn-luxury btn-gold text-center"
                >
                  Explorar
                </button>
              </motion.div>
            </div>
          </div>
        </div>

      {/* Animated GIANT logo — fixed position, transforms from center to header */}
      <motion.div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[52] pointer-events-none"
        style={{ opacity: heroLogoOpacity }}
      >
        <motion.img
          src={LOGO_WHITE}
          alt="TAMBVRINI"
          className="w-[88vw] md:w-[78vw] lg:w-[72vw] max-w-[1250px] origin-center"
          style={{
            scale: logoScale,
            y: logoY,
            willChange: 'transform',
          }}
        />
      </motion.div>

    </section>
  );
};

const NovedadesTile = ({ title, bg, videoSrc, to, testId }) => {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (!hovered) {
      v.pause();
      v.currentTime = 0;
      return;
    }

    v.load();
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [hovered]);

  return (
    <Link
      to={to}
      data-testid={testId}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
      className="group text-left block"
      aria-label={title}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 rounded-[28px]">
        <img
          src={bg}
          alt={title}
          loading="lazy"
          className={`w-full h-auto object-contain object-center ${hovered ? 'hidden' : 'block'}`}
        />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={bg}
          src={videoSrc}
          className={`w-full h-auto max-w-full object-contain object-center ${hovered ? 'block' : 'hidden'}`}
        />

        {/* Keep luminosity consistent between image/video */}
        <div className="absolute inset-0 bg-black/5" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-10">
          <p className="font-cinzel text-[11px] tracking-[0.35em] uppercase text-obsidian/60">Novedades</p>
          <h3 className="mt-4 font-playfair text-2xl md:text-3xl text-obsidian tracking-wide text-center">{title}</h3>
          <span className="mt-8 inline-flex items-center justify-center border border-black/15 px-10 py-4 font-montserrat text-[10px] tracking-[0.25em] uppercase text-obsidian/80 group-hover:border-black/30 group-hover:text-obsidian transition-colors duration-500">
            Comprar
          </span>
        </div>
      </div>
    </Link>
  );
};


/* ============ DROP GRID (Homepage main focus) ============ */
const DropGridSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCollectionTransition, setShowCollectionTransition] = useState(false);
  const [limitedBannerVisible, setLimitedBannerVisible] = useState(false);
  const [limitedBannerAnimated, setLimitedBannerAnimated] = useState(false);
  const limitedBannerRef = useRef(null);
  const navigate = useNavigate();
  const limitedBannerClassName = useMemo(
    () =>
      [
        'limited-editions-banner',
        'limited-editions-banner--fade-default',
        'block',
        'w-full',
        'relative',
        'z-[1]',
        limitedBannerAnimated && !limitedBannerVisible ? 'limited-editions-banner--fade-init' : '',
        limitedBannerVisible ? 'limited-editions-banner--fade-visible' : '',
      ]
        .filter(Boolean)
        .join(' '),
    [limitedBannerAnimated, limitedBannerVisible]
  );

  const handleCollectionClick = () => {
    if (showCollectionTransition) return;
    setShowCollectionTransition(true);
    setTimeout(() => {
      navigate('/tienda?category=2026');
    }, 450);
  };

  useEffect(() => {
    const element = limitedBannerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setLimitedBannerVisible(true);
      return;
    }

    setLimitedBannerAnimated(true);

    const fallbackTimer = setTimeout(() => {
      setLimitedBannerVisible(true);
    }, LIMITED_BANNER_FALLBACK_MS);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallbackTimer);
          setLimitedBannerVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);


  useEffect(() => {
    const fetchDrop = async () => {
      setLoading(true);
      try {
        const result = queryProducts({ limit: 50 });
        const all = result.products || [];
        // Option A (confirmed): only remove Tennis Club items. Keep other collections.
        const filtered = all.filter((p) => {
          const cats = Array.isArray(p.category) ? p.category : [];
          const cols = Array.isArray(p.collections) ? p.collections : [];
          if (cats.includes('tennis-club')) return false;
          if (cols.includes('tennis-club')) return false;
          return true;
        });
        setProducts(filtered);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrop();
  }, []);

  return (
    <section id="drops" data-testid="drop-grid" className="py-24 md:py-32">
      {showCollectionTransition && (
        <motion.div
          data-testid="collection-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed inset-0 z-[80] bg-white/90 backdrop-blur-sm flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="px-10 py-4 rounded-full border border-[#E6E0D4]/70"
          >
            <span className="font-playfair text-sm tracking-[0.35em] uppercase text-obsidian/70">
              Sport Club 2026
            </span>
          </motion.div>
        </motion.div>
      )}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* 8 items: 2 rows of 4 on desktop */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="mt-4 h-3 bg-white/5 w-2/3" />
                <div className="mt-2 h-3 bg-white/5 w-1/3" />
              </div>
            ))}
          </div>
        ) : (() => {
          // Force “Suéter Captain” to render as the 8th (last) item in the 2nd row on desktop.
          const captain = products.find((p) => p.product_id === 'sueter-captain');
          const domus = products.find((p) => p.product_id === 'polo-domus');
          const sylva = products.find((p) => p.product_id === 'sueter-sylva');
          const patricius = products.find((p) => p.product_id === 'polo-patricius');
          const regius = products.find((p) => p.product_id === 'polo-regius');
          const rest = products.filter(
            (p) =>
              p.product_id !== 'sueter-captain' &&
              p.product_id !== 'polo-domus' &&
              p.product_id !== 'sueter-sylva' &&
              p.product_id !== 'polo-patricius' &&
              p.product_id !== 'polo-regius'
          );
          const base = rest.slice(0, captain ? 7 : 8);
          const displayed = captain ? [...base, captain] : base;
          const firstRow = displayed.slice(0, 4);
          const secondRow = displayed.slice(4, 8);
          const spotlight = [domus, sylva, patricius, regius].filter(Boolean);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                {firstRow.map((p, i) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    index={i}
                    enableHoverVideo={p.product_id === 'camiseta-sport-club' || p.product_id === 'polo-golf' || p.product_id === 'camiseta-imperium' || p.product_id === 'americana-umbra' || p.product_id === 'sueter-captain' || p.product_id === 'polo-aureus' || p.product_id === 'traje-monograma-tambvrini' || p.product_id === 'bolso-monograma-tambvrini' || p.product_id === 'polo-domus' || p.product_id === 'sueter-sylva' || p.product_id === 'polo-patricius'}
                    enableWishlistIcon
                  />
                ))}
              </div>

              <div className="my-6 md:my-8">
                <div className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                  <img
                    data-testid="editorial-divider-image"
                    src={DROP_EDITORIAL_IMAGE}
                    alt="Editorial TAMBVRINI"
                    className="mx-auto w-full h-auto object-contain object-center"
                    loading="lazy"
                  />
                </div>
              </div>

              <div data-testid="editorial-collections-section" className="mt-6 md:mt-8 mb-4 md:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="text-center">
                    <Link
                      to="/tienda?category=polos"
                      data-testid="editorial-polos-link"
                      className="group block"
                    >
                      <div className="overflow-hidden rounded-[22px]">
                        <img
                          src={EDITORIAL_POLOS_IMAGE}
                          alt="Colección Polos"
                          loading="lazy"
                          className="w-full h-auto object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                    <span
                      data-testid="editorial-polos-label"
                      className="mt-3 block font-playfair text-[12px] md:text-[13px] tracking-[0.28em] text-[#1a1a1a]/85"
                    >
                      POLOS
                    </span>
                  </div>
                  <div className="text-center">
                    <Link
                      to="/tienda?category=sueteres"
                      data-testid="editorial-sueteres-link"
                      className="group block"
                    >
                      <div className="overflow-hidden rounded-[22px]">
                        <img
                          src={EDITORIAL_SUETERES_IMAGE}
                          alt="Colección Suéteres"
                          loading="lazy"
                          className="w-full h-auto object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    </Link>
                    <span
                      data-testid="editorial-sueteres-label"
                      className="mt-3 block font-playfair text-[12px] md:text-[13px] tracking-[0.28em] text-[#1a1a1a]/85"
                    >
                      SUÉTERES
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                {secondRow.map((p, i) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    index={i + firstRow.length}
                    enableHoverVideo={p.product_id === 'camiseta-sport-club' || p.product_id === 'polo-golf' || p.product_id === 'camiseta-imperium' || p.product_id === 'americana-umbra' || p.product_id === 'sueter-captain' || p.product_id === 'polo-aureus' || p.product_id === 'traje-monograma-tambvrini' || p.product_id === 'bolso-monograma-tambvrini'}
                    enableWishlistIcon
                  />
                ))}
              </div>

              {spotlight.length > 0 && (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                  {spotlight.map((item, i) => (
                    <ProductCard
                      key={item.product_id}
                      product={item}
                      index={displayed.length + i}
                      enableHoverVideo={item.product_id === 'camiseta-sport-club' || item.product_id === 'polo-golf' || item.product_id === 'camiseta-imperium' || item.product_id === 'americana-umbra' || item.product_id === 'sueter-captain' || item.product_id === 'polo-aureus' || item.product_id === 'traje-monograma-tambvrini' || item.product_id === 'bolso-monograma-tambvrini'}
                      enableWishlistIcon
                    />
                  ))}
                </div>
              )}

              <div className="mt-8 md:mt-10 mb-6 md:mb-8">
                <div className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                  <div className="relative w-full">
                    <img
                      data-testid="campaign-divider-image"
                      src={DROP_CAMPAIGN_IMAGE}
                      alt="Editorial Casablanca TAMBVRINI"
                      className="w-full h-auto object-contain object-center"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className="text-center max-w-[640px]">
                        <h2
                          data-testid="campaign-collection-title"
                          className="font-playfair text-[34px] md:text-[56px] lg:text-[64px] tracking-[0.08em] text-[#F6F1E7]/90 font-light"
                        >
                          Sport Club 2026
                        </h2>
                        <button
                          data-testid="campaign-collection-button"
                          type="button"
                          onClick={handleCollectionClick}
                          className="mt-6 inline-flex items-center justify-center rounded-full border border-[#F6F1E7]/70 px-8 py-3 font-montserrat text-[10px] tracking-[0.32em] uppercase text-[#F6F1E7]/85 transition-all duration-500 hover:text-[#F6F1E7] hover:border-[#F6F1E7] hover:shadow-[0_0_18px_rgba(0,0,0,0.04)] hover:bg-white/5"
                        >
                          Comprar la Colección
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8 md:mb-10">
                <Link
                  to="/limited-editions"
                  data-testid="limited-editions-banner-link"
                  ref={limitedBannerRef}
                  className={limitedBannerClassName}
                >
                  <div className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                    <div className="w-full flex justify-center">
                      <div className="relative w-full">
                        <img
                          data-testid="limited-editions-banner-image"
                          src={LIMITED_EDITIONS_BANNER_IMAGE}
                          alt="Limited Editions collection banner - explore exclusive pieces"
                          className="block w-full h-auto limited-editions-banner-image"
                          loading="lazy"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-6 left-6 md:bottom-10 md:left-10 rounded-full bg-white/15 px-4 py-2 font-montserrat text-[12px] tracking-[0.28em] uppercase text-white/85"
                        >
                          LIMITED EDITIONS
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <div className="mb-8 md:mb-10">
                <div className="w-[94%] max-w-[1760px] mx-auto">
                  <div className="relative w-full aspect-video rounded-[28px] overflow-hidden">
                    <img
                      data-testid="editorial-hero-image"
                      src={EDITORIAL_HERO_IMAGE}
                      alt="Editorial TAMBVRINI"
                      className="w-full h-auto object-contain object-center"
                      loading="lazy"
                    />
                    <Link
                      data-testid="editorial-hero-cta"
                      to="/tienda?category=novedades"
                      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                      className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 rounded-full border border-[#F5F2EA]/70 bg-transparent px-6 py-2 text-[11px] tracking-[0.25em] uppercase font-montserrat text-[#1a1a1a] transition-colors duration-300 hover:bg-white hover:text-[#1a1a1a]"
                    >
                      Descubrir
                    </Link>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

        {/* Aesthetic-only promo tiles (scroll to drops) */}
        <div id="novedades" data-testid="novedades-section" className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-2 gap-10">
          <NovedadesTile
            title="Novedades para Hombre"
            bg={NOVEDADES_HOMBRE_BG}
            videoSrc={NOVEDADES_HOMBRE_VIDEO}
            to="/tienda?gender=hombre"
            testId="novedades-hombre-link"
          />
          <NovedadesTile
            title="Novedades para Mujer"
            bg={NOVEDADES_MUJER_BG}
            videoSrc={NOVEDADES_MUJER_VIDEO}
            to="/tienda?gender=mujer"
            testId="novedades-mujer-link"
          />
        </div>
      </div>
    </section>
  );
};

/* ============ CINEMATIC VIDEO LOOP (below promo tiles) ============ */


/* ============ HOMEPAGE ============ */
export default function HomePage() {
  return (
    <div data-testid="home-page" className="noise-overlay editorial-noise bg-white">
      <HeroSection />

      <IntroVideoSection />

      {/* (removed editorial divider) */}

      <DropGridSection />
    </div>
  );
}
