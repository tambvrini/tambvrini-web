import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const MARBLE_IMAGE = "https://images.unsplash.com/photo-1756287530100-c0b4412dee8b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzN8MHwxfHNlYXJjaHwxfHxtYXJibGUlMjB0ZXh0dXJlJTIwd2hpdGUlMjBjbGFzc2ljYWx8ZW58MHx8fHwxNzcwMzIxNzAzfDA&ixlib=rb-4.1.0&q=85";
const TENNIS_IMAGE = "https://customer-assets.emergentagent.com/job_tambvrini-luxury-2/artifacts/zitxtlbr_IMG_1066.JPEG";
const CINEMATIC_VIDEO_URL = "https://customer-assets.emergentagent.com/job_a24b6471-62bc-4793-aa50-779b82deb92e/artifacts/axoe4sux_VIDEO%20WEB%201.mp4";

const BrandCinematicSection = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }, []);

  return (
    <section data-testid="brand-cinematic-section" className="py-16 md:py-24 bg-[#F5F2EA]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="overflow-hidden rounded-[12px]">
          <div className="relative w-full aspect-video bg-white/5">
            <video
              ref={videoRef}
              data-testid="brand-cinematic-video"
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate noremoteplayback"
              src={CINEMATIC_VIDEO_URL}
              onError={() => {
                const v = videoRef.current;
                if (!v || v.dataset.retry === '1') return;
                v.dataset.retry = '1';
                v.load();
                const p = v.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default function BrandPage() {
  return (
    <div data-testid="brand-page" className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[70vh] overflow-hidden">
        <img src={MARBLE_IMAGE} alt="Marble" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6" />
      </section>

      {/* Philosophy */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
        <div className="section-divider mb-10" />
        <h2 className="font-cinzel text-2xl md:text-3xl tracking-[0.1em] text-obsidian mb-10">Filosofía</h2>
        <div className="space-y-6">
          <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">
            TAMBVRINI nace de Lucas Tamburini, artista y diseñador establecido en Barcelona.
            La marca surge como una visión personal de la elegancia atemporal, prendas creadas para trascender.
          </p>
          <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">
            Inspirado en la grandeza del mundo clásico, la estética europea y la artesanía tradicional, TAMBVRINI construye cada colección como un diálogo entre el pasado y el presente.
            Una búsqueda constante de equilibrio entre la majestuosidad, la sobriedad y la elegancia despreocupada.
          </p>
          <p className="font-montserrat text-sm text-obsidian/60 leading-relaxed">
            Cada pieza refleja una filosofía clara: identidad y carácter.
          </p>
          <p className="font-playfair italic text-lg text-obsidian/35 mt-10">
            "Vestir bien no es un acto de vanidad, sino un homenaje a la tradición."
          </p>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="bg-[#F5F2EA]">
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

      <BrandCinematicSection />

      {/* Values */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24 max-w-[1920px] mx-auto">
        <div className="text-center mb-16">
          <div className="section-divider mx-auto mb-8" />
          <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-obsidian/50">Nuestros Valores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { title: 'Herencia', text: 'Cada colección rinde homenaje a la rica tradición de la moda europea.' },
            { title: 'Excelencia', text: 'Diseñado y elaborado a mano en Barcelona, cada producto TAMBVRINI nace de un proceso artesanal donde el detalle es la prioridad.' },
            { title: 'Compromiso', text: 'Tu satisfacción es nuestra prioridad. Si el producto no cumple tus expectativas, puedes solicitar la devolución en un plazo de 14 días.' },
          ].map((v, i) => (
            <div key={i} className="text-center">
              <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase text-gold mb-6">{v.title}</h3>
              <p className="font-montserrat text-xs text-obsidian/55 leading-relaxed">{v.text}</p>
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
