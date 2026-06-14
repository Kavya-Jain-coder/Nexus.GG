import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const THEME_COLORS = {
  valorant: 0x00f0ff,
  cs2: 0xde9b35,
  lol: 0xc8aa6e,
  fortnite: 0xa855f7,
  pubg: 0xf25c05,
  default: 0x9b5de5
};

export default function DashboardBackground3D({ activeGame }) {
  const mountRef = useRef(null);
  const scrollRef = useRef(0);
  const colorTargetRef = useRef(new THREE.Color(THEME_COLORS.default));
  const currentColorRef = useRef(new THREE.Color(THEME_COLORS.default));

  // Sync color target on activeGame change
  useEffect(() => {
    const colorHex = THEME_COLORS[activeGame] || THEME_COLORS.default;
    colorTargetRef.current.setHex(colorHex);
  }, [activeGame]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030307, 0.012);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 250;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- 2. Create Constellation Grid Particles ---
    const particleCount = 220;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    // Distribute points in a wide spatial volume
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600;

      velocities.push({
        x: (Math.random() - 0.5) * 0.15,
        y: (Math.random() - 0.5) * 0.15,
        z: (Math.random() - 0.5) * 0.15
      });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      color: currentColorRef.current,
      size: 1.8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particlesGeometry, pMaterial);
    scene.add(particleSystem);

    // --- 3. Dynamic Lines Connecting Neighbors ---
    const lineMaterial = new THREE.LineBasicMaterial({
      color: currentColorRef.current,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    // We dynamically construct line segments for points that are close to each other
    let lineSegmentsGeometry = new THREE.BufferGeometry();
    let lineSystem = new THREE.LineSegments(lineSegmentsGeometry, lineMaterial);
    scene.add(lineSystem);

    // --- 4. Interactivity (Scroll & Mouse parallax) ---
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.12;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.12;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // --- 5. Animation loop ---
    let frameId;
    
    const animate = () => {
      // Lerp colors towards current active game theme color
      currentColorRef.current.lerp(colorTargetRef.current, 0.04);
      pMaterial.color.copy(currentColorRef.current);
      lineMaterial.color.copy(currentColorRef.current);

      // Smooth mouse parallax interpolation
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Camera Scroll Flight simulation (moves camera on Z, scrolls grid)
      // Z starts at 250, and camera flies forward as user scrolls
      const scrollZ = scrollRef.current * 0.25;
      camera.position.x = mouseX;
      camera.position.y = -mouseY;
      camera.position.z = 250 - scrollZ;

      // Wrap camera z when flying too far, or keep it proportional
      // Also apply a camera rotation to make the scrolling dynamic
      camera.rotation.z = scrollRef.current * 0.0003;

      // Animate points positions slightly
      const positionsArr = particlesGeometry.attributes.position.array;
      const linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        // Apply velocity
        positionsArr[i * 3] += velocities[i].x;
        positionsArr[i * 3 + 1] += velocities[i].y;
        positionsArr[i * 3 + 2] += velocities[i].z;

        // Boundary wrapping
        if (Math.abs(positionsArr[i * 3]) > 400) velocities[i].x *= -1;
        if (Math.abs(positionsArr[i * 3 + 1]) > 300) velocities[i].y *= -1;
        if (Math.abs(positionsArr[i * 3 + 2]) > 300) velocities[i].z *= -1;
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Draw lines between close neighbors (proximity check)
      for (let i = 0; i < particleCount; i++) {
        const xi = positionsArr[i * 3];
        const yi = positionsArr[i * 3 + 1];
        const zi = positionsArr[i * 3 + 2];

        for (let j = i + 1; j < Math.min(i + 30, particleCount); j++) {
          const xj = positionsArr[j * 3];
          const yj = positionsArr[j * 3 + 1];
          const zj = positionsArr[j * 3 + 2];

          const dx = xi - xj;
          const dy = yi - yj;
          const dz = zi - zj;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 100) {
            linePositions.push(xi, yi, zi);
            linePositions.push(xj, yj, zj);
          }
        }
      }

      // Re-create lines geometry for this frame
      scene.remove(lineSystem);
      lineSegmentsGeometry.dispose();
      
      lineSegmentsGeometry = new THREE.BufferGeometry();
      lineSegmentsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      
      lineSystem = new THREE.LineSegments(lineSegmentsGeometry, lineMaterial);
      scene.add(lineSystem);

      // Render
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      scene.remove(particleSystem);
      particlesGeometry.dispose();
      pMaterial.dispose();

      scene.remove(lineSystem);
      lineSegmentsGeometry.dispose();
      lineMaterial.dispose();
      
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: -5,
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto none auto 100vh',
      }}
    />
  );
}
