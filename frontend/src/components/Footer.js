import { useI18n } from "../contexts/I18nContext";

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const ICON_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/krjmn5r6_LOGO%20ICONO%20blanco%20svg%20web.svg";

export const Footer = () => {
  const { lang, setLang, t } = useI18n();
  return (
    <footer data-testid="main-footer" className="bg-[#F5F2EA] border-t border-black/5">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 w-full items-start">
            {/* Left (links) */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <ul className="space-y-3">
                {[t('contacto'), t('mi_pedido'), t('faq')].map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className="font-montserrat text-xs text-obsidian/50 hover:text-obsidian tracking-wide transition-colors duration-300"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Brand (true center) */}
            <div className="flex items-start justify-center">
              <div className="flex flex-col items-center text-center">
                <img src={ICON_WHITE} alt="TAMBVRINI" className="h-28 mb-6 opacity-60" />
                <p className="font-montserrat text-xs text-obsidian/50 leading-relaxed tracking-wide">
                  {t('tambvrini_by')}
                </p>
              </div>
            </div>

            {/* Right (links + language) */}
            <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
              <ul className="space-y-3">
                {[t('acerca'), t('avisos'), t('privacidad')].map((item) => (
                  <li key={item}>
                    <button
                      type="button"
                      className="font-montserrat text-xs text-obsidian/50 hover:text-obsidian tracking-wide transition-colors duration-300"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <p className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-obsidian/50 mb-4">{t('idioma')}</p>
                <select
                  aria-label="Idioma"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent border border-black/10 px-4 py-2 font-montserrat text-xs text-obsidian/60 tracking-wide outline-none"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <img src={LOGO_WHITE} alt="TAMBVRINI" className="h-4 opacity-30" />
          <p className="font-montserrat text-[10px] text-obsidian/35 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} TAMBVRINI. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
