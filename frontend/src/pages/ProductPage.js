import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import ModelViewer from '../components/ModelViewer';
import { toast } from 'sonner';
import { getProductById } from '../data/productHelpers';

const LOGO_FALLBACK_POSTER = '/logo-letras-final-blanco.svg';

const resolveFallbackPoster = (thumbnailImage, media) => {
  if (thumbnailImage) return thumbnailImage;
  const firstImage = media.find((item) => item.type === 'image')?.src;
  return firstImage || '';
};

export default function ProductPage() {
  const { productId } = useParams();
  const isUmbraProduct = productId === 'americana-umbra';
  const isIgnatiusProduct = productId === 'sueter-ignatius';
  const umbraTransitionDelay = 800;
  const ignatiusTransitionDelay = 300;
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [infoTab, setInfoTab] = useState('description');
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = getProductById(productId);
        setProduct(data);
        setRelated(data?.related_products || []);
        setSelectedSize('');
        setSelectedColor('');
        setQuantity(1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [productId]);

  useEffect(() => {
    if (!isUmbraProduct) {
      document.body.classList.remove('umbra-mode');
      return;
    }

    const timer = window.setTimeout(() => {
      document.body.classList.add('umbra-mode');
    }, umbraTransitionDelay);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('umbra-mode');
    };
  }, [isUmbraProduct]);

  useEffect(() => {
    if (!isIgnatiusProduct) {
      document.body.classList.remove('ignatius-mode');
      return;
    }

    const timer = window.setTimeout(() => {
      document.body.classList.add('ignatius-mode');
    }, ignatiusTransitionDelay);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('ignatius-mode');
    };
  }, [isIgnatiusProduct]);

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
      <div className={`min-h-screen pt-32 flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
        {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
        {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen pt-32 flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
        {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
        {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
        <p className="font-playfair text-xl text-obsidian/50">Producto no encontrado</p>
      </div>
    );
  }

  const galleryImages = product.product_id === 'americana-umbra'
    ? [
        '/products/americana-umbra/americana-umbra-main.jpg',
        '/products/americana-umbra/americana-umbra-look-01.jpg',
        '/products/americana-umbra/americana-umbra-look-02.jpg',
        '/products/americana-umbra/americana-umbra-look-03.jpg',
        '/products/americana-umbra/americana-umbra-look-04.jpg',
        '/products/americana-umbra/americana-umbra-detail-01.jpg',
        '/products/americana-umbra/americana-umbra-detail-02.jpg',
      ]
    : (product.images || []);

  const galleryMedia = [
    ...(product.model_url ? [{ type: 'model', src: product.model_url }] : []),
    ...galleryImages.map((img) => ({ type: 'image', src: img })),
  ];
  const fallbackPoster = resolveFallbackPoster(product.thumbnail_image, galleryMedia);
  const modelPoster = product.model_poster
    || fallbackPoster
    || LOGO_FALLBACK_POSTER;
  const inWishlist = isInWishlist(product.product_id);

  return (
    <div
      data-testid="product-page"
      className={`min-h-screen pt-28 md:pt-32 pb-24 ${isUmbraProduct ? 'umbra-product-page' : ''} ${
        isIgnatiusProduct ? 'product-page-ignatius' : ''
      }`}
    >
      {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
      {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
      {/* Breadcrumb */}
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 mb-8">
        <nav className="flex items-center gap-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40">
          <Link to="/" className="hover:text-obsidian transition-colors">Inicio</Link>
          <ChevronRight size={10} />
          <Link to="/tienda" className="hover:text-obsidian transition-colors">Tienda</Link>
          <ChevronRight size={10} />
          <span className="text-obsidian/60">{product.name}</span>
        </nav>
      </div>

      {/* Product layout */}
      <div className="product-content max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 lg:gap-16 items-start">
          {/* Left: Gallery */}
          <div>
            {galleryMedia.length > 0 ? (
              <div className="flex flex-col gap-12">
                {galleryMedia.map((media, index) => (
                  <div
                    key={`${media.type}-${index}`}
                    data-testid={`product-gallery-item-${index}`}
                    className="border-b border-black/5 pb-12 last:border-b-0 last:pb-0"
                  >
                    {media.type === 'model' ? (
                      <div className="product-gallery-media bg-white">
                        <ModelViewer
                          data-testid="product-model-viewer"
                          src={media.src}
                          alt={`Vista 3D de ${product.name}`}
                          poster={modelPoster}
                          className="product-model-viewer"
                        />
                      </div>
                    ) : (
                      <div className="product-gallery-media bg-white">
                        <img
                          data-testid={`product-gallery-image-${index}`}
                          src={media.src}
                          alt={product.name}
                          className="product-gallery-image"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="product-gallery-media bg-[#f5f5f5] flex items-center justify-center">
                <span className="font-montserrat text-xs tracking-[0.22em] uppercase text-obsidian/30">{product.name}</span>
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="lg:pl-8 lg:pt-4 lg:sticky lg:top-32 lg:self-start">
            <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-4">
              {product.category?.join(' / ')}
            </p>
            <div className="flex items-start justify-between gap-6 mb-4">
              <h1
                data-testid="product-name"
                className={`font-playfair text-3xl md:text-4xl text-obsidian ${isIgnatiusProduct ? 'ignatius-glow-text' : ''}`}
              >
                {product.name}
              </h1>
              {product.is_sold_out && (
                <span className="mt-2 border border-black/15 px-4 py-2 font-montserrat text-[10px] tracking-[0.25em] uppercase text-obsidian/70">
                  SOLD OUT
                </span>
              )}
            </div>
            <p data-testid="product-price" className="font-montserrat text-lg text-[#6e6e6e] tracking-wide mb-4">
              {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
            </p>
            {product.product_id === 'polo-aureus' && (
              <p className="font-montserrat text-xs text-obsidian/50 tracking-wide mb-8">
                Solo queda talla M disponible
              </p>
            )}
            {product.product_id !== 'polo-aureus' && (
              <div className="mb-10" />
            )}

            {/* Color selector */}
            {product.colors?.length > 0 && (
              <div className="mb-8">
                <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-4">Color</p>
                <div className="flex gap-3">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      data-testid={`color-btn-${i}`}
                      onClick={() => setSelectedColor(c.name)}
                      disabled={product.is_sold_out}
                      className={`flex items-center gap-2 px-4 py-2 border transition-colors duration-300 ${
                        selectedColor === c.name ? 'border-gold text-gold' : 'border-black/10 text-obsidian/60'
                      } ${product.is_sold_out ? 'opacity-60 cursor-not-allowed' : 'hover:border-black/30'}`}
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
              <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-4">Talla</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s, i) => {
                  const isSizeSoldOut =
                    (Array.isArray(product.sold_out_sizes) && product.sold_out_sizes.includes(s)) ||
                    (product.product_id === 'polo-golf' && s === 'L') ||
                    (product.product_id === 'americana-umbra' && ['M', 'L', 'XL'].includes(s)) ||
                    (product.product_id === 'polo-aureus' && ['XS', 'S', 'L', 'XL'].includes(s));
                  const disabled = product.is_sold_out || isSizeSoldOut;
                  return (
                    <button
                      key={i}
                      data-testid={`size-btn-${s}`}
                      onClick={() => setSelectedSize(s)}
                      disabled={disabled}
                      className={`min-w-[48px] py-3 px-4 border font-montserrat text-xs tracking-wide transition-colors duration-300 ${
                        selectedSize === s
                          ? 'border-obsidian text-obsidian bg-black/5'
                          : 'border-black/10 text-obsidian/50'
                      } ${disabled ? 'opacity-60 cursor-not-allowed line-through' : 'hover:border-black/30 hover:text-obsidian'} ${
                        isIgnatiusProduct && selectedSize === s ? 'ignatius-glow' : ''
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className={`mb-10 ${product.is_sold_out ? 'opacity-60 pointer-events-none' : ''}`}>
              <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-4">Cantidad</p>
              <div className="flex items-center gap-0 border border-black/10 inline-flex">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center text-obsidian/50 hover:text-obsidian border-r border-black/10"
                >
                  <Minus size={14} />
                </button>
                <span className="w-16 h-12 flex items-center justify-center font-montserrat text-sm text-obsidian">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center text-obsidian/50 hover:text-obsidian border-l border-black/10"
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
                className={`umbra-keep-dark flex-1 py-4 font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                  product.is_sold_out
                    ? 'bg-black/5 text-obsidian/60 cursor-not-allowed'
                    : 'bg-white text-obsidian hover:bg-gold'
                } ${isIgnatiusProduct ? 'ignatius-glow' : ''}`}
              >
                {product.is_sold_out ? 'SOLD OUT' : 'Añadir al Carrito'}
              </button>
              <button
                data-testid="product-wishlist-btn"
                onClick={() => toggleItem(product)}
                className={`w-14 h-14 border flex items-center justify-center transition-colors duration-300 ${
                  inWishlist ? 'border-gold' : 'border-black/10 hover:border-black/30'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-obsidian/50'} />
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
                  <span className="font-montserrat text-xs tracking-[0.15em] uppercase text-obsidian/60">
                    {tab === 'description' ? 'Descripción' : tab === 'composition' ? 'Composición' : 'Envío'}
                  </span>
                  <Plus size={14} className={`text-obsidian/30 transition-transform duration-300 ${infoTab === tab ? 'rotate-45' : ''}`} />
                </button>
              ))}
              {infoTab === 'description' && (
                <div className="py-5 border-b border-white/5">
                  <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">{product.description}</p>
                </div>
              )}
              {infoTab === 'composition' && (
                <div className="py-5 border-b border-white/5">
                  <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed mb-2">{product.composition}</p>
                  <p className="font-montserrat text-xs text-obsidian/40">{product.care}</p>
                </div>
              )}
              {infoTab === 'shipping' && (
                <div className="py-5 border-b border-white/5 space-y-2">
                  <p className="font-montserrat text-sm text-obsidian/60">Envío estándar: 5-7 días laborables</p>
                  <p className="font-montserrat text-sm text-obsidian/60">Envío express: 2-3 días laborables</p>
                  <p className="font-montserrat text-sm text-obsidian/60">Envío gratuito en pedidos superiores a 500&euro;</p>
                  <p className="font-montserrat text-xs text-obsidian/40 mt-3">Devoluciones gratuitas en 30 días</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-24 md:mt-32">
            <div className="section-divider mb-8" />
            <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-obsidian/50 mb-3">También te puede gustar</h2>
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
