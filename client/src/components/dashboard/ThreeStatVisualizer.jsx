import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ACCENT_COLORS = {
  valorant: 0x00f0ff,
  cs2: 0xde9b35,
  lol: 0xc8aa6e,
  fortnite: 0xa855f7,
  pubg: 0xf25c05,
  default: 0x9b5de5
};

export default function ThreeStatVisualizer({ type, value = 0.5, activeGame }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const colorTargetRef = useRef(new THREE.Color(ACCENT_COLORS.default));
  const currentColorRef = useRef(new THREE.Color(ACCENT_COLORS.default));
  
  // Sync activeGame colors
  useEffect(() => {
    const colorHex = ACCENT_COLORS[activeGame] || ACCENT_COLORS.default;
    colorTargetRef.current.setHex(colorHex);
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || 100;
    const height = container.clientHeight || 100;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- 2. Add mode-specific mesh elements ---
    let progressMesh = null;
    let tipMesh = null;
    let crystalMesh = null;
    let crystalWireframe = null;
    let particleSystem = null;

    if (type === 'progress-ring') {
      // Background full ring (dark track)
      const trackGeom = new THREE.TorusGeometry(1.4, 0.12, 16, 100);
      const trackMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04
      });
      const trackMesh = new THREE.Mesh(trackGeom, trackMat);
      scene.add(trackMesh);

      // Foreground visual progress ring
      // We clip the arc length based on value (0 to 1)
      const arcLength = Math.PI * 2 * Math.max(0.01, Math.min(value, 1.0));
      const progressGeom = new THREE.TorusGeometry(1.4, 0.13, 16, 100, arcLength);
      const progressMat = new THREE.MeshBasicMaterial({
        color: currentColorRef.current,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending
      });
      progressMesh = new THREE.Mesh(progressGeom, progressMat);
      // Align progress starting point at 12 o'clock (default starts at 3 o'clock)
      progressMesh.rotation.z = Math.PI / 2;
      progressMesh.rotation.y = Math.PI; // Flip to run clockwise
      scene.add(progressMesh);

      // Pulsing glowing orb at the end of progress arc
      const tipGeom = new THREE.SphereGeometry(0.18, 16, 16);
      const tipMat = new THREE.MeshBasicMaterial({
        color: currentColorRef.current,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      tipMesh = new THREE.Mesh(tipGeom, tipMat);
      // Position the orb at the tip using trigonometry
      const angle = arcLength;
      // Flip coordinate since we flipped Y-axis rotation
      tipMesh.position.x = Math.cos(angle) * 1.4;
      tipMesh.position.y = Math.sin(angle) * 1.4;
      
      // Group them inside the flipped space of the ring
      progressMesh.add(tipMesh);

    } else if (type === 'floating-crystal') {
      // Holographic Octahedron Crystal representing XP core
      const crystalGeom = new THREE.OctahedronGeometry(1.1, 0);
      
      // Face material
      const crystalMat = new THREE.MeshBasicMaterial({
        color: currentColorRef.current,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
      });
      crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
      scene.add(crystalMesh);

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: currentColorRef.current,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      crystalWireframe = new THREE.Mesh(crystalGeom, wireMat);
      crystalMesh.add(crystalWireframe);

      // Orbiting particle points
      const particleCount = 20;
      const particleGeom = new THREE.BufferGeometry();
      const pPositions = new Float32Array(particleCount * 3);
      const pAngles = [];
      const pSpeeds = [];

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        pAngles.push(angle);
        pSpeeds.push(0.01 + Math.random() * 0.015);
        pPositions[i * 3] = Math.cos(angle) * 1.8;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
        pPositions[i * 3 + 2] = Math.sin(angle) * 1.8;
      }
      particleGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));

      const pMaterial = new THREE.PointsMaterial({
        color: currentColorRef.current,
        size: 0.12,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      particleSystem = new THREE.Points(particleGeom, pMaterial);
      scene.add(particleSystem);
      
      // Keep trackers inside mesh variables
      crystalMesh.userData = { pAngles, pSpeeds, particleGeom };
    }

    // --- 3. Resize handling ---
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

    // --- 4. Animation loop ---
    const clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Lerp active colors
      currentColorRef.current.lerp(colorTargetRef.current, 0.05);

      if (type === 'progress-ring') {
        // Pulse the tip sphere size and opacity
        const scaleVal = 1.0 + Math.sin(time * 6) * 0.2;
        tipMesh.scale.set(scaleVal, scaleVal, scaleVal);
        // Tilt the ring canvas coordinates slightly for dynamic look
        progressMesh.rotation.x = Math.sin(time * 1.5) * 0.15;
        progressMesh.rotation.y = Math.PI + Math.cos(time * 1.5) * 0.15;

      } else if (type === 'floating-crystal') {
        // Rotate crystal core
        crystalMesh.rotation.y += 0.012;
        crystalMesh.rotation.x += 0.007;

        // Floating hover movement (sine wave translation)
        crystalMesh.position.y = Math.sin(time * 2.0) * 0.12;

        // Pulse scale
        const pulse = 1.0 + Math.sin(time * 3) * 0.05;
        crystalMesh.scale.set(pulse, pulse, pulse);

        // Orbit particles around crystal
        const userData = crystalMesh.userData;
        const posArr = userData.particleGeom.attributes.position.array;
        for (let i = 0; i < 20; i++) {
          userData.pAngles[i] += userData.pSpeeds[i];
          const radius = 1.6 + Math.sin(time + i) * 0.15;
          posArr[i * 3] = Math.cos(userData.pAngles[i]) * radius;
          posArr[i * 3 + 2] = Math.sin(userData.pAngles[i]) * radius;
        }
        userData.particleGeom.attributes.position.needsUpdate = true;
        particleSystem.rotation.y -= 0.005;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    // --- 5. Cleanup ---
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();

      // Resource garbage collection
      if (type === 'progress-ring') {
        scene.remove(progressMesh);
        progressMesh.geometry.dispose();
        progressMesh.material.dispose();
        tipMesh.geometry.dispose();
        tipMesh.material.dispose();
      } else if (type === 'floating-crystal') {
        scene.remove(crystalMesh);
        crystalMesh.geometry.dispose();
        crystalMesh.material.dispose();
        crystalWireframe.geometry.dispose();
        crystalWireframe.material.dispose();
        scene.remove(particleSystem);
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
      }

      renderer.dispose();
    };
  }, [type, value]); // Re-init geometry only if type or progress value change

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center min-h-[96px]">
      <canvas ref={canvasRef} className="block outline-none" />
    </div>
  );
}
