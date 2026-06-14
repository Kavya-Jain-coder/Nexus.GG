import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playSynthSound } from '../../lib/sound';

const ARENA_COLORS = {
  valorant: 0xff4655,
  cs2: 0xde9b35,
  lol: 0xc8aa6e,
  fortnite: 0x00f0ff,
  pubg: 0xf25c05,
  default: 0x9b5de5
};

export default function ThreeIdentityCore({ activeGame }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const themeColorRef = useRef(new THREE.Color(ARENA_COLORS.default));

  useEffect(() => {
    const colorHex = ARENA_COLORS[activeGame] || ARENA_COLORS.default;
    themeColorRef.current.setHex(colorHex);
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080810, 0.12);

    const width = container.clientWidth || 200;
    const height = container.clientHeight || 200;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // --- 2. Build Gyroscopic Neon Rings ---
    const createRing = (radius, thickness, rotationAxes) => {
      const geom = new THREE.TorusGeometry(radius, thickness, 8, 48);
      const mat = new THREE.MeshBasicMaterial({
        color: themeColorRef.current,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Assign custom axes speed
      mesh.userData = { rotationAxes, geom, mat };
      coreGroup.add(mesh);
      return mesh;
    };

    const ring1 = createRing(1.2, 0.03, { x: 0.015, y: 0.005, z: 0 });
    const ring2 = createRing(0.95, 0.025, { x: 0, y: 0.018, z: 0.008 });
    const ring3 = createRing(0.7, 0.02, { x: 0.008, y: 0, z: 0.025 });

    // Inner Glowing Core Star (Dodecahedron)
    const coreGeom = new THREE.DodecahedronGeometry(0.35, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: themeColorRef.current,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreGroup.add(coreMesh);

    // Inner Core Solid Shield
    const solidGeom = new THREE.DodecahedronGeometry(0.18, 0);
    const solidMat = new THREE.MeshBasicMaterial({
      color: themeColorRef.current,
      transparent: true,
      opacity: 0.2
    });
    const solidMesh = new THREE.Mesh(solidGeom, solidMat);
    coreGroup.add(solidMesh);

    // Orbiting particle array
    const particleCount = 40;
    const particleGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(particleCount * 3);
    const pAngles = [];
    const pSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      pAngles.push(angle);
      pSpeeds.push(0.008 + Math.random() * 0.012);
      
      const r = 1.35;
      pPositions[i * 3] = Math.cos(angle) * r;
      pPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pPositions[i * 3 + 2] = Math.sin(angle) * r;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

    const pMaterial = new THREE.PointsMaterial({
      color: themeColorRef.current,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeom, pMaterial);
    scene.add(particleSystem);

    // --- 3. Click and Drag Interactions ---
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      playSynthSound('click');
    };

    const handleMouseMove = (e) => {
      if (isDragging.current) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.current.x,
          y: e.clientY - previousMousePosition.current.y
        };

        coreGroup.rotation.y += deltaMove.x * 0.008;
        coreGroup.rotation.x += deltaMove.y * 0.008;

        previousMousePosition.current = {
          x: e.clientX,
          y: e.clientY
        };
      } else {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerRef.current.targetX = x * 0.4;
        pointerRef.current.targetY = y * 0.4;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 4. Animation Loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Lerp colors
      ring1.userData.mat.color.copy(themeColorRef.current);
      ring2.userData.mat.color.copy(themeColorRef.current);
      ring3.userData.mat.color.copy(themeColorRef.current);
      coreMat.color.copy(themeColorRef.current);
      solidMat.color.copy(themeColorRef.current);
      pMaterial.color.copy(themeColorRef.current);

      // Rotate gyroscopic rings on their axes
      coreGroup.children.forEach(child => {
        if (child.userData && child.userData.rotationAxes) {
          const axes = child.userData.rotationAxes;
          child.rotation.x += axes.x;
          child.rotation.y += axes.y;
          child.rotation.z += axes.z;
        }
      });

      // Central core breathing scale & rotation
      coreMesh.rotation.y += 0.012;
      coreMesh.rotation.x -= 0.008;
      const pulse = 1.0 + Math.sin(time * 2.5) * 0.06;
      coreMesh.scale.set(pulse, pulse, pulse);
      solidMesh.scale.set(pulse, pulse, pulse);

      // Orbit particles around assembly
      const posArr = particleGeom.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pAngles[i] += pSpeeds[i];
        const r = 1.35 + Math.sin(time * 1.5 + i) * 0.08;
        posArr[i * 3] = Math.cos(pAngles[i]) * r;
        posArr[i * 3 + 2] = Math.sin(pAngles[i]) * r;
        posArr[i * 3 + 1] = Math.sin(time * 0.8 + pAngles[i]) * 0.15;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Inertial hover camera position
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;
      camera.position.x = pointerRef.current.x;
      camera.position.y = pointerRef.current.y;
      camera.lookAt(0, 0, 0);

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

      // Dispose items
      coreGroup.children.forEach(child => {
        if (child.userData && child.userData.geom) {
          child.userData.geom.dispose();
          child.userData.mat.dispose();
        }
      });
      scene.remove(coreGroup);

      coreGeom.dispose();
      coreMat.dispose();
      solidGeom.dispose();
      solidMat.dispose();

      scene.remove(particleSystem);
      particleGeom.dispose();
      pMaterial.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center min-h-[220px]">
      <canvas ref={canvasRef} className="block outline-none cursor-grab active:cursor-grabbing" />
      {/* Decorative hud brackets overlay */}
      <div className="absolute inset-4 border border-white/5 rounded-full pointer-events-none select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] border border-dashed border-white/10 rounded-full" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[var(--game-accent)] rounded-full animate-pulse" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[var(--game-accent)] rounded-full animate-pulse" />
      </div>
    </div>
  );
}
