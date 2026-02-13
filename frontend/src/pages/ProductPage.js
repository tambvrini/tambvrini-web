import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [infoTab, setInfoTab] = useState('description');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API}/products/${productId}`);
        setProduct(res.data);
        setRelated(res.data.related_products || []);
        setSelectedImage(0);
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [productId]);

  const handleAddToCart = () => {
    if (product.is_sold_out) return;
    if (!selectedSize) {
      toast.error('Selecciona una talla');
      return;
    }
    addItem(product, selectedSize, selectedColor || product.colors?.[0]?.name || '', quantity);
    toast.success('Añadido al carrito');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p className="font-playfair text-xl text-marble/40">Producto no encontrado</p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.product_id);

  return (
    <div data-testid="product-page" className="min-h-screen pt-28 md:pt-32 pb-24">
      {/* Breadcrumb */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 mb-8">
        <nav className="flex items-center gap-2 font-montserrat text-[10px] tracking-widest uppercase text-marble/30">
          <Link to="/" className="hover:text-marble transition-colors">Inicio</Link>
          <ChevronRight size={10} />
          <Link to="/tienda" className="hover:text-marble transition-colors">Tienda</Link>
          <ChevronRight size={10} />
          <span className="text-marble/60">{product.name}</span>
        </nav>
      </div>

      {/* Product layout */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Gallery */}
          <div>
            <div className="img-zoom aspect-[3/4] mb-4 overflow-hidden bg-white/5">
              <img
                data-testid="product-main-image"
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  data-testid={`product-thumb-${i}`}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-28 overflow-hidden border transition-colors duration-300 ${
                    selectedImage === i ? 'border-gold' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product info */}
          <div className="lg:pl-8 lg:pt-4">
            <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-4">
              {product.category?.join(' / ')}
            </p>
            <div className="flex items-start justify-between gap-6 mb-4">
              <h1 data-testid="product-name" className="font-playfair text-3xl md:text-4xl text-marble">
                {product.name}
              </h1>
              {product.is_sold_out && (
                <span className="mt-2 border border-marble/25 px-4 py-2 font-montserrat text-[10px] tracking-[0.25em] uppercase text-marble/70">
                  SOLD OUT
                </span>
              )}
            </div>
            <p data-testid="product-price" className="font-montserrat text-lg text-marble/70 tracking-wide mb-10">
              {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
            </p>

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-marble/40 mb-4">Color</p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      data-testid={`color-btn-${i}`}
                      onClick={() => setSelectedColor(c.name)}
                      disabled={product.is_sold_out}
                      className={`flex items-center gap-2 px-4 py-2 border transition-colors duration-300 ${
                        selectedColor === c.name ? 'border-gold text-gold' : 'border-white/10 text-marble/50'
                      } ${product.is_sold_out ? 'opacity-60 cursor-not-allowed' : 'hover:border-white/30'}`}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                      <span className="font-montserrat text-[10px] tracking-wide">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            <div className="mb-8">
              <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-marble/40 mb-4">Talla</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s, i) => {
                  const isSizeSoldOut =
                    (product.product_id === 'polo-golf' && s === 'L') ||
                    (product.product_id === 'americana-umbra' && ['M', 'L', 'XL'].includes(s));
                  const disabled = product.is_sold_out || isSizeSoldOut;
                  return (
                    <button
                      key={i}
                      data-testid={`size-btn-${s}`}
                      onClick={() => setSelectedSize(s)}
                      disabled={disabled}
                      className={`min-w-[48px] py-3 px-4 border font-montserrat text-xs tracking-wide transition-colors duration-300 ${
                        selectedSize === s
                          ? 'border-marble text-marble bg-marble/5'
                          : 'border-white/10 text-marble/40'
                      } ${disabled ? 'opacity-60 cursor-not-allowed line-through' : 'hover:border-white/30 hover:text-marble'}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className={`mb-10 ${product.is_sold_out ? 'opacity-60 pointer-events-none' : ''}`}>
              <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-marble/40 mb-4">Cantidad</p>
              <div className="flex items-center gap-0 border border-white/10 inline-flex">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-marble/50 hover:text-marble border-r border-white/10"
                >
                  <Minus size={14} />
                </button>
                <span className="w-16 h-12 flex items-center justify-center font-montserrat text-sm text-marble">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-marble/50 hover:text-marble border-l border-white/10"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-12">
              <button
                data-testid="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.is_sold_out}
                className={`flex-1 py-4 font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                  product.is_sold_out
                    ? 'bg-white/10 text-marble/70 cursor-not-allowed'
                    : 'bg-marble text-obsidian hover:bg-gold'
                }`}
              >
                {product.is_sold_out ? 'SOLD OUT' : 'Añadir al Carrito'}
              </button>
              <button
                data-testid="product-wishlist-btn"
                onClick={() => toggleItem(product)}
                className={`w-14 h-14 border flex items-center justify-center transition-colors duration-300 ${
                  inWishlist ? 'border-gold' : 'border-white/10 hover:border-white/30'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-marble/50'} />
              </button>
            </div>

            {/* Info tabs */}
            <div className="border-t border-white/5">
              {['description', 'composition', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => setInfoTab(infoTab === tab ? '' : tab)}
                  className="w-full py-5 border-b border-white/5 flex justify-between items-center text-left"
                >
                  <span className="font-montserrat text-xs tracking-[0.15em] uppercase text-marble/60">
                    {tab === 'description' ? 'Descripción' : tab === 'composition' ? 'Composición' : 'Envío'}
                  </span>
                  <Plus size={14} className={`text-marble/30 transition-transform duration-300 ${infoTab === tab ? 'rotate-45' : ''}`} />
                </button>
              ))}
              {infoTab === 'description' && (
                <div className="py-5 border-b border-white/5">
                  <p className="font-montserrat text-sm text-marble/50 leading-relaxed">{product.description}</p>
                </div>
              )}
              {infoTab === 'composition' && (
                <div className="py-5 border-b border-white/5">
                  <p className="font-montserrat text-sm text-marble/50 leading-relaxed mb-2">{product.composition}</p>
                  <p className="font-montserrat text-xs text-marble/30">{product.care}</p>
                </div>
              )}
              {infoTab === 'shipping' && (
                <div className="py-5 border-b border-white/5 space-y-2">
                  <p className="font-montserrat text-sm text-marble/50">Envío estándar: 5-7 días laborables</p>
                  <p className="font-montserrat text-sm text-marble/50">Envío express: 2-3 días laborables</p>
                  <p className="font-montserrat text-sm text-marble/50">Envío gratuito en pedidos superiores a 500&euro;</p>
                  <p className="font-montserrat text-xs text-marble/30 mt-3">Devoluciones gratuitas en 30 días</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24 md:mt-32">
            <div className="section-divider mb-8" />
            <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/50 mb-3">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 mt-10">
              {related.map((p, i) => (
                <ProductCard key={p.product_id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
