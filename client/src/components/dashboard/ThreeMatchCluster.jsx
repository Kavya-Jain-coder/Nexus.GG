import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playSynthSound } from '../../lib/sound';

const GAME_THEMES = {
  valorant: 0xff4655,
  cs2: 0xde9b35,
  lol: 0xc8aa6e,
  fortnite: 0x00f0ff,
  pubg: 0xf25c05,
  default: 0x9b5de5
};

export default function ThreeMatchCluster({ matchHistory = [], activeGame, onSelectMatch }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const themeColorRef = useRef(new THREE.Color(GAME_THEMES.default));

  // Raycasting for interactivity
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  useEffect(() => {
    const colorHex = GAME_THEMES[activeGame] || GAME_THEMES.default;
    themeColorRef.current.setHex(colorHex);
  }, [activeGame]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080810, 0.08);

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Group to hold our custom items and apply dragging rotation
    const interactionGroup = new THREE.Group();
    scene.add(interactionGroup);

    // --- 2. Ambient and Decorative Grid ---
    const gridHelper = new THREE.GridHelper(10, 20, 0xffffff, 0xffffff);
    if (gridHelper.material) {
      gridHelper.material.transparent = true;
      gridHelper.material.opacity = 0.02;
    }
    gridHelper.position.y = -1.5;
    interactionGroup.add(gridHelper);

    // --- 3. Build Nodes from Match History ---
    const nodes = [];
    const connectionLines = [];
    const nodeGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const winMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green for Win
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const lossMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e, // Rose red for Loss
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    // Positions mapping: Spiral Timeline going upwards
    const count = matchHistory.length;
    if (count > 0) {
      matchHistory.forEach((match, index) => {
        const angle = (index / count) * Math.PI * 4; // 2 full revolutions
        const radius = 2.0 - (index / count) * 0.8; // spiral inward
        const y = -1.2 + (index / count) * 2.4; // ascend

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const mat = match.is_win ? winMat : lossMat;
        const mesh = new THREE.Mesh(nodeGeom, mat);
        mesh.position.set(x, y, z);
        mesh.userData = { match, originalScale: 1.0, index };

        // Outer glow wireframe
        const glowGeom = new THREE.SphereGeometry(0.24, 8, 8);
        const glowMat = new THREE.MeshBasicMaterial({
          color: match.is_win ? 0x10b981 : 0xf43f5e,
          wireframe: true,
          transparent: true,
          opacity: 0.2
        });
        const glowMesh = new THREE.Mesh(glowGeom, glowMat);
        mesh.add(glowMesh);

        interactionGroup.add(mesh);
        nodes.push(mesh);
      });

      // Construct connection line path (connecting matches in chronological order)
      const points = nodes.map(n => n.position);
      const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: themeColorRef.current,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending
      });
      const pathLine = new THREE.Line(lineGeom, lineMat);
      interactionGroup.add(pathLine);
      connectionLines.push(pathLine);
    } else {
      // Empty state: render a placeholder rotating tech polyhedron
      const placeholderGeom = new THREE.IcosahedronGeometry(1.2, 1);
      const placeholderMat = new THREE.MeshBasicMaterial({
        color: themeColorRef.current,
        wireframe: true,
        transparent: true,
        opacity: 0.15
      });
      const placeholderMesh = new THREE.Mesh(placeholderGeom, placeholderMat);
      interactionGroup.add(placeholderMesh);
      nodes.push(placeholderMesh);
    }

    // --- 4. Event Listeners (Parallax, Click & Drag Rotate) ---
    const handleMouseDown = (e) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const deltaMove = {
          x: e.clientX - previousMousePosition.current.x,
          y: e.clientY - previousMousePosition.current.y
        };

        interactionGroup.rotation.y += deltaMove.x * 0.007;
        interactionGroup.rotation.x += deltaMove.y * 0.007;

        previousMousePosition.current = {
          x: e.clientX,
          y: e.clientY
        };
      } else {
        // Subtle camera hover parallax
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        pointerRef.current.targetX = x * 0.5;
        pointerRef.current.targetY = y * 0.5;
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleClick = () => {
      // Raycast collision detection
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObjects(nodes);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object;
        if (clickedNode.userData && clickedNode.userData.match) {
          playSynthSound('success');
          if (onSelectMatch) {
            onSelectMatch(clickedNode.userData.match);
          }

          // Visual punch scale animation
          clickedNode.scale.set(1.5, 1.5, 1.5);
          setTimeout(() => {
            clickedNode.scale.set(1, 1, 1);
          }, 300);
        }
      }
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
    canvas.addEventListener('click', handleClick);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 5. Animation Loop ---
    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();

      // Soft self rotation if not dragging
      if (!isDragging.current) {
        interactionGroup.rotation.y += 0.002;
      }

      // Smooth camera parallax
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * 0.05;
      camera.position.x = pointerRef.current.x;
      camera.position.y = 2 + pointerRef.current.y;
      camera.lookAt(0, 0.2, 0);

      // Animate node pulsing scale and update line color
      nodes.forEach((node) => {
        if (node.userData && node.userData.match) {
          const baseScale = node.userData.originalScale;
          const pulse = baseScale + Math.sin(time * 3 + node.userData.index) * 0.08;
          node.scale.set(pulse, pulse, pulse);
        } else {
          // Placeholder animations
          node.rotation.y += 0.005;
          node.rotation.x += 0.003;
        }
      });

      connectionLines.forEach(line => {
        line.material.color.copy(themeColorRef.current);
      });

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
      canvas.removeEventListener('click', handleClick);
      resizeObserver.disconnect();

      // Dispose geometries & materials
      nodes.forEach((node) => {
        scene.remove(node);
        node.geometry.dispose();
        if (Array.isArray(node.material)) {
          node.material.forEach(m => m.dispose());
        } else {
          node.material.dispose();
        }
        node.children.forEach(c => {
          c.geometry.dispose();
          c.material.dispose();
        });
      });

      connectionLines.forEach(line => {
        scene.remove(line);
        line.geometry.dispose();
        line.material.dispose();
      });

      gridHelper.geometry.dispose();
      gridHelper.material.dispose();

      renderer.dispose();
    };
  }, [matchHistory, activeGame]);

  return (
    <div ref={containerRef} className="w-full h-full relative border border-white/5 rounded-2xl overflow-hidden bg-black/40 shadow-inner">
      <canvas ref={canvasRef} className="block w-full h-full cursor-grab active:cursor-grabbing" />
      {/* HUD diagnostic label overlays */}
      <div className="absolute inset-x-4 top-3 flex justify-between items-center pointer-events-none select-none">
        <span className="font-mono text-[9px] text-white/45 tracking-widest uppercase">
          PERFORMANCE SPATIAL VECTOR // GRAPH
        </span>
        <span className="font-mono text-[9px] text-white/35">
          NODES: {matchHistory.length}
        </span>
      </div>
      <div className="absolute inset-x-4 bottom-3 flex justify-between items-center pointer-events-none select-none">
        <span className="font-mono text-[8px] text-[var(--game-accent)]/80 tracking-widest uppercase">
          DRAG TO ROTATE DATA MATRIX
        </span>
        <span className="font-mono text-[8px] text-white/30">
          STABLE_LINK
        </span>
      </div>
    </div>
  );
}
