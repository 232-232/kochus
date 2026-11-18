import { memo, useEffect, useRef } from 'react';
import gardenBackground from '../../assets/eden-garden-background.jpg';

const WIDTH = 1402;
const HEIGHT = 1122;

const FALLS = [
  [568, 684, 448, 548],
  [352, 502, 650, 742],
  [470, 742, 744, 836],
  [850, 905, 758, 800],
];

const BUTTERFLIES = [
  { center: [260, 320], radiusX: 170, radiusY: 90, speed: 0.5, phase: 0, color: 0, size: 1 },
  { center: [470, 450], radiusX: 60, radiusY: 40, speed: 0.9, phase: 2, color: 1, size: 1 },
  { center: [420, 800], radiusX: 90, radiusY: 50, speed: 0.7, phase: 4, color: 0, size: 1.15 },
  { center: [1290, 720], radiusX: 70, radiusY: 40, speed: 0.8, phase: 1, color: 1, size: 1.15 },
  { center: [740, 330], radiusX: 260, radiusY: 70, speed: 0.35, phase: 3, color: 0, size: 0.8 },
  { center: [900, 620], radiusX: 200, radiusY: 90, speed: 0.4, phase: 5, color: 1, size: 0.9 },
  { center: [130, 420], radiusX: 60, radiusY: 80, speed: 0.6, phase: 2.5, color: 0, size: 1 },
];

const BUTTERFLY_COLORS = [
  ['#ff9a1f', '#ffd24a'],
  ['#2aa8ff', '#8be3ff'],
];

const SWAY_REGIONS = [
  [0, 0, 800, 330, 5],
  [0, 560, 470, 562, 4],
  [860, 560, 542, 562, 3.5],
  [1180, 260, 222, 220, 2.5],
  [640, 380, 330, 230, 1.8],
];

const STYLES = `
.hg{position:fixed;inset:0;z-index:0;overflow:hidden;pointer-events:none;background:#1b1230}
.hg-stage{position:absolute;inset:0;perspective:1200px;overflow:hidden}
.hg-world{position:absolute;inset:-4%;transform-style:preserve-3d;transition:transform .15s ease-out}
.hg-canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.hg-header{position:fixed;top:0;left:0;right:0;padding:calc(env(safe-area-inset-top,0px) + 18px) 22px 0;color:#fff;text-shadow:0 2px 14px rgba(120,40,100,.7);pointer-events:none}
.hg-header h1{margin:0;font:400 clamp(22px,4vw,44px)/1.2 Georgia,'Times New Roman',serif;letter-spacing:.04em}
.hg-header p{margin:4px 0 0;font:italic clamp(12px,1.6vw,16px)/1.4 Georgia,'Times New Roman',serif;opacity:.9}
@media(prefers-reduced-motion:reduce){.hg-world{transition:none}}
`;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function HeavenGarden() {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const world = worldRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !world || !context) {
      console.error('Unable to initialize the Eden Garden canvas.');
      return undefined;
    }

    let frameId = 0;
    let disposed = false;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let lastFrame = 0;
    let time = 0;

    const image = new Image();
    const resize = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      scale = Math.max(width / WIDTH, height / HEIGHT);
      offsetX = (width - WIDTH * scale) / 2;
      offsetY = (height - HEIGHT * scale) / 2;
    };

    const tilt = (x, y) => {
      world.style.transform = `rotateY(${x * 4}deg) rotateX(${-y * 3}deg) translate3d(${-x * 14}px,${-y * 10}px,0)`;
    };
    const handlePointerMove = (event) => {
      tilt((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
    };
    const handleOrientation = (event) => {
      if (event.gamma != null && event.beta != null) {
        tilt(
          Math.max(-1, Math.min(1, event.gamma / 30)),
          Math.max(-1, Math.min(1, (event.beta - 45) / 30)),
        );
      }
    };

    const waterfallParticles = Array.from({ length: 520 }, () => {
      const fall = FALLS[Math.floor(Math.random() * FALLS.length)];
      return {
        fall,
        x: randomBetween(fall[0], fall[1]),
        y: randomBetween(fall[2], fall[3]),
        speed: randomBetween(90, 190),
        length: randomBetween(8, 22),
        alpha: randomBetween(0.3, 0.8),
      };
    });
    const mistParticles = Array.from({ length: 110 }, () => ({
      fall: Math.floor(Math.random() * FALLS.length),
      progress: Math.random(),
      position: randomBetween(0, 1),
    }));
    const petals = Array.from({ length: 70 }, () => ({
      x: randomBetween(0, WIDTH),
      y: randomBetween(0, HEIGHT),
      size: randomBetween(3, 7),
      rotation: randomBetween(0, 6),
      rotationSpeed: randomBetween(-2, 2),
      speed: randomBetween(14, 36),
      phase: randomBetween(0, 9),
      color: Math.random() < 0.8 ? '#ffb3cf' : '#fff0f5',
    }));

    const spawnWaterfallParticle = () => {
      const fall = FALLS[Math.floor(Math.random() * FALLS.length)];
      return {
        fall,
        x: randomBetween(fall[0], fall[1]),
        y: fall[2],
        speed: randomBetween(90, 190),
        length: randomBetween(8, 22),
        alpha: randomBetween(0.3, 0.8),
      };
    };
    const spawnPetal = () => ({
      x: randomBetween(-100, 0),
      y: randomBetween(0, 500),
      size: randomBetween(3, 7),
      rotation: randomBetween(0, 6),
      rotationSpeed: randomBetween(-2, 2),
      speed: randomBetween(14, 36),
      phase: randomBetween(0, 9),
      color: Math.random() < 0.8 ? '#ffb3cf' : '#fff0f5',
    });

    const drawWingedButterfly = (x, y, rotation, size, colorIndex, elapsed, phase) => {
      const flap = 0.25 + 0.75 * Math.abs(Math.sin(elapsed * 14 + phase));
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(size, size);
      context.fillStyle = '#2b1608';
      context.beginPath();
      context.ellipse(0, 0, 1.6, 7, 0, 0, Math.PI * 2);
      context.fill();

      for (const direction of [-1, 1]) {
        context.save();
        context.scale(direction * flap, 1);
        const gradient = context.createLinearGradient(0, 0, 14, 0);
        gradient.addColorStop(0, BUTTERFLY_COLORS[colorIndex][0]);
        gradient.addColorStop(1, BUTTERFLY_COLORS[colorIndex][1]);
        context.fillStyle = gradient;
        context.strokeStyle = '#1b0d05';
        context.lineWidth = 1.2;
        context.beginPath();
        context.moveTo(1, -1);
        context.bezierCurveTo(8, -18, 22, -16, 17, -4);
        context.bezierCurveTo(22, 6, 12, 14, 1, 3);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
      }
      context.restore();
    };

    const drawDove = (x, y, elapsed, size, direction) => {
      const flap = Math.sin(elapsed * 7);
      context.save();
      context.translate(x, y);
      context.scale(size * direction, size);
      context.rotate(-0.08 + flap * 0.03);
      context.shadowColor = 'rgba(255,230,160,.9)';
      context.shadowBlur = 14;
      context.fillStyle = '#fff';
      context.beginPath();
      context.ellipse(0, 0, 20, 7, 0, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(19, -3, 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = '#f4c27a';
      context.beginPath();
      context.moveTo(23, -3);
      context.lineTo(29, -2);
      context.lineTo(23, -1);
      context.fill();
      context.fillStyle = '#fff';
      context.beginPath();
      context.moveTo(-18, 0);
      context.lineTo(-34, -4);
      context.lineTo(-34, 5);
      context.fill();
      context.fillStyle = '#f4f6ff';
      for (const featherScale of [1, 0.6]) {
        context.save();
        context.rotate(flap * featherScale * 0.9);
        context.translate(2, -2);
        context.beginPath();
        context.moveTo(0, 0);
        context.bezierCurveTo(-8, -30 * featherScale - 10, -32, -40 * featherScale - 8, -44, -26 * featherScale - 6);
        context.bezierCurveTo(-30, -20, -14, -6, 0, 2);
        context.fill();
        context.restore();
      }
      context.restore();
    };

    const renderFrame = (timestamp) => {
      if (disposed || !image.complete) return;
      const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
      lastFrame = timestamp;
      time += delta;
      const gust = Math.pow(Math.max(0, Math.sin(time * 0.55)), 8) * 0.8;
      const wind = 2 * Math.max(
        0.15,
        0.55 + 0.35 * Math.sin(time * 0.4) + 0.25 * Math.sin(time * 1.3 + 1) + gust,
      );

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#1b1230';
      context.fillRect(0, 0, width, height);
      context.setTransform(scale * pixelRatio, 0, 0, scale * pixelRatio, offsetX * pixelRatio, offsetY * pixelRatio);
      context.drawImage(image, 0, 0);

      for (const region of SWAY_REGIONS) {
        const [x, y, regionWidth, regionHeight, amplitude] = region;
        context.save();
        context.beginPath();
        context.rect(x, y, regionWidth, regionHeight);
        context.clip();
        for (let stripY = y; stripY < y + regionHeight; stripY += 4) {
          const edge = Math.min(1, (stripY - y) / 40, (y + regionHeight - stripY) / 40);
          const wobble = Math.sin(time * 1.7 + stripY * 0.018 + x * 0.01)
            + 0.5 * Math.sin(time * 3.1 + stripY * 0.05);
          const shift = wobble * amplitude * wind * 0.35 * Math.max(0, edge);
          context.drawImage(image, x, stripY, regionWidth, 4, x + shift, stripY, regionWidth, 4);
        }
        context.restore();
      }

      context.save();
      context.beginPath();
      context.rect(160, 150, 290, 400);
      context.clip();
      context.translate(300, 150);
      context.rotate(Math.sin(time * 1.1) * 0.012 * (0.4 + wind));
      context.translate(-300, -150);
      context.globalAlpha = 0.55;
      context.drawImage(image, 0, 0);
      context.restore();

      context.globalCompositeOperation = 'lighter';
      const sunX = 1030;
      const sunY = 190;
      const pulse = 0.8 + 0.2 * Math.sin(time * 0.8);
      let gradient = context.createRadialGradient(sunX, sunY, 10, sunX, sunY, 520);
      gradient.addColorStop(0, `rgba(255,220,130,${0.35 * pulse})`);
      gradient.addColorStop(1, 'rgba(255,200,120,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, WIDTH, HEIGHT);

      context.save();
      context.translate(sunX, sunY);
      for (let index = 0; index < 14; index += 1) {
        const angle = (index / 14) * Math.PI * 2 + time * 0.03;
        const alpha = 0.05 + 0.04 * Math.sin(time * 0.7 + index * 1.7);
        context.fillStyle = `rgba(255,235,170,${alpha})`;
        context.beginPath();
        context.moveTo(0, 0);
        context.arc(0, 0, 900, angle, angle + 0.07);
        context.fill();
      }
      context.restore();

      for (const [lampX, lampY] of [[873, 500], [1232, 470], [1135, 508], [975, 520]]) {
        const lampPulse = 0.8 + 0.2 * Math.sin(time * 9 + lampX) * Math.sin(time * 3.3 + lampY);
        gradient = context.createRadialGradient(lampX, lampY, 0, lampX, lampY, 50);
        gradient.addColorStop(0, `rgba(255,190,90,${0.5 * lampPulse})`);
        gradient.addColorStop(1, 'rgba(255,160,60,0)');
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(lampX, lampY, 50, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < 26; index += 1) {
        const glintX = 380 + ((index * 137 + time * 14) % 520);
        const glintY = 860 + ((index * 53) % 70);
        const alpha = 0.35 + 0.35 * Math.sin(time * 4 + index);
        context.fillStyle = `rgba(255,255,255,${alpha * 0.5})`;
        context.fillRect(glintX, glintY, randomBetween(6, 10), 1.4);
      }

      context.lineCap = 'round';
      for (const particle of waterfallParticles) {
        particle.y += particle.speed * delta;
        if (particle.y > particle.fall[3]) {
          Object.assign(particle, spawnWaterfallParticle());
        }
        context.strokeStyle = `rgba(235,248,255,${particle.alpha * 0.55})`;
        context.lineWidth = 1.4;
        context.beginPath();
        context.moveTo(particle.x + Math.sin(time * 3 + particle.y * 0.05) * 0.6, particle.y);
        context.lineTo(particle.x, particle.y - particle.length);
        context.stroke();
      }

      for (const particle of mistParticles) {
        const fall = FALLS[particle.fall];
        particle.progress += delta * 0.35;
        if (particle.progress > 1) {
          particle.progress = 0;
          particle.position = Math.random();
        }
        const x = fall[0] + (fall[1] - fall[0]) * particle.position + wind * particle.progress * 20;
        const y = fall[3] - particle.progress * 34;
        const radius = 6 + particle.progress * 22;
        gradient = context.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255,255,255,${0.22 * (1 - particle.progress)})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      }

      context.globalCompositeOperation = 'source-over';
      for (const petal of petals) {
        petal.phase += delta * 2;
        petal.x += (30 * wind + Math.sin(petal.phase) * 14) * delta;
        petal.y += (petal.speed + Math.cos(petal.phase * 0.7) * 8) * delta;
        petal.rotation += petal.rotationSpeed * delta;
        if (petal.x > WIDTH + 20 || petal.y > HEIGHT + 20) {
          Object.assign(petal, spawnPetal());
        }
        context.save();
        context.translate(petal.x, petal.y);
        context.rotate(petal.rotation);
        context.scale(1, 0.55 + 0.45 * Math.sin(petal.phase * 1.3));
        context.fillStyle = petal.color;
        context.globalAlpha = 0.85;
        context.beginPath();
        context.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      for (const butterfly of BUTTERFLIES) {
        const butterflyTime = time * butterfly.speed + butterfly.phase;
        const x = butterfly.center[0] + Math.sin(butterflyTime) * butterfly.radiusX + wind * 10;
        const y = butterfly.center[1]
          + Math.sin(butterflyTime * 1.7 + 1) * butterfly.radiusY
          + Math.sin(time * 6 + butterfly.phase) * 4;
        const velocityX = Math.cos(butterflyTime) * butterfly.radiusX;
        drawWingedButterfly(
          x,
          y,
          velocityX > 0 ? 0.5 : -0.5,
          butterfly.size * 1.2,
          butterfly.color,
          time,
          butterfly.phase,
        );
      }

      const doveProgress1 = (time * 55) % (WIDTH + 500);
      drawDove(WIDTH + 150 - doveProgress1, 130 + Math.sin(time * 1.2) * 30 + doveProgress1 * 0.04, time, 1.4, -1);
      const doveProgress2 = (time * 38 + 600) % (WIDTH + 500);
      drawDove(-120 + doveProgress2, 230 + Math.sin(time * 1.5 + 2) * 22, time + 1, 1, 1);
      context.globalAlpha = 1;

      frameId = window.requestAnimationFrame(renderFrame);
    };

    const handleImageLoad = () => {
      if (disposed) return;
      resize();
      frameId = window.requestAnimationFrame(renderFrame);
    };
    const handleImageError = () => {
      console.error('Unable to load the Eden Garden background image.');
    };

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('deviceorientation', handleOrientation);
    image.addEventListener('load', handleImageLoad);
    image.addEventListener('error', handleImageError);
    image.src = gardenBackground;

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      image.removeEventListener('load', handleImageLoad);
      image.removeEventListener('error', handleImageError);
    };
  }, []);

  return (
    <div className="hg" aria-hidden="true">
      <style>{STYLES}</style>
      <div className="hg-stage">
        <div className="hg-world" ref={worldRef}>
          <canvas className="hg-canvas" ref={canvasRef} />
        </div>
      </div>
      <header className="hg-header">
        <h1>Eden Garden</h1>
        <p>Move your mouse (or tilt your phone) to look around</p>
      </header>
    </div>
  );
}

export default memo(HeavenGarden);
