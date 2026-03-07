import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronRight, X } from 'lucide-react';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeDetail, setActiveDetail] = useState('details');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailLabels = {
    details: 'Detalles del producto',
    size: 'Guía de tallas',
    shipping: 'Envío y devoluciones',
  };
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = getProductById(productId);
        if (!data) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }
        setProduct(data);
        setRelatedProducts(data.related_products || []);
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
  }, [productId]);

  useEffect(() => {
    if (!detailsOpen) return;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDetailsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailsOpen]);

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
      <div className={`product-page-shell flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
        {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
        {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`product-page-shell flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
        {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
        {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
        <p className="font-playfair text-xl text-obsidian/50">Producto no encontrado</p>
      </div>
    );
  }

  const selectorLayoutClass = product.colors?.length
    ? 'product-options'
    : 'product-options product-options--single';

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
  const sizeLabel = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes.join(', ')
    : 'Consulta disponibilidad en tienda';
  const galleryItems = (() => {
    let imageIndex = 0;

    return galleryMedia.map((media, index) => {
      const currentImageIndex = media.type === 'image' ? imageIndex : null;

      if (media.type === 'image') {
        imageIndex += 1;
      }

      const showDivider = index < galleryMedia.length - 1;

      return (
        <div
          key={`${media.type}-${index}`}
          data-testid={`product-gallery-item-${index}`}
        >
          {media.type === 'model' ? (
            <div className="product-gallery-media">
              <ModelViewer
                data-testid="product-model-viewer"
                src={media.src}
                alt={`Vista 3D de ${product.name}`}
                poster={modelPoster}
                className="product-model-viewer"
              />
            </div>
          ) : (
            <div className="product-gallery-media">
              <img
                data-testid={`product-gallery-image-${currentImageIndex}`}
                src={media.src}
                alt={product.name}
                className="product-gallery-image"
              />
            </div>
          )}
          {showDivider && (
            <div aria-hidden="true" className="h-px bg-black/[0.08] my-6" />
          )}
        </div>
      );
    });
  })();

  return (
    <div
      data-testid="product-page"
      className={`product-page-shell ${isUmbraProduct ? 'umbra-product-page' : ''} ${
        isIgnatiusProduct ? 'product-page-ignatius' : ''
      }`}
    >
      {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
      {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}

      {/* Product layout */}
      <div className="product-content max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="product-page product-layout product-gallery-layout">
          {/* Left: Gallery */}
          <div className="product-media" data-testid="product-media">
            {galleryMedia.length > 0 ? (
              galleryItems
            ) : (
              <div className="product-gallery-media flex items-center justify-center">
                <span className="font-montserrat text-xs tracking-[0.22em] uppercase text-obsidian/30">{product.name}</span>
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="product-info">
            <nav className="flex items-center gap-2 font-montserrat text-[10px] tracking-widest uppercase text-obsidian/40 mb-4">
              <Link to="/" className="hover:text-obsidian transition-colors">Inicio</Link>
              <ChevronRight size={10} />
              <Link to="/tienda" className="hover:text-obsidian transition-colors">Tienda</Link>
              <ChevronRight size={10} />
              <span className="text-obsidian/60">{product.name}</span>
            </nav>
            <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-gold/60 mb-2">
              {product.category?.join(' / ')}
            </p>
            <div className="flex items-start justify-between gap-4 mb-2">
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
            <p data-testid="product-price" className="font-montserrat text-lg text-obsidian/60 tracking-wide mb-2">
              {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
            </p>
            {product.product_id === 'polo-aureus' && (
              <p className="font-montserrat text-xs text-obsidian/50 tracking-wide mb-3">
                Solo queda talla M disponible
              </p>
            )}
            {product.product_id !== 'polo-aureus' && (
              <div className="mb-3" />
            )}

            <div className={selectorLayoutClass}>
              {/* Color selector */}
              {product.colors?.length > 0 && (
                <div className="flex-1">
                  <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        data-testid={`color-btn-${i}`}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={`Seleccionar color ${c.name}`}
                        disabled={product.is_sold_out}
                        className={`flex items-center gap-2 px-3 py-2 border transition-colors duration-300 ${
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
              <div className="flex-1">
                <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-2">Talla</p>
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
                        aria-label={`Seleccionar talla ${s}`}
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
            </div>

            {/* Quantity + wishlist */}
            <div className="product-options product-options--compact">
              <div className={product.is_sold_out ? 'opacity-60 pointer-events-none' : ''}>
                <p className="font-montserrat text-[10px] tracking-[0.2em] uppercase text-obsidian/50 mb-2">Cantidad</p>
                <div className="flex items-center border border-black/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Disminuir cantidad"
                    disabled={product.is_sold_out}
                    className={`w-12 h-12 flex items-center justify-center text-obsidian/50 border-r border-black/10 ${
                      product.is_sold_out ? 'cursor-not-allowed' : 'hover:text-obsidian'
                    }`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-16 h-12 flex items-center justify-center font-montserrat text-sm text-obsidian">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar cantidad"
                    disabled={product.is_sold_out}
                    className={`w-12 h-12 flex items-center justify-center text-obsidian/50 border-l border-black/10 ${
                      product.is_sold_out ? 'cursor-not-allowed' : 'hover:text-obsidian'
                    }`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <button
                data-testid="product-wishlist-btn"
                onClick={() => toggleItem(product)}
                aria-label={inWishlist ? 'Eliminar de la lista de deseos' : 'Añadir a la lista de deseos'}
                className={`product-wishlist w-14 h-14 border flex items-center justify-center transition-colors duration-300 ${
                  inWishlist ? 'border-gold' : 'border-black/10 hover:border-black/30'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-obsidian/50'} />
              </button>
            </div>

            {/* Actions */}
            <div className="mb-4">
              <button
                data-testid="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.is_sold_out}
                className={`umbra-keep-dark w-full py-3 font-montserrat text-[11px] tracking-[0.2em] uppercase transition-colors duration-500 ${
                  product.is_sold_out
                    ? 'bg-black/5 text-obsidian/60 cursor-not-allowed'
                    : 'bg-white text-obsidian hover:bg-gold'
                } ${isIgnatiusProduct ? 'ignatius-glow' : ''}`}
              >
                {product.is_sold_out ? 'SOLD OUT' : 'Añadir al Carrito'}
              </button>
            </div>

            {/* Info tabs */}
            <div className="border-t border-white/5">
              {['details', 'size', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => {
                    setActiveDetail(tab);
                    setDetailsOpen(true);
                  }}
                  className="w-full py-3 border-b border-white/5 flex justify-between items-center text-left"
                >
                  <span className="font-montserrat text-xs tracking-[0.15em] uppercase text-obsidian/60">
                    {detailLabels[tab]}
                  </span>
                  <Plus size={14} className="text-obsidian/30 transition-transform duration-300" />
                </button>
              ))}
            </div>
            <div
              className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
                detailsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              aria-hidden={!detailsOpen}
            >
              <div
                className="absolute inset-0 bg-black/30"
                onClick={() => setDetailsOpen(false)}
                aria-hidden="true"
              />
              <div
                className={`details-drawer p-8 shadow-[0_24px_64px_rgba(15,23,42,0.18)] ${
                  detailsOpen ? 'open' : ''
                }`}
                role="dialog"
                aria-label="Detalles del producto"
              >
                <button
                  type="button"
                  onClick={() => setDetailsOpen(false)}
                  aria-label="Cerrar detalles"
                  className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center text-obsidian/50 hover:text-obsidian transition-colors"
                >
                  <X size={18} />
                </button>
                <div className="space-y-6">
                  <div>
                    <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-obsidian/40 mb-2">
                      Detalles
                    </p>
                    <h3 className="font-playfair text-2xl text-obsidian">
                      {detailLabels[activeDetail]}
                    </h3>
                  </div>
                  {activeDetail === 'details' && (
                    <div className="space-y-3">
                      <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">
                        {product.description}
                      </p>
                      <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">{product.composition}</p>
                      <p className="font-montserrat text-xs text-obsidian/40">{product.care}</p>
                    </div>
                  )}
                  {activeDetail === 'size' && (
                    <div className="space-y-3">
                      <p className="font-montserrat text-sm text-obsidian/60">
                        Tallas disponibles: {sizeLabel}
                      </p>
                      <p className="font-montserrat text-xs text-obsidian/40">
                        Ajuste estándar. Si estás entre dos tallas, elige la superior.
                      </p>
                    </div>
                  )}
                  {activeDetail === 'shipping' && (
                    <div className="space-y-3">
                      <p className="font-montserrat text-sm text-obsidian/60">Envío estándar: 5-7 días laborables</p>
                      <p className="font-montserrat text-sm text-obsidian/60">Envío express: 2-3 días laborables</p>
                      <p className="font-montserrat text-sm text-obsidian/60">Envío gratuito en pedidos superiores a 500&euro;</p>
                      <p className="font-montserrat text-xs text-obsidian/40">Devoluciones gratuitas en 30 días</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 md:mt-20">
            <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-obsidian/50 mb-6">
              También te puede gustar
            </h2>
            <div className="product-recommendations" data-testid="product-recommendations">
              {relatedProducts.slice(0, 4).map((item, index) => (
                <ProductCard key={item.product_id} product={item} index={index} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
