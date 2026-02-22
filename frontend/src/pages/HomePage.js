import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_WHITE = "/logo-letras-final-blanco.svg";
const HERO_IMAGE = "/hero-main.jpg";
const CINEMATIC_VIDEO_URL = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/axoe4sux_VIDEO%20WEB%201.mp4";
const ROMAN_CARD_WHITE_URL = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/inwhbq34_logo%20romano%20blanco.png";
const ROMAN_CARD_BLACK_URL = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/vn85wlf1_logo%20romano%20negro.png";

const NOVEDADES_HOMBRE_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/had86o8r_hf_20260213_213626_2abfbed4-aa1c-4aef-9cbb-2f94a6ca4225.png";
const NOVEDADES_MUJER_BG = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/gmhgobyc_hf_20260213_214633_0565b32b-1650-49f6-87d1-ae0424c2505d.png";
const NOVEDADES_HOMBRE_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/sbeaj2rx_video%20hombre.mp4";
const NOVEDADES_MUJER_VIDEO = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/mzrddski_video%20mujer.mp4";
// (Campaign/categories/tennis/story visuals removed for simplified DROP-style homepage)

/* ============ useInView hook ============ */
const useInView = (opts = {}) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15, ...opts });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

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
    <section data-testid="hero-section" className="relative h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="TAMBVRINI Campaign" className="w-full h-full object-cover brightness-105" />
        <motion.div className="absolute inset-0 bg-[#F5F2EA]" style={{ opacity: overlayOpacity }} />
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

      {/* CTA Buttons at bottom of hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-20 md:bottom-24 left-0 right-0 z-10 flex flex-col sm:flex-row justify-center gap-4 px-6"
        style={{ opacity: buttonsOpacity, y: buttonsY }}
      >
        <Link to="/tienda?gender=hombre" data-testid="hero-shop-men" className="btn-luxury text-center">Comprar Hombre</Link>
        <Link to="/tienda?gender=mujer" data-testid="hero-shop-women" className="btn-luxury text-center">Comprar Mujer</Link>
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
    </section>
  );
};

const NovedadesTile = ({ title, bg, videoSrc }) => {
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
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        const el = document.getElementById('drops');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }}
      className="group text-left"
      aria-label={title}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 rounded-[14px]">
        <img
          src={bg}
          alt={title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-contain object-center ${hovered ? 'hidden' : 'block'}`}
        />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster={bg}
          src={videoSrc}
          className={`absolute inset-0 w-full h-full object-contain object-center ${hovered ? 'block' : 'hidden'}`}
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
    </button>
  );
};


/* ============ DROP GRID (Homepage main focus) ============ */
const DropGridSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrop = async () => {
      setLoading(true);
      try {
        // Fetch more than 12 so we can filter out unwanted categories/collections
        // while still rendering exactly 12 items.
        const res = await axios.get(`${API}/products?limit=50`);
        const all = res.data.products || [];
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
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        {/* 8 items: 2 rows of 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-14 gap-y-20">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="mt-4 h-3 bg-white/5 w-2/3" />
                <div className="mt-2 h-3 bg-white/5 w-1/3" />
              </div>
            ))
            : (() => {
              // Force “Suéter Captain” to render as the 8th (last) item in the 2nd row on desktop.
              const captain = products.find((p) => p.product_id === 'sueter-captain');
              const rest = products.filter((p) => p.product_id !== 'sueter-captain');
              const base = rest.slice(0, captain ? 7 : 8);
              const displayed = captain ? [...base, captain] : base;
              return displayed.map((p, i) => (
                <ProductCard
                  key={p.product_id}
                  product={p}
                  index={i}
                  enableHoverVideo={p.product_id === 'camiseta-sport-club' || p.product_id === 'polo-golf' || p.product_id === 'camiseta-imperium' || p.product_id === 'americana-umbra' || p.product_id === 'sueter-captain' || p.product_id === 'polo-aureus' || p.product_id === 'traje-monograma-tambvrini' || p.product_id === 'bolso-monograma-tambvrini'}
                />
              ));
            })()}
        </div>

        {/* Aesthetic-only promo tiles (scroll to drops) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10">
          <NovedadesTile
            title="Novedades para Hombre"
            bg={NOVEDADES_HOMBRE_BG}
            videoSrc={NOVEDADES_HOMBRE_VIDEO}
          />
          <NovedadesTile
            title="Novedades para Mujer"
            bg={NOVEDADES_MUJER_BG}
            videoSrc={NOVEDADES_MUJER_VIDEO}
          />
        </div>
      </div>
    </section>
  );
};

/* ============ CINEMATIC VIDEO LOOP (below promo tiles) ============ */
const CinematicVideoSection = () => {
  const [ref, visible] = useInView({ threshold: 0.2, rootMargin: '120px' });
  const [shouldLoad, setShouldLoad] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (visible) setShouldLoad(true);
  }, [visible]);

  useEffect(() => {
    if (!shouldLoad) return;
    const v = videoRef.current;
    if (!v) return;
    // When adding <source> dynamically, call load() so the browser starts fetching immediately.
    v.load();
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [shouldLoad]);

  return (
    <section className="mt-10 mb-[120px]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 1 }}
          animate={visible ? { opacity: 1, scale: 1.02 } : { opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[1008px]"
        >
          <div className="overflow-hidden rounded-[8px]">
            <div className="relative w-full aspect-video bg-white/5">
              <video
                ref={videoRef}
                data-testid="cinematic-loop-video"
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload={shouldLoad ? 'auto' : 'none'}
                controls={false}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate noremoteplayback"
                src={shouldLoad ? CINEMATIC_VIDEO_URL : undefined}
                onError={() => {
                  // Retry once in case of transient network abort (common on large mp4 streams)
                  const v = videoRef.current;
                  if (!v || v.dataset.retry === '1') return;
                  v.dataset.retry = '1';
                  v.load();
                  const p = v.play();
                  if (p && typeof p.catch === 'function') p.catch(() => {});
                }}
              />
            </div>
          </div>

          {/* Premium branding cards under video */}
          <div className="mt-10 flex items-center justify-center gap-10">
            <div className="overflow-hidden rounded-[8px]">
              <img
                src={ROMAN_CARD_WHITE_URL}
                alt="Tarjeta romana blanca"
                loading="lazy"
                className="h-[184px] w-auto object-contain transform transition-transform duration-300 ease-out hover:scale-105"
              />
            </div>
            <div className="overflow-hidden rounded-[8px]">
              <img
                src={ROMAN_CARD_BLACK_URL}
                alt="Tarjeta romana negra"
                loading="lazy"
                className="h-[184px] w-auto object-contain transform transition-transform duration-300 ease-out hover:scale-105"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};


/* ============ HOMEPAGE ============ */
export default function HomePage() {
  return (
    <div data-testid="home-page" className="noise-overlay editorial-noise">
      <HeroSection />
      <DropGridSection />
      <CinematicVideoSection />
    </div>
  );
}
