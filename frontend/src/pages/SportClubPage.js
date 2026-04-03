import { useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { queryProducts } from '@/data/productHelpers';
import { supportsHoverVideo } from '../constants/hoverVideoProducts';

const SPORT_CLUB_HERO_IMAGE = 'https://customer-assets.emergentagent.com/job_6fc96d8f-cb6c-4beb-8fea-5ecb3f3ddc7f/artifacts/74ejw418_campa%C3%B1a%202.jpg';

export default function SportClubPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  const sportClubProducts = useMemo(
    () => queryProducts({ category: 'sport-club', limit: 20 }).products,
    []
  );

  return (
    <div
      data-testid="sport-club-page"
      className="min-h-screen pt-32 md:pt-40 pb-24 noise-overlay editorial-noise bg-white"
    >
      <div
        data-testid="sport-club-hero-wrapper"
        className="w-screen max-w-none relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
      >
        <div className="relative w-full">
          <img
            data-testid="sport-club-hero-image"
            src={SPORT_CLUB_HERO_IMAGE}
            alt="Editorial Sport Club TAMBVRINI"
            className="w-full h-auto object-contain object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="text-center max-w-[640px]">
              <h1
                data-testid="sport-club-hero-title"
                className="font-playfair text-[34px] md:text-[56px] lg:text-[64px] tracking-[0.08em] text-[#F6F1E7]/90 font-light"
              >
                Sport Club 2026
              </h1>
              <button
                data-testid="sport-club-hero-button"
                type="button"
                onClick={() => {
                  const section = document.getElementById('sport-club-products');
                  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-[#F6F1E7]/70 px-8 py-3 font-montserrat text-[10px] tracking-[0.32em] uppercase text-[#F6F1E7]/85 transition-all duration-500 hover:text-[#F6F1E7] hover:border-[#F6F1E7] hover:shadow-[0_0_18px_rgba(0,0,0,0.04)] hover:bg-white/5"
              >
                Comprar la Colección
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 mt-16 md:mt-20">
        <div className="mb-10 md:mb-14 text-left">
          <h2
            data-testid="sport-club-page-title"
            className="font-cinzel text-3xl md:text-4xl lg:text-5xl tracking-[0.12em] text-editorial-red font-normal"
          >
            Sport Club
          </h2>
          <p className="font-montserrat text-xxs md:text-xs text-obsidian/40 mt-2 tracking-[0.12em]">
            {sportClubProducts.length} {sportClubProducts.length === 1 ? 'producto' : 'productos'}
          </p>
        </div>

        <div
          id="sport-club-products"
          data-testid="sport-club-products-grid"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14"
        >
          {sportClubProducts.map((product, index) => (
            <ProductCard
              key={product.product_id}
              product={product}
              index={index}
              enableHoverVideo={supportsHoverVideo(product.product_id)}
              enableWishlistIcon
            />
          ))}
        </div>
      </div>
    </div>
  );
}
