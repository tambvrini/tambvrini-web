import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';

const TRAJE_ID = 'traje-monograma-tambvrini';
const TRAJE_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/tf3t88bp_loop%20final%20model.mp4';

const AUREUS_ID = 'polo-aureus';
const AUREUS_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_602a5873-5674-439a-a044-350968db276c/artifacts/2bvf26dc_0212%20%284%29%281%29.mp4';

const BOLSO_ID = 'bolso-monograma-tambvrini';
const BOLSO_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_ed531f3b-442c-4069-8f9a-a4817ba88a48/artifacts/ll0mphlg_0216%282%29.mp4';

const SPORT_CLUB_ID = 'camiseta-sport-club';
const SPORT_CLUB_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_ed531f3b-442c-4069-8f9a-a4817ba88a48/artifacts/4q03omes_0216%281%29.mp4';

const POLO_GOLF_ID = 'polo-golf';
const POLO_GOLF_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_ed531f3b-442c-4069-8f9a-a4817ba88a48/artifacts/rrxcz0pq_0216.mp4';

const IMPERIUM_ID = 'camiseta-imperium';
const IMPERIUM_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_602a5873-5674-439a-a044-350968db276c/artifacts/5muj0dwx_0212%20%284%29.mp4';

const UMBRA_ID = 'americana-umbra';
const UMBRA_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_602a5873-5674-439a-a044-350968db276c/artifacts/eotmn5eb_0212%20%284%29%282%29.mp4';

const CAPTAIN_ID = 'sueter-captain';
const CAPTAIN_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_602a5873-5674-439a-a044-350968db276c/artifacts/pu3df808_0212%20%284%29.mp4';

const LOCAL_THUMBNAILS = {
  'americana-umbra': 'americana-umbra',
  'bolso-monograma-tambvrini': 'bolso-monograma-tambvrini',
  'camiseta-imperium': 'camiseta-imperium',
  'camiseta-sport-club': 'camiseta-sport-club',
  'polo-aureus': 'polo-aureus',
  'polo-domus': 'polo-domus',
  'polo-golf': 'polo-golf',
  'polo-patricius': 'polo-patricius',
  'polo-regius': 'polo-regius',
  'sueter-captain': 'sueter-captain',
  'sueter-sylva': 'sueter-sylva',
  'traje-monograma-tambvrini': 'traje-monograma-tambvrini',
  'sueter-ignatius': 'ignatius-sweater-thumb',
};

const getLocalThumbnail = (product) => {
  if (!product) return '';
  if (product.thumbnail_image?.startsWith('/thumbnails/')) return product.thumbnail_image;
  const mappedThumbnail = LOCAL_THUMBNAILS[product.product_id] || LOCAL_THUMBNAILS[product.slug];
  return mappedThumbnail ? `/thumbnails/${mappedThumbnail}.jpg` : '';
};

export const ProductCard = ({ product, index = 0, enableHoverVideo = false, enableWishlistIcon = false }) => {
  const isTraje = enableHoverVideo && product.product_id === TRAJE_ID;
  const isAureus = enableHoverVideo && product.product_id === AUREUS_ID;
  const isBolso = enableHoverVideo && product.product_id === BOLSO_ID;
  const isSportClub = enableHoverVideo && product.product_id === SPORT_CLUB_ID;
  const isPoloGolf = enableHoverVideo && product.product_id === POLO_GOLF_ID;
  const isImperium = enableHoverVideo && product.product_id === IMPERIUM_ID;
  const isUmbra = enableHoverVideo && product.product_id === UMBRA_ID;
  const isCaptain = enableHoverVideo && product.product_id === CAPTAIN_ID;
  const hasHoverVideo = isTraje || isAureus || isBolso || isSportClub || isPoloGolf || isImperium || isUmbra || isCaptain;

  const { toggleItem, isInWishlist } = useWishlist();

  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showGalleryImage, setShowGalleryImage] = useState(false);
  const [galleryReady, setGalleryReady] = useState(false);

  const inWishlist = enableWishlistIcon && isInWishlist(product.product_id);
  const galleryImages = product.images || [];
  const hasGalleryNavigation = galleryImages.length > 1;
  const localThumbnailSrc = getLocalThumbnail(product);
  const fallbackImageSrc = galleryImages[0] || '';
  const baseImageSrc = localThumbnailSrc || fallbackImageSrc;
  const galleryImageSrc = galleryReady ? galleryImages[activeImageIndex] : '';
  const displayImageSrc = showGalleryImage && galleryImageSrc ? galleryImageSrc : baseImageSrc;
  const isVideoActive = hasHoverVideo && hovered && !showGalleryImage;

  useEffect(() => {
    if (!hasHoverVideo) return;

    const v = videoRef.current;
    if (!v) return;

    if (!isVideoActive) {
      v.pause();
      v.currentTime = 0;
      return;
    }

    // Instant start on hover (video is preloaded; play only while hovering)
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [isVideoActive, hasHoverVideo]);

  const handleImageNavigation = (direction, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hasGalleryNavigation) return;

    setGalleryReady(true);
    setShowGalleryImage(true);
    setHovered(false);
    setActiveImageIndex((prev) => {
      const nextIndex = prev + direction;
      if (nextIndex < 0) return galleryImages.length - 1;
      if (nextIndex >= galleryImages.length) return 0;
      return nextIndex;
    });
  };

  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`product-card-${product.product_id}`}
      aria-label={`Ver producto ${product.name}`}
      className="group block product-card"
      style={{ animationDelay: `${index * 0.03}s` }}
      onMouseEnter={() => {
        const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;
        if (hasGalleryNavigation) setGalleryReady(true);
        if (hasHoverVideo && !showGalleryImage) setHovered(true);
      }}
      onMouseLeave={() => {
        const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (!canHover) return;
        setHovered(false);
        setShowGalleryImage(false);
        setActiveImageIndex(0);
        setGalleryReady(false);
      }}
    >
      <div className="relative aspect-[3/4] product-card-media flex items-center justify-center">
        {displayImageSrc ? (
          <img
            data-testid="product-card-image"
            src={displayImageSrc}
            alt={product.name}
            className="w-full h-auto max-h-full object-contain object-center"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5]">
            <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-obsidian/30">{product.name}</span>
          </div>
        )}

        {hasHoverVideo && (
          <video
            data-testid="product-card-video"
            ref={videoRef}
            muted
            loop
            playsInline
            preload={isSportClub || isPoloGolf || isImperium || isUmbra || isCaptain ? 'auto' : 'metadata'}
            poster={baseImageSrc}
            className={`absolute inset-0 w-full h-full object-contain object-center pointer-events-none transition-opacity duration-300 ${isVideoActive ? 'opacity-100' : 'opacity-0'}`}
            src={
              isTraje
                ? TRAJE_HOVER_VIDEO_URL
                : isAureus
                  ? AUREUS_HOVER_VIDEO_URL
                  : isBolso
                    ? BOLSO_HOVER_VIDEO_URL
                    : isSportClub
                      ? SPORT_CLUB_HOVER_VIDEO_URL
                      : isPoloGolf
                        ? POLO_GOLF_HOVER_VIDEO_URL
                        : isImperium
                          ? IMPERIUM_HOVER_VIDEO_URL
                          : isUmbra
                            ? UMBRA_HOVER_VIDEO_URL
                            : CAPTAIN_HOVER_VIDEO_URL
            }
          />
        )}

        {hasGalleryNavigation && (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              data-testid="product-card-arrow-left"
              className="product-card-arrow product-card-arrow-left"
              onClick={(event) => handleImageNavigation(-1, event)}
            >
              &lsaquo;
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              data-testid="product-card-arrow-right"
              className="product-card-arrow product-card-arrow-right"
              onClick={(event) => handleImageNavigation(1, event)}
            >
              &rsaquo;
            </button>
          </>
        )}

        {!hasHoverVideo && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-obsidian/30" />
        )}
        <div className="product-card-overlay">
          <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-obsidian/80">Ver producto</span>

          {enableWishlistIcon && (
            <button
              type="button"
              aria-label={inWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              className={`absolute top-[14px] right-[14px] z-20 w-8 h-8 flex items-center justify-center rounded-full bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 active:scale-[0.95] ${
                inWishlist ? 'opacity-100' : ''
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleItem(product);
              }}
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={`text-obsidian transition-transform duration-200 ${inWishlist ? 'fill-obsidian scale-[1.0]' : 'scale-100'}`}
              />
            </button>
          )}
        </div>

        {product.is_sold_out && (
          <span className="absolute top-4 left-4 font-montserrat text-[9px] tracking-[0.22em] uppercase text-obsidian/70">Sold out</span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-playfair text-[13px] text-obsidian/95 leading-snug">{product.name}</h3>
        <p className="mt-1 font-montserrat text-[11px] tracking-wide text-[#6e6e6e]">
          {product.price?.toLocaleString('en-US', { minimumFractionDigits: 0 })} €
        </p>
      </div>

    </Link>
  );
};

export default ProductCard;
