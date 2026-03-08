import { useEffect, useRef } from 'react';
import * as THREE from 'three';
const Simple3DViewer = ({
  src,
  className = '',
  style,
  ...rest
}) => {
  const containerRef = useRef(null);

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
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1, 3);

    let renderer;
    let controls;
    let isMounted = true;

    const render = () => {
      if (renderer) {
        renderer.render(scene, camera);
      }
    };

    const init = async () => {
      try {
        const [{ GLTFLoader }, { OrbitControls }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader'),
          import('three/examples/jsm/controls/OrbitControls'),
        ]);

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
        controls.enableDamping = false;
        controls.enablePan = false;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(2, 4, 3);
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
          () => {
            if (isMounted) {
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
      style={{
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
      {...rest}
    />
  );
};

export default Simple3DViewer;
