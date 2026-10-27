import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import Simple3DViewer from './Simple3DViewer';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const renderWithRoot = (ui: React.ReactNode) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { container, root };
};

describe('Simple3DViewer', () => {
  it('uses the ignatius preset only for sueter-ignatius', () => {
    const { container, root } = renderWithRoot(
      <Simple3DViewer src="/models/ignatius.glb" productId="sueter-ignatius" />
    );

    const viewer = container.querySelector('[data-model-src="/models/ignatius.glb"]');

    expect(viewer).not.toBeNull();
    expect(viewer?.getAttribute('data-viewer-preset')).toBe('ignatius');

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('keeps default preset for Americana Umbra', () => {
    const { container, root } = renderWithRoot(
      <Simple3DViewer src="/models/umbra.glb" productId="americana-umbra" />
    );

    const viewer = container.querySelector('[data-model-src="/models/umbra.glb"]');

    expect(viewer).not.toBeNull();
    expect(viewer?.getAttribute('data-viewer-preset')).toBe('default');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
