import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Minus, Plus, X } from 'lucide-react';
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

const isSizeSoldOut = (product, size) => (
  (Array.isArray(product.sold_out_sizes) && product.sold_out_sizes.includes(size)) ||
  (product.product_id === 'polo-golf' && size === 'L') ||
  (product.product_id === 'americana-umbra' && ['M', 'L', 'XL'].includes(size)) ||
  (product.product_id === 'polo-aureus' && ['XS', 'S', 'L', 'XL'].includes(size))
);

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
  const shouldUseSimpleViewer = isUmbraProduct || isIgnatiusProduct;
  const inWishlist = isInWishlist(product.product_id);
  const hasAvailableSizes = Array.isArray(product.sizes) && product.sizes.some((size) => !isSizeSoldOut(product, size));
  const isProductUnavailable = product.is_sold_out || !hasAvailableSizes;
  const productPaymentLink = product.stripePaymentLink;
  const categoryLabel = Array.isArray(product.category) && product.category.length > 0
    ? product.category.slice(0, 2).join(' / ').toUpperCase()
    : 'APPAREL';
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
          <div className="product-info product-right">
            <nav
              data-testid="product-breadcrumb"
              aria-label="Categoría del producto"
              className="product-category-label category-label mx-auto flex w-full max-w-[28rem] justify-center"
            >
              <span className="font-montserrat uppercase text-obsidian/45">
                {categoryLabel}
              </span>
            </nav>
            <div className="product-heading-block mx-auto flex w-full max-w-[28rem] flex-col items-center gap-3">
              <h1
                data-testid="product-name"
                className={`product-title max-w-[16ch] text-center font-playfair break-words text-obsidian ${isIgnatiusProduct ? 'ignatius-glow-text' : ''}`}
              >
                {product.name}
              </h1>
              {isProductUnavailable && (
                <span className="border border-black/15 px-4 py-2 font-montserrat text-[10px] tracking-[0.25em] uppercase text-obsidian/70">
                  AGOTADO
                </span>
              )}
            </div>
            <p
              data-testid="product-price"
              className="product-price price mx-auto w-full max-w-[28rem] text-center font-montserrat text-obsidian/60"
            >
              {product.price.toLocaleString('es-ES', { minimumFractionDigits: 0 })} &euro;
            </p>
            {product.product_id === 'polo-aureus' && (
              <p className="product-note mx-auto w-full max-w-[28rem] text-center font-montserrat text-xs tracking-wide text-obsidian/50">
                Solo queda talla M disponible
              </p>
            )}

            <div className={`${selectorLayoutClass} product-selectors`}>
              {/* Color selector */}
              {product.colors?.length > 0 && (
                <div className="product-selector-group product-section flex-1">
                  <p className="product-selector-label text-center font-montserrat text-[10px] tracking-[0.24em] uppercase text-obsidian/50">Color</p>
                  <div className="product-selector-list color-selector flex flex-wrap justify-center gap-2">
                    {product.colors.map((c, i) => (
                      <button
                        key={i}
                        data-testid={`color-btn-${i}`}
                        onClick={() => setSelectedColor(c.name)}
                        aria-label={`Seleccionar color ${c.name}`}
                        disabled={product.is_sold_out}
                        className={`product-color-chip color-pill flex items-center justify-center gap-2 border text-center transition-colors duration-300 ${
                          selectedColor === c.name ? 'border-gold text-gold' : 'border-black/10 text-obsidian/60'
                        } ${product.is_sold_out ? 'opacity-60 cursor-not-allowed' : 'hover:border-black/30'}`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
                        <span className="font-montserrat tracking-wide">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector */}
              <div className="product-selector-group product-section flex-1">
                <p className="product-selector-label text-center font-montserrat text-[10px] tracking-[0.24em] uppercase text-obsidian/50">Talla</p>
                  <div className="product-selector-list size-selector flex flex-wrap justify-center gap-2">
                    {product.sizes.map((s, i) => {
                    const sizeSoldOut = isSizeSoldOut(product, s);
                    const disabled = isProductUnavailable || sizeSoldOut;
                    return (
                      <button
                        key={i}
                        data-testid={`size-btn-${s}`}
                        onClick={() => setSelectedSize(s)}
                        aria-label={`Seleccionar talla ${s}`}
                        disabled={disabled}
                        className={`product-size-chip size-button border text-center font-montserrat tracking-wide transition-colors duration-300 ${
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
            <div className="product-options product-options--compact product-section">
              <div className={isProductUnavailable ? 'product-quantity-block opacity-60 pointer-events-none flex flex-col items-center' : 'product-quantity-block flex flex-col items-center'}>
                <p className="product-selector-label text-center font-montserrat text-[10px] tracking-[0.24em] uppercase text-obsidian/50">Cantidad</p>
                <div className="quantity-selector inline-flex items-center">
                  <button
                    data-testid="quantity-decrease-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Disminuir cantidad"
                    disabled={isProductUnavailable}
                    className={`quantity-selector__button flex items-center justify-center text-obsidian/50 transition-colors duration-300 ${
                      isProductUnavailable ? 'cursor-not-allowed' : 'hover:text-obsidian'
                    }`}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    data-testid="quantity-value"
                    className="quantity-selector__value flex items-center justify-center font-montserrat text-sm text-obsidian"
                  >
                    {quantity}
                  </span>
                  <button
                    data-testid="quantity-increase-btn"
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Aumentar cantidad"
                    disabled={isProductUnavailable}
                    className={`quantity-selector__button flex items-center justify-center text-obsidian/50 transition-colors duration-300 ${
                      isProductUnavailable ? 'cursor-not-allowed' : 'hover:text-obsidian'
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
                className={`product-wishlist flex items-center justify-center border transition-colors duration-300 ${
                  inWishlist ? 'border-gold' : 'border-black/10 hover:border-black/30'
                }`}
              >
                <Heart size={18} className={inWishlist ? 'fill-gold text-gold' : 'text-obsidian/50'} />
              </button>
            </div>

            {/* Actions */}
            <div className="product-cta-group product-section mx-auto w-full max-w-[28rem]">
              {!isProductUnavailable && productPaymentLink && (
                <a
                  data-testid="buy-now-btn"
                  href={productPaymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="product-primary-cta cta-button buy-btn umbra-keep-dark flex w-full items-center justify-center px-4 text-center font-montserrat uppercase transition-colors duration-300"
                >
                  COMPRAR AHORA
                </a>
              )}
              {isProductUnavailable ? (
                <span
                  data-testid="sold-out-btn"
                  className={`product-primary-cta cta-button umbra-keep-dark flex w-full cursor-not-allowed items-center justify-center px-4 text-center font-montserrat uppercase transition-colors duration-300 ${
                    isIgnatiusProduct ? 'ignatius-glow' : ''
                  }`}
                  aria-disabled="true"
                >
                  AGOTADO
                </span>
              ) : (
                <button
                  data-testid="add-to-cart-btn"
                  onClick={handleAddToCart}
                  className={`product-primary-cta cta-button umbra-keep-dark flex w-full items-center justify-center px-4 text-center font-montserrat uppercase transition-colors duration-300 ${
                    isIgnatiusProduct ? 'ignatius-glow' : ''
                  }`}
                >
                  AÑADIR AL CARRITO
                </button>
              )}
            </div>

            {/* Info tabs */}
            <div className="product-info-links product-details mx-auto w-full max-w-[28rem] border-t border-white/5">
              <button
                data-testid="tab-details"
                onClick={() => {
                  setActiveDetail('details');
                  setDetailsOpen(true);
                }}
                className="product-info-link relative flex w-full items-center justify-center border-b border-white/5 text-center"
              >
                <span className="product-info-link__label font-montserrat uppercase text-obsidian/60">
                  {detailLabels.details}
                </span>
                <Plus size={12} className="product-info-link__icon absolute right-0 text-obsidian/30 transition-transform duration-300" />
              </button>
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
                <div className="space-y-5 text-center">
                  <div>
                    <p className="mb-2 font-cinzel text-[10px] tracking-[0.3em] uppercase text-obsidian/40">
                      Detalles
                    </p>
                    <h3 className="font-playfair text-2xl text-obsidian">
                      {detailLabels[activeDetail]}
                    </h3>
                  </div>
                  {activeDetail === 'details' && (
                    <div className="space-y-2.5">
                      <p className="font-montserrat text-sm leading-relaxed text-obsidian/60">
                        {product.description}
                      </p>
                      <p className="font-montserrat text-sm leading-relaxed text-obsidian/60">{product.composition}</p>
                      <p className="font-montserrat text-xs text-obsidian/40">{product.care}</p>
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
