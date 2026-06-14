import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const COACH_THEMES = {
  valorant: { color: 0xff4655, speed: 1.5, complexity: 1.5 },
  cs2: { color: 0xde9b35, speed: 1.2, complexity: 1.0 },
  lol: { color: 0xc8aa6e, speed: 0.8, complexity: 1.8 },
  fortnite: { color: 0x00f0ff, speed: 2.0, complexity: 2.0 },
  pubg: { color: 0xf25c05, speed: 1.0, complexity: 0.8 },
  default: { color: 0x9b5de5, speed: 1.0, complexity: 1.2 }
};

export default function ThreeNeuralCore({ activeGame }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const themeRef = useRef(COACH_THEMES.default);
  const currentThemeColor = useRef(new THREE.Color(COACH_THEMES.default.color));

  useEffect(() => {
    const config = COACH_THEMES[activeGame] || COACH_THEMES.default;
    themeRef.current = config;
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080810, 0.15);

    const width = container.clientWidth || 250;
    const height = container.clientHeight || 250;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Neural Sphere Core (Displaceable Sphere) ---
    const geom = new THREE.SphereGeometry(1.0, 32, 32);
    // Keep a copy of original positions for displacement mapping
    const originalPositions = geom.attributes.position.clone();

    const mat = new THREE.MeshBasicMaterial({
      color: currentThemeColor.current,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(geom, mat);
    scene.add(coreMesh);

    // Inner Solid Core
    const innerGeom = new THREE.OctahedronGeometry(0.4, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: currentThemeColor.current,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending
    });
    const innerMesh = new THREE.Mesh(innerGeom, innerMat);
    scene.add(innerMesh);

    // Outer Orbit Ring
    const ringGeom = new THREE.TorusGeometry(1.4, 0.03, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: currentThemeColor.current,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    scene.add(ringMesh);

    // --- 3. Neural Synapses (Energy Particles Swarm) ---
    const particleCount = 120;
    const particleGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const speeds = [];
    const phases = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const distance = 1.0 + Math.random() * 0.5;

      pPositions[i * 3] = Math.sin(phi) * Math.cos(theta) * distance;
      pPositions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * distance;
      pPositions[i * 3 + 2] = Math.cos(phi) * distance;

      speeds.push(0.5 + Math.random() * 1.5);
      phases.push(Math.random() * Math.PI * 2);
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pTexture = (() => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(pCanvas);
    })();

    const pMaterial = new THREE.PointsMaterial({
      color: currentThemeColor.current,
      size: 0.08,
      map: pTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const synapseSystem = new THREE.Points(particleGeom, pMaterial);
    scene.add(synapseSystem);

    // --- 4. Resize handling ---
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
      const time = clock.getElapsedTime();
      const theme = themeRef.current;

      // Color lerping
      const targetCol = new THREE.Color(theme.color);
      currentThemeColor.current.lerp(targetCol, 0.05);

      mat.color.copy(currentThemeColor.current);
      innerMat.color.copy(currentThemeColor.current);
      ringMat.color.copy(currentThemeColor.current);
      pMaterial.color.copy(currentThemeColor.current);

      // Rotate elements
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.002;
      innerMesh.rotation.y -= 0.01;
      innerMesh.rotation.z += 0.006;
      ringMesh.rotation.z += 0.008;

      // Pulse inner core
      const pulseScale = 1.0 + Math.sin(time * 3 * theme.speed) * 0.08;
      innerMesh.scale.set(pulseScale, pulseScale, pulseScale);

      // 3D Procedural Displacement of Sphere Vertices (Liquid wireframe effect)
      const positions = geom.attributes.position.array;
      const orig = originalPositions.array;
      const waveSpeed = time * 2.5 * theme.speed;
      const complexity = theme.complexity;

      for (let i = 0; i < positions.length; i += 3) {
        const x = orig[i];
        const y = orig[i + 1];
        const z = orig[i + 2];

        // Compute noise-like displacement using sinusoidal patterns
        const wave = Math.sin(x * complexity + waveSpeed) * 
                     Math.cos(y * complexity + waveSpeed) * 
                     Math.sin(z * complexity + waveSpeed) * 0.18;

        // Apply displacement along normal vector (since it's a sphere, normal is normalized position)
        const len = Math.sqrt(x*x + y*y + z*z);
        const nx = x / len;
        const ny = y / len;
        const nz = z / len;

        positions[i] = x + nx * wave;
        positions[i + 1] = y + ny * wave;
        positions[i + 2] = z + nz * wave;
      }
      geom.attributes.position.needsUpdate = true;

      // Animate synapses (orbit and radial breathing)
      const pPosArr = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const theta = (i / particleCount) * Math.PI * 2 + time * 0.1 * speeds[i];
        const phi = (i % 8) * (Math.PI / 4) + Math.cos(time * 0.5 + phases[i]) * 0.1;
        // Radial breathe pulsing
        const radialBreathe = 1.1 + Math.sin(time * 2 + phases[i]) * 0.15;

        pPosArr[i * 3] = Math.sin(phi) * Math.cos(theta) * radialBreathe;
        pPosArr[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radialBreathe;
        pPosArr[i * 3 + 2] = Math.cos(phi) * radialBreathe;
      }
      particleGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
      
      scene.remove(coreMesh);
      geom.dispose();
      mat.dispose();

      scene.remove(innerMesh);
      innerGeom.dispose();
      innerMat.dispose();

      scene.remove(ringMesh);
      ringGeom.dispose();
      ringMat.dispose();

      scene.remove(synapseSystem);
      particleGeom.dispose();
      pMaterial.dispose();
      pTexture.dispose();

      originalPositions.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center min-h-[200px]">
      <canvas ref={canvasRef} className="block outline-none" />
      
      {/* HUD Scanner Sweeps overlay */}
      <div className="absolute inset-2 border border-white/5 pointer-events-none rounded-xl">
        <div className="absolute top-1 left-2 font-mono text-[8px] text-white/35 uppercase">
          AI_LOGIC_GRID // COGNITIVE
        </div>
        <div className="absolute bottom-1 right-2 font-mono text-[8px] text-white/35">
          CORE_TEMP: 38.4C
        </div>
        <div className="absolute top-1/2 left-1 text-white/10 font-mono text-[8px] tracking-tighter rotate-90 select-none">
          SYNC_GATE_ACTIVE
        </div>
      </div>
    </div>
  );
}
