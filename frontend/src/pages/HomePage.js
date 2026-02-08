import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_WHITE = "/logo-letras-final-blanco.svg";
const HERO_IMAGE = "https://images.unsplash.com/photo-1760446005643-292066b54734?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtZWRpdGVycmFuZWFuJTIwcml2aWVyYSUyMGx1eHVyeSUyMGxpZmVzdHlsZSUyMDE5NzBzfGVufDB8fHx8MTc3MDMyMTY4OXww&ixlib=rb-4.1.0&q=85";
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
  const overlayOpacity = useTransform(progress, [0, 1], [0.35, 0.65]);

  // CTA buttons fade out quickly
  const buttonsOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const buttonsY = useTransform(scrollY, [0, 250], [0, 40]);

  return (
    <section data-testid="hero-section" className="relative h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={HERO_IMAGE} alt="TAMBVRINI Campaign" className="w-full h-full object-cover" />
        <motion.div className="absolute inset-0 bg-obsidian" style={{ opacity: overlayOpacity }} />
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
          Explorar Colección
        </button>
      </motion.div>
    </section>
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
        const res = await axios.get(`${API}/products?limit=12`);
        setProducts(res.data.products || []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDrop();
  }, []);

  return (
    <section
      id="drops"
      data-testid="drop-grid"
      className="py-20 md:py-28"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="mt-4 h-3 bg-white/5 w-2/3" />
                <div className="mt-2 h-3 bg-white/5 w-1/3" />
              </div>
            ))
            : products.slice(0, 12).map((p, i) => (
              <DropProductCard key={p.product_id} product={p} index={i} />
            ))}
        </div>
      </div>
    </section>
  );
};

const DropProductCard = ({ product, index = 0 }) => {
  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`drop-card-${product.product_id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-obsidian/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-marble/90">
            View product
          </span>
        </div>
        {/* Sold out (optional) */}
        {product.is_sold_out && (
          <span className="absolute top-4 left-4 font-montserrat text-[9px] tracking-[0.22em] uppercase text-marble/80">
            Sold out
          </span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-playfair text-[13px] text-marble/90 leading-snug">
          {product.name}
        </h3>
        <p className="mt-1 font-montserrat text-[11px] tracking-wide text-marble/55">
          {product.price?.toLocaleString('en-US', { minimumFractionDigits: 0 })} €
        </p>
      </div>
    </Link>
  );
};

/* ============ HOMEPAGE ============ */
export default function HomePage() {
  return (
    <div data-testid="home-page">
      <HeroSection />
      <DropGridSection />
    </div>
  );
}
