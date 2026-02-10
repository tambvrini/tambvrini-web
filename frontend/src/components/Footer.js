import { useI18n } from "../contexts/I18nContext";

const LOGO_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/amln6wrd_LOGO%20LETRAS%20blanco%20svg%20web.svg";
const ICON_WHITE = "https://customer-assets.emergentagent.com/job_42168592-1148-4152-ae1b-eab7ccc63cd7/artifacts/krjmn5r6_LOGO%20ICONO%20blanco%20svg%20web.svg";

export const Footer = () => {
  const { lang, setLang, t } = useI18n();
  return (
    <footer data-testid="main-footer" className="bg-obsidian border-t border-white/5">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 py-20 md:py-28">
        <div className="flex justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 w-full">
            {/* Left spacer (keeps center perfectly centered on large screens) */}
            <div className="hidden lg:block" />

            {/* Brand (true center) */}
            <div className="flex items-start justify-center">
              <div className="flex flex-col items-center text-center">
                <img src={ICON_WHITE} alt="TAMBVRINI" className="h-28 mb-6 opacity-60" />
                <p className="font-montserrat text-xs text-marble/40 leading-relaxed tracking-wide">
                  TAMBVRINI by Lucas Tamburini
                </p>
              </div>
            </div>

            {/* Right spacer */}
            <div className="hidden lg:block" />
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
