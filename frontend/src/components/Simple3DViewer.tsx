import { useEffect, useRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

interface Simple3DViewerProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  className?: string;
  style?: CSSProperties;
}

const VIEWER_HEIGHT_PX = 600;
const CAMERA_FOV = 45;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_POSITION = { x: 0, y: 1, z: 3 };
const AMBIENT_LIGHT_INTENSITY = 0.7;
const DIRECTIONAL_LIGHT_INTENSITY = 0.8;
const DIRECTIONAL_LIGHT_POSITION = { x: 2, y: 4, z: 3 };

const Simple3DViewer = ({
  src,
  className = '',
  style,
  ...rest
}: Simple3DViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    if (typeof window === 'undefined' || !window.WebGLRenderingContext) {
      return undefined;
    }

    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, CAMERA_NEAR, CAMERA_FAR);
    camera.position.set(CAMERA_POSITION.x, CAMERA_POSITION.y, CAMERA_POSITION.z);

    let renderer: THREE.WebGLRenderer | undefined;
    let controls: OrbitControls | undefined;
    let isMounted = true;

    const render = () => {
      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    const init = async () => {
      try {
        const [loaderModule, controlsModule] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader'),
          import('three/examples/jsm/controls/OrbitControls'),
        ]);
        const { GLTFLoader } = loaderModule;
        const { OrbitControls } = controlsModule;

        if (!isMounted) {
          return;
        }

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio || 1);
        renderer.setSize(width, height);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        container.appendChild(renderer.domElement);

        controls = new OrbitControls(camera, renderer.domElement);
        // Keep damping disabled to avoid additional animation loops.
        controls.enableDamping = false;
        controls.enablePan = false;

        const ambientLight = new THREE.AmbientLight(0xffffff, AMBIENT_LIGHT_INTENSITY);
        const directionalLight = new THREE.DirectionalLight(0xffffff, DIRECTIONAL_LIGHT_INTENSITY);
        directionalLight.position.set(
          DIRECTIONAL_LIGHT_POSITION.x,
          DIRECTIONAL_LIGHT_POSITION.y,
          DIRECTIONAL_LIGHT_POSITION.z
        );
        scene.add(ambientLight, directionalLight);

        const loader = new GLTFLoader();
        loader.load(
          src,
          (gltf) => {
            if (!isMounted) {
              return;
            }
            scene.add(gltf.scene);
            render();
          },
          undefined,
          (error) => {
            if (isMounted) {
              console.warn(
                'Simple3DViewer failed to load model from',
                src,
                'Check the URL, network access, and GLB format.',
                error
              );
              render();
            }
          }
        );

        controls.addEventListener('change', render);
        render();
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.warn(
          'Simple3DViewer failed to initialize for',
          src,
          'Check WebGL support and module loading.',
          error
        );
      }
    };

    init();

    return () => {
      isMounted = false;
      if (controls) {
        controls.removeEventListener('change', render);
        controls.dispose();
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={className}
      data-model-src={src}
      style={{
        width: '100%',
        height: `${VIEWER_HEIGHT_PX}px`,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      {...rest}
    />
  );
};

export default Simple3DViewer;
