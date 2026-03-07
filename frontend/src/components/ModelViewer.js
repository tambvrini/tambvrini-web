import { useCallback, useEffect, useRef, useState } from 'react';
import '@google/model-viewer';

const INTERACTION_ZONE_RATIO = 0.6;
const AUTO_ROTATE_SPEED = 0.5;
const AUTO_ROTATE_IDLE_MS = 5500;
const WINDOW_ORBIT_THETA_RANGE = 12;
const WINDOW_ORBIT_PHI_RANGE = 6;
const WINDOW_ORBIT_MIN_PHI = 10;
const WINDOW_ORBIT_MAX_PHI = 85;
const DEFAULT_ORBIT = { theta: 0, phi: 75, radius: '2.5m' };

const requestAnimationFrameSafe = (callback) => {
  if (typeof window === 'undefined' || !window.requestAnimationFrame) {
    return null;
  }

  return window.requestAnimationFrame(callback);
};

const cancelAnimationFrameSafe = (frameId) => {
  if (
    typeof window === 'undefined' ||
    frameId === null ||
    frameId === undefined ||
    !window.cancelAnimationFrame
  ) {
    return;
  }

  window.cancelAnimationFrame(frameId);
};

const parseOrbitValue = (orbit) => {
  if (!orbit) {
    return null;
  }

  if (typeof orbit === 'string') {
    const parts = orbit.trim().split(/\s+/);
    if (parts.length < 3) {
      return null;
    }

    return {
      theta: parseFloat(parts[0]),
      phi: parseFloat(parts[1]),
      radius: parts[2],
    };
  }

  if (
    typeof orbit === 'object' &&
    orbit.theta !== undefined &&
    orbit.theta !== null &&
    orbit.phi !== undefined &&
    orbit.phi !== null
  ) {
    const orbitRadius = orbit.radius ?? DEFAULT_ORBIT.radius;
    return {
      theta: orbit.theta,
      phi: orbit.phi,
      radius: typeof orbitRadius === 'number' ? `${orbitRadius}m` : orbitRadius,
    };
  }

  return null;
};

const ModelViewer = ({
  src,
  alt,
  poster,
  className = '',
  interactionScope = 'local',
  ...rest
}) => {
  const isWindowInteraction = interactionScope === 'window';
  const [controlsEnabled, setControlsEnabled] = useState(isWindowInteraction);
  const controlsEnabledRef = useRef(isWindowInteraction);
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true);
  const autoRotateEnabledRef = useRef(true);
  const autoRotateTimerRef = useRef(null);
  const modelViewerRef = useRef(null);
  const baseOrbitRef = useRef(DEFAULT_ORBIT);
  const orbitFrameRef = useRef(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });

  const setControlsState = useCallback((enabled) => {
    const nextState = isWindowInteraction ? true : enabled;
    if (controlsEnabledRef.current === nextState) {
      return;
    }

    controlsEnabledRef.current = nextState;
    setControlsEnabled(nextState);
  }, [isWindowInteraction]);

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
    if (isWindowInteraction) {
      return;
    }
    setAutoRotateState(false);
    scheduleAutoRotateResume();
  }, [isWindowInteraction, scheduleAutoRotateResume, setAutoRotateState]);

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
      if (!isWindowInteraction) {
        setControlsState(isInsideInteractionZone(event));
      }
      if (event.buttons) {
        pauseAutoRotate();
      }
    },
    [isInsideInteractionZone, isWindowInteraction, pauseAutoRotate, setControlsState]
  );

  const handlePointerEnter = useCallback(
    (event) => {
      if (!isWindowInteraction) {
        setControlsState(isInsideInteractionZone(event));
      }
    },
    [isInsideInteractionZone, isWindowInteraction, setControlsState]
  );

  const handlePointerDown = useCallback(
    (event) => {
      if (!isWindowInteraction) {
        setControlsState(isInsideInteractionZone(event));
      } else if (event.currentTarget?.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      pauseAutoRotate();
    },
    [isInsideInteractionZone, isWindowInteraction, pauseAutoRotate, setControlsState]
  );

  const handlePointerUp = useCallback((event) => {
    if (
      isWindowInteraction &&
      event.currentTarget?.releasePointerCapture &&
      event.pointerId !== undefined &&
      event.pointerId !== null
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    scheduleAutoRotateResume();
  }, [isWindowInteraction, scheduleAutoRotateResume]);

  const handlePointerLeave = useCallback(() => {
    if (!isWindowInteraction) {
      setControlsState(false);
      scheduleAutoRotateResume();
    }
  }, [isWindowInteraction, scheduleAutoRotateResume, setControlsState]);

  const handleWheel = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const scheduleOrbitUpdate = useCallback(() => {
    if (!modelViewerRef.current || orbitFrameRef.current) {
      return;
    }

    const frameId = requestAnimationFrameSafe(() => {
      orbitFrameRef.current = null;
      if (!modelViewerRef.current) {
        return;
      }

      const { innerWidth, innerHeight } = window;
      if (!innerWidth || !innerHeight) {
        return;
      }

      const { x, y } = pointerPositionRef.current;
      const normalizedX = (x / innerWidth) * 2 - 1;
      const normalizedY = (y / innerHeight) * 2 - 1;
      const baseOrbit = baseOrbitRef.current;
      const theta = baseOrbit.theta + normalizedX * WINDOW_ORBIT_THETA_RANGE;
      const phi = Math.min(
        WINDOW_ORBIT_MAX_PHI,
        Math.max(WINDOW_ORBIT_MIN_PHI, baseOrbit.phi - normalizedY * WINDOW_ORBIT_PHI_RANGE)
      );
      const nextOrbit = `${theta}deg ${phi}deg ${baseOrbit.radius}`;

      if (modelViewerRef.current.cameraOrbit !== nextOrbit) {
        modelViewerRef.current.cameraOrbit = nextOrbit;
      }
    });
    if (frameId !== null && frameId !== undefined) {
      orbitFrameRef.current = frameId;
    }
  }, []);

  useEffect(() => {
    if (!isWindowInteraction) {
      return undefined;
    }

    const modelViewer = modelViewerRef.current;
    if (!modelViewer) {
      return undefined;
    }

    setControlsState(true);
    setAutoRotateState(true);
    clearAutoRotateTimer();

    const updateBaseOrbit = () => {
      const orbitValue = modelViewer.cameraOrbit || modelViewer.getAttribute('camera-orbit');
      const parsedOrbit = parseOrbitValue(orbitValue) ?? DEFAULT_ORBIT;
      baseOrbitRef.current = parsedOrbit;
    };

    updateBaseOrbit();
    modelViewer.addEventListener('load', updateBaseOrbit);

    const handleWindowPointerMove = (event) => {
      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
      scheduleOrbitUpdate();
    };

    const handleScroll = () => {
      scheduleOrbitUpdate();
    };

    window.addEventListener('pointermove', handleWindowPointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      modelViewer.removeEventListener('load', updateBaseOrbit);
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [clearAutoRotateTimer, isWindowInteraction, scheduleOrbitUpdate, setAutoRotateState, setControlsState]);

  useEffect(() => {
    if (isWindowInteraction || !modelViewerRef.current) {
      return undefined;
    }

    setControlsState(false);
    return undefined;
  }, [isWindowInteraction, setControlsState]);

  useEffect(() => () => clearAutoRotateTimer(), [clearAutoRotateTimer]);
  useEffect(() => () => {
    cancelAnimationFrameSafe(orbitFrameRef.current);
    orbitFrameRef.current = null;
  }, []);

  return (
    <model-viewer
      ref={modelViewerRef}
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
