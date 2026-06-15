import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Import character skins
import valorantChar from '../../assets/characters/valorant-character.png';
import cs2Char from '../../assets/characters/cs2-character.png';
import lolChar from '../../assets/characters/lol-character.png';
import fortniteChar from '../../assets/characters/fortnite-character.png';
import pubgChar from '../../assets/characters/pubg-character.png';

// Import backgrounds for the card backs
import valorantBg from '../../assets/backgrounds/valorant-bg.jpg';
import cs2Bg from '../../assets/backgrounds/cs2-bg.jpg';
import lolBg from '../../assets/backgrounds/lol-bg.jpg';
import fortniteBg from '../../assets/backgrounds/fortnite-bg.jpg';
import pubgBg from '../../assets/backgrounds/pubg-bg.jpg';
import defaultBg from '../../assets/backgrounds/dashboard-bg.jpg';

const GAME_THEMES = {
  valorant: {
    primary: 0x00f0ff,
    secondary: 0xff4655,
    charTexture: valorantChar,
    bgTexture: valorantBg,
    particleSpeed: 0.8,
  },
  cs2: {
    primary: 0xde9b35,
    secondary: 0xff4500,
    charTexture: cs2Char,
    bgTexture: cs2Bg,
    particleSpeed: 1.2,
  },
  lol: {
    primary: 0xc8aa6e,
    secondary: 0x005a82,
    charTexture: lolChar,
    bgTexture: lolBg,
    particleSpeed: 0.5,
  },
  fortnite: {
    primary: 0x00f0ff,
    secondary: 0xa855f7,
    charTexture: fortniteChar,
    bgTexture: fortniteBg,
    particleSpeed: 1.5,
  },
  pubg: {
    primary: 0xf25c05,
    secondary: 0xeab308,
    charTexture: pubgChar,
    bgTexture: pubgBg,
    particleSpeed: 0.9,
  },
  default: {
    primary: 0x9b5de5,
    secondary: 0x00f0ff,
    charTexture: valorantChar,
    bgTexture: defaultBg,
    particleSpeed: 0.7,
  }
};

export default function ThreeHologram({ activeGame, isFullscreen = false, autoRotate = true }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const activeGameRef = useRef(activeGame);
  const autoRotateRef = useRef(autoRotate);
  
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  const colorsRef = useRef({
    currentPrimary: new THREE.Color(GAME_THEMES.default.primary),
    targetPrimary: new THREE.Color(GAME_THEMES.default.primary),
    currentSecondary: new THREE.Color(GAME_THEMES.default.secondary),
    targetSecondary: new THREE.Color(GAME_THEMES.default.secondary),
    particleSpeed: GAME_THEMES.default.particleSpeed,
    targetParticleSpeed: GAME_THEMES.default.particleSpeed,
  });

  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    activeGameRef.current = activeGame;
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
    const aspect = width / height;
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    const baseZ = isFullscreen ? 5.5 : 6.5;
    const targetZ = aspect < 1 ? Math.min(10, baseZ / (aspect * 1.3)) : baseZ;
    camera.position.z = targetZ;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // --- 2. Lighting Setup ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const primaryNeonLight = new THREE.PointLight(colorsRef.current.currentPrimary, 5.0, 10);
    primaryNeonLight.position.set(0, -2, 2);
    scene.add(primaryNeonLight);

    // --- 3. Holographic Card Setup ---
    const textureLoader = new THREE.TextureLoader();
    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    // Dimensions for the card
    const cardWidth = 2.5;
    const cardHeight = 3.8;
    const cardDepth = 0.1;

    // Geometry for the 3D card
    const cardGeometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);
    
    // We will apply different materials to the faces of the box
    // Index: 0: right, 1: left, 2: top, 3: bottom, 4: front, 5: back
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 }), // Right
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 }), // Left
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 }), // Top
      new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8, roughness: 0.2 }), // Bottom
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.4, transparent: true }), // Front
      new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.5, roughness: 0.5 })  // Back
    ];

    const cardMesh = new THREE.Mesh(cardGeometry, materials);
    cardGroup.add(cardMesh);

    // Add a glowing rim around the card
    const edgesGeometry = new THREE.EdgesGeometry(cardGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: colorsRef.current.currentPrimary, linewidth: 2 });
    const cardEdges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    cardGroup.add(cardEdges);

    // Load textures dynamically
    const loadedTextures = {};
    const loadTextures = (gameKey) => {
      if (loadedTextures[gameKey]) return loadedTextures[gameKey];
      const theme = GAME_THEMES[gameKey] || GAME_THEMES.default;
      
      const frontTex = textureLoader.load(theme.charTexture);
      frontTex.colorSpace = THREE.SRGBColorSpace;
      
      const backTex = textureLoader.load(theme.bgTexture);
      backTex.colorSpace = THREE.SRGBColorSpace;
      // Flip the back texture so it reads correctly from behind
      backTex.wrapS = THREE.RepeatWrapping;
      backTex.repeat.x = -1;

      loadedTextures[gameKey] = { front: frontTex, back: backTex };
      return loadedTextures[gameKey];
    };

    // Preload all
    Object.keys(GAME_THEMES).forEach(loadTextures);

    // --- 4. Swirling Particle Storm ---
    const particleCount = 700;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const originalAngles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const heights = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 3.0;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4.0;
      
      radii[i] = radius;
      originalAngles[i] = angle;
      heights[i] = y;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 16;
    pCanvas.height = 16;
    const ctx = pCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMaterial = new THREE.PointsMaterial({
      color: colorsRef.current.currentPrimary,
      size: 0.08,
      map: pTexture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Orbit rings
    const rings = [];
    const createOrbitRing = (radius) => {
      const rGeom = new THREE.RingGeometry(radius, radius + 0.015, 64);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const rMesh = new THREE.Mesh(rGeom, rMat);
      rMesh.rotation.x = Math.random() * Math.PI;
      rMesh.rotation.y = Math.random() * Math.PI;
      scene.add(rMesh);
      rings.push(rMesh);
    };
    createOrbitRing(2.2);
    createOrbitRing(2.8);

    // Floor projection
    const floorProjectorGeo = new THREE.RingGeometry(1.2, 1.4, 32);
    const floorProjectorMat = new THREE.MeshBasicMaterial({
      color: colorsRef.current.currentPrimary,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const floorProjector = new THREE.Mesh(floorProjectorGeo, floorProjectorMat);
    floorProjector.rotation.x = Math.PI / 2;
    floorProjector.position.y = -2.2;
    scene.add(floorProjector);

    // --- 5. Interactivity ---
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
        pointerRef.current.targetX = x * 0.8;
        pointerRef.current.targetY = y * 0.6;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchStart = (e) => {
      if (!isFullscreen) return;
      isDragging.current = true;
      const touch = e.touches[0];
      previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      if (!isFullscreen) return;
      if (isDragging.current) {
        if (e.cancelable) e.preventDefault(); // Prevent standard screen scroll
        const touch = e.touches[0];
        const deltaMove = {
          x: touch.clientX - previousMousePosition.current.x,
          y: touch.clientY - previousMousePosition.current.y
        };
        manualRotation.current.y += deltaMove.x * 0.008;
        manualRotation.current.x += deltaMove.y * 0.008;
        previousMousePosition.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

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

    // --- 6. Animation Loop ---
    const clock = new THREE.Clock();
    let angleOffset = 0;

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Lerp active theme colors
      colorsRef.current.currentPrimary.lerp(colorsRef.current.targetPrimary, 0.05);
      colorsRef.current.currentSecondary.lerp(colorsRef.current.targetSecondary, 0.05);
      colorsRef.current.particleSpeed += (colorsRef.current.targetParticleSpeed - colorsRef.current.particleSpeed) * 0.05;

      // Apply colors
      particleMaterial.color.copy(colorsRef.current.currentPrimary);
      floorProjectorMat.color.copy(colorsRef.current.currentPrimary);
      primaryNeonLight.color.copy(colorsRef.current.currentPrimary);
      edgesMaterial.color.copy(colorsRef.current.currentPrimary);

      // Update Card Textures based on active game
      const activeTextures = loadedTextures[activeGameRef.current] || loadedTextures['default'];
      materials[4].map = activeTextures.front;
      materials[5].map = activeTextures.back;
      materials[4].needsUpdate = true;
      materials[5].needsUpdate = true;

      // Animate particle cloud
      angleOffset += delta * 0.02 * colorsRef.current.particleSpeed;
      const posArr = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const speedFactor = 1.0 + (i % 3) * 0.2;
        const currentAngle = originalAngles[i] + angleOffset * speedFactor;
        posArr[i * 3] = Math.cos(currentAngle) * radii[i];
        posArr[i * 3 + 1] = heights[i] + Math.sin(time * 0.4 + radii[i]) * 0.1;
        posArr[i * 3 + 2] = Math.sin(currentAngle) * radii[i];
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Animate Card
      if (isFullscreen) {
        cardGroup.rotation.y = manualRotation.current.y;
        cardGroup.rotation.x = manualRotation.current.x;
        
        if (autoRotateRef.current && !isDragging.current) {
          manualRotation.current.y += 0.005;
          cardGroup.rotation.y = manualRotation.current.y;
        }
        cardGroup.position.y = Math.sin(time * 1.0) * 0.1;
      } else {
        cardGroup.rotation.y += 0.005;
        cardGroup.rotation.x = Math.sin(time * 0.4) * 0.1;
        cardGroup.position.y = Math.sin(time * 1.2) * 0.1;
      }

      // Card scale breathing
      const pulse = 1.0 + Math.sin(time * 2.0) * 0.015;
      cardGroup.scale.set(pulse, pulse, pulse);

      // Animate background HUD rings
      rings.forEach((ring, idx) => {
        ring.rotation.x += 0.003 * (idx + 1);
        ring.rotation.y += 0.002 * (idx + 1);
        ring.material.opacity += ((isFullscreen ? 0.25 : 0.35) - ring.material.opacity) * 0.05;
        ring.material.color.copy(idx === 0 ? colorsRef.current.currentPrimary : colorsRef.current.currentSecondary);
      });

      // Camera parallax
      if (!isFullscreen) {
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;
        camera.position.x = pointerRef.current.x * 0.5;
        camera.position.y = pointerRef.current.y * 0.5;
        camera.position.z = targetZ;
        camera.lookAt(0, 0, 0);
      } else {
        camera.position.set(0, 0, targetZ);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };

    const handleStateChange = (e) => {
      if (e.skipped) {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      } else {
        clock.getDelta();
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    container.addEventListener('contentvisibilityautostatechange', handleStateChange);

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);

      container.removeEventListener('contentvisibilityautostatechange', handleStateChange);
      resizeObserver.disconnect();

      scene.remove(particleSystem);
      particleGeometry.dispose();
      pTexture.dispose();
      particleMaterial.dispose();
      floorProjectorGeo.dispose();
      floorProjectorMat.dispose();
      cardGeometry.dispose();
      materials.forEach(m => m.dispose());
      edgesGeometry.dispose();
      edgesMaterial.dispose();
      rings.forEach(ring => {
        scene.remove(ring);
        ring.geometry.dispose();
        ring.material.dispose();
      });
      renderer.dispose();
    };
  }, [isFullscreen]);

  return (
    <div 
      ref={containerRef} 
      className="three-hologram-container w-full h-full relative"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto none auto 400px',
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full outline-none cursor-grab active:cursor-grabbing" />
    </div>
  );
}
