import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

const TRAJE_ID = 'traje-monograma-tambvrini';
const TRAJE_HOVER_VIDEO_URL = 'https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/c37z6yj8_loop%20fade.mp4';

export const ProductCard = ({ product, index = 0, enableHoverVideo = false }) => {
  const isTraje = enableHoverVideo && product.product_id === TRAJE_ID;
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    if (!isTraje) return;
    if (!hovered) {
      const v = videoRef.current;
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      return;
    }

    setShouldLoadVideo(true);

    const v = videoRef.current;
    if (!v) return;
    // Ensure instant start on hover
    v.load();
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, [hovered, isTraje]);

  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`product-card-${product.product_id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.03}s` }}
      onMouseEnter={() => { if (isTraje) setHovered(true); }}
      onMouseLeave={() => { if (isTraje) setHovered(false); }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.thumbnail_image || product.images?.[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] ${isTraje ? 'transition-opacity duration-200' : ''} ${isTraje && hovered ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />

        {isTraje && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload={shouldLoadVideo ? 'auto' : 'metadata'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            src={shouldLoadVideo ? TRAJE_HOVER_VIDEO_URL : undefined}
          />
        )}

        <div className="absolute inset-0 bg-obsidian/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-marble/90">Ver producto</span>
        </div>

        {product.is_sold_out && (
          <span className="absolute top-4 left-4 font-montserrat text-[9px] tracking-[0.22em] uppercase text-marble/80">Sold out</span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-playfair text-[13px] text-marble/90 leading-snug">{product.name}</h3>
        <p className="mt-1 font-montserrat text-[11px] tracking-wide text-marble/55">
          {product.price?.toLocaleString('en-US', { minimumFractionDigits: 0 })} €
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
