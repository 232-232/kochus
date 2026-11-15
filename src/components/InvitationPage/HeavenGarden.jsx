/* ==========================================================================
   HeavenGarden — advanced, realistic garden scene (drop-in replacement)
   - Species-accurate butterflies (monarch, blue morpho, swallowtail,
     painted lady, cabbage white, lilac) with veined, scaled, bordered wings
   - Hairy, translucent-winged honey bees with pollen baskets & compound eyes
   - Daisy (Fibonacci seed head), layered rose, and tulip, with gradient
     petals, veins, sepals, thorns, leaves, and wind sway
   - Natural flight: Lissajous-style meandering paths generated in JS, with
     the body always heading in the direction of travel
   - All CSS is injected by the component (classes prefixed hg-), so the old
     .heaven / .flyer / .flower CSS is no longer needed.
   ========================================================================== */

/* ----------------------------- DATA -------------------------------------- */

const SPECIES = {
  monarch:     { a: '#ffb347', b: '#e0580a', edge: '#17100a', vein: '#17100a', dots: '#fff7e8', ew: 9 },
  morpho:      { a: '#8fdcff', b: '#0a40c0', edge: '#080f24', vein: '#0a1a44', dots: '#c9ecff', ew: 8, iris: true },
  swallowtail: { a: '#fff4a6', b: '#f0c010', edge: '#14110c', vein: '#14110c', dots: '#f7dc52', ew: 8, bands: true, tail: true, eye: '#3f7cff' },
  painted:     { a: '#ffcf8a', b: '#e06a36', edge: '#2a1a12', vein: '#3a2216', dots: '#fff', ew: 10 },
  white:       { a: '#ffffff', b: '#d9e4ec', edge: '#5d6368', vein: '#9aa6ae', dots: null, ew: 3.5 },
  lilac:       { a: '#f3e8ff', b: '#a589e0', edge: '#34264f', vein: '#5b4a82', dots: '#ffffff', ew: 7, iris: true },
};

const BUTTERFLIES = [
  { id: 'b1', species: 'monarch',     left: '6%',  top: '12%', size: 92,  dur: '40s', delay: '-2s',  path: 'a', flap: '0.62s' },
  { id: 'b2', species: 'morpho',      left: '70%', top: '8%',  size: 84,  dur: '46s', delay: '-8s',  path: 'b', flap: '0.7s' },
  { id: 'b3', species: 'swallowtail', left: '40%', top: '18%', size: 78,  dur: '38s', delay: '-4s',  path: 'c', flap: '0.56s' },
  { id: 'b4', species: 'lilac',       left: '82%', top: '28%', size: 66,  dur: '44s', delay: '-11s', path: 'd', flap: '0.5s' },
  { id: 'b5', species: 'painted',     left: '18%', top: '36%', size: 62,  dur: '36s', delay: '-6s',  path: 'b', flap: '0.48s' },
  { id: 'b6', species: 'monarch',     left: '54%', top: '6%',  size: 100, dur: '52s', delay: '-14s', path: 'a', flap: '0.74s' },
  { id: 'b7', species: 'swallowtail', left: '28%', top: '22%', size: 70,  dur: '42s', delay: '-9s',  path: 'd', flap: '0.6s' },
  { id: 'b8', species: 'white',       left: '88%', top: '48%', size: 58,  dur: '34s', delay: '-3s',  path: 'c', flap: '0.42s' },
];

const BEES = [
  { id: 'e1', left: '12%', top: '58%', size: 54, dur: '22s', delay: '-1s',  path: 'a' },
  { id: 'e2', left: '62%', top: '64%', size: 44, dur: '19s', delay: '-5s',  path: 'b' },
  { id: 'e3', left: '38%', top: '72%', size: 50, dur: '26s', delay: '-8s',  path: 'c' },
  { id: 'e4', left: '78%', top: '52%', size: 40, dur: '20s', delay: '-3s',  path: 'a' },
  { id: 'e5', left: '24%', top: '46%', size: 42, dur: '24s', delay: '-10s', path: 'b' },
];

const FLOWERS = [
  { id: 'f1', left: '2%',  hue: 340, delay: '0s',   scale: 1.0,  kind: 'daisy' },
  { id: 'f2', left: '12%', hue: 48,  delay: '1.1s', scale: 0.9,  kind: 'tulip' },
  { id: 'f3', left: '22%', hue: 345, delay: '0.4s', scale: 1.15, kind: 'rose' },
  { id: 'f4', left: '34%', hue: 280, delay: '1.8s', scale: 0.95, kind: 'daisy' },
  { id: 'f5', left: '46%', hue: 355, delay: '0.7s', scale: 1.1,  kind: 'rose' },
  { id: 'f6', left: '58%', hue: 330, delay: '1.4s', scale: 0.9,  kind: 'tulip' },
  { id: 'f7', left: '70%', hue: 350, delay: '0.2s', scale: 1.2,  kind: 'daisy' },
  { id: 'f8', left: '82%', hue: 8,   delay: '1.6s', scale: 1.0,  kind: 'rose' },
  { id: 'f9', left: '92%', hue: 20,  delay: '0.9s', scale: 0.9,  kind: 'tulip' },
];

function driftItems(kind, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${kind}-${i}`,
    left: `${(i * 37) % 100}%`,
    delay: `${-((i * 1.7) % 12)}s`,
    duration: `${11 + (i % 7) * 1.6}s`,
    size: 8 + (i % 5) * 4,
    drift: `${(i % 2 === 0 ? -1 : 1) * (20 + (i % 6) * 14)}px`,
    tone: i % 4,
  }));
}

const PETALS = driftItems('petal', 16);
const SNOW = driftItems('snow', 18);
const LEAVES = driftItems('leaf', 12);
const MOTES = driftItems('mote', 26);

const TONES = {
  petal: [['#ffc2d6', '#ff8fb7'], ['#ffe0ec', '#ffb3cb'], ['#ffffff', '#ffd6e4'], ['#ff9fc0', '#e8588f']],
  snow: [['#fff', '#fff'], ['#f4f8ff', '#fff'], ['#fff', '#eaf3ff'], ['#e7f2ff', '#fff']],
  leaf: [['#e8803c', '#a8431a'], ['#d65a55', '#8e2a35'], ['#f0b648', '#b9741c'], ['#a85a30', '#5e2f18']],
};

/* ---------------------- natural flight-path generator -------------------- */

function flightKeyframes(name, { ax, ay, fx, fy, ph, k2 = 0.28, steps = 72 }) {
  const T = Math.PI * 2;
  let ang = null;
  let out = `@keyframes ${name}{`;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = ax * (Math.sin(T * fx * t + ph) + k2 * Math.sin(T * (2 * fx + 1) * t + 2 * ph));
    const y = ay * (Math.sin(T * fy * t) + k2 * Math.sin(T * (fy + 2) * t + ph));
    const dx = ax * T * (fx * Math.cos(T * fx * t + ph) + k2 * (2 * fx + 1) * Math.cos(T * (2 * fx + 1) * t + 2 * ph));
    const dy = ay * T * (fy * Math.cos(T * fy * t) + k2 * (fy + 2) * Math.cos(T * (fy + 2) * t + ph));
    const h = (Math.atan2(dy, dx * 1.6) * 180) / Math.PI + 90; // body points "up" in the SVG
    if (ang === null) ang = h;
    else {
      let d = (((h - ang) % 360) + 540) % 360 - 180; // unwrap so it never spins backwards
      ang += d;
    }
    out += `${(t * 100).toFixed(2)}%{transform:translate3d(${x.toFixed(2)}vw,${y.toFixed(2)}vh,0) rotate(${ang.toFixed(1)}deg)}`;
  }
  return out + '}';
}

const FLY = {
  a: { ax: 20, ay: 11, fx: 1, fy: 2, ph: 0 },
  b: { ax: 24, ay: 9, fx: 2, fy: 1, ph: 1.2 },
  c: { ax: 16, ay: 13, fx: 1, fy: 3, ph: 2.3 },
  d: { ax: 22, ay: 8, fx: 3, fy: 2, ph: 0.6 },
};
const BUZZ = {
  a: { ax: 9, ay: 7, fx: 2, fy: 3, ph: 0.4, k2: 0.4, steps: 96 },
  b: { ax: 12, ay: 6, fx: 3, fy: 2, ph: 1.7, k2: 0.35, steps: 96 },
  c: { ax: 8, ay: 9, fx: 1, fy: 4, ph: 3.0, k2: 0.45, steps: 96 },
};

const PATH_CSS =
  Object.entries(FLY).map(([k, v]) => flightKeyframes(`hg-fly-${k}`, v)).join('') +
  Object.entries(BUZZ).map(([k, v]) => flightKeyframes(`hg-buzz-${k}`, v)).join('');

/* ------------------------------- STYLES ---------------------------------- */

const CSS = `
.hg{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0;contain:layout paint}
.hg-glow{position:absolute;border-radius:50%;filter:blur(60px);mix-blend-mode:screen;animation:hg-pulse 14s ease-in-out infinite alternate}
.hg-glow-a{width:60vw;height:60vw;left:-12vw;top:-18vw;background:radial-gradient(circle,rgba(255,226,170,.55),transparent 65%)}
.hg-glow-b{width:50vw;height:50vw;right:-10vw;top:4vh;background:radial-gradient(circle,rgba(255,190,225,.45),transparent 65%);animation-delay:-5s}
.hg-glow-c{width:70vw;height:40vw;left:15vw;bottom:-10vw;background:radial-gradient(circle,rgba(190,235,255,.4),transparent 70%);animation-delay:-9s}
.hg-rays{position:absolute;inset:-10% -10% 30% -10%;background:linear-gradient(104deg,transparent 18%,rgba(255,244,214,.2) 25%,transparent 33%,transparent 44%,rgba(255,244,214,.14) 50%,transparent 58%,rgba(255,244,214,.18) 70%,transparent 78%);filter:blur(14px);mix-blend-mode:screen;animation:hg-rays 18s ease-in-out infinite alternate}
@keyframes hg-pulse{from{opacity:.65;transform:scale(1)}to{opacity:1;transform:scale(1.12)}}
@keyframes hg-rays{from{opacity:.5;transform:translateX(-2vw)}to{opacity:1;transform:translateX(2vw)}}

/* drifting particles */
.hg-drift{position:absolute;top:-8%;will-change:transform;animation:hg-fall linear infinite}
.hg-drift-petal{border-radius:100% 0 100% 0;box-shadow:inset -2px -2px 4px rgba(190,60,110,.25)}
.hg-drift-leaf{border-radius:0 100% 0 100%;box-shadow:inset -2px -2px 5px rgba(0,0,0,.25)}
.hg-drift-snow{border-radius:50%;box-shadow:0 0 6px rgba(255,255,255,.85);filter:blur(.4px)}
@keyframes hg-fall{
 0%{transform:perspective(500px) translate3d(0,-6vh,0) rotate3d(1,.4,.6,0deg);opacity:0}
 8%{opacity:1}
 50%{transform:perspective(500px) translate3d(calc(var(--shift) * .6),52vh,0) rotate3d(1,.4,.6,200deg)}
 100%{transform:perspective(500px) translate3d(var(--shift),112vh,0) rotate3d(1,.4,.6,420deg);opacity:.85}}
.hg-mote{position:absolute;bottom:-3%;border-radius:50%;background:radial-gradient(circle,#fff6c8,rgba(255,220,120,0) 70%);animation:hg-rise linear infinite}
@keyframes hg-rise{0%{transform:translate3d(0,0,0);opacity:0}15%{opacity:.9}50%{opacity:.4}100%{transform:translate3d(var(--shift),-70vh,0);opacity:0}}

/* flyers */
.hg-flyer{position:absolute;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}
.hg-tilt{width:100%;filter:drop-shadow(0 14px 9px rgba(40,25,10,.2))}
.hg-butterfly .hg-tilt{animation:hg-bob var(--flap,.55s) ease-in-out infinite}
.hg-bee .hg-tilt{animation:hg-vib .11s linear infinite;filter:drop-shadow(0 10px 6px rgba(40,25,10,.25))}
.hg-bug{display:block;width:100%;height:auto;overflow:visible}
@keyframes hg-bob{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6%) scale(1.035)}}
@keyframes hg-vib{0%{transform:translate(0,0)}33%{transform:translate(.7px,-.9px)}66%{transform:translate(-.7px,.6px)}100%{transform:translate(0,0)}}
.hg-wing{transform-origin:100px 68px;animation:hg-flap var(--flap,.55s) cubic-bezier(.45,0,.55,1) infinite}
@keyframes hg-flap{0%,100%{transform:scaleX(1) skewY(0deg)}50%{transform:scaleX(.14) skewY(-5deg)}}
.hg-iris{animation:hg-iris 6s ease-in-out infinite alternate}
@keyframes hg-iris{from{filter:hue-rotate(-14deg) saturate(1.05)}to{filter:hue-rotate(16deg) saturate(1.25) brightness(1.08)}}
.hg-bw{transform-origin:42px 35px;animation:hg-wbuzz .055s ease-in-out infinite alternate}
.hg-bw-hind{animation-direction:alternate-reverse;animation-duration:.06s}
@keyframes hg-wbuzz{from{transform:rotate(-16deg)}to{transform:rotate(20deg)}}

/* garden */
.hg-floor{position:absolute;left:0;right:0;bottom:0;height:42%}
.hg-grass{position:absolute;left:0;bottom:0;width:100%;height:100%}
.hg-mist{position:absolute;left:-10%;right:-10%;bottom:0;height:60%;background:radial-gradient(ellipse at 50% 100%,rgba(255,255,255,.55),transparent 70%);filter:blur(18px);animation:hg-mist 16s ease-in-out infinite alternate}
@keyframes hg-mist{from{transform:translateX(-3%);opacity:.6}to{transform:translateX(3%);opacity:.95}}
.hg-flower{position:absolute;bottom:-1%;width:calc(var(--scale) * clamp(72px,9vw,132px));animation:hg-grow 2.6s cubic-bezier(.2,.8,.2,1) backwards}
.hg-flower svg{display:block;width:100%;height:auto;overflow:visible}
.hg-sway{transform-origin:50% 100%;animation:hg-sway 6s ease-in-out infinite alternate}
@keyframes hg-grow{from{transform:scale(.2) translateY(30%);opacity:0;transform-origin:50% 100%}to{transform:scale(1);opacity:1;transform-origin:50% 100%}}
@keyframes hg-sway{from{transform:rotate(-2.4deg)}to{transform:rotate(2.4deg)}}

@media (prefers-reduced-motion:reduce){.hg *{animation-play-state:paused!important}}
${PATH_CSS}
`;

/* ---------------------------- SHARED SVG DEFS ---------------------------- */

function SharedDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <pattern id="hg-scales" width="3" height="3" patternUnits="userSpaceOnUse">
          <ellipse cx="1.5" cy="1" rx="1.2" ry=".7" fill="#fff" opacity=".16" />
          <ellipse cx="0" cy="2.5" rx="1.2" ry=".7" fill="#000" opacity=".07" />
        </pattern>
        <linearGradient id="hg-bodyg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#140d08" />
          <stop offset=".45" stopColor="#6b4a34" />
          <stop offset="1" stopColor="#120b07" />
        </linearGradient>
        <linearGradient id="hg-bw" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".8" />
          <stop offset="1" stopColor="#bcd6ff" stopOpacity=".28" />
        </linearGradient>
        <linearGradient id="hg-stemg" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#2c6a2c" />
          <stop offset=".5" stopColor="#8fd070" />
          <stop offset="1" stopColor="#2f7a34" />
        </linearGradient>
        <linearGradient id="hg-leafg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9bd982" />
          <stop offset="1" stopColor="#2b7335" />
        </linearGradient>
        <linearGradient id="hg-bladeg" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#1f5a2b" />
          <stop offset="1" stopColor="#8fd36a" />
        </linearGradient>
        <filter id="hg-fuzz" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* ------------------------------ BUTTERFLY -------------------------------- */

const FORE = 'M97 66 C84 30 44 2 10 14 C0 30 12 56 46 72 C66 80 86 76 97 70Z';
const HIND = 'M97 70 C84 74 58 78 46 94 C38 112 52 132 72 126 C90 120 98 96 99 76Z';
const TAIL = 'M62 124 C55 136 49 146 55 149 C66 145 75 135 79 124Z';
const FORE_VEINS = ['M97 67 Q60 44 12 20', 'M97 67 Q66 30 30 8', 'M97 67 Q74 26 50 8', 'M97 68 Q60 58 4 34', 'M97 69 Q70 70 30 66', 'M97 68 Q54 36 10 30'];
const HIND_VEINS = ['M98 72 Q68 84 42 104', 'M98 73 Q80 100 60 126', 'M98 74 Q92 98 84 120', 'M98 72 Q58 76 46 94'];
const FORE_DOTS = [[11, 24], [19, 14], [31, 9], [45, 10], [57, 21], [26, 47], [40, 60]];
const HIND_DOTS = [[44, 106], [47, 119], [58, 126], [71, 124], [83, 116]];
const BANDS = ['M97 66 Q76 46 44 20', 'M97 68 Q70 58 28 46', 'M97 70 Q66 70 24 62'];

function Wing({ id, s }) {
  const hind = s.tail ? `${HIND} ${TAIL}` : HIND;
  const detail = (d, veins, dots, clip) => (
    <g clipPath={`url(#${id}-${clip})`}>
      <path d={d} fill={`url(#${id}-g)`} />
      <path d={d} fill="url(#hg-scales)" />
      {veins.map((v, i) => <path key={i} d={v} stroke={s.vein} strokeWidth="1.1" fill="none" opacity=".75" />)}
      {clip === 'cf' && s.bands && BANDS.map((b, i) => <path key={i} d={b} stroke={s.edge} strokeWidth="7" fill="none" strokeLinecap="round" opacity=".92" />)}
      <path d={d} fill="none" stroke={s.edge} strokeWidth={s.ew} />
      {s.dots && dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 1.7 : 2.4} fill={s.dots} opacity=".95" />)}
      {clip === 'ch' && s.eye && (
        <g><circle cx="76" cy="112" r="6.5" fill="#e8742a" stroke={s.edge} strokeWidth="1.4" /><circle cx="76" cy="112" r="3.2" fill={s.eye} /></g>
      )}
      <ellipse cx={clip === 'cf' ? 80 : 86} cy={clip === 'cf' ? 52 : 90} rx="16" ry="7" fill="#fff" opacity=".14" transform={`rotate(${clip === 'cf' ? -30 : 60} ${clip === 'cf' ? 80 : 86} ${clip === 'cf' ? 52 : 90})`} />
    </g>
  );
  return (
    <g className={`hg-wing${s.iris ? ' hg-iris' : ''}`}>
      {detail(hind, HIND_VEINS, HIND_DOTS, 'ch')}
      {detail(FORE, FORE_VEINS, FORE_DOTS, 'cf')}
    </g>
  );
}

function Butterfly({ spec }) {
  const s = SPECIES[spec.species];
  const id = spec.id;
  return (
    <div
      className="hg-flyer hg-butterfly"
      style={{
        left: spec.left, top: spec.top, width: spec.size * 1.5,
        animationName: `hg-fly-${spec.path}`,
        animationDuration: spec.dur, animationDelay: spec.delay,
        '--flap': spec.flap,
      }}
    >
      <div className="hg-tilt">
        <svg viewBox="0 0 200 150" className="hg-bug" aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-g`} cx="97" cy="68" r="100" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={s.b} />
              <stop offset=".42" stopColor={s.a} />
              <stop offset="1" stopColor={s.b} />
            </radialGradient>
            <clipPath id={`${id}-cf`}><path d={FORE} /></clipPath>
            <clipPath id={`${id}-ch`}><path d={s.tail ? `${HIND} ${TAIL}` : HIND} /></clipPath>
          </defs>
          <Wing id={id} s={s} />
          <g transform="translate(200 0) scale(-1 1)"><Wing id={id} s={s} /></g>
          {/* body */}
          <g filter="url(#hg-fuzz)">
            <path d="M96 74 C95 92 97 110 100 124 C103 110 105 92 104 74Z" fill="url(#hg-bodyg)" />
            <ellipse cx="100" cy="64" rx="5.2" ry="11" fill="url(#hg-bodyg)" />
            <circle cx="100" cy="50" r="4.6" fill="#1a110b" />
          </g>
          {[82, 90, 98, 106, 114].map((y) => <path key={y} d={`M96.6 ${y} Q100 ${y + 2} 103.4 ${y}`} stroke="#fff" strokeOpacity=".13" fill="none" strokeWidth=".8" />)}
          <circle cx="97.8" cy="49" r="1.3" fill="#fff" opacity=".55" />
          <circle cx="102.2" cy="49" r="1.3" fill="#fff" opacity=".55" />
          <path d="M98.5 46.5 Q90 28 83 17" stroke="#2b1c12" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M101.5 46.5 Q110 28 117 17" stroke="#2b1c12" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <ellipse cx="82.4" cy="16" rx="1.8" ry="2.6" fill="#2b1c12" transform="rotate(-30 82.4 16)" />
          <ellipse cx="117.6" cy="16" rx="1.8" ry="2.6" fill="#2b1c12" transform="rotate(30 117.6 16)" />
        </svg>
      </div>
    </div>
  );
}

/* --------------------------------- BEE ----------------------------------- */

const HAIRS = (() => {
  let d = '';
  for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2;
    const x = 50 + 15 * Math.cos(a), y = 40 + 14 * Math.sin(a);
    d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(3.4 * Math.cos(a + 0.35)).toFixed(1)} ${(3.4 * Math.sin(a + 0.35)).toFixed(1)}`;
  }
  return d;
})();

function BeeWings() {
  return [0, 1].map((side) => (
    <g key={side} transform={side ? 'translate(100 0) scale(-1 1)' : undefined}>
      <g className="hg-bw hg-bw-hind">
        <path d="M42 38 C30 40 16 52 20 60 C30 64 42 52 45 42Z" fill="url(#hg-bw)" stroke="#64708a" strokeOpacity=".45" strokeWidth=".6" />
        <path d="M43 40 Q30 50 22 58" stroke="#64708a" strokeOpacity=".4" strokeWidth=".4" fill="none" />
      </g>
      <g className="hg-bw">
        <path d="M42 32 C30 10 6 6 2 20 C0 36 22 46 42 38Z" fill="url(#hg-bw)" stroke="#64708a" strokeOpacity=".5" strokeWidth=".7" />
        {['M42 34 Q24 22 6 16', 'M42 35 Q22 30 3 26', 'M42 36 Q24 40 8 36', 'M30 24 Q24 30 20 40'].map((d, i) => (
          <path key={i} d={d} stroke="#64708a" strokeOpacity=".4" strokeWidth=".45" fill="none" />
        ))}
      </g>
    </g>
  ));
}

function Bee({ spec }) {
  const id = spec.id;
  return (
    <div
      className="hg-flyer hg-bee"
      style={{
        left: spec.left, top: spec.top, width: spec.size * 1.2,
        animationName: `hg-buzz-${spec.path}`,
        animationDuration: spec.dur, animationDelay: spec.delay,
      }}
    >
      <div className="hg-tilt">
        <svg viewBox="0 0 100 120" className="hg-bug" aria-hidden="true">
          <defs>
            <radialGradient id={`${id}-ab`} cx=".45" cy=".35" r=".8">
              <stop offset="0" stopColor="#ffd75a" />
              <stop offset="1" stopColor="#b97a0e" />
            </radialGradient>
            <radialGradient id={`${id}-th`} cx=".5" cy=".4" r=".7">
              <stop offset="0" stopColor="#f6dc88" />
              <stop offset="1" stopColor="#8a5a16" />
            </radialGradient>
            <radialGradient id={`${id}-eye`} cx=".35" cy=".3" r=".8">
              <stop offset="0" stopColor="#6a5a50" />
              <stop offset=".4" stopColor="#1c1410" />
              <stop offset="1" stopColor="#050403" />
            </radialGradient>
            <clipPath id={`${id}-cl`}><path d="M50 54 C34 56 30 82 40 98 C44 106 56 106 60 98 C70 82 66 56 50 54Z" /></clipPath>
          </defs>
          {/* legs + pollen baskets */}
          <g stroke="#241a12" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
            {['M38 44 L28 46 L24 53', 'M62 44 L72 46 L76 53', 'M36 50 L24 56 L20 65', 'M64 50 L76 56 L80 65', 'M38 56 L27 66 L25 80', 'M62 56 L73 66 L75 80'].map((d, i) => <path key={i} d={d} />)}
          </g>
          <ellipse cx="25.5" cy="71" rx="4" ry="6.5" fill="#ff9a1f" /><ellipse cx="74.5" cy="71" rx="4" ry="6.5" fill="#ff9a1f" />
          <ellipse cx="24.5" cy="69" rx="1.6" ry="2.4" fill="#ffd27a" opacity=".8" /><ellipse cx="73.5" cy="69" rx="1.6" ry="2.4" fill="#ffd27a" opacity=".8" />
          {/* body */}
          <g filter="url(#hg-fuzz)">
            <path d="M50 54 C34 56 30 82 40 98 C44 106 56 106 60 98 C70 82 66 56 50 54Z" fill={`url(#${id}-ab)`} />
            <g clipPath={`url(#${id}-cl)`} fill="#1a120b">
              <path d="M28 70 Q50 78 72 70 L72 77 Q50 85 28 77Z" />
              <path d="M28 84 Q50 92 72 84 L72 92 Q50 100 28 92Z" />
              <path d="M28 97 Q50 105 72 97 L72 110 L28 110Z" />
              <ellipse cx="44" cy="68" rx="6" ry="12" fill="#fff" opacity=".12" />
            </g>
            <path d="M50 105 L50 113" stroke="#1a120b" strokeWidth="1.8" strokeLinecap="round" />
            <ellipse cx="50" cy="40" rx="15" ry="14" fill={`url(#${id}-th)`} />
            <path d={HAIRS} stroke="#e6c566" strokeWidth=".8" strokeLinecap="round" fill="none" opacity=".85" />
            <ellipse cx="50" cy="18" rx="9.5" ry="8" fill="#241a12" />
          </g>
          <ellipse cx="42" cy="16" rx="4.6" ry="6.2" fill={`url(#${id}-eye)`} transform="rotate(-12 42 16)" />
          <ellipse cx="58" cy="16" rx="4.6" ry="6.2" fill={`url(#${id}-eye)`} transform="rotate(12 58 16)" />
          <circle cx="40.6" cy="13.6" r="1.1" fill="#fff" opacity=".8" /><circle cx="56.6" cy="13.6" r="1.1" fill="#fff" opacity=".8" />
          <path d="M46 11 L40 3 L33 5 M54 11 L60 3 L67 5" stroke="#231a12" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="33" cy="5" r="1.4" fill="#231a12" /><circle cx="67" cy="5" r="1.4" fill="#231a12" />
          <BeeWings />
        </svg>
      </div>
    </div>
  );
}

/* -------------------------------- FLOWERS -------------------------------- */

const Leaf = ({ d, vein, flip, y = 0 }) => (
  <g transform={`${flip ? 'translate(120 0) scale(-1 1) ' : ''}translate(0 ${y})`}>
    <path d={d} fill="url(#hg-leafg)" />
    <path d={vein} stroke="#d6f2c2" strokeOpacity=".6" strokeWidth=".9" fill="none" />
  </g>
);
const LEAF_D = 'M60 220 C44 214 26 196 14 176 C34 178 54 196 60 220Z';
const LEAF_V = 'M60 220 C46 206 32 192 18 180';

function Daisy({ id, hue }) {
  const tip = `hsl(${hue} 85% 80%)`;
  const ring = (n, off, s, op, k) =>
    Array.from({ length: n }, (_, i) => (
      <g key={`${k}${i}`} opacity={op} transform={`rotate(${off + (360 / n) * i} 60 60) translate(60 60) scale(${s}) translate(-60 -60)`}>
        <path d="M60 60 C52 46 53 20 60 6 C67 20 68 46 60 60Z" fill={`url(#${id}-p)`} />
        <path d="M60 56 L60 14" stroke={tip} strokeWidth=".7" opacity=".55" />
        <path d="M57 50 L57 20 M63 50 L63 20" stroke={tip} strokeWidth=".35" opacity=".35" />
      </g>
    ));
  const seeds = Array.from({ length: 44 }, (_, i) => {
    const r = 1.45 * Math.sqrt(i + 1), a = i * 2.39996;
    return <circle key={i} cx={60 + r * Math.cos(a)} cy={60 + r * Math.sin(a)} r=".95" fill={i % 3 ? '#8a4f00' : '#ffd24a'} opacity=".85" />;
  });
  return (
    <>
      <defs>
        <linearGradient id={`${id}-p`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset=".35" stopColor="#fff" />
          <stop offset="1" stopColor={tip} />
        </linearGradient>
        <radialGradient id={`${id}-c`}>
          <stop offset="0" stopColor="#ffe45c" /><stop offset=".7" stopColor="#e59a00" /><stop offset="1" stopColor="#8d5200" />
        </radialGradient>
      </defs>
      <path d="M60 66 C57 120 64 180 60 280" stroke="url(#hg-stemg)" strokeWidth="4.6" fill="none" strokeLinecap="round" />
      <Leaf d={LEAF_D} vein={LEAF_V} y={14} />
      <Leaf d={LEAF_D} vein={LEAF_V} flip y={34} />
      <g style={{ filter: 'brightness(.88)' }}>{ring(22, 8, 0.93, 1, 'b')}</g>
      {ring(22, 0, 1, 1, 'f')}
      <circle cx="60" cy="60" r="11.5" fill={`url(#${id}-c)`} />
      <circle cx="60" cy="60" r="11.5" fill="none" stroke="#5a3200" strokeOpacity=".35" strokeWidth="1.2" />
      {seeds}
    </>
  );
}

function Rose({ id, hue }) {
  const cA = `hsl(${hue} 85% 66%)`, cB = `hsl(${hue} 80% 44%)`, cC = `hsl(${hue} 85% 22%)`;
  const P = 'M60 70 C36 66 22 40 38 22 C48 12 72 12 82 22 C98 40 84 66 60 70Z';
  const rings = [[5, 0, 1, 1], [5, 36, 0.74, 0.88], [4, 10, 0.52, 0.76], [3, 50, 0.32, 0.64]];
  return (
    <>
      <defs>
        <radialGradient id={`${id}-r`} cx="60" cy="70" r="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={cC} /><stop offset=".5" stopColor={cB} /><stop offset="1" stopColor={cA} />
        </radialGradient>
      </defs>
      <path d="M60 112 C56 170 64 220 60 280" stroke="url(#hg-stemg)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M62 170 l9 -5 l-5 10z M58 214 l-9 -5 l5 10z" fill="#6b8f3a" />
      <Leaf d={LEAF_D} vein={LEAF_V} y={4} />
      <Leaf d={LEAF_D} vein={LEAF_V} flip y={28} />
      <path d="M60 112 C48 106 38 114 30 128 C44 126 56 122 60 112Z M60 112 C72 106 82 114 90 128 C76 126 64 122 60 112Z" fill="#3f8a3a" />
      <g transform="translate(60 70) scale(.8) translate(-60 -70)">
        {rings.map(([n, off, s, br], k) =>
          Array.from({ length: n }, (_, i) => (
            <g key={`${k}${i}`} style={{ filter: `brightness(${br})` }}
               transform={`rotate(${off + (360 / n) * i} 60 70) translate(60 70) scale(${s}) translate(-60 -70)`}>
              <path d={P} fill={`url(#${id}-r)`} />
              <path d="M40 24 C50 14 70 14 80 24" stroke="#fff" strokeOpacity=".28" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              <path d="M60 68 C50 54 48 40 52 28" stroke={cC} strokeOpacity=".35" strokeWidth=".8" fill="none" />
            </g>
          ))
        )}
        <path d="M60 70 m-7 0 a7 7 0 1 1 7 7 a3.5 3.5 0 1 1 -3.5 -3.5" stroke={cC} strokeWidth="1.4" fill="none" />
      </g>
    </>
  );
}

function Tulip({ id, hue }) {
  const lo = `hsl(${hue} 85% 36%)`, hi = `hsl(${hue} 90% 62%)`, hi2 = `hsl(${hue} 95% 74%)`;
  return (
    <>
      <defs>
        <linearGradient id={`${id}-t`} x1="0" y1="1" x2=".2" y2="0">
          <stop offset="0" stopColor={lo} /><stop offset="1" stopColor={hi} />
        </linearGradient>
        <linearGradient id={`${id}-u`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={hi} /><stop offset="1" stopColor={hi2} />
        </linearGradient>
      </defs>
      <path d="M60 276 C30 250 20 190 30 120 C46 170 58 230 60 276Z" fill="url(#hg-leafg)" />
      <path d="M60 276 C90 252 104 200 94 140 C78 184 62 232 60 276Z" fill="url(#hg-leafg)" opacity=".92" />
      <path d="M60 272 C40 240 34 190 32 130" stroke="#d6f2c2" strokeOpacity=".5" fill="none" />
      <path d="M60 108 C58 170 62 220 60 280" stroke="url(#hg-stemg)" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M60 24 C40 30 30 56 36 86 C42 112 78 112 84 86 C90 56 80 30 60 24Z" fill={lo} />
      <path d="M60 22 C34 28 24 62 38 92 C46 106 58 108 60 108 C52 80 50 50 60 22Z" fill={`url(#${id}-t)`} />
      <path d="M60 22 C86 28 96 62 82 92 C74 106 62 108 60 108 C68 80 70 50 60 22Z" fill={`url(#${id}-t)`} />
      <path d="M60 30 C48 44 46 78 60 106 C74 78 72 44 60 30Z" fill={`url(#${id}-u)`} />
      <path d="M60 32 C52 50 52 80 60 102" stroke="#fff" strokeOpacity=".3" strokeWidth="1.4" fill="none" />
      <path d="M44 40 C38 58 40 80 46 94" stroke="#fff" strokeOpacity=".22" strokeWidth="1.2" fill="none" />
    </>
  );
}

function Flower({ spec }) {
  const Head = { daisy: Daisy, rose: Rose, tulip: Tulip }[spec.kind];
  return (
    <div
      className="hg-flower"
      style={{ left: spec.left, animationDelay: spec.delay, '--scale': spec.scale }}
    >
      <svg viewBox="0 0 120 280" aria-hidden="true" className="hg-sway" style={{ animationDelay: `-${spec.delay}`, animationDuration: `${5 + spec.scale * 2}s` }}>
        <Head id={spec.id} hue={spec.hue} />
      </svg>
    </div>
  );
}

/* ----------------------------- GRASS / DRIFT ----------------------------- */

function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}
function makeBlades(count, seed, hMin, hMax) {
  const r = seeded(seed);
  let d = '';
  for (let i = 0; i < count; i++) {
    const x = (i / count) * 1000 + r() * 14;
    const h = hMin + r() * (hMax - hMin);
    const lean = (r() - 0.5) * 50;
    d += `M${x.toFixed(1)} 120 Q${(x + lean * 0.3).toFixed(1)} ${(120 - h * 0.55).toFixed(1)} ${(x + lean).toFixed(1)} ${(120 - h).toFixed(1)} Q${(x + lean * 0.3 + 6).toFixed(1)} ${(120 - h * 0.5).toFixed(1)} ${(x + 7).toFixed(1)} 120Z`;
  }
  return d;
}
const BLADES_BACK = makeBlades(120, 11, 40, 100);
const BLADES_FRONT = makeBlades(90, 97, 20, 62);

function Grass({ d, opacity, bright }) {
  return (
    <svg className="hg-grass" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" style={{ opacity, filter: `brightness(${bright})` }}>
      <path d={d} fill="url(#hg-bladeg)" />
    </svg>
  );
}

function Drift({ item, kind }) {
  if (kind === 'mote') {
    return <span className="hg-mote" style={{ left: item.left, width: item.size / 2, height: item.size / 2, animationDelay: item.delay, animationDuration: `${item.duration.replace('s', '') * 1.8}s`, '--shift': item.drift }} />;
  }
  const [c1, c2] = TONES[kind][item.tone];
  const vein = kind === 'leaf' ? ',linear-gradient(135deg,transparent 47%,rgba(0,0,0,.28) 50%,transparent 53%)' : '';
  return (
    <span
      className={`hg-drift hg-drift-${kind}`}
      style={{
        left: item.left, animationDelay: item.delay, animationDuration: item.duration,
        width: item.size, height: kind === 'leaf' ? item.size * 1.15 : item.size,
        background: `linear-gradient(135deg,${c1},${c2})${vein}`,
        '--shift': item.drift,
      }}
    />
  );
}

/* --------------------------------- ROOT ---------------------------------- */

export default function HeavenGarden() {
  return (
    <div className="hg" aria-hidden="true">
      <style>{CSS}</style>
      <SharedDefs />
      <div className="hg-glow hg-glow-a" />
      <div className="hg-glow hg-glow-b" />
      <div className="hg-glow hg-glow-c" />
      <div className="hg-rays" />

      {PETALS.map((item) => <Drift key={item.id} item={item} kind="petal" />)}
      {SNOW.map((item) => <Drift key={item.id} item={item} kind="snow" />)}
      {LEAVES.map((item) => <Drift key={item.id} item={item} kind="leaf" />)}
      {MOTES.map((item) => <Drift key={item.id} item={item} kind="mote" />)}

      <div className="hg-floor">
        <Grass d={BLADES_BACK} opacity={0.9} bright={0.7} />
        {FLOWERS.map((spec) => <Flower key={spec.id} spec={spec} />)}
        <Grass d={BLADES_FRONT} opacity={1} bright={1} />
        <div className="hg-mist" />
      </div>

      {BUTTERFLIES.map((spec) => <Butterfly key={spec.id} spec={spec} />)}
      {BEES.map((spec) => <Bee key={spec.id} spec={spec} />)}
    </div>
  );
}