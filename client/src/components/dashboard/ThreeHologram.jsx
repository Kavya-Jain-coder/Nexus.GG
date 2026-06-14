import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const GAME_THEMES = {
  valorant: {
    primary: 0x00f0ff, // Cyan
    secondary: 0xff4655, // Red
    particleSpeed: 0.8,
  },
  cs2: {
    primary: 0xde9b35, // Gold
    secondary: 0xff4500, // Fire Orange
    particleSpeed: 1.2,
  },
  lol: {
    primary: 0xc8aa6e, // Gold
    secondary: 0x005a82, // Magic Blue
    particleSpeed: 0.5,
  },
  fortnite: {
    primary: 0x00f0ff, // Cyan
    secondary: 0xa855f7, // Violet
    particleSpeed: 1.5,
  },
  pubg: {
    primary: 0xf25c05, // Orange
    secondary: 0xeab308, // Yellow
    particleSpeed: 0.9,
  },
  default: {
    primary: 0x9b5de5, // Purple
    secondary: 0x00f0ff, // Cyan
    particleSpeed: 0.7,
  }
};

export default function ThreeHologram({ activeGame }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  
  // Track target colors for smooth lerping
  const colorsRef = useRef({
    currentPrimary: new THREE.Color(GAME_THEMES.default.primary),
    targetPrimary: new THREE.Color(GAME_THEMES.default.primary),
    currentSecondary: new THREE.Color(GAME_THEMES.default.secondary),
    targetSecondary: new THREE.Color(GAME_THEMES.default.secondary),
    particleSpeed: GAME_THEMES.default.particleSpeed,
    targetParticleSpeed: GAME_THEMES.default.particleSpeed,
  });

  // Track pointer positions for parallax
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Update target colors when active game changes
  useEffect(() => {
    const theme = GAME_THEMES[activeGame] || GAME_THEMES.default;
    colorsRef.current.targetPrimary.setHex(theme.primary);
    colorsRef.current.targetSecondary.setHex(theme.secondary);
    colorsRef.current.targetParticleSpeed = theme.particleSpeed;
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera & WebGL Renderer Setup ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030307, 0.08);

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // --- 2. Model Creation Function (Procedural Geometries) ---
    const models = {};
    const materialsList = []; // Track to update colors & opacity in loop

    const registerMaterial = (mat) => {
      materialsList.push(mat);
      return mat;
    };

    // Shared glowing materials helper
    const createGlowingMaterial = (isPrimary = true, wireframe = true) => {
      return registerMaterial(new THREE.MeshBasicMaterial({
        color: isPrimary ? colorsRef.current.currentPrimary : colorsRef.current.currentSecondary,
        wireframe: wireframe,
        transparent: true,
        opacity: 0.0, // starts hidden, fades in dynamically
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      }));
    };

    // VALORANT: Jett Dagger / Blade model
    const buildValorantModel = () => {
      const group = new THREE.Group();
      
      // Flat triangular blade
      const bladeGeom = new THREE.ConeGeometry(0.45, 1.8, 4);
      const bladeMat = createGlowingMaterial(true, true);
      const bladeMesh = new THREE.Mesh(bladeGeom, bladeMat);
      bladeMesh.scale.z = 0.15; // flatten
      bladeMesh.position.y = 0.7;
      group.add(bladeMesh);

      // Diamond hilt guard
      const guardGeom = new THREE.BoxGeometry(0.7, 0.1, 0.2);
      const guardMat = createGlowingMaterial(false, true);
      const guardMesh = new THREE.Mesh(guardGeom, guardMat);
      guardMesh.position.y = -0.15;
      group.add(guardMesh);

      // Handle grip
      const gripGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.7, 8);
      const gripMat = createGlowingMaterial(true, false);
      const gripMesh = new THREE.Mesh(gripGeom, gripMat);
      gripMesh.position.y = -0.5;
      group.add(gripMesh);

      // Pommel ring
      const ringGeom = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
      const ringMat = createGlowingMaterial(false, true);
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.y = -0.9;
      group.add(ringMesh);

      group.userData = { id: 'valorant' };
      scene.add(group);
      models.valorant = group;
    };

    // CS2: Tactical Reticle / Crosshair model
    const buildCs2Model = () => {
      const group = new THREE.Group();

      // Outer rings
      const ringGeom = new THREE.TorusGeometry(1.2, 0.05, 12, 64);
      const ringMat = createGlowingMaterial(true, true);
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      group.add(ringMesh);

      // Tactical tick marks (Vertical & Horizontal lines)
      const tickVGeom = new THREE.BoxGeometry(0.06, 0.6, 0.06);
      const tickHGeom = new THREE.BoxGeometry(0.6, 0.06, 0.06);
      const tickMat = createGlowingMaterial(false, true);
      
      const tickTop = new THREE.Mesh(tickVGeom, tickMat);
      tickTop.position.y = 0.8;
      group.add(tickTop);

      const tickBottom = new THREE.Mesh(tickVGeom, tickMat);
      tickBottom.position.y = -0.8;
      group.add(tickBottom);

      const tickLeft = new THREE.Mesh(tickHGeom, tickMat);
      tickLeft.position.x = -0.8;
      group.add(tickLeft);

      const tickRight = new THREE.Mesh(tickHGeom, tickMat);
      tickRight.position.x = 0.8;
      group.add(tickRight);

      // Central indicator dot
      const dotGeom = new THREE.OctahedronGeometry(0.18, 0);
      const dotMat = createGlowingMaterial(true, false);
      const dotMesh = new THREE.Mesh(dotGeom, dotMat);
      group.add(dotMesh);

      group.userData = { id: 'cs2' };
      scene.add(group);
      models.cs2 = group;
    };

    // LEAGUE OF LEGENDS: Magical Rune Crystal
    const buildLolModel = () => {
      const group = new THREE.Group();

      // Center magical floating octahedron crystal
      const crystalGeom = new THREE.OctahedronGeometry(0.85, 0);
      const crystalMat = createGlowingMaterial(true, true);
      const crystalMesh = new THREE.Mesh(crystalGeom, crystalMat);
      group.add(crystalMesh);

      // Inner solid core
      const innerGeom = new THREE.OctahedronGeometry(0.4, 0);
      const innerMat = createGlowingMaterial(false, false);
      const innerMesh = new THREE.Mesh(innerGeom, innerMat);
      group.add(innerMesh);

      // Surrounding Orbiting Magical Ring
      const runeRingGeom = new THREE.TorusGeometry(1.4, 0.06, 8, 32);
      const runeRingMat = createGlowingMaterial(true, true);
      const runeRingMesh = new THREE.Mesh(runeRingGeom, runeRingMat);
      runeRingMesh.rotation.x = Math.PI / 2.3;
      group.add(runeRingMesh);

      // Floating support crown
      const crownGeom = new THREE.TorusGeometry(0.6, 0.04, 6, 24);
      const crownMat = createGlowingMaterial(false, true);
      const crownMesh = new THREE.Mesh(crownGeom, crownMat);
      crownMesh.position.y = 0.55;
      crownMesh.rotation.x = Math.PI / 2;
      group.add(crownMesh);

      group.userData = { id: 'lol' };
      scene.add(group);
      models.lol = group;
    };

    // FORTNITE: Supply Drop Balloon / Crate
    const buildFortniteModel = () => {
      const group = new THREE.Group();

      // Voxel supply box
      const boxGeom = new THREE.BoxGeometry(0.75, 0.75, 0.75);
      const boxMat = createGlowingMaterial(true, true);
      const boxMesh = new THREE.Mesh(boxGeom, boxMat);
      boxMesh.position.y = -0.7;
      group.add(boxMesh);

      // Balloon Canopy (Semi-sphere)
      const balloonGeom = new THREE.SphereGeometry(0.7, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2);
      const balloonMat = createGlowingMaterial(false, true);
      const balloonMesh = new THREE.Mesh(balloonGeom, balloonMat);
      balloonMesh.position.y = 0.7;
      balloonMesh.rotation.x = Math.PI; // Flip downward
      group.add(balloonMesh);

      // Rigging cords connecting balloon to box
      const cordGeom = new THREE.CylinderGeometry(0.015, 0.45, 1.25, 6);
      const cordMat = createGlowingMaterial(true, false);
      const cordMesh = new THREE.Mesh(cordGeom, cordMat);
      cordMesh.position.y = 0.0;
      group.add(cordMesh);

      group.userData = { id: 'fortnite' };
      scene.add(group);
      models.fortnite = group;
    };

    // PUBG: Military Tactical Airdrop Box
    const buildPubgModel = () => {
      const group = new THREE.Group();

      // Base solid block representing standard cargo box
      const baseGeom = new THREE.BoxGeometry(1.2, 0.8, 1.2);
      const baseMat = createGlowingMaterial(true, true);
      const baseMesh = new THREE.Mesh(baseGeom, baseMat);
      group.add(baseMesh);

      // Tarp lid cover overlay
      const lidGeom = new THREE.BoxGeometry(1.3, 0.25, 1.3);
      const lidMat = createGlowingMaterial(false, false);
      const lidMesh = new THREE.Mesh(lidGeom, lidMat);
      lidMesh.position.y = 0.45;
      group.add(lidMesh);

      // Antennas / straps indicators
      const strapGeom = new THREE.BoxGeometry(0.08, 0.9, 1.25);
      const strapMat = createGlowingMaterial(true, false);
      const strapMesh = new THREE.Mesh(strapGeom, strapMat);
      group.add(strapMesh);

      group.userData = { id: 'pubg' };
      scene.add(group);
      models.pubg = group;
    };

    // DEFAULT: Rotating cybernetic wireframe core
    const buildDefaultModel = () => {
      const group = new THREE.Group();
      
      const coreGeom = new THREE.IcosahedronGeometry(1.4, 2);
      const coreMat = createGlowingMaterial(true, true);
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      group.add(coreMesh);

      const innerGeom = new THREE.OctahedronGeometry(0.7, 1);
      const innerMat = createGlowingMaterial(false, true);
      const innerMesh = new THREE.Mesh(innerGeom, innerMat);
      group.add(innerMesh);

      group.userData = { id: 'default' };
      scene.add(group);
      models.default = group;
    };

    // Build all model objects
    buildValorantModel();
    buildCs2Model();
    buildLolModel();
    buildFortniteModel();
    buildPubgModel();
    buildDefaultModel();

    // --- 3. Create Swirling Particle Storm (Swarm Background) ---
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalAngles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const heights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.5;
      
      radii[i] = radius;
      originalAngles[i] = angle;
      heights[i] = y;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture
    const createParticleTexture = () => {
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
    };

    const pTexture = createParticleTexture();
    const particleMaterial = registerMaterial(new THREE.PointsMaterial({
      color: colorsRef.current.currentPrimary,
      size: 0.08,
      map: pTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Orbit rings
    const rings = [];
    const createOrbitRing = (radius, isPrimary = true) => {
      const rGeom = new THREE.RingGeometry(radius, radius + 0.02, 64);
      const rMat = createGlowingMaterial(isPrimary, true);
      const rMesh = new THREE.Mesh(rGeom, rMat);
      rMesh.rotation.x = Math.random() * Math.PI;
      rMesh.rotation.y = Math.random() * Math.PI;
      scene.add(rMesh);
      rings.push(rMesh);
    };
    createOrbitRing(1.8, true);
    createOrbitRing(2.3, false);

    // --- 4. Interactivity (Mouse Parallax) ---
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.targetX = x * 1.2;
      pointerRef.current.targetY = y * 1.2;
    };
    container.addEventListener('mousemove', handleMouseMove);

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

    // --- 5. Animation loop with Opacity Transitions ---
    const clock = new THREE.Clock();
    let angleOffset = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp active colors
      colorsRef.current.currentPrimary.lerp(colorsRef.current.targetPrimary, 0.05);
      colorsRef.current.currentSecondary.lerp(colorsRef.current.targetSecondary, 0.05);

      // Lerp particle speeds
      colorsRef.current.particleSpeed += (colorsRef.current.targetParticleSpeed - colorsRef.current.particleSpeed) * 0.05;

      // Animate particle coordinates
      angleOffset += delta * 0.02 * colorsRef.current.particleSpeed;
      const posArr = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const speedFactor = 1.0 + (i % 3) * 0.2;
        const currentAngle = originalAngles[i] + angleOffset * speedFactor;
        posArr[i * 3] = Math.cos(currentAngle) * radii[i];
        posArr[i * 3 + 1] = heights[i] + Math.sin(time * 0.4 + radii[i]) * 0.12;
        posArr[i * 3 + 2] = Math.sin(currentAngle) * radii[i];
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Rotate models individually & manage fade-in/fade-out transitions
      Object.keys(models).forEach(key => {
        const model = models[key];
        const isSelected = activeGame === key || (key === 'default' && !models[activeGame]);
        
        // Target opacity for this model's materials
        const targetOpacity = isSelected ? 0.75 : 0.0;

        // Apply slow rotations
        model.rotation.y += 0.006;
        model.rotation.x = Math.sin(time * 0.5) * 0.15;

        // Apply floating vertical translation
        if (isSelected) {
          model.position.y = Math.sin(time * 1.5) * 0.15;
          // Core scaling pulsing
          const pulse = 1.0 + Math.sin(time * 2.5) * 0.04;
          model.scale.set(pulse, pulse, pulse);
        }

        // Lerp opacity on model child materials
        model.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.opacity += (targetOpacity - child.material.opacity) * 0.06;
            // Sync material color variables
            if (child.material.color) {
              const matchesPrimary = child.material.color.getHex() === colorsRef.current.currentPrimary.getHex() || child.material.color.getHex() === colorsRef.current.targetPrimary.getHex();
              child.material.color.copy(matchesPrimary ? colorsRef.current.currentPrimary : colorsRef.current.currentSecondary);
            }
          }
        });
      });

      // Animate background orbit rings
      rings.forEach((ring, idx) => {
        ring.rotation.x += 0.003 * (idx + 1);
        ring.rotation.y += 0.002 * (idx + 1);
        
        // Fade rings in as well
        ring.material.opacity += (0.25 - ring.material.opacity) * 0.05;
        ring.material.color.copy(idx === 0 ? colorsRef.current.currentPrimary : colorsRef.current.currentSecondary);
      });

      // Camera pointer ease parallax
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

      camera.position.x = pointerRef.current.x;
      camera.position.y = pointerRef.current.y;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleStateChange = (e) => {
      if (e.skipped) {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      } else {
        clock.getDelta(); // Reset clock delta
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    container.addEventListener('contentvisibilityautostatechange', handleStateChange);

    // Start loop
    requestRef.current = requestAnimationFrame(animate);

    // --- Cleanup ---
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('contentvisibilityautostatechange', handleStateChange);
      resizeObserver.disconnect();

      // Dispose all models
      Object.keys(models).forEach(key => {
        const model = models[key];
        scene.remove(model);
        model.traverse(child => {
          if (child.geometry) child.geometry.dispose();
          if (child.material) child.material.dispose();
        });
      });

      // Dispose particles
      scene.remove(particleSystem);
      particleGeometry.dispose();
      pTexture.dispose();

      // Dispose rings
      rings.forEach(ring => {
        scene.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
      });

      // Clean materials tracking array
      materialsList.forEach(mat => mat.dispose());

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
      {/* Decorative HUD terminal overlays */}
      <div className="absolute inset-4 border border-white/5 pointer-events-none rounded-xl">
        <div className="absolute top-2 left-3 font-mono text-[9px] text-white/40 uppercase tracking-widest">
          3D DIAG_NODE // {activeGame || 'SYSTEM'}
        </div>
        <div className="absolute bottom-2 right-3 font-mono text-[9px] text-white/40 uppercase tracking-widest">
          GRID_STABLE // 60FPS
        </div>
        
        {/* Radar grids decoration */}
        <div className="absolute top-3 right-3 w-6 h-6 border border-white/10 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
        </div>
        
        {/* Reticles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-white/5 rounded-full" />
      </div>
    </div>
  );
}
