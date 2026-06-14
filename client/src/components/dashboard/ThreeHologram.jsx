import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GAME_THEMES = {
  valorant: {
    primary: 0x00f0ff, // Cyan
    secondary: 0x0f1923, // Dark Valorant
    accent: 0xff4655, // Red slash
    particleSpeed: 0.8,
  },
  cs2: {
    primary: 0xde9b35, // Gold
    secondary: 0x11141a, // Slate
    accent: 0xff4500, // Fire Orange
    particleSpeed: 1.2,
  },
  lol: {
    primary: 0xc8aa6e, // Gold
    secondary: 0x091428, // Deep Blue
    accent: 0xc8aa6e,
    particleSpeed: 0.5,
  },
  fortnite: {
    primary: 0x00f0ff, // Cyan
    secondary: 0x120626, // Purple
    accent: 0xa855f7, // Violet
    particleSpeed: 1.5,
  },
  pubg: {
    primary: 0xf25c05, // Orange
    secondary: 0x161311, // Rust
    accent: 0xeab308, // Yellow
    particleSpeed: 0.9,
  },
  default: {
    primary: 0x9b5de5, // Purple
    secondary: 0x080810, // Dark
    accent: 0x00f0ff, // Cyan
    particleSpeed: 0.7,
  }
};

export default function ThreeHologram({ activeGame }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  // Keep track of target colors for smooth lerping
  const colorsRef = useRef({
    currentPrimary: new THREE.Color(GAME_THEMES.default.primary),
    targetPrimary: new THREE.Color(GAME_THEMES.default.primary),
    currentAccent: new THREE.Color(GAME_THEMES.default.accent),
    targetAccent: new THREE.Color(GAME_THEMES.default.accent),
    particleSpeed: GAME_THEMES.default.particleSpeed,
    targetParticleSpeed: GAME_THEMES.default.particleSpeed,
  });

  // Track pointer positions for parallax
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Update target colors when active game changes
  useEffect(() => {
    const theme = GAME_THEMES[activeGame] || GAME_THEMES.default;
    colorsRef.current.targetPrimary.setHex(theme.primary);
    colorsRef.current.targetAccent.setHex(theme.accent);
    colorsRef.current.targetParticleSpeed = theme.particleSpeed;
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera & Renderer Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030307, 0.09);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // --- 2. Create Holographic Core Objects ---
    
    // Core Mesh: 3D wireframe Icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(1.6, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: colorsRef.current.currentPrimary,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreMesh);

    // Dynamic inner core: smaller, denser wireframe
    const innerGeometry = new THREE.OctahedronGeometry(0.8, 1);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: colorsRef.current.currentAccent,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // --- 3. Create Orbiting Rings ---
    const ringGroups = [];
    const createRing = (radius, color, rotationAxis, speed) => {
      const ringGeom = new THREE.RingGeometry(radius, radius + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending
      });
      const mesh = new THREE.Mesh(ringGeom, ringMat);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      scene.add(mesh);
      ringGroups.push({ mesh, rotationAxis, speed });
    };

    createRing(2.1, colorsRef.current.currentPrimary, new THREE.Vector3(0.5, 1, 0).normalize(), 0.015);
    createRing(2.5, colorsRef.current.currentAccent, new THREE.Vector3(-0.5, 0.5, 1).normalize(), -0.01);
    createRing(2.8, colorsRef.current.currentPrimary, new THREE.Vector3(1, 0, -0.5).normalize(), 0.007);

    // --- 4. Create Swirling Particle Storm ---
    const particleCount = 1400;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalAngles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const heights = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 4.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.0;
      
      radii[i] = radius;
      originalAngles[i] = angle;
      heights[i] = y;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
      
      sizes[i] = 1.0 + Math.random() * 3.0;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // High quality soft circle texture using canvas
    const createParticleTexture = () => {
      const pCanvas = document.createElement('canvas');
      pCanvas.width = 16;
      pCanvas.height = 16;
      const ctx = pCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
      return new THREE.CanvasTexture(pCanvas);
    };

    const particleTexture = createParticleTexture();
    const particleMaterial = new THREE.PointsMaterial({
      color: colorsRef.current.currentPrimary,
      size: 0.08,
      map: particleTexture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // --- 5. Mouse Interaction for Parallax ---
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.targetX = x * 1.5;
      pointerRef.current.targetY = y * 1.5;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // --- 6. Resize Observer ---
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

    // --- 7. Animation Loop with Dynamic Color Lerping ---
    let angleOffset = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp colors towards targets
      colorsRef.current.currentPrimary.lerp(colorsRef.current.targetPrimary, 0.05);
      colorsRef.current.currentAccent.lerp(colorsRef.current.targetAccent, 0.05);
      
      // Update materials directly
      coreMaterial.color.copy(colorsRef.current.currentPrimary);
      innerMaterial.color.copy(colorsRef.current.currentAccent);
      particleMaterial.color.copy(colorsRef.current.currentPrimary);
      ringGroups.forEach((ring, idx) => {
        ring.mesh.material.color.copy(idx === 1 ? colorsRef.current.currentAccent : colorsRef.current.currentPrimary);
      });

      // Lerp particle speed
      colorsRef.current.particleSpeed += (colorsRef.current.targetParticleSpeed - colorsRef.current.particleSpeed) * 0.05;

      // Animate core
      coreMesh.rotation.y += 0.005;
      coreMesh.rotation.x += 0.003;
      
      innerMesh.rotation.y -= 0.01;
      innerMesh.rotation.z += 0.005;

      // Pulse scaling
      const scale = 1.0 + Math.sin(time * 2) * 0.06;
      innerMesh.scale.set(scale, scale, scale);
      
      const coreScale = 1.0 + Math.cos(time * 1.5) * 0.03;
      coreMesh.scale.set(coreScale, coreScale, coreScale);

      // Animate rings
      ringGroups.forEach(ring => {
        ring.mesh.rotateOnAxis(ring.rotationAxis, ring.speed);
      });

      // Animate Particles in a swirling vortex
      angleOffset += delta * 0.02 * colorsRef.current.particleSpeed;
      const posArr = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Rotational wave
        const speedFactor = 1.0 + (i % 3) * 0.2;
        const currentAngle = originalAngles[i] + angleOffset * speedFactor;
        
        // Swirling drift
        posArr[i * 3] = Math.cos(currentAngle) * radii[i];
        posArr[i * 3 + 1] = heights[i] + Math.sin(time * 0.5 + radii[i]) * 0.2;
        posArr[i * 3 + 2] = Math.sin(currentAngle) * radii[i];
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Lerp camera pointer coordinates (smooth ease-out parallax)
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

      camera.position.x = pointerRef.current.x;
      camera.position.y = pointerRef.current.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    // --- 8. content-visibility auto optimisation support ---
    // Pause rendering loop when skipped/offscreen to conserve resources
    const handleStateChange = (e) => {
      if (e.skipped) {
        if (requestRef.current) {
          cancelAnimationFrame(requestRef.current);
          requestRef.current = null;
        }
      } else {
        if (!requestRef.current) {
          clock.getDelta(); // reset clock delta to prevent jump
          requestRef.current = requestAnimationFrame(animate);
        }
      }
    };

    // Bind event directly to the container
    container.addEventListener('contentvisibilityautostatechange', handleStateChange);

    // Initial kickstart
    requestRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('contentvisibilityautostatechange', handleStateChange);
      resizeObserver.disconnect();
      
      // Memory cleanup
      scene.remove(coreMesh);
      coreGeometry.dispose();
      coreMaterial.dispose();
      
      scene.remove(innerMesh);
      innerGeometry.dispose();
      innerMaterial.dispose();

      ringGroups.forEach(ring => {
        scene.remove(ring.mesh);
        ring.mesh.geometry.dispose();
        ring.mesh.material.dispose();
      });

      scene.remove(particleSystem);
      particleGeometry.dispose();
      particleMaterial.dispose();
      particleTexture.dispose();

      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="three-hologram-container w-full h-full relative"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto none auto 400px',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full outline-none" />
      {/* HUD Telemetry Frame overlays inside canvas */}
      <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl">
        <div className="absolute top-2 left-3 font-mono text-[9px] text-white/40 uppercase tracking-widest">
          3D Core Telemetry Active // {activeGame || 'Nexus'}
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[9px] text-white/40 uppercase tracking-widest">
          FPS: 60 // SYNC_STABLE
        </div>
        
        {/* Crosshair decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-white/20" />
      </div>
    </div>
  );
}
