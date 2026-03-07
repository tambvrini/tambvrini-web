import { useCallback, useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

const INTERACTION_ZONE_RATIO = 0.6;
const AUTO_ROTATE_SPEED = 0.5;
const AUTO_ROTATE_IDLE_MS = 5500;

const ModelViewer = ({ src, alt, poster, className = '', ...rest }) => {
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const controlsEnabledRef = useRef(false);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const autoRotateEnabledRef = useRef(true);
  const autoRotateTimerRef = useRef(null);

  const setControlsState = useCallback((enabled) => {
    if (controlsEnabledRef.current === enabled) {
      return;
    }

    controlsEnabledRef.current = enabled;
    setControlsEnabled(enabled);
  }, []);

  const setAutoRotateState = useCallback((enabled) => {
    if (autoRotateEnabledRef.current === enabled) {
      return;
    }

    autoRotateEnabledRef.current = enabled;
    setAutoRotateEnabled(enabled);
  }, []);

  const clearAutoRotateTimer = useCallback(() => {
    if (autoRotateTimerRef.current) {
      window.clearTimeout(autoRotateTimerRef.current);
      autoRotateTimerRef.current = null;
    }
  }, []);

  const scheduleAutoRotateResume = useCallback(() => {
    clearAutoRotateTimer();
    autoRotateTimerRef.current = window.setTimeout(() => {
      setAutoRotateState(true);
    }, AUTO_ROTATE_IDLE_MS);
  }, [clearAutoRotateTimer, setAutoRotateState]);

  const pauseAutoRotate = useCallback(() => {
    setAutoRotateState(false);
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume, setAutoRotateState]);

  const isInsideInteractionZone = useCallback((event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return false;
    }

    const zoneWidth = rect.width * INTERACTION_ZONE_RATIO;
    const zoneHeight = rect.height * INTERACTION_ZONE_RATIO;
    const zoneLeft = (rect.width - zoneWidth) / 2;
    const zoneTop = (rect.height - zoneHeight) / 2;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return x >= zoneLeft && x <= zoneLeft + zoneWidth && y >= zoneTop && y <= zoneTop + zoneHeight;
  }, []);

  const handlePointerMove = useCallback(
    (event) => {
      setControlsState(isInsideInteractionZone(event));
      if (event.buttons) {
        pauseAutoRotate();
      }
    },
    [isInsideInteractionZone, pauseAutoRotate, setControlsState]
  );

  const handlePointerEnter = useCallback(
    (event) => {
      setControlsState(isInsideInteractionZone(event));
    },
    [isInsideInteractionZone, setControlsState]
  );

  const handlePointerDown = useCallback(
    (event) => {
      setControlsState(isInsideInteractionZone(event));
      pauseAutoRotate();
    },
    [isInsideInteractionZone, pauseAutoRotate, setControlsState]
  );

  const handlePointerUp = useCallback(() => {
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume]);

  const handlePointerLeave = useCallback(() => {
    setControlsState(false);
    scheduleAutoRotateResume();
  }, [scheduleAutoRotateResume, setControlsState]);

  const handleWheel = useCallback((event) => {
    event.stopPropagation();
  }, []);

  useEffect(() => () => clearAutoRotateTimer(), [clearAutoRotateTimer]);

  return (
    <model-viewer
      src={src}
      alt={alt}
      poster={poster}
      loading="eager"
      reveal="auto"
      auto-rotate={autoRotateEnabled || undefined}
      auto-rotate-speed={AUTO_ROTATE_SPEED}
      touch-action="pan-y"
      shadow-intensity="0.6"
      disable-zoom
      camera-controls={controlsEnabled || undefined}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onWheel={handleWheel}
      {...rest}
    />
  );
};

export default ModelViewer;
