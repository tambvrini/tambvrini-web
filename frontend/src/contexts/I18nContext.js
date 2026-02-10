import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const I18nContext = createContext(null);
export const useI18n = () => useContext(I18nContext);

const STORAGE_KEY = 'tambvrini_lang';

// Minimal dictionary: we only translate what we introduce now.
const DICT = {
  es: {
    contacto: 'Contacto',
    mi_pedido: 'Mi pedido',
    faq: 'Preguntas Frecuentes',
    acerca: 'Acerca de Tambvrini',
    avisos: 'Avisos Legales',
    privacidad: 'Política de Privacidad',
    idioma: 'Idioma',
    tambvrini_by: 'TAMBVRINI by Lucas Tamburini',
  },
  en: {
    contacto: 'Contact',
    mi_pedido: 'My order',
    faq: 'FAQ',
    acerca: 'About Tambvrini',
    avisos: 'Legal notice',
    privacidad: 'Privacy Policy',
    idioma: 'Language',
    tambvrini_by: 'TAMBVRINI by Lucas Tamburini',
  },
  fr: {
    contacto: 'Contact',
    mi_pedido: 'Ma commande',
    faq: 'FAQ',
    acerca: 'À propos de Tambvrini',
    avisos: 'Mentions légales',
    privacidad: 'Politique de confidentialité',
    idioma: 'Langue',
    tambvrini_by: 'TAMBVRINI by Lucas Tamburini',
  },
  it: {
    contacto: 'Contatto',
    mi_pedido: 'Il mio ordine',
    faq: 'FAQ',
    acerca: 'Chi è Tambvrini',
    avisos: 'Note legali',
    privacidad: 'Privacy Policy',
    idioma: 'Lingua',
    tambvrini_by: 'TAMBVRINI by Lucas Tamburini',
  },
};

export const I18nProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'es';
    } catch {
      return 'es';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const t = useMemo(() => {
    const dict = DICT[lang] || DICT.es;
    return (key) => dict[key] || DICT.es[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
