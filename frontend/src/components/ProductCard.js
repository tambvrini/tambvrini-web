import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { ASSETS } from '../../lib/assets';

const TRAJE_ID = 'traje-monograma-tambvrini';
const TRAJE_HOVER_VIDEO_URL = ASSETS.videos.productHover.trajeMonogramaTambvrini;

const AUREUS_ID = 'polo-aureus';
const AUREUS_HOVER_VIDEO_URL = ASSETS.videos.productHover.poloAureus;

const BOLSO_ID = 'bolso-monograma-tambvrini';
const BOLSO_HOVER_VIDEO_URL = ASSETS.videos.productHover.bolsoMonogramaTambvrini;

const SPORT_CLUB_ID = 'camiseta-sport-club';
const SPORT_CLUB_HOVER_VIDEO_URL = ASSETS.videos.productHover.camisetaSportClub;

const POLO_GOLF_ID = 'polo-golf';
const POLO_GOLF_HOVER_VIDEO_URL = ASSETS.videos.productHover.poloGolf;

const IMPERIUM_ID = 'camiseta-imperium';
const IMPERIUM_HOVER_VIDEO_URL = ASSETS.videos.productHover.camisetaImperium;

const UMBRA_ID = 'americana-umbra';
const UMBRA_HOVER_VIDEO_URL = ASSETS.videos.productHover.americanaUmbra;

const CAPTAIN_ID = 'sueter-captain';
const CAPTAIN_HOVER_VIDEO_URL = ASSETS.videos.productHover.sueterCaptain;

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

  const inWishlist = enableWishlistIcon && isInWishlist(product.product_id);

  useEffect(() => {
    if (!hasHoverVideo) return;

    const v = videoRef.current;
    if (!v) return;

    if (!hovered) {
      v.pause();
      v.currentTime = 0;
      return;
    }

    // Instant start on hover (video is preloaded; play only while hovering)
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [hovered, hasHoverVideo]);

  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`product-card-${product.product_id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.03}s` }}
      onMouseEnter={() => {
        const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (hasHoverVideo && canHover) setHovered(true);
      }}
      onMouseLeave={() => {
        const canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (hasHoverVideo && canHover) setHovered(false);
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-[12px] bg-white">
          {(product.thumbnail_image || product.images?.[0]) ? (
            <img
              src={product.thumbnail_image || product.images?.[0]}
              alt={product.name}
              className={`w-full h-full object-cover ${hasHoverVideo ? '' : 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]'}`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#f5f5f5]">
              <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-obsidian/30">{product.name}</span>
            </div>
          )}

          {hasHoverVideo && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload={isSportClub || isPoloGolf || isImperium || isUmbra || isCaptain ? 'auto' : 'metadata'}
              poster={product.thumbnail_image || product.images?.[0]}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
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

          {!hasHoverVideo && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-obsidian/30" />
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
