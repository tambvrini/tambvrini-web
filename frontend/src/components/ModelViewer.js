import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@google/model-viewer';

const INTERACTION_ZONE_RATIO = 0.6;
const AUTO_ROTATE_SPEED = 0.5;
const AUTO_ROTATE_IDLE_MS = 5500;

const ModelViewer = ({
  src,
  alt,
  poster,
  className = '',
  persistentInteraction = false,
  ...rest
}) => {
  const viewerRef = useRef(null);
  const pointerCaptureIdRef = useRef(null);
  const pointerCaptureTargetRef = useRef(null);
  const [controlsEnabled, setControlsEnabled] = useState(persistentInteraction);
  const controlsEnabledRef = useRef(persistentInteraction);
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

  const updateControlsFromEvent = useCallback(
    (event) => {
      // Pause auto-rotate on drag so manual interaction stays responsive.
      if (event.buttons) {
        pauseAutoRotate();
      }

      if (persistentInteraction) {
        setControlsState(true);
      } else {
        setControlsState(isInsideInteractionZone(event));
      }
    },
    [isInsideInteractionZone, pauseAutoRotate, persistentInteraction, setControlsState]
  );

  const handlePointerEnter = useCallback(
    (event) => {
      updateControlsFromEvent(event);
    },
    [updateControlsFromEvent]
  );

  const handlePointerDown = useCallback(
    (event) => {
      updateControlsFromEvent(event);
      pauseAutoRotate();
      if (persistentInteraction && typeof event.pointerId === 'number') {
        const target = event.currentTarget;
        if (target?.setPointerCapture) {
          target.setPointerCapture(event.pointerId);
          pointerCaptureIdRef.current = event.pointerId;
          pointerCaptureTargetRef.current = target;
        }
      }
    },
    [pauseAutoRotate, persistentInteraction, updateControlsFromEvent]
  );

  const releasePointerCapture = useCallback(() => {
    if (!persistentInteraction) {
      return;
    }

    const pointerId = pointerCaptureIdRef.current;
    const target = pointerCaptureTargetRef.current;
    if ((pointerId === null || pointerId === undefined) || !target?.releasePointerCapture) {
      pointerCaptureIdRef.current = null;
      pointerCaptureTargetRef.current = null;
      return;
    }

    const hasPointerCapture = target.hasPointerCapture?.(pointerId) ?? false;
    if (hasPointerCapture) {
      target.releasePointerCapture(pointerId);
    }

    pointerCaptureIdRef.current = null;
    pointerCaptureTargetRef.current = null;
  }, [persistentInteraction]);

  const handlePointerUp = useCallback(() => {
    releasePointerCapture();
    scheduleAutoRotateResume();
  }, [releasePointerCapture, scheduleAutoRotateResume]);

  const handlePointerLeave = useCallback(() => {
    releasePointerCapture();
    if (!persistentInteraction) {
      setControlsState(false);
    }
    scheduleAutoRotateResume();
  }, [persistentInteraction, releasePointerCapture, scheduleAutoRotateResume, setControlsState]);

  const handleWheel = useCallback((event) => {
    // Allow scroll propagation in persistent mode to keep page scrolling responsive.
    if (!persistentInteraction) {
      event.stopPropagation();
    }
  }, [persistentInteraction]);

  const pointerEventsStyle = useMemo(
    () => (persistentInteraction ? { pointerEvents: 'auto' } : undefined),
    [persistentInteraction]
  );

  useEffect(() => {
    setControlsState(persistentInteraction);
  }, [persistentInteraction, setControlsState]);

  useEffect(() => () => clearAutoRotateTimer(), [clearAutoRotateTimer]);

  return (
    <model-viewer
      ref={viewerRef}
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
      style={pointerEventsStyle}
      onPointerEnter={handlePointerEnter}
      onPointerMove={updateControlsFromEvent}
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
