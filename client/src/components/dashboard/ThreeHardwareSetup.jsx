import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const THEME_COLORS = {
  valorant: { primary: 0x00f0ff, secondary: 0xff4655 },
  cs2: { primary: 0xde9b35, secondary: 0xff4500 },
  lol: { primary: 0xc8aa6e, secondary: 0x005a82 },
  fortnite: { primary: 0x00f0ff, secondary: 0xa855f7 },
  pubg: { primary: 0xf25c05, secondary: 0xeab308 },
  default: { primary: 0x9b5de5, secondary: 0x00f0ff }
};

export default function ThreeHardwareSetup({ activeGame, isFullscreen = false, autoRotate = true }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const activeGameRef = useRef(activeGame);
  const autoRotateRef = useRef(autoRotate);
  
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  const themeColorsRef = useRef({
    primary: new THREE.Color(THEME_COLORS.default.primary),
    secondary: new THREE.Color(THEME_COLORS.default.secondary),
    targetPrimary: new THREE.Color(THEME_COLORS.default.primary),
    targetSecondary: new THREE.Color(THEME_COLORS.default.secondary)
  });

  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  // Update theme colors when game profile changes
  useEffect(() => {
    activeGameRef.current = activeGame;
    const theme = THEME_COLORS[activeGame] || THEME_COLORS.default;
    themeColorsRef.current.targetPrimary.setHex(theme.primary);
    themeColorsRef.current.targetSecondary.setHex(theme.secondary);
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera, WebGL Renderer Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060c, 0.15);

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, isFullscreen ? 3.5 : 3); // Positioned directly in front

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // --- 2. Environment & Lights ---
    // Minimal lights because we are using a glowing model
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(themeColorsRef.current.primary, 5.0, 10);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    const rimLight = new THREE.DirectionalLight(themeColorsRef.current.secondary, 2.0);
    rimLight.position.set(-2, 2, -2);
    scene.add(rimLight);

    // --- 3. Model Loading (DamagedHelmet) ---
    const setupGroup = new THREE.Group();
    scene.add(setupGroup);

    const materialsTracker = [];
    const loader = new GLTFLoader();
    
    loader.load('/models/DamagedHelmet.glb', (gltf) => {
      const model = gltf.scene;
      
      // Center and scale the helmet
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Scale to fit the container nicely
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = isFullscreen ? 2.5 : 2.0;
      const scale = targetScale / maxDim;
      model.scale.setScalar(scale);
      
      model.position.sub(center.multiplyScalar(scale));
      
      // Look slightly to the right to show depth
      model.rotation.y = Math.PI * -0.15;
      
      // Enhance materials to react to theme colors
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissiveIntensity = 2.0; // Boost glow
          materialsTracker.push(child.material);
        }
      });
      
      setupGroup.add(model);
    }, undefined, (error) => {
      console.error('Error loading 3D model:', error);
    });

    // Background particles
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPositions[i * 3] = (Math.random() - 0.5) * 6;
      pPositions[i * 3 + 1] = Math.random() * 2;
      pPositions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: themeColorsRef.current.primary,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, pMat);
    scene.add(particleSystem);

    // --- 4. Interactivity ---
    const handleMouseDown = (e) => {
      if (!isFullscreen) return;
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (isFullscreen && isDragging.current) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.current.x,
          y: e.clientY - previousMousePosition.current.y
        };
        manualRotation.current.y += deltaMove.x * 0.008;
        manualRotation.current.x += deltaMove.y * 0.008;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      } else {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerRef.current.targetX = x * 0.5;
        pointerRef.current.targetY = y * 0.4;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 5. Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp colors smoothly
      themeColorsRef.current.primary.lerp(themeColorsRef.current.targetPrimary, 0.05);
      themeColorsRef.current.secondary.lerp(themeColorsRef.current.targetSecondary, 0.05);

      // Apply colors to lights and particles
      pointLight.color.copy(themeColorsRef.current.primary);
      rimLight.color.copy(themeColorsRef.current.secondary);
      pMat.color.copy(themeColorsRef.current.primary);

      // Rotate / Float the model
      if (isFullscreen) {
        if (autoRotateRef.current) {
          manualRotation.current.y += delta * 0.15;
        }
        setupGroup.rotation.y = manualRotation.current.y;
        setupGroup.rotation.x = manualRotation.current.x;
        setupGroup.position.y = Math.sin(time * 1.5) * 0.03;
      } else {
        setupGroup.rotation.y = Math.sin(time * 0.5) * 0.15 + pointerRef.current.x * 0.4;
        setupGroup.rotation.x = Math.sin(time * 0.3) * 0.1 + pointerRef.current.y * 0.2;
        setupGroup.position.y = Math.sin(time * 1.5) * 0.05;
      }

      // Camera pointer ease parallax when not drag-rotating
      if (!isDragging.current) {
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

        camera.position.x = pointerRef.current.x * 0.5;
        camera.position.y = pointerRef.current.y * 0.5;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      resizeObserver.disconnect();

      particleGeo.dispose();
      pMat.dispose();

      renderer.dispose();
    };
  }, [isFullscreen]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[160px] relative">
      <canvas ref={canvasRef} className="block w-full h-full outline-none" />
    </div>
  );
}
