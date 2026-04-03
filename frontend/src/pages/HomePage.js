import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Logo from '../components/Logo';
import ProductCard from '../components/ProductCard';
import IntroVideoSection from '../components/IntroVideoSection.tsx';
import { queryProducts } from '@/data/productHelpers';
import { supportsHoverVideo } from '../constants/hoverVideoProducts';

const HERO_IMAGE = "/images/header-tambvrini-yo.jpg";
const HERO_IMAGE_MOBILE = "/images/header-vertical-final.jpg.jpeg";
const HERO_WRAPPER_CLASSES = "h-screen overflow-hidden";

const NOVEDADES_HOMBRE_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/had86o8r_hf_20260213_213626_2abfbed4-aa1c-4aef-9cbb-2f94a6ca4225.png";
const NOVEDADES_MUJER_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/gmhgobyc_hf_20260213_214633_0565b32b-1650-49f6-87d1-ae0424c2505d.png";
const NOVEDADES_HOMBRE_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/sbeaj2rx_video%20hombre.mp4";
const NOVEDADES_MUJER_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/mzrddski_video%20mujer.mp4";
const DROP_EDITORIAL_IMAGE = "https://customer-assets.emergentagent.com/job_ed531f3b-442c-4069-8f9a-a4817ba88a48/artifacts/jaoxpz4f_10.jpg";
const EDITORIAL_HERO_IMAGE = "/images/header-primavera.jpeg";
const DROP_CAMPAIGN_IMAGE = "https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/74ejw418_campa%C3%B1a%202.jpg";
const EDITORIAL_POLOS_IMAGE = "/images/heades-polos.png";
const EDITORIAL_SUETERES_IMAGE = "/images/header-sueteres.png";
const HTML_MEDIA_READY_STATE_FALLBACK = 2; // Fallback for HTMLMediaElement.HAVE_CURRENT_DATA (2) in non-browser envs.
const HTML_MEDIA_READY_STATE_TARGET = typeof HTMLMediaElement !== 'undefined'
  ? HTMLMediaElement.HAVE_CURRENT_DATA
  : HTML_MEDIA_READY_STATE_FALLBACK;
export const LIMITED_EDITIONS_SYNC_THRESHOLD_SECONDS = 0.08;
export const LIMITED_EDITIONS_SYNC_INTERVAL_MS = 250;
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

  // CTA buttons fade out quickly
  const buttonsOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const buttonsY = useTransform(scrollY, [0, 250], [0, 40]);

  return (
      <section data-testid="hero-section" className="hero relative w-full">
        {/* Background image */}
        <div className={`relative w-full ${HERO_WRAPPER_CLASSES}`}>
          <picture>
            <source media="(max-width: 767px)" srcSet={HERO_IMAGE_MOBILE} type="image/jpeg" />
            <img
              src={HERO_IMAGE}
              alt="TAMBVRINI Campaign"
              loading="eager"
              fetchPriority="high"
              className="hero-image-cinematic block w-full h-full object-cover object-center"
            />
          </picture>
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
                  className="btn-luxury hero-cta-luxury text-center"
                >
                  Comprar Hombre
                </Link>
                <Link
                  to="/tienda?gender=mujer"
                  data-testid="hero-shop-women"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}
                  className="btn-luxury hero-cta-luxury text-center"
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
                  className="btn-luxury btn-gold hero-cta-luxury text-center"
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
        <motion.div
          className="origin-center"
          style={{
            scale: logoScale,
            y: logoY,
            willChange: 'transform',
          }}
        >
          <Logo
            className="logo hero-logo w-[88vw] md:w-[78vw] lg:w-[72vw] max-w-[1250px]"
          />
        </motion.div>
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
  const limitedEditionsVideosContainerRef = useRef(null);


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

  useEffect(() => {
    if (loading) return;
    const container = limitedEditionsVideosContainerRef.current;
    if (!container) return;
    const videos = [
      container.querySelector('[data-testid="limited-editions-left-video"]'),
      container.querySelector('[data-testid="limited-editions-right-video"]'),
    ].filter(Boolean);
    if (videos.length < 2) return;
    let cancelled = false;
    let syncInterval = null;
    const handlers = new Map();

    const waitForVideo = (video) => new Promise((resolve) => {
      if (video.readyState >= HTML_MEDIA_READY_STATE_TARGET) {
        resolve();
        return;
      }
      const handleLoaded = () => {
        video.removeEventListener('loadeddata', handleLoaded);
        resolve();
      };
      handlers.set(video, handleLoaded);
      video.addEventListener('loadeddata', handleLoaded);
    });

    Promise.all(videos.map(waitForVideo)).then(() => {
      if (cancelled) return;
      const [masterVideo] = videos;
      videos.forEach((video) => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      });

      if (cancelled) return;
      syncInterval = window.setInterval(() => {
        if (cancelled) return;
        if (masterVideo.paused || masterVideo.ended) return;
        const masterTime = masterVideo.currentTime;
        videos.slice(1).forEach((video) => {
          if (video.paused || video.ended) return;
          if (Math.abs(video.currentTime - masterTime) > LIMITED_EDITIONS_SYNC_THRESHOLD_SECONDS) {
            video.currentTime = masterTime;
          }
        });
      }, LIMITED_EDITIONS_SYNC_INTERVAL_MS);
    });

    return () => {
      cancelled = true;
      if (syncInterval) {
        window.clearInterval(syncInterval);
      }
      handlers.forEach((handler, video) => {
        video.removeEventListener('loadeddata', handler);
      });
    };
  }, [loading]);

  return (
    <section id="drops" data-testid="drop-grid" className="pt-6 pb-24 md:pt-8 md:pb-32">
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
          const ignatius = products.find((p) => p.product_id === 'sueter-ignatius');
          const sylva = products.find((p) => p.product_id === 'sueter-sylva');
          const patricius = products.find((p) => p.product_id === 'polo-patricius');
          const regius = products.find((p) => p.product_id === 'polo-regius');
          const rest = products.filter(
            (p) =>
              p.product_id !== 'sueter-captain' &&
              p.product_id !== 'polo-domus' &&
              p.product_id !== 'sueter-ignatius' &&
              p.product_id !== 'sueter-sylva' &&
              p.product_id !== 'polo-patricius' &&
              p.product_id !== 'polo-regius'
          );
          const base = rest.slice(0, captain ? 7 : 8);
          const displayed = captain ? [...base, captain] : base;
          const firstRow = displayed.slice(0, 4);
          const secondRow = displayed.slice(4, 8);
          const spotlight = [ignatius, sylva, patricius, regius].filter(Boolean);

          return (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                {firstRow.map((p, i) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    index={i}
                    enableHoverVideo={supportsHoverVideo(p.product_id)}
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

              <div data-testid="editorial-collections-section" className="mt-6 md:mt-8 mb-6 md:mb-8">
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

              <div data-testid="editorial-eagle-divider" className="my-6 md:my-8">
                <div className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
                  <div className="w-full overflow-hidden flex justify-center">
                    <video
                      data-testid="editorial-eagle-divider-video"
                      src="/videos/aguila-header-ultrawide.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      aria-hidden="true"
                      className="w-full h-auto block object-contain"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                {secondRow.map((p, i) => (
                  <ProductCard
                    key={p.product_id}
                    product={p}
                    index={i + firstRow.length}
                    enableHoverVideo={supportsHoverVideo(p.product_id)}
                    enableWishlistIcon
                  />
                ))}
              </div>

              {spotlight.length > 0 && (
                <div className="mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
                  {spotlight.map((item, i) => (
                    <ProductCard
                      key={item.product_id}
                      product={item}
                      index={displayed.length + i}
                      enableHoverVideo={supportsHoverVideo(item.product_id)}
                      enableWishlistIcon
                    />
                  ))}
                </div>
              )}

              <div ref={limitedEditionsVideosContainerRef} className="mt-4 md:mt-0 mb-6 md:mb-8">
                <div className="limited-editions-video-wrapper">
                  <div
                    data-testid="limited-editions-left-wrapper"
                    className="limited-editions-video-card"
                    aria-hidden="true"
                  >
                    <video
                      data-testid="limited-editions-left-video"
                      data-video-label="left"
                      src="/videos/pasarela-video-web.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label="Limited Editions Pasarela video"
                      title="Limited Editions Pasarela video"
                      className="limited-editions-video"
                    />
                    <Link
                      to="/limited-editions"
                      data-testid="limited-editions-label"
                      className="limited-editions-video-label"
                    >
                      Limited Editions
                    </Link>
                  </div>
                  <div
                    data-testid="limited-editions-right-wrapper"
                    className="limited-editions-video-card"
                    aria-hidden="true"
                  >
                    <video
                      data-testid="limited-editions-right-video"
                      data-video-label="right"
                      src="/videos/eden-video-web.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label="Limited Editions Eden video"
                      title="Limited Editions Eden video"
                      className="limited-editions-video"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6 md:mb-8">
                <div className="w-[94%] max-w-[1760px] mx-auto">
                  <div className="relative w-full aspect-video rounded-[28px] overflow-hidden">
                    <img
                      data-testid="editorial-hero-image"
                      src={EDITORIAL_HERO_IMAGE}
                      alt="Editorial TAMBVRINI"
                      className="w-full h-full object-cover object-center"
                      loading="lazy"
                    />
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center">
                      <span data-testid="editorial-hero-title" className="primavera-editorial-title">
                        PRIMAVERA — VERANO
                      </span>
                    </div>
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
        <div id="novedades" data-testid="novedades-section" className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 md:gap-y-8">
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

        <div data-testid="mystic-divider-image" className="mt-6 md:mt-8 -mb-[4.5rem] md:-mb-24">
          <div
            data-testid="mystic-divider-wrapper"
            className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
          >
            <img
              src="/images/header-mistico-ultrawide.png"
              alt="editorial mystic divider"
              className="w-full h-auto object-contain object-center"
              loading="lazy"
            />
          </div>
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
