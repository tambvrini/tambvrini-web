import { Link } from 'react-router-dom';

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const ICON_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/krjmn5r6_LOGO%20ICONO%20blanco%20svg%20web.svg";

export const Footer = () => {
  return (
    <footer data-testid="main-footer" className="bg-obsidian border-t border-white/5">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {/* La Marca */}
          <div>
            <h4 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/60 mb-6">La Marca</h4>
            <ul className="space-y-3">
              {['Sobre TAMBVRINI', 'Filosofía', 'Artesanía', 'Editorial', 'Sostenibilidad'].map((item, i) => (
                <li key={i}>
                  <Link
                    to="/marca"
                    className="font-montserrat text-xs text-marble/40 hover:text-gold tracking-wide transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand (center) */}
          <div className="flex items-start justify-center">
            <div className="flex flex-col items-center text-center">
              <img src={ICON_WHITE} alt="TAMBVRINI" className="h-24 mb-6 opacity-60" />
              <p className="font-montserrat text-xs text-marble/40 leading-relaxed tracking-wide">
                TAMBVRINI by Lucas Tamburini
              </p>
            </div>
          </div>

          {/* Client Services */}
          <div>
            <h4 className="font-cinzel text-xs tracking-[0.3em] uppercase text-marble/60 mb-6">Atención al Cliente</h4>
            <ul className="space-y-3">
              {['Contacto', 'Envíos', 'Devoluciones', 'Guía de Tallas', 'FAQ'].map((item, i) => (
                <li key={i}>
                  <Link
                    to="/marca"
                    className="font-montserrat text-xs text-marble/40 hover:text-gold tracking-wide transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <img src={LOGO_WHITE} alt="TAMBVRINI" className="h-4 opacity-30" />
          <p className="font-montserrat text-[10px] text-marble/25 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} TAMBVRINI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
