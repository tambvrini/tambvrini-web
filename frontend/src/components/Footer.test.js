import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '../contexts/I18nContext';
import Footer, { FOOTER_BACKGROUND } from './Footer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const renderFooter = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <I18nProvider>
        <Footer />
      </I18nProvider>
    );
  });

  return { container, root };
};

describe('Footer styling', () => {
  it('uses the global pastel background and ivory accents', async () => {
    const { container, root } = await renderFooter();
    const footer = container.querySelector('[data-testid="main-footer"]');

    expect(footer).not.toBeNull();
    expect(FOOTER_BACKGROUND).toBe('#0e2a2c');
    expect(footer.className).toContain('footer');
    document.documentElement.style.setProperty('--footer-bg', FOOTER_BACKGROUND);
    expect(document.documentElement.style.getPropertyValue('--footer-bg')).toBe(FOOTER_BACKGROUND);
    expect(footer.style.getPropertyValue('--footer-bg')).toBe(FOOTER_BACKGROUND);

    const button = container.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.className).toContain('text-white');
    expect(button.className).toContain('hover:text-white');
    expect(button.style.transition).toBe('color 0.25s ease');

    const divider = Array.from(container.querySelectorAll('div.border-t')).find((element) =>
      element.className.includes('border-white/25')
    );
    expect(divider).toBeTruthy();

    const icon = container.querySelector('img.h-28');
    expect(icon).not.toBeNull();
    expect(icon.style.filter).toBe('sepia(0.2) saturate(1.1) brightness(0.98)');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
