import { X } from 'lucide-react';
import { Sheet, SheetClose, SheetContent } from './ui/sheet';

const ContactPanel = ({ open, onOpenChange }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="right"
      hideClose
      overlayClassName="contact-overlay"
      className="w-full sm:w-1/2 sm:max-w-none border-l border-black/10 p-0 bg-white data-[state=open]:duration-300 data-[state=closed]:duration-200"
    >
      <div data-testid="contact-panel" data-state={open ? 'open' : 'closed'} className="flex h-full flex-col">
        <div className="flex items-center justify-between px-8 md:px-12 py-8 border-b border-black/5">
          <h2 className="font-cinzel text-xs tracking-[0.3em] uppercase text-obsidian/60">
            Contáctanos
          </h2>
          <SheetClose asChild>
            <button
              type="button"
              data-testid="contact-close-btn"
              className="text-obsidian/60 hover:text-obsidian transition-colors duration-300"
              aria-label="Cerrar contacto"
            >
              <X size={20} />
            </button>
          </SheetClose>
        </div>
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-10 space-y-6">
          <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(17,17,17,0.06)] p-6 space-y-3">
            <h3 className="font-montserrat text-sm text-obsidian tracking-wide">Llámanos</h3>
            <p className="font-montserrat text-sm text-obsidian/60">
              Estamos disponibles de 9:00 a 21:00.
            </p>
            <p className="font-montserrat text-sm text-obsidian/70">
              Teléfono:{' '}
              <a href="tel:+34685051959" className="text-obsidian/80 hover:text-obsidian transition-colors duration-300">
                +34 685 051 959
              </a>
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(17,17,17,0.06)] p-6 space-y-3">
            <h3 className="font-montserrat text-sm text-obsidian tracking-wide">Escríbenos</h3>
            <p className="font-montserrat text-sm text-obsidian/60">
              Nuestro equipo está disponible de 9:00 a 21:00.
            </p>
            <p className="font-montserrat text-sm text-obsidian/60">
              Servicio disponible en Español e Inglés.
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white shadow-[0_12px_30px_rgba(17,17,17,0.06)] p-6 space-y-3">
            <h3 className="font-montserrat text-sm text-obsidian tracking-wide">Email</h3>
            <p className="font-montserrat text-sm text-obsidian/60">
              Estamos disponibles de 9:00 a 21:00.
            </p>
            <p className="font-montserrat text-sm text-obsidian/70">
              Correo electrónico:{' '}
              <a
                href="mailto:tambvrini@gmail.com"
                className="text-obsidian/80 hover:text-obsidian transition-colors duration-300 select-all"
              >
                tambvrini@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

export default ContactPanel;
