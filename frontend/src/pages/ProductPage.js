import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Minus, Plus, ChevronRight, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/ProductCard';
import ModelViewer from '../components/ModelViewer';
import Simple3DViewer from '../components/Simple3DViewer.tsx';
import { toast } from 'sonner';
import { getProductById } from '../data/productHelpers';
import { supportsHoverVideo } from '../constants/hoverVideoProducts';

const LOGO_FALLBACK_POSTER = '/logo-letras-final-blanco.svg';
const MAX_RECOMMENDED_PRODUCTS = 4;

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
        setRelatedProducts(Array.isArray(data.related_products) ? data.related_products : []);
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
      <div className={`product-page-shell mb-10 flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
        {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
        {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}
        <div className="w-8 h-8 border border-gold/30 border-t-gold animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`product-page-shell mb-10 flex items-center justify-center ${isUmbraProduct ? 'umbra-product-page' : ''} ${isIgnatiusProduct ? 'product-page-ignatius' : ''}`}>
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
  const shouldUseSimpleViewer = isUmbraProduct || isIgnatiusProduct;
  const inWishlist = isInWishlist(product.product_id);
  const categoryLabel = Array.isArray(product.category) && product.category.length > 0
    ? product.category
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' / ')
    : 'Apparel';
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

      return (
        <div
          key={`${media.type}-${index}`}
          className="product-gallery-item"
          data-testid={`product-gallery-item-${index}`}
        >
          {media.type === 'model' ? (
            <div className="product-gallery-media">
              {shouldUseSimpleViewer ? (
                <Simple3DViewer
                  data-testid="product-model-viewer"
                  src={media.src}
                  productId={product.product_id}
                  className="product-model-viewer"
                  aria-label={`Vista 3D de ${product.name}`}
                />
              ) : (
                <ModelViewer
                  data-testid="product-model-viewer"
                  src={media.src}
                  alt={`Vista 3D de ${product.name}`}
                  poster={modelPoster}
                  className="product-model-viewer"
                />
              )}
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
        </div>
      );
    });
  })();

  return (
    <div
      data-testid="product-page"
      className={`product-page-shell mb-12 ${isUmbraProduct ? 'umbra-product-page' : ''} ${
        isIgnatiusProduct ? 'product-page-ignatius' : ''
      }`}
    >
      {isUmbraProduct && <div className="umbra-background" aria-hidden="true" />}
      {isIgnatiusProduct && <div className="ignatius-background" aria-hidden="true" />}

      {/* Product layout */}
      <div className="product-content">
        <div className="product-page product-layout">
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
            <p className="product-label">
              {categoryLabel}
            </p>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1
                data-testid="product-name"
                className={`product-title ${isIgnatiusProduct ? 'ignatius-glow-text' : ''}`}
              >
                {product.name}
              </h1>
              {product.is_sold_out && (
                <span className="mt-2 border border-black/15 px-4 py-2 font-montserrat text-[10px] tracking-[0.25em] uppercase text-obsidian/70">
                  SOLD OUT
                </span>
              )}
            </div>
            <p data-testid="product-price" className="product-price">
              {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
            </p>
            {product.product_id === 'polo-aureus' && (
              <p className="font-montserrat text-xs text-obsidian/50 tracking-wide mb-6">
                Solo queda talla M disponible
              </p>
            )}
            {product.product_id !== 'polo-aureus' && (
              <div className="mb-6" />
            )}

            <div className="product-variant-stack">
              {product.colors?.length > 0 && (
                <div className="product-variant-row">
                  <p className="product-variant-label">Color:</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        data-testid={`color-btn-${i}`}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={`Seleccionar color ${c.name}`}
                        disabled={product.is_sold_out}
                        className={`product-color-option ${
                          selectedColor === c.name ? 'is-selected' : ''
                        } ${product.is_sold_out ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <span className="product-color-swatch" style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-variant-row">
                <p className="product-variant-label">Talla:</p>
                <div className="product-size-options">
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
                        className={`product-size-option ${selectedSize === s ? 'is-selected' : ''} ${
                          disabled ? 'is-disabled' : ''
                        } ${
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
            <div className="product-controls-row">
              <div className={`product-quantity-control ${product.is_sold_out ? 'opacity-60 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Disminuir cantidad"
                  disabled={product.is_sold_out}
                  className={`product-quantity-button ${
                    product.is_sold_out ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <Minus size={14} />
                </button>
                <span className="product-quantity-value">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Aumentar cantidad"
                  disabled={product.is_sold_out}
                  className={`product-quantity-button ${
                    product.is_sold_out ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                data-testid="product-wishlist-btn"
                onClick={() => toggleItem(product)}
                aria-label={inWishlist ? 'Eliminar de la lista de deseos' : 'Añadir a la lista de deseos'}
                className={`product-wishlist transition-colors duration-300 ${
                  inWishlist ? 'border-gold' : 'border-black/10 hover:border-black/30'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-obsidian/50'} />
              </button>
            </div>

            {/* Actions */}
            <div className="mb-10">
              {product.product_id === 'camiseta-sport-club' && (
                <a
                  href="https://buy.stripe.com/8x27sM7A34mh5KQbGp1Jm00"
                  className="buy-btn product-secondary-cta"
                >
                  Comprar ahora
                </a>
              )}
              <button
                data-testid="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.is_sold_out}
                className={`product-primary-cta ${
                  product.is_sold_out
                    ? 'bg-black/5 text-obsidian/60 cursor-not-allowed'
                    : 'bg-obsidian text-white hover:opacity-90'
                } ${isIgnatiusProduct ? 'ignatius-glow' : ''}`}
              >
                {product.is_sold_out ? 'SOLD OUT' : 'AÑADIR AL CARRITO'}
              </button>
            </div>

            {/* Info tabs */}
            <div className="product-detail-links">
              {[
                ['details', 'Product details'],
                ['size', 'Size guide'],
                ['shipping', 'Delivery & returns'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => {
                    setActiveDetail(tab);
                    setDetailsOpen(true);
                  }}
                  className="product-detail-link"
                >
                  <span>{label}</span>
                  <ChevronRight size={14} />
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
              {relatedProducts.slice(0, MAX_RECOMMENDED_PRODUCTS).map((item, index) => (
                <ProductCard key={item.product_id} product={item} index={index} enableHoverVideo={supportsHoverVideo(item.product_id)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
