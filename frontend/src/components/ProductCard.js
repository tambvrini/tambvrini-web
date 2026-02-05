import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

export const ProductCard = ({ product, index = 0 }) => {
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem } = useCart();
  const inWishlist = isInWishlist(product.product_id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'Único';
    const defaultColor = product.colors?.[0]?.name || '';
    addItem(product, defaultSize, defaultColor);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`product-card-${product.product_id}`}
      className="product-card group block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative img-zoom aspect-[3/4] bg-obsidian mb-4 overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Wishlist button */}
        <button
          data-testid={`wishlist-btn-${product.product_id}`}
          onClick={handleWishlist}
          className={`wishlist-btn absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-obsidian/50 backdrop-blur-sm ${
            inWishlist ? 'opacity-100' : ''
          }`}
        >
          <Heart
            size={16}
            strokeWidth={1.5}
            className={inWishlist ? 'fill-gold text-gold' : 'text-marble'}
          />
        </button>
        {/* New badge */}
        {product.is_new && (
          <span className="absolute top-4 left-4 font-montserrat text-[9px] tracking-[0.2em] uppercase text-marble bg-obsidian/60 backdrop-blur-sm px-3 py-1">
            Nuevo
          </span>
        )}
        {/* Quick add */}
        <button
          data-testid={`quick-add-${product.product_id}`}
          onClick={handleQuickAdd}
          className="quick-add absolute bottom-4 left-4 right-4 py-3 bg-obsidian/80 backdrop-blur-sm text-marble font-montserrat text-[10px] tracking-[0.2em] uppercase text-center hover:bg-gold hover:text-obsidian transition-colors duration-300"
        >
          Añadir al carrito
        </button>
      </div>
      {/* Info */}
      <div>
        <h3 className="font-playfair text-sm text-marble/90 mb-1">{product.name}</h3>
        <p className="font-montserrat text-xs text-marble/50 tracking-wide">
          {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
