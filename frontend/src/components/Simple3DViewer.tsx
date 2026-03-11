import { useEffect, useRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

interface Simple3DViewerProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  productId?: string;
  className?: string;
  style?: CSSProperties;
}

const VIEWER_HEIGHT_PX = 600;
const VIEWER_FALLBACK_ASPECT = 4 / 5;
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const IDLE_ROTATION_SPEED = 0.13;
const HOVER_SCALE_MULTIPLIER = 1.02;
const HOVER_TILT_STRENGTH = 0.06;
const DAMPING_FACTOR = 7;
const ENVIRONMENT_BLUR = 0.04;

const PRODUCT_VIEWER_PRESETS = {
  default: {
    baseScale: 1,
    cameraYOffset: 0.1,
    cameraDistanceMultiplier: 2.1,
    modelYOffsetMultiplier: 0,
  },
  ignatius: {
    baseScale: 1.18,
    cameraYOffset: 0.16,
    cameraDistanceMultiplier: 1.72,
    modelYOffsetMultiplier: 0.03,
  },
} as const;

const getViewerPresetKey = (productId?: string) => {
  if (productId === 'sueter-ignatius') {
    return 'ignatius';
  }

  return 'default';
};

const Simple3DViewer = ({
  src,
  productId,
  className = '',
  style,
  ...rest
}: Simple3DViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pointerInsideRef = useRef(false);
  const targetTiltRef = useRef({ x: 0, z: 0 });
  const currentTiltRef = useRef({ x: 0, z: 0 });
  const currentScaleRef = useRef(1);
  const cursorStateRef = useRef<'auto' | 'grab' | 'grabbing'>('auto');
  const presetKey = getViewerPresetKey(productId);
  const viewerPreset = PRODUCT_VIEWER_PRESETS[presetKey];

  // Recreate the scene only when the model source changes to keep the viewer stable.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      return undefined;
    }

    const cachedWidth = container.clientWidth;
    const cachedHeight = container.clientHeight;
    const rect = (!cachedWidth || !cachedHeight) ? container.getBoundingClientRect() : null;
    const height = cachedHeight || rect?.height || VIEWER_HEIGHT_PX;
    const width = cachedWidth || rect?.width || height * VIEWER_FALLBACK_ASPECT;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(0, 1, 3);

    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let isMounted = true;
    const hoverGroup = new THREE.Group();
    const idleRotationGroup = new THREE.Group();
    const clock = new THREE.Clock();
    let frameId: number | undefined;
    let environmentMap: THREE.Texture | undefined;
    let model: THREE.Object3D | undefined;

    idleRotationGroup.add(hoverGroup);
    scene.add(idleRotationGroup);

    const updateCursor = () => {
      const nextCursor: 'auto' | 'grab' | 'grabbing' = isDraggingRef.current
        ? 'grabbing'
        : (pointerInsideRef.current ? 'grab' : 'auto');
      if (cursorStateRef.current !== nextCursor) {
        cursorStateRef.current = nextCursor;
        container.style.cursor = nextCursor;
      }
    };

    const init = async () => {
      try {
        const [loaderModule, controlsModule, environmentModule] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader'),
          import('three/examples/jsm/controls/OrbitControls'),
          import('three/examples/jsm/environments/RoomEnvironment'),
        ]);
        const { GLTFLoader } = loaderModule;
        const { OrbitControls } = controlsModule;
        const { RoomEnvironment } = environmentModule;

        if (!isMounted) {
          return;
        }

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        if (!isMounted) {
          renderer.dispose();
          return;
        }
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        renderer.domElement.style.touchAction = 'pan-y';
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        if (!isMounted) {
          controls.dispose();
          renderer.dispose();
          return;
        }
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.rotateSpeed = 0.9;
        controls.maxPolarAngle = Math.PI * 0.7;
        controls.minPolarAngle = Math.PI * 0.33;

        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        environmentMap = pmremGenerator.fromScene(new RoomEnvironment(), ENVIRONMENT_BLUR).texture;
        scene.environment = environmentMap;
        pmremGenerator.dispose();

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
        const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.12);
        keyLight.position.set(2.6, 3.6, 2.2);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.set(1024, 1024);
        keyLight.shadow.radius = 5;
        const fillLight = new THREE.DirectionalLight(0xe7efff, 0.45);
        fillLight.position.set(-2, 1.8, 2.1);
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.35);
        rimLight.position.set(0, 2.8, -2.4);
        scene.add(ambientLight, keyLight, fillLight, rimLight);

        const loader = new GLTFLoader();
        // Progress callback is optional; we pass a no-op for clarity.
        const noOpProgressCallback = () => {};
        loader.load(
          src,
          (gltf) => {
            if (!isMounted) {
              return;
            }
            model = gltf.scene;
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  const materialList = Array.isArray(child.material) ? child.material : [child.material];
                  materialList.forEach((material) => {
                    if ('envMapIntensity' in material) {
                      material.envMapIntensity = 1.05;
                    }
                  });
                }
              }
            });

            const bounds = new THREE.Box3().setFromObject(model);
            const center = bounds.getCenter(new THREE.Vector3());
            const size = bounds.getSize(new THREE.Vector3());
            const baseScale = viewerPreset.baseScale;

            model.position.sub(center);
            model.position.y += size.y * viewerPreset.modelYOffsetMultiplier;
            model.scale.setScalar(baseScale);

            hoverGroup.add(model);

            const scaledBounds = new THREE.Box3().setFromObject(model);
            const sphere = scaledBounds.getBoundingSphere(new THREE.Sphere());
            const radius = Math.max(sphere.radius, 1);
            const cameraDistance = radius * viewerPreset.cameraDistanceMultiplier;
            camera.position.set(0, radius * viewerPreset.cameraYOffset, cameraDistance);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();

            const shadowPlane = new THREE.Mesh(
              new THREE.PlaneGeometry(radius * 3, radius * 3),
              new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.12 })
            );
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.y = -radius * 0.9;
            shadowPlane.receiveShadow = true;
            scene.add(shadowPlane);

            currentScaleRef.current = baseScale;
          },
          noOpProgressCallback,
          (error) => {
            if (isMounted) {
              console.warn(
                `Simple3DViewer failed to load model from ${src}. ` +
                  'Check the URL, network access, and glTF/GLB format.',
                error
              );
              render();
            }
          }
        );

        const animate = () => {
          if (!isMounted || !renderer) {
            return;
          }

          const delta = Math.min(clock.getDelta(), 0.05);
          const damping = Math.min(DAMPING_FACTOR * delta, 1);
          const targetScale = viewerPreset.baseScale * (isHoveringRef.current ? HOVER_SCALE_MULTIPLIER : 1);
          currentTiltRef.current.x += (targetTiltRef.current.x - currentTiltRef.current.x) * damping;
          currentTiltRef.current.z += (targetTiltRef.current.z - currentTiltRef.current.z) * damping;
          currentScaleRef.current += (targetScale - currentScaleRef.current) * damping;

          if (model) {
            hoverGroup.rotation.x = currentTiltRef.current.x;
            hoverGroup.rotation.z = currentTiltRef.current.z;
            hoverGroup.scale.setScalar(currentScaleRef.current);
          }

          if (!isDraggingRef.current) {
            idleRotationGroup.rotation.y += IDLE_ROTATION_SPEED * delta;
          }

          controls?.update();
          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.warn(
          `Simple3DViewer failed to initialize for ${src}. ` +
            'Check WebGL support and module loading.',
          error
        );
      }
    };

    const handlePointerEnter = () => {
      pointerInsideRef.current = true;
      isHoveringRef.current = true;
      updateCursor();
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerInsideRef.current = true;
      const target = event.currentTarget as HTMLDivElement;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      targetTiltRef.current = {
        x: -normalizedY * HOVER_TILT_STRENGTH,
        z: normalizedX * HOVER_TILT_STRENGTH,
      };
    };

    const handlePointerDown = () => {
      isDraggingRef.current = true;
      isHoveringRef.current = true;
      updateCursor();
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      updateCursor();
    };

    const handlePointerLeave = () => {
      pointerInsideRef.current = false;
      isHoveringRef.current = false;
      isDraggingRef.current = false;
      targetTiltRef.current = { x: 0, z: 0 };
      updateCursor();
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointerup', handlePointerUp);
    container.addEventListener('pointercancel', handlePointerUp);
    container.addEventListener('pointerleave', handlePointerLeave);

    init();

    return () => {
      isMounted = false;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
      controls?.dispose();
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointerup', handlePointerUp);
      container.removeEventListener('pointercancel', handlePointerUp);
      container.removeEventListener('pointerleave', handlePointerLeave);
      container.style.cursor = 'auto';
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      environmentMap?.dispose();
    };
  }, [src, viewerPreset]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-model-src={src}
      data-viewer-preset={presetKey}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: 'none',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      {...rest}
    />
  );
};

export default Simple3DViewer;
