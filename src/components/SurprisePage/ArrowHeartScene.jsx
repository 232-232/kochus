import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './arrow-heart-scene.css';

const HEART_COLORS = [0xff77a8, 0xff9aa9, 0xf45c87, 0xffd0d5, 0xffd47b];

function createHeartShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.65);
  shape.bezierCurveTo(-0.45, -0.2, -1.55, 0.6, -1.15, 1.28);
  shape.bezierCurveTo(-0.75, 2.05, -0.08, 1.85, 0, 1.25);
  shape.bezierCurveTo(0.08, 1.85, 0.75, 2.05, 1.15, 1.28);
  shape.bezierCurveTo(1.55, 0.6, 0.45, -0.2, 0, -0.65);
  return shape;
}

export default function ArrowHeartScene({ onComplete, active = true, visible = active }) {
  const canvasRef = useRef(null);
  const veilRef = useRef(null);
  const completeRef = useRef(onComplete);
  const activeRef = useRef(active);
  const animationControlRef = useRef(() => {});

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    activeRef.current = active;
    animationControlRef.current(true);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 100);
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.HemisphereLight(0xfff0f3, 0x714b66, 2.2);
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(-4, 6, 8);
    const rimLight = new THREE.PointLight(0xff8fb4, 100, 18, 2);
    const fillLight = new THREE.PointLight(0xffd5e0, 55, 14, 2);
    scene.add(ambient, keyLight, rimLight, fillLight);

    const environmentCanvas = document.createElement('canvas');
    environmentCanvas.width = 512;
    environmentCanvas.height = 256;
    const context = environmentCanvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 512, 256);
    gradient.addColorStop(0, '#fff3f0');
    gradient.addColorStop(0.35, '#ffd0e1');
    gradient.addColorStop(0.65, '#fffdf8');
    gradient.addColorStop(1, '#f48aac');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    for (let i = 0; i < 18; i += 1) {
      context.fillStyle = `rgba(255,255,255,${0.12 + (i % 3) * 0.08})`;
      context.beginPath();
      context.ellipse((i * 97) % 512, (i * 53) % 256, 8 + (i % 5) * 5, 3 + (i % 4) * 3, 0, 0, Math.PI * 2);
      context.fill();
    }
    const environment = new THREE.CanvasTexture(environmentCanvas);
    environment.mapping = THREE.EquirectangularReflectionMapping;
    environment.colorSpace = THREE.SRGBColorSpace;

    const heartShape = createHeartShape();
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.46,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.13,
      bevelThickness: 0.13,
      curveSegments: 20,
    });
    heartGeometry.translate(0, -0.6, -0.23);
    const heartMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf43e7a,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMap: environment,
      envMapIntensity: 1.3,
    });
    const heart = new THREE.Mesh(heartGeometry, heartMaterial);
    const heartGroup = new THREE.Group();
    heartGroup.add(heart);
    scene.add(heartGroup);

    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 128;
    glowCanvas.height = 128;
    const glowContext = glowCanvas.getContext('2d');
    const glow = glowContext.createRadialGradient(64, 64, 2, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255,105,155,.62)');
    glow.addColorStop(0.45, 'rgba(255,125,170,.2)');
    glow.addColorStop(1, 'rgba(255,125,170,0)');
    glowContext.fillStyle = glow;
    glowContext.fillRect(0, 0, 128, 128);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffc0d0,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    aura.scale.set(5, 5, 1);
    aura.position.z = -0.8;
    heartGroup.add(aura);

    const orbiters = [];
    const orbiterMaterial = new THREE.MeshBasicMaterial({ color: 0xffabc8, transparent: true, opacity: 0.86 });
    for (let i = 0; i < 9; i += 1) {
      const orbiter = new THREE.Mesh(heartGeometry, orbiterMaterial);
      orbiter.scale.setScalar(0.12 + (i % 3) * 0.025);
      scene.add(orbiter);
      orbiters.push({ mesh: orbiter, radius: 1.85 + (i % 4) * 0.34, speed: 0.28 + i * 0.025, phase: (i / 9) * Math.PI * 2 });
    }

    const bowGroup = new THREE.Group();
    const bowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.82, 0),
      new THREE.Vector3(-0.5, -0.45, 0),
      new THREE.Vector3(-0.62, 0, 0),
      new THREE.Vector3(-0.5, 0.45, 0),
      new THREE.Vector3(0, 0.82, 0),
    ]);
    const bow = new THREE.Mesh(
      new THREE.TubeGeometry(bowCurve, 36, 0.045, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x92566d, roughness: 0.35, metalness: 0.25 }),
    );
    bowGroup.add(bow);
    const stringGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.82, 0.02),
      new THREE.Vector3(0, 0, 0.02),
      new THREE.Vector3(0, 0.82, 0.02),
    ]);
    const string = new THREE.Line(stringGeometry, new THREE.LineBasicMaterial({ color: 0xffe6ed }));
    bowGroup.add(string);
    scene.add(bowGroup);

    const arrowGroup = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.032, 1.8, 7),
      new THREE.MeshStandardMaterial({ color: 0xe9c5a6, metalness: 0.1, roughness: 0.42 }),
    );
    shaft.rotation.z = -Math.PI / 2;
    shaft.position.x = 0.82;
    const arrowHead = new THREE.Mesh(
      new THREE.ConeGeometry(0.09, 0.3, 6),
      new THREE.MeshStandardMaterial({ color: 0xffe6ed, metalness: 0.45, roughness: 0.25 }),
    );
    arrowHead.rotation.z = -Math.PI / 2;
    arrowHead.position.x = 1.83;
    arrowGroup.add(shaft, arrowHead);
    bowGroup.add(arrowGroup);

    const shardCount = reducedMotion ? 110 : 220;
    const shardGeometry = new THREE.TetrahedronGeometry(0.11, 0);
    const shardMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 1 });
    const shards = new THREE.InstancedMesh(shardGeometry, shardMaterial, shardCount);
    shards.visible = false;
    scene.add(shards);

    const partyCount = reducedMotion ? 60 : 150;
    const partyMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.94 });
    const partyHearts = new THREE.InstancedMesh(heartGeometry, partyMaterial, partyCount);
    partyHearts.visible = false;
    scene.add(partyHearts);

    const sparkCount = reducedMotion ? 160 : 420;
    const sparkPositions = new Float32Array(sparkCount * 3);
    const sparkVelocities = [];
    for (let i = 0; i < sparkCount; i += 1) {
      sparkPositions[i * 3] = 10000;
      sparkPositions[i * 3 + 1] = 10000;
      sparkPositions[i * 3 + 2] = 0;
      sparkVelocities.push(new THREE.Vector3());
    }
    const sparkGeometry = new THREE.BufferGeometry();
    sparkGeometry.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
    const sparks = new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({ color: 0xffd9e3, size: 0.075, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }),
    );
    scene.add(sparks);

    const shardStates = [];
    const partyStates = [];
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let phase = 'idle';
    let phaseTime = 0;
    let targetPull = 0;
    let pull = 0;
    let pointerId = null;
    let pointerStart = null;
    let direction = new THREE.Vector3(1, 0, 0);
    const homeHeartPosition = new THREE.Vector3();
    let flightStart = new THREE.Vector3();
    let flightTarget = new THREE.Vector3();
    let startTime = performance.now();
    let sceneStartTime = startTime;
    let completeFired = false;
    let frameId = null;

    const layout = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspect = width / height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.left = -5 * aspect;
      camera.right = 5 * aspect;
      camera.top = 5;
      camera.bottom = -5;
      camera.updateProjectionMatrix();
      const portrait = aspect < 0.82;
      heartGroup.position.set(portrait ? 0 : 1.3, portrait ? 1.5 : 0.35, 0);
      homeHeartPosition.copy(heartGroup.position);
      const bowPosition = new THREE.Vector3(portrait ? 0 : -4.1, portrait ? -3.15 : -1.35, 0);
      bowGroup.position.copy(bowPosition);
      direction.copy(heartGroup.position).sub(bowPosition).normalize();
      bowGroup.rotation.z = Math.atan2(direction.y, direction.x);
      arrowGroup.position.set(-1.12, 0, 0.05);
      if (phase === 'idle' || phase === 'draw') updateString();
    };

    const updateString = () => {
      const positions = string.geometry.attributes.position;
      const nockX = -0.98 - pull * 1.25;
      positions.setXYZ(0, 0, -0.82, 0.02);
      positions.setXYZ(1, nockX, 0, 0.02);
      positions.setXYZ(2, 0, 0.82, 0.02);
      positions.needsUpdate = true;
      string.geometry.computeBoundingSphere();
      arrowGroup.position.x = -1.12 - pull * 1.25;
    };

    const fire = () => {
      phase = 'flying';
      phaseTime = 0;
      const arrowTip = arrowGroup.localToWorld(new THREE.Vector3(1.83, 0, 0));
      const flightDirection = heartGroup.position.clone().sub(arrowTip).normalize();
      flightStart.copy(arrowGroup.getWorldPosition(new THREE.Vector3()));
      flightTarget.copy(heartGroup.position).addScaledVector(flightDirection, -1.83);
      bowGroup.remove(arrowGroup);
      scene.add(arrowGroup);
      arrowGroup.rotation.z = Math.atan2(flightDirection.y, flightDirection.x);
    };

    const burst = () => {
      phase = 'party';
      phaseTime = 0;
      heartGroup.visible = false;
      arrowGroup.visible = false;
      shards.visible = true;
      partyHearts.visible = true;
      const center = heartGroup.position;
      shardStates.length = 0;
      for (let i = 0; i < shardCount; i += 1) {
        const position = new THREE.Vector3(
          center.x + (Math.random() - 0.5) * 1.9,
          center.y + (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 0.5,
        );
        const velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 5,
          (Math.random() - 0.5) * 5 + 0.5,
          (Math.random() - 0.5) * 2,
        );
        color.setHex(HEART_COLORS[i % HEART_COLORS.length]);
        shards.setColorAt(i, color);
        shardStates.push({ position, velocity, rotation: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6), spin: new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3), scale: 0.65 + Math.random() * 0.8 });
      }
      partyStates.length = 0;
      for (let i = 0; i < partyCount; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = new THREE.Vector3(Math.cos(angle) * (1.4 + Math.random() * 3), Math.random() * 4 + 0.8, (Math.random() - 0.5) * 2);
        color.setHex(HEART_COLORS[i % HEART_COLORS.length]);
        partyHearts.setColorAt(i, color);
        partyStates.push({
          position: center.clone(),
          velocity,
          phase: Math.random() * Math.PI * 2,
          scale: 0.035 + Math.random() * 0.045,
          spin: (Math.random() - 0.5) * 1.4,
        });
      }
      for (let i = 0; i < sparkCount; i += 1) {
        const index = i * 3;
        sparkPositions[index] = center.x;
        sparkPositions[index + 1] = center.y;
        sparkPositions[index + 2] = 0.3;
        const angle = Math.random() * Math.PI * 2;
        sparkVelocities[i].set(Math.cos(angle) * (2 + Math.random() * 5), Math.sin(angle) * (2 + Math.random() * 5), (Math.random() - 0.5) * 3);
      }
      sparks.geometry.attributes.position.needsUpdate = true;
    };

    const pointerDown = (event) => {
      if (!activeRef.current || phase !== 'idle') return;
      pointerId = event.pointerId;
      pointerStart = { x: event.clientX, y: event.clientY };
      targetPull = 0;
      phase = 'draw';
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const pointerMove = (event) => {
      if (event.pointerId !== pointerId || !pointerStart) return;
      const worldX = (event.clientX - pointerStart.x) * (camera.right - camera.left) / window.innerWidth;
      const worldY = -(event.clientY - pointerStart.y) * 10 / window.innerHeight;
      const pullDistance = -(worldX * direction.x + worldY * direction.y);
      targetPull = THREE.MathUtils.clamp(pullDistance / 1.5, 0, 1);
    };
    const pointerUp = (event) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      pointerStart = null;
      if (targetPull > 0.18) {
        pull = targetPull;
        fire();
      } else {
        phase = 'idle';
        targetPull = 0;
      }
    };
    const resize = () => layout();
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    layout();

    const animate = (now) => {
      frameId = null;
      if (!activeRef.current || document.hidden) return;
      const delta = Math.min((now - startTime) / 1000, 0.05);
      startTime = now;
      const time = now / 1000;
      if (phase === 'idle' || phase === 'draw') {
          pull += (targetPull - pull) * Math.min(1, delta * 11);
          if (pull > 0.92) pull += Math.sin(time * 48) * 0.002;
          updateString();
          const beat = (time * 1.5) % 1;
          const firstBeat = Math.exp(-Math.pow((beat - 0.12) / 0.055, 2));
          const secondBeat = Math.exp(-Math.pow((beat - 0.31) / 0.07, 2));
          const heartbeat = 1 + firstBeat * 0.07 + secondBeat * 0.04;
          const popProgress = Math.min((now - sceneStartTime) / 850, 1);
          const pop = popProgress < 1
            ? 1 + (2 ** (-10 * popProgress)) * Math.sin((popProgress * 10 - 0.75) * (2 * Math.PI / 3))
            : 1;
          const sway = Math.sin(time * 0.7) * 0.1;
          heartGroup.rotation.y = Math.sin(time * 0.55) * 0.12;
          heartGroup.rotation.x = sway;
          heartGroup.scale.setScalar(heartbeat * pop);
          rimLight.position.set(heartGroup.position.x + Math.sin(time * 1.4) * 1.1, heartGroup.position.y + Math.cos(time * 1.2) * 1.2, 2);
          fillLight.position.set(heartGroup.position.x + Math.cos(time * 0.9) * 1.5, heartGroup.position.y + Math.sin(time * 1.1) * 1.1, 1.5);
          aura.material.opacity = 0.7 + Math.sin(time * 1.4) * 0.18;
          orbiters.forEach((orbiter) => {
            const angle = time * orbiter.speed + orbiter.phase;
            orbiter.mesh.position.set(
              heartGroup.position.x + Math.cos(angle) * orbiter.radius,
              heartGroup.position.y + Math.sin(angle * 1.3) * 0.45 + Math.sin(angle) * orbiter.radius * 0.55,
              Math.sin(angle) * 0.6,
            );
            orbiter.mesh.rotation.z = angle;
          });
      } else if (phase === 'flying') {
          phaseTime += delta;
          const progress = Math.min(phaseTime / (reducedMotion ? 0.48 : 0.78), 1);
          arrowGroup.position.lerpVectors(flightStart, flightTarget, progress);
          arrowGroup.position.y += Math.sin(progress * Math.PI) * 0.25;
          if (progress === 1) {
            phase = 'impact';
            phaseTime = 0;
          }
      } else if (phase === 'impact') {
          phaseTime += delta;
          heartGroup.visible = true;
          const shake = reducedMotion ? 0.012 : 0.04;
          heartGroup.position.copy(homeHeartPosition);
          heartGroup.position.x += Math.sin(phaseTime * 52) * shake;
          heartGroup.position.y += Math.cos(phaseTime * 47) * shake;
          heartGroup.rotation.z = Math.sin(phaseTime * 38) * (reducedMotion ? 0.025 : 0.09);
          if (phaseTime > (reducedMotion ? 0.18 : 0.42)) {
            heartGroup.position.copy(homeHeartPosition);
            heartGroup.rotation.set(0, 0, 0);
            burst();
          }
      } else if (phase === 'party' || phase === 'veil') {
          phaseTime += delta;
          const partyElapsed = phase === 'veil' ? phaseTime + (reducedMotion ? 0.4 : 1.2) : phaseTime;
          shardStates.forEach((shard, index) => {
            shard.velocity.y -= delta * 1.2;
            shard.position.addScaledVector(shard.velocity, delta);
            shard.rotation.x += shard.spin.x * delta;
            shard.rotation.y += shard.spin.y * delta;
            dummy.position.copy(shard.position);
            dummy.rotation.copy(shard.rotation);
            dummy.scale.setScalar(shard.scale * Math.max(0, 1 - partyElapsed / 3.8));
            dummy.updateMatrix();
            shards.setMatrixAt(index, dummy.matrix);
          });
          shards.instanceMatrix.needsUpdate = true;
          partyStates.forEach((particle, index) => {
            particle.position.addScaledVector(particle.velocity, delta);
            particle.velocity.y *= Math.exp(-delta * 0.7);
            particle.position.y += Math.sin(time * 1.8 + particle.phase) * delta * 0.25;
            dummy.position.copy(particle.position);
            dummy.rotation.set(0, 0, time * particle.spin + particle.phase);
            dummy.scale.setScalar(particle.scale);
            dummy.updateMatrix();
            partyHearts.setMatrixAt(index, dummy.matrix);
          });
          partyHearts.instanceMatrix.needsUpdate = true;
          for (let i = 0; i < sparkCount; i += 1) {
            const index = i * 3;
            sparkVelocities[i].y -= delta * 1.1;
            sparkPositions[index] += sparkVelocities[i].x * delta;
            sparkPositions[index + 1] += sparkVelocities[i].y * delta;
            sparkPositions[index + 2] += sparkVelocities[i].z * delta;
          }
          sparks.geometry.attributes.position.needsUpdate = true;
          camera.zoom = 1 + Math.min(partyElapsed, 3) * 0.035;
          camera.updateProjectionMatrix();
          if (phase === 'party' && phaseTime > (reducedMotion ? 1 : 3.2)) {
            phase = 'veil';
            phaseTime = 0;
            veilRef.current?.classList.add('is-visible');
          } else if (phase === 'veil' && phaseTime > (reducedMotion ? 0.5 : 1.25) && !completeFired) {
            completeFired = true;
            completeRef.current?.();
          }
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = (resetTime = false) => {
      if (!activeRef.current || document.hidden || frameId !== null) return;
      if (resetTime) {
        startTime = performance.now();
        sceneStartTime = startTime;
      }
      frameId = window.requestAnimationFrame(animate);
    };
    const stopAnimation = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
        frameId = null;
      }
    };
    const visibilityChange = () => {
      startTime = performance.now();
      if (document.hidden) stopAnimation();
      else startAnimation();
    };

    shards.visible = true;
    partyHearts.visible = true;
    renderer.compile(scene, camera);
    shards.visible = false;
    partyHearts.visible = false;
    renderer.render(scene, camera);
    animationControlRef.current = startAnimation;
    if (activeRef.current) startAnimation(true);
    document.addEventListener('visibilitychange', visibilityChange);

    const resources = new Set();
    scene.traverse((object) => {
      if (object.geometry) resources.add(object.geometry);
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          resources.add(material);
          Object.values(material).forEach((value) => {
            if (value && value.isTexture) resources.add(value);
          });
        });
      }
    });

    return () => {
      stopAnimation();
      animationControlRef.current = () => {};
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      document.removeEventListener('visibilitychange', visibilityChange);
      resources.forEach((resource) => resource.dispose?.());
      renderer.dispose();
    };
  }, []);

  return (
    <main className={`arrow-heart-scene${visible ? ' is-visible' : ''}${active ? ' is-active' : ''}`} aria-hidden={!visible}>
      <canvas ref={canvasRef} className="arrow-heart-canvas" aria-label="Drag back the arrow and release to break the heart" />
      <p className="arrow-heart-caption">someone made this, just for you</p>
      <p className="arrow-heart-hint">PULL &amp; LET GO</p>
      <div ref={veilRef} className="arrow-heart-veil" aria-hidden="true" />
    </main>
  );
}
