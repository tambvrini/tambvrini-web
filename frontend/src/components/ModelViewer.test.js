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
    expect(viewer.getAttribute('auto-rotate-speed')).toBe('0.5');
    expect(viewer.classList.contains('model-viewer')).toBe(true);
    expect(viewer.hasAttribute('disable-zoom')).toBe(true);
    expect(viewer.hasAttribute('camera-controls')).toBe(false);
    expect(viewer.hasAttribute('auto-rotate')).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('keeps camera controls enabled for window interaction', () => {
    const { container, root } = renderWithRoot(
      <ModelViewer
        src="/models/ignatius.glb"
        alt="Ignatius 3D"
        poster="/thumbnails/ignatius.jpg"
        interactionScope="window"
      />
    );

    const viewer = container.querySelector('model-viewer');
    expect(viewer).not.toBeNull();
    expect(viewer.hasAttribute('camera-controls')).toBe(true);
    expect(viewer.hasAttribute('auto-rotate')).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('pauses auto-rotation on interaction and resumes after idle', () => {
    jest.useFakeTimers();
    const { container, root } = renderWithRoot(
      <ModelViewer
        src="/models/ignatius.glb"
        alt="Ignatius 3D"
        poster="/thumbnails/ignatius.jpg"
      />
    );

    const viewer = container.querySelector('model-viewer');
    viewer.getBoundingClientRect = () => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
    });

    act(() => {
      viewer.dispatchEvent(new MouseEvent('pointerdown', { clientX: 50, clientY: 50, bubbles: true }));
    });

    expect(viewer.hasAttribute('auto-rotate')).toBe(false);

    act(() => {
      jest.advanceTimersByTime(5500);
    });

    expect(viewer.hasAttribute('auto-rotate')).toBe(true);

    act(() => {
      root.unmount();
    });
    container.remove();
    jest.useRealTimers();
  });
});
