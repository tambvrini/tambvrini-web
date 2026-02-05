import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const HERO_IMAGE = "https://images.unsplash.com/photo-1760446005643-292066b54734?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtZWRpdGVycmFuZWFuJTIwcml2aWVyYSUyMGx1eHVyeSUyMGxpZmVzdHlsZSUyMDE5NzBzfGVufDB8fHx8MTc3MDMyMTY4OXww&ixlib=rb-4.1.0&q=85";
const MEN_IMAGE = "https://images.unsplash.com/photo-1765815442140-f88e94db8817?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHw0fHxmYXNoaW9uJTIwbW9kZWwlMjBlZGl0b3JpYWwlMjBzdWl0fGVufDB8fHx8MTc3MDMyMTcwMHww&ixlib=rb-4.1.0&q=85";
const WOMEN_IMAGE = "https://images.unsplash.com/photo-1765269303556-b53ff8bd8a8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGx1eHVyeSUyMGZhc2hpb24lMjBkcmVzcyUyMHN1bW1lcnxlbnwwfHx8fDE3NzAzMjE3MDF8MA&ixlib=rb-4.1.0&q=85";
const TENNIS_IMAGE = "https://images.unsplash.com/photo-1731777347197-3418de40a8f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwzfHx0ZW5uaXMlMjBjb3VydCUyMGNsYXklMjBsdXh1cnl8ZW58MHx8fHwxNzcwMzIxNzA0fDA&ixlib=rb-4.1.0&q=85";
const MARBLE_IMAGE = "https://images.unsplash.com/photo-1756287530100-c0b4412dee8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjB0ZXh0dXJlJTIwd2hpdGUlMjBjbGFzc2ljYWx8ZW58MHx8fHwxNzcwMzIxNzAzfDA&ixlib=rb-4.1.0&q=85";

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
  const logoScale = useTransform(scrollY, [0, SCROLL_THRESHOLD], [1, 0.09]);
  const logoY = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0, -(viewportH * 0.44)]);
  const heroLogoOpacity = useTransform(scrollY, [SCROLL_THRESHOLD * 0.65, SCROLL_THRESHOLD * 0.85], [1, 0]);

  // Hero overlay darkens as you scroll
  const overlayOpacity = useTransform(scrollY, [0, SCROLL_THRESHOLD], [0.35, 0.65]);

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
        className="fixed inset-0 z-[52] flex items-center justify-center pointer-events-none"
        style={{ opacity: heroLogoOpacity }}
      >
        <motion.img
          src={LOGO_WHITE}
          alt="TAMBVRINI"
          className="w-[80vw] md:w-[70vw] lg:w-[65vw] max-w-[1100px]"
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
        <Link to="/tienda" data-testid="hero-explore" className="btn-luxury btn-gold text-center">Explorar Colección</Link>
      </motion.div>
    </section>
  );
};

/* ============ CAMPAIGN ============ */
const CampaignSection = () => {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} data-testid="campaign-section" className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative img-zoom aspect-[4/5] overflow-hidden">
          <img src={MEN_IMAGE} alt="Campaign" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-obsidian/30" />
          <div className="absolute bottom-8 left-8">
            <p className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/60 mb-2">Campaña</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-marble">Resort 2026</h3>
          </div>
        </div>
        <div className="relative img-zoom aspect-[4/5] overflow-hidden">
          <img src={WOMEN_IMAGE} alt="Campaign" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-obsidian/30" />
          <div className="absolute bottom-8 left-8">
            <p className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/60 mb-2">Colección</p>
            <h3 className="font-playfair text-2xl md:text-3xl text-marble">Atelier Roma</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============ CATEGORIES ============ */
const CategoriesSection = () => {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} data-testid="categories-section" className="px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto pb-24 md:pb-32">
      <div className={`text-center mb-16 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="section-divider mx-auto mb-8" />
        <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/50">Comprar por categoría</h2>
      </div>
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-1000 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {[
          { title: 'Hombre', img: MEN_IMAGE, href: '/tienda?gender=hombre' },
          { title: 'Mujer', img: WOMEN_IMAGE, href: '/tienda?gender=mujer' },
          { title: 'Tennis Club', img: TENNIS_IMAGE, href: '/tienda?filter=tennis-club' },
        ].map((cat, i) => (
          <Link
            key={i}
            to={cat.href}
            data-testid={`category-${cat.title.toLowerCase().replace(' ', '-')}`}
            className="group relative img-zoom aspect-[3/4] overflow-hidden"
          >
            <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-obsidian/40 group-hover:bg-obsidian/20 transition-all duration-700" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <h3 className="font-cinzel text-lg md:text-xl tracking-[0.2em] uppercase text-marble">{cat.title}</h3>
              <span className="mt-3 font-montserrat text-[10px] tracking-[0.2em] uppercase text-marble/50 group-hover:text-gold transition-colors duration-500">
                Explorar <ArrowRight size={10} className="inline ml-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

/* ============ FEATURED PRODUCTS ============ */
const FeaturedSection = () => {
  const [products, setProducts] = useState([]);
  const [ref, visible] = useInView();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    axios.get(`${API}/products?is_featured=true&limit=8`).then(r => setProducts(r.data.products)).catch(() => {});
  }, []);

  const scroll = (dir) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section ref={ref} data-testid="featured-section" className="py-24 md:py-32 max-w-[1920px] mx-auto">
      <div className={`px-6 md:px-12 lg:px-24 flex justify-between items-end mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div>
          <div className="section-divider mb-6" />
          <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/50 mb-3">Selección</h2>
          <p className="font-playfair text-2xl md:text-3xl text-marble">Piezas Destacadas</p>
        </div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll(-1)} className="w-10 h-10 border border-white/10 flex items-center justify-center text-marble/40 hover:text-marble hover:border-white/30 transition-colors duration-300">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll(1)} className="w-10 h-10 border border-white/10 flex items-center justify-center text-marble/40 hover:text-marble hover:border-white/30 transition-colors duration-300">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto px-6 md:px-12 lg:px-24 pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {products.map((p, i) => (
          <div key={p.product_id} className="min-w-[260px] md:min-w-[300px] flex-shrink-0">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ============ STORY / ROMAN NARRATIVE ============ */
const StorySection = () => {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} data-testid="story-section" className="bg-marble">
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2">
        {/* Image */}
        <div className="relative img-zoom aspect-square lg:aspect-auto overflow-hidden">
          <img src={MARBLE_IMAGE} alt="Roman marble" className="w-full h-full object-cover" />
        </div>
        {/* Text */}
        <div className={`px-8 md:px-16 lg:px-24 py-20 md:py-32 flex flex-col justify-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="w-12 h-px bg-emerald mb-10" />
          <p className="font-cinzel text-xs tracking-[0.3em] uppercase text-emerald/60 mb-6">La Casa</p>
          <h2 className="font-cinzel text-2xl md:text-4xl text-obsidian leading-tight mb-8">
            Donde Roma<br />Encuentra el Mar
          </h2>
          <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed mb-6 max-w-md">
            TAMBVRINI nace de la intersección entre la grandeza clásica de Roma y la elegancia
            despreocupada de la Riviera. Cada pieza es un homenaje a la artesanía europea,
            confeccionada con materiales de la más alta calidad.
          </p>
          <p className="font-playfair italic text-base text-obsidian/40 mb-10 max-w-md">
            "La verdadera elegancia no se impone, se hereda."
          </p>
          <Link to="/marca" className="inline-block font-montserrat text-[11px] tracking-[0.2em] uppercase text-emerald border-b border-emerald/30 pb-1 hover:border-emerald transition-colors duration-300 self-start">
            Descubrir la Marca
          </Link>
        </div>
      </div>
    </section>
  );
};

/* ============ TENNIS CLUB SECTION ============ */
const TennisSection = () => {
  const [ref, visible] = useInView();
  return (
    <section ref={ref} data-testid="tennis-section" className="bg-marble py-24 md:py-32">
      <div className={`max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <p className="font-cinzel text-xs tracking-[0.3em] uppercase text-emerald/50 mb-4">Colección Exclusiva</p>
          <h2 className="font-cinzel text-3xl md:text-4xl lg:text-5xl text-emerald tracking-[0.1em]">Tennis Club</h2>
        </div>
        <div className="relative img-zoom aspect-[21/9] overflow-hidden">
          <img src={TENNIS_IMAGE} alt="Tennis Club" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Link to="/tienda?filter=tennis-club" className="border border-marble/80 text-marble font-montserrat text-[11px] tracking-[0.2em] uppercase py-4 px-10 hover:bg-marble hover:text-emerald transition-colors duration-500">
              Explorar Colección
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ============ NEWSLETTER ============ */
const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [ref, visible] = useInView();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await axios.post(`${API}/newsletter/subscribe`, { email });
      setStatus(res.data.message);
      setEmail('');
    } catch {
      setStatus('Error al suscribirse');
    }
  };

  return (
    <section ref={ref} data-testid="newsletter-section" className="py-24 md:py-32 px-6 md:px-12 lg:px-24">
      <div className={`max-w-xl mx-auto text-center transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="section-divider mx-auto mb-10" />
        <h2 className="font-cinzel text-lg md:text-xl tracking-[0.15em] text-marble mb-4">Únase a la Casa TAMBVRINI</h2>
        <p className="font-montserrat text-xs text-marble/40 mb-10 tracking-wide">
          Reciba acceso anticipado a nuevas colecciones, invitaciones a eventos exclusivos y novedades de la marca.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            data-testid="newsletter-email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Su email"
            className="flex-1 bg-transparent border-b border-white/15 pb-3 font-montserrat text-sm text-marble placeholder:text-marble/25 focus:outline-none focus:border-gold"
            required
          />
          <button
            data-testid="newsletter-submit-btn"
            type="submit"
            className="btn-luxury btn-gold whitespace-nowrap"
          >
            Suscribirse
          </button>
        </form>
        {status && (
          <p className="mt-4 font-montserrat text-xs text-gold/80">{status}</p>
        )}
      </div>
    </section>
  );
};

/* ============ HOMEPAGE ============ */
export default function HomePage() {
  return (
    <div data-testid="home-page">
      <HeroSection />
      <CampaignSection />
      <CategoriesSection />
      <FeaturedSection />
      <StorySection />
      <TennisSection />
      <NewsletterSection />
    </div>
  );
}
