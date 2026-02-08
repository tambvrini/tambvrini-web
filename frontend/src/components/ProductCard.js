import { Link } from 'react-router-dom';
export const ProductCard = ({ product, index = 0 }) => {
  return (
    <Link
      to={`/producto/${product.product_id}`}
      data-testid={`product-card-${product.product_id}`}
      className="group block"
      style={{ animationDelay: `${index * 0.03}s` }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-obsidian/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <span className="font-montserrat text-[10px] tracking-[0.22em] uppercase text-marble/90">View product</span>
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
