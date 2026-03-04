import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ModelViewer from './ModelViewer';

jest.mock('@google/model-viewer', () => ({}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const renderWithRoot = (ui) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });
  return { container, root };
};

describe('ModelViewer', () => {
  it('renders a model-viewer element with expected attributes', () => {
    const { container, root } = renderWithRoot(
      <ModelViewer
        src="/models/ignatius.glb"
        alt="Ignatius 3D"
        poster="/thumbnails/ignatius.jpg"
        className="model-viewer"
      />
    );

    const viewer = container.querySelector('model-viewer');
    expect(viewer).not.toBeNull();
    expect(viewer.getAttribute('src')).toBe('/models/ignatius.glb');
    expect(viewer.getAttribute('alt')).toBe('Ignatius 3D');
    expect(viewer.getAttribute('poster')).toBe('/thumbnails/ignatius.jpg');
    expect(viewer.getAttribute('loading')).toBe('eager');
    expect(viewer.getAttribute('reveal')).toBe('auto');
    expect(viewer.getAttribute('touch-action')).toBe('pan-y');
    expect(viewer.classList.contains('model-viewer')).toBe(true);
    expect(viewer.hasAttribute('camera-controls')).toBe(true);
    expect(viewer.hasAttribute('auto-rotate')).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
