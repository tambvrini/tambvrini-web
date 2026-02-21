import { Link } from 'react-router-dom';

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const MARBLE_IMAGE = "https://images.unsplash.com/photo-1756287530100-c0b4412dee8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjB0ZXh0dXJlJTIwd2hpdGUlMjBjbGFzc2ljYWx8ZW58MHx8fHwxNzcwMzIxNzAzfDA&ixlib=rb-4.1.0&q=85";
const TENNIS_IMAGE = "https://customer-assets.emergentagent.com/job_tambvrini-luxury-2/artifacts/zitxtlbr_IMG_1066.JPEG";

export default function BrandPage() {
  return (
    <div data-testid="brand-page" className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={MARBLE_IMAGE} alt="Marble" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-obsidian/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6" />
      </section>

      {/* Philosophy */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <div className="section-divider mb-10" />
        <h2 className="font-cinzel text-2xl md:text-3xl tracking-[0.1em] text-marble mb-10">Filosofía</h2>
        <div className="space-y-6">
          <p className="font-montserrat text-sm text-marble/50 leading-relaxed">
            TAMBVRINI nace de la convicción de que la verdadera elegancia es atemporal. Inspirados en la grandeza del mundo clásico
            y la sofisticación de la Riviera europea, creamos piezas que trascienden temporadas y tendencias.
          </p>
          <p className="font-montserrat text-sm text-marble/50 leading-relaxed">
            Cada colección es un diálogo entre el pasado y el presente: la majestuosidad de Roma, la despreocupada elegancia
            de los clubes de tenis de la Costa Azul, y la artesanía de los mejores talleres de Italia.
          </p>
          <p className="font-playfair italic text-lg text-marble/30 mt-10">
            "Vestir bien no es un acto de vanidad, sino un homenaje a la tradición."
          </p>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="bg-marble">
        <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2">
          <div className="px-8 md:px-16 lg:px-24 py-20 md:py-32 flex flex-col justify-center">
            <div className="w-12 h-px bg-emerald mb-10" />
            <h2 className="font-cinzel text-2xl md:text-3xl text-obsidian tracking-[0.1em] mb-8">Artesanía</h2>
            <p className="font-montserrat text-sm text-obsidian/50 leading-relaxed mb-6 max-w-md">
              Trabajamos artesanalmente. Cada pieza pasa por un riguroso proceso de confección que garantiza la excelencia en cada detalle.
            </p>
            <p className="font-montserrat text-sm text-obsidian/50 leading-relaxed max-w-md">
              Desde Barcelona, seleccionamos materiales de la más alta calidad para crear prendas que duran generaciones.
            </p>
          </div>
          <div className="img-zoom aspect-square lg:aspect-auto overflow-hidden">
            <img src={TENNIS_IMAGE} alt="Craftsmanship" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <div className="section-divider mx-auto mb-8" />
          <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/50">Nuestros Valores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'Herencia', text: 'Cada colección rinde homenaje a la rica tradición de la moda europea, desde la sastrería napolitana hasta la seda de Como.' },
            { title: 'Excelencia', text: 'Diseñado y elaborado a mano en Barcelona, cada producto TAMBVRINI nace de un proceso artesanal donde el detalle es la prioridad.' },
            { title: 'Compromiso', text: 'Tu satisfacción es nuestra prioridad. Si el producto no cumple tus expectativas, puedes solicitar la devolución en un plazo de 14 días.' },
          ].map((v, i) => (
            <div key={i} className="text-center">
              <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase text-gold mb-6">{v.title}</h3>
              <p className="font-montserrat text-xs text-marble/40 leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <Link to="/tienda" className="btn-luxury btn-gold inline-block">Explorar Colección</Link>
      </section>
    </div>
  );
}
