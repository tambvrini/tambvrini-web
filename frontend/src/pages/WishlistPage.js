import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();

  return (
    <div data-testid="wishlist-page" className="min-h-screen pt-32 md:pt-40 pb-24">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <h1 className="font-cinzel text-3xl md:text-4xl tracking-[0.1em] text-obsidian mb-4">Favoritos</h1>
        <p className="font-montserrat text-xs text-obsidian/50 mb-16 tracking-wide">{items.length} {items.length === 1 ? 'artículo' : 'artículos'}</p>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={40} className="text-obsidian/15 mx-auto mb-4" />
            <p className="font-playfair text-xl text-obsidian/50 mb-6">Tu lista de favoritos está vacía</p>
            <Link to="/tienda" className="btn-luxury inline-block">Explorar Tienda</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
            {items.map((item) => (
              <div key={item.product_id} className="group relative">
                <Link to={`/producto/${item.product_id}`} className="block">
                  <div className="img-zoom aspect-[3/4] bg-white/5 mb-4 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-playfair text-sm text-obsidian/95 mb-1">{item.name}</h3>
                  <p className="font-montserrat text-xs text-[#6e6e6e]">{item.price.toLocaleString('es-ES')} &euro;</p>
                </Link>
                <button
                  data-testid={`remove-wishlist-${item.product_id}`}
                  onClick={() => removeItem(item.product_id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <X size={14} className="text-obsidian/70" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
