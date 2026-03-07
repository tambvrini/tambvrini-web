import { useCallback, useRef, useState } from 'react';
import '@google/model-viewer';

const INTERACTION_ZONE_RATIO = 0.6;

const ModelViewer = ({ src, alt, poster, className = '', ...rest }) => {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const controlsEnabledRef = useRef(false);

  const setControlsState = useCallback((enabled) => {
    if (controlsEnabledRef.current === enabled) {
      return;
    }

    controlsEnabledRef.current = enabled;
    setControlsEnabled(enabled);
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        setControlsState(false);
        return;
      }

      const zoneWidth = rect.width * INTERACTION_ZONE_RATIO;
      const zoneHeight = rect.height * INTERACTION_ZONE_RATIO;
      const zoneLeft = (rect.width - zoneWidth) / 2;
      const zoneTop = (rect.height - zoneHeight) / 2;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const isInsideZone =
        x >= zoneLeft && x <= zoneLeft + zoneWidth && y >= zoneTop && y <= zoneTop + zoneHeight;

      setControlsState(isInsideZone);
    },
    [setControlsState]
  );

  const handlePointerLeave = useCallback(() => {
    setControlsState(false);
  }, [setControlsState]);

  const handleWheel = useCallback((event) => {
    event.stopPropagation();
  }, []);

  return (
    <model-viewer
      src={src}
      alt={alt}
      poster={poster}
      loading="eager"
      reveal="auto"
      auto-rotate
      touch-action="pan-y"
      shadow-intensity="0.6"
      disable-zoom
      camera-controls={controlsEnabled ? true : undefined}
      className={className}
      onPointerEnter={handlePointerMove}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      {...rest}
    />
  );
};

export default ModelViewer;
