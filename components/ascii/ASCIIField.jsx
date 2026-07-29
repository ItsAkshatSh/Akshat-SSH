import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ASCIIField
 * Deep-sea ASCII background: a procedural 3D jellyfish and fish school
 * rendered with three.js + custom GLSL, composited over bubbles and
 * warm god rays, then stamped as an ASCII grid. Cursor-reactive.
 */

const RAMP = ' .·:-=+*x#%@';
const GLITCH = '!@#$%&*+=~/\\|<>[]{}?';

// Character cell metrics.
const CELL_W = 7;
const CELL_H = 12;
const FONT_SIZE = 12;

// Render the three.js scene at 2x the grid resolution so its shaded gradients
// come out smooth after downsampling to the ASCII grid.
const RENDER_SCALE = 2;

// ---------- Jellyfish shaders (from the reference, adapted) ----------
const BELL_VERT = /* glsl */ `
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;
void main() {
  vPos = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const BELL_FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
varying vec3 vPos; varying vec3 vNormal; varying vec3 vView;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1., 0.)), c = hash(i + vec2(0., 1.)), d = hash(i + vec2(1., 1.));
  vec2 u = f * f * (3. - 2. * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.4);
  float h = clamp((vPos.y + 0.40) / 1.40, 0.0, 1.0);
  float ang = atan(vPos.z, vPos.x);

  // Unified cool-white palette (apex → margin). Same tone as everything
  // else in the scene so the composition stays monochrome.
  vec3 top  = vec3(0.86, 0.90, 0.96);
  vec3 mid  = vec3(0.76, 0.82, 0.92);
  vec3 edge = vec3(0.66, 0.76, 0.90);
  vec3 col = mix(edge, mid, smoothstep(0.0, 0.5, h));
  col = mix(col, top, smoothstep(0.45, 1.0, h));

  // Radial ribs (meridians).
  float ribs = abs(fract(ang / (2.0 * 3.14159265) * 18.0) - 0.5) * 2.0;
  float ribLine = smoothstep(0.80, 0.99, ribs);
  float ribMask = smoothstep(0.98, 0.55, h) * smoothstep(-0.02, 0.22, h);
  col *= 1.0 - ribLine * 0.55 * ribMask;

  // Mottled dark margin band (only on front-facing surface).
  float backw = gl_FrontFacing ? 1.0 : 0.0;
  float band = smoothstep(0.34, 0.02, h);
  float spots = noise(vec2(ang * 7.0, h * 12.0));
  float wart = smoothstep(0.58, 0.86, spots) * band;
  col = mix(col, vec3(0.22, 0.28, 0.38), wart * 0.85 * backw);

  // Cool iridescent rim + subtle inner glow.
  col += fres * vec3(0.20, 0.32, 0.52);
  col += (1.0 - fres) * vec3(0.14, 0.20, 0.30) * (0.5 + 0.5 * h);

  float alpha = 0.50 + fres * 0.45 + ribLine * ribMask * 0.22 + wart * 0.35 * backw;
  alpha *= mix(0.30, 1.0, backw);
  alpha = clamp(alpha, 0.0, 0.96);
  gl_FragColor = vec4(col, alpha);
}
`;

const STRAND_VERT = /* glsl */ `
uniform float uTime; uniform float uLen; uniform float uPhase; uniform float uAmp; uniform float uFreq;
varying float vK; varying vec3 vNormal; varying vec3 vView;
void main() {
  vec3 p = position;
  float k = clamp(-p.y / uLen, 0.0, 1.0);
  float amp = k * k * uAmp;
  p.x += sin(uTime * 1.5 + k * uFreq + uPhase) * amp;
  p.z += cos(uTime * 1.2 + k * uFreq * 0.9 + uPhase * 1.3) * amp;
  vK = k;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const STRAND_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uTop; uniform vec3 uTip; uniform float uOpacity;
varying float vK; varying vec3 vNormal; varying vec3 vView;
void main() {
  float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 1.6);
  float topFade = smoothstep(0.02, 0.10, vK);   // hide attachment inside bell
  float tipFade = 1.0 - smoothstep(0.72, 1.0, vK); // wispy trailing tips
  float vis = topFade * tipFade;
  vec3 col = mix(uTop, uTip, vK) + fres * 0.25;
  float alpha = ((1.0 - vK * 0.92) * uOpacity + fres * 0.12) * vis;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
}
`;

// Build a tubular tentacle geometry along a curled spine.
function makeStrandGeometry(length, thickness, curl) {
  const seg = 40;
  const radial = 6;
  const spine = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    spine.push(new THREE.Vector3(
      Math.sin(t * 3) * curl * t,
      -t * length,
      Math.cos(t * 2) * curl * t
    ));
  }
  const curve = new THREE.CatmullRomCurve3(spine);
  const frames = curve.computeFrenetFrames(seg, false);
  const pos = [];
  const idx = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const p = curve.getPointAt(t);
    const r = thickness * (1 - Math.pow(t, 0.75));
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j <= radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      pos.push(
        p.x + (c * N.x + s * B.x) * r,
        p.y + (c * N.y + s * B.y) * r,
        p.z + (c * N.z + s * B.z) * r
      );
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function ASCIIField({ paused = false } = {}) {
  const displayCanvasRef = useRef(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const dctx = displayCanvas.getContext('2d');

    // Offscreen canvas: source pixels for the ASCII pass.
    const gridCanvas = document.createElement('canvas');
    const gctx = gridCanvas.getContext('2d', { willReadFrequently: true });

    // Offscreen canvas: god-ray intensity mask (alpha only). Kept separate
    // from the grid so rays render as a coherent single hue instead of
    // getting per-channel mixed with the 3D scene beneath them.
    const rayCanvas = document.createElement('canvas');
    const rctx = rayCanvas.getContext('2d', { willReadFrequently: true });

    // Offscreen canvas: kelp silhouette mask. Same trick as the rays.
    const kelpCanvas = document.createElement('canvas');
    const kctx = kelpCanvas.getContext('2d', { willReadFrequently: true });

    // Offscreen canvas: three.js target.
    const threeCanvas = document.createElement('canvas');
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const uTime = { value: 0 };

    // ----- Build the jellyfish -----
    const jelly = new THREE.Group();

    // Bell.
    const bellGeo = new THREE.SphereGeometry(1, 96, 96, 0, Math.PI * 2, 0, 1.98);
    const bellMat = new THREE.ShaderMaterial({
      vertexShader: BELL_VERT,
      fragmentShader: BELL_FRAG,
      uniforms: { uTime },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const bell = new THREE.Mesh(bellGeo, bellMat);
    bell.scale.set(1, 0.84, 1);
    jelly.add(bell);

    // Inner bioluminescent core.
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0xa8cfe8,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    glow.position.set(0, 0.18, 0);
    jelly.add(glow);

    const disposables = [bellGeo, bellMat, glow.geometry, glow.material];

    // Long marginal tentacles.
    const TENTACLE_COUNT = 28;
    for (let i = 0; i < TENTACLE_COUNT; i++) {
      const geo = makeStrandGeometry(4.2, 0.016, 0.05);
      const mat = new THREE.ShaderMaterial({
        vertexShader: STRAND_VERT,
        fragmentShader: STRAND_FRAG,
        uniforms: {
          uTime,
          uLen: { value: 4.2 },
          uPhase: { value: i * 0.5 },
          uAmp: { value: 0.5 },
          uFreq: { value: 7.0 },
          uTop: { value: new THREE.Color('#c8dce8') },
          uTip: { value: new THREE.Color('#dae8f0') },
          uOpacity: { value: 0.55 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const angle = (i / TENTACLE_COUNT) * Math.PI * 2;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * 0.82, -0.25, Math.sin(angle) * 0.82);
      jelly.add(mesh);
      disposables.push(geo, mat);
    }

    // Frilly oral arms clustered under the bell centre.
    const ORAL_COUNT = 8;
    for (let i = 0; i < ORAL_COUNT; i++) {
      const geo = makeStrandGeometry(2.0, 0.07, 0.14);
      const mat = new THREE.ShaderMaterial({
        vertexShader: STRAND_VERT,
        fragmentShader: STRAND_FRAG,
        uniforms: {
          uTime,
          uLen: { value: 2.0 },
          uPhase: { value: i * 1.0 + 0.4 },
          uAmp: { value: 0.32 },
          uFreq: { value: 10.0 },
          uTop: { value: new THREE.Color('#d0dee8') },
          uTip: { value: new THREE.Color('#adc0d2') },
          uOpacity: { value: 0.72 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const angle = (i / ORAL_COUNT) * Math.PI * 2;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.cos(angle) * 0.22, -0.1, Math.sin(angle) * 0.22);
      jelly.add(mesh);
      disposables.push(geo, mat);
    }

    // Overall jellyfish scale so it reads as a background element, not a hero.
    jelly.scale.setScalar(0.7);
    scene.add(jelly);

    // ---------- Small school of fish ----------
    // Real 3D geometry (elongated ellipsoid body) with a vertex-shader tail
    // wag. Each fish has its own wag phase and random per-fish offset within
    // the school, so no two look alike. The whole school drifts on its own
    // slow path, opposite the jellyfish, and turns to face where it's going.
    const FISH_VERT = /* glsl */ `
      uniform float uTime;
      uniform float uPhase;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec3 p = position;
        // Tail wag: vertices behind the body sway on z.
        float tailFactor = smoothstep(0.0, 1.0, -p.x - 0.15);
        p.z += sin(uTime * 5.5 + uPhase) * tailFactor * 0.42;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vView = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `;
    const FISH_FRAG = /* glsl */ `
      precision highp float;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float fres = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), 1.5);
        vec3 col = vec3(0.72, 0.80, 0.90) + fres * vec3(0.15, 0.18, 0.22);
        float alpha = 0.55 + fres * 0.35;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
      }
    `;

    // Shared fish body: stretched icosphere.
    const fishGeo = new THREE.IcosahedronGeometry(1, 3);
    fishGeo.scale(1.35, 0.35, 0.45);
    disposables.push(fishGeo);

    const school = new THREE.Group();
    const fishInstances = []; // { mesh, offset: {x,y,z}, scale }
    const FISH_COUNT = 7;
    for (let i = 0; i < FISH_COUNT; i++) {
      const mat = new THREE.ShaderMaterial({
        vertexShader: FISH_VERT,
        fragmentShader: FISH_FRAG,
        uniforms: {
          uTime,
          uPhase: { value: Math.random() * Math.PI * 2 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(fishGeo, mat);
      // Loose formation within the school.
      const offset = {
        x: (Math.random() - 0.5) * 2.6,
        y: (Math.random() - 0.5) * 0.9,
        z: (Math.random() - 0.5) * 1.8,
      };
      const s = 0.09 + Math.random() * 0.06;
      mesh.position.set(offset.x, offset.y, offset.z);
      mesh.scale.setScalar(s);
      school.add(mesh);
      fishInstances.push({ mesh, offset, scale: s });
      disposables.push(mat);
    }
    scene.add(school);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.4, 6);

    // ----- Ambient ASCII life -----
    let W = 0, H = 0, cols = 0, rows = 0;
    let bubbles = [];

    // Portrait-style cursor reactivity.
    const cursor = { x: -9999, y: -9999, target: 0, influence: 0 };

    let raf;
    let lastFrame = 0;
    const targetInterval = 1000 / 30;

    const initAmbient = () => {
      const bubCount = Math.floor((cols * rows) / 1400);
      bubbles = Array.from({ length: bubCount }, () => ({
        x: Math.random() * cols,
        y: Math.random() * rows,
        vy: -(0.025 + Math.random() * 0.055),
        drift: 0.001 + Math.random() * 0.003,
        phase: Math.random() * Math.PI * 2,
        r: 0.4 + Math.random() * 0.9,
        alpha: 0.45 + Math.random() * 0.35,
      }));
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      cols = Math.max(20, Math.ceil(W / CELL_W));
      rows = Math.max(10, Math.ceil(H / CELL_H));

      displayCanvas.width = Math.floor(W * dpr);
      displayCanvas.height = Math.floor(H * dpr);
      displayCanvas.style.width = `${W}px`;
      displayCanvas.style.height = `${H}px`;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx.font = `${FONT_SIZE}px 'JetBrains Mono', ui-monospace, "SF Mono", Menlo, Consolas, monospace`;
      dctx.textBaseline = 'top';

      gridCanvas.width = cols;
      gridCanvas.height = rows;
      rayCanvas.width = cols;
      rayCanvas.height = rows;
      kelpCanvas.width = cols;
      kelpCanvas.height = rows;

      // Render three.js at slightly higher res for smoother gradients.
      renderer.setSize(cols * RENDER_SCALE, rows * RENDER_SCALE, false);
      camera.aspect = cols / rows;
      camera.updateProjectionMatrix();

      initAmbient();
      initKelp();
    };

    // Bubbles rising slowly, in the same cool-white palette as the jelly.
    const drawBubbles = () => {
      for (const b of bubbles) {
        gctx.fillStyle = `rgba(226,232,240,${b.alpha})`;
        gctx.beginPath();
        gctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        gctx.fill();
      }
    };

    // Kelp strands.
    // Rooted at the very bottom, short (< ~35% of viewport), swaying in
    // sinuous curves. Two clusters: far left and far right. Painted into
    // their own alpha mask so the ASCII pass can paint them as a single
    // deep-teal hue, independent of anything else in the frame.
    const kelp = [];
    const initKelp = () => {
      kelp.length = 0;
      // Column groups near each edge; heights vary strand to strand.
      const push = (rootX, heightFrac, seed, thickness) =>
        kelp.push({ rootX, heightFrac, seed, thickness });

      // Left cluster
      push(cols * 0.015, 0.12, 1.7, 0.85);
      push(cols * 0.05,  0.08, 3.1, 0.7);
      push(cols * 0.09,  0.14, 5.4, 0.95);
      push(cols * 0.13,  0.07, 7.2, 0.65);

      // Right cluster
      push(cols * 0.87,  0.13, 2.5, 0.95);
      push(cols * 0.91,  0.07, 4.8, 0.7);
      push(cols * 0.955, 0.10, 6.3, 0.8);
      push(cols * 0.99,  0.06, 8.9, 0.65);
    };

    const drawKelp = (t) => {
      kctx.clearRect(0, 0, cols, rows);
      kctx.globalCompositeOperation = 'lighter';

      const secs = t / 1000;
      const baseY = rows;

      for (const s of kelp) {
        const heightPx = rows * s.heightFrac;
        // Sample each row for a smooth strand.
        for (let dy = 0; dy < heightPx; dy++) {
          const y = baseY - dy;
          const tipT = dy / heightPx;
          // Sway grows quadratically from root (fixed) to tip (loose).
          const amp = tipT * tipT * 2.4;
          const swayX =
            Math.sin(secs * 0.45 + s.seed + tipT * 2.2) * amp +
            Math.sin(secs * 0.9 + s.seed * 1.7 + tipT * 4.5) * amp * 0.25;
          // Thin taper toward the tip.
          const thick = s.thickness * (1 - tipT * 0.4);
          // Slight fade at the very top so tips don't clip hard.
          const alpha = 0.75 * (1 - Math.pow(tipT, 3) * 0.5);
          kctx.fillStyle = `rgba(255,255,255,${alpha})`;
          kctx.fillRect(s.rootX + swayX - thick, y, thick * 2, 1);
        }
      }

      kctx.globalCompositeOperation = 'source-over';
    };

    // Scene animation.
    // The jelly follows a wandering Lissajous-plus-noise path. Each frame
    // we take the tangent and rotate the bell so its head leads and the
    // tentacles trail.
    let lastAnimSecs = null;
    let smoothedHeading = 0;

    const noise = (t, seed) =>
      Math.sin(t * 0.13 + seed * 12.9) * 0.5 +
      Math.sin(t * 0.29 + seed * 7.1) * 0.3 +
      Math.sin(t * 0.71 + seed * 3.4) * 0.2;

    // Jelly path: starts off-screen right, drifts across, cycles.
    const pathPoint = (t, frustumW, frustumH) => {
      const x =
        frustumW * 0.62 * Math.cos(t * 0.09) +
        noise(t * 0.32, 1.7) * frustumW * 0.05;
      const y =
        frustumH * 0.32 * Math.sin(t * 0.157 + 1.7) +
        noise(t * 0.41, 2.3) * frustumH * 0.05;
      return { x, y };
    };

    // Ease an angle along the shortest arc so headings blend across the
    // atan2 discontinuity.
    const easeAngle = (current, target, k) => {
      let delta = target - current;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      return current + delta * k;
    };

    let schoolSmoothedHeading = 0;

    // Fish school path: mirror of the jelly, slower frequency so the two
    // creatures never sync up.
    const schoolPathPoint = (t, frustumW, frustumH) => {
      const x =
        -frustumW * 0.58 * Math.cos(t * 0.062) +
        noise(t * 0.27, 4.4) * frustumW * 0.04;
      const y =
        frustumH * 0.28 * Math.sin(t * 0.12 + 2.7) +
        noise(t * 0.35, 5.5) * frustumH * 0.04;
      return { x, y };
    };

    const animateScene = (secs) => {
      uTime.value = secs;
      lastAnimSecs = secs;

      const frustumHeight = 2 * Math.tan((camera.fov / 2) * Math.PI / 180) * 6;
      const frustumWidth = frustumHeight * camera.aspect;

      // ---- Main jellyfish ----
      const here = pathPoint(secs, frustumWidth, frustumHeight);
      const ahead = pathPoint(secs + 0.35, frustumWidth, frustumHeight);
      const dx = ahead.x - here.x;
      const dy = ahead.y - here.y;

      jelly.position.x = here.x;
      jelly.position.y = here.y + Math.sin(secs * 0.6) * 0.06;
      jelly.position.z = noise(secs * 0.14, 3.1) * 0.8;

      const targetHeading = Math.atan2(-dx, dy);
      smoothedHeading = easeAngle(smoothedHeading, targetHeading, 0.08);
      jelly.rotation.z = smoothedHeading;
      jelly.rotation.x = 0;
      jelly.rotation.y = 0;

      const k = Math.sin(secs * 1.65);
      jelly.scale.set(0.7 + k * 0.055, 0.7 - k * 0.06, 0.7 + k * 0.055);

      // ---- Fish school ----
      // Whole group drifts on its own path; each fish rocks slightly within
      // the school for a "flock" feel, and the group turns to face its
      // direction of travel (fish +x is the head/nose of each fish).
      const sHere = schoolPathPoint(secs, frustumWidth, frustumHeight);
      const sAhead = schoolPathPoint(secs + 0.5, frustumWidth, frustumHeight);
      const sdx = sAhead.x - sHere.x;
      const sdy = sAhead.y - sHere.y;

      school.position.x = sHere.x;
      school.position.y = sHere.y;
      school.position.z = 0.6 + noise(secs * 0.11, 6.1) * 0.5;

      // Fish body's +x is the nose , so heading atan2(sdy, sdx) points +x
      // in the travel direction. Ease for smoothness.
      const schoolTarget = Math.atan2(sdy, sdx);
      schoolSmoothedHeading = easeAngle(schoolSmoothedHeading, schoolTarget, 0.06);
      school.rotation.z = schoolSmoothedHeading;

      // Per-fish micro-motion , small bob + roll so the school breathes.
      for (let i = 0; i < fishInstances.length; i++) {
        const f = fishInstances[i];
        const phase = i * 0.9;
        f.mesh.position.y = f.offset.y + Math.sin(secs * 1.4 + phase) * 0.05;
        f.mesh.rotation.z = Math.sin(secs * 2.2 + phase) * 0.08;
      }

      renderer.render(scene, camera);
    };

    // God rays.
    // Rendered into a dedicated canvas as a pure-white intensity mask.
    // The ASCII pass reads the mask and paints matching cells in a fixed
    // warm-cream colour, so rays always read as a single coherent hue no
    // matter what 3D content sits behind them.
    const MAIN_RAY_COUNT = 2;
    const MICRO_RAY_COUNT = 6;
    // Colour applied to any ASCII cell that falls under a ray.
    const RAY_COLOR_MAIN = [255, 226, 196];   // warm cream
    const RAY_COLOR_MICRO = [255, 241, 220];  // one shade up, thin scatter
    // Deep-teal for kelp — sits in the cool palette without introducing
    // saturated green.
    const KELP_COLOR = [90, 140, 128];

    const drawLightRays = (t) => {
      rctx.clearRect(0, 0, cols, rows);
      // Additive so overlapping rays only get brighter, never colour-shift.
      rctx.globalCompositeOperation = 'lighter';

      const sunX = cols * (1.05 + Math.sin(t / 34000) * 0.04);
      const sunY = -rows * 0.30;

      // Main shafts: shorter (~48% down) and slimmer than before so they
      // read as delicate accents in the upper right, not screen-crossing
      // beams.
      const mainBottom = rows * 0.48;
      const mainTargets = [cols * 0.78, cols * 0.9];

      for (let i = 0; i < MAIN_RAY_COUNT; i++) {
        const seed = i * 2.3;
        const baseAngle = (mainTargets[i] - sunX) / (mainBottom - sunY);
        const angle = baseAngle + Math.sin(t / 5800 + seed) * 0.015;
        const topX = sunX + (0 - sunY) * angle;
        const bottomX = sunX + (mainBottom - sunY) * angle;

        // Wide soft halo.
        {
          const wTop = 2.2 + Math.sin(t / 3800 + seed) * 0.5;
          const wBottom = wTop + 2.4;
          const alpha = 0.32 + Math.sin(t / 2400 + seed * 2.1) * 0.05;
          const grad = rctx.createLinearGradient(topX, 0, bottomX, mainBottom);
          grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
          grad.addColorStop(0.55, `rgba(255,255,255,${alpha * 0.5})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          rctx.fillStyle = grad;
          rctx.beginPath();
          rctx.moveTo(topX - wTop, 0);
          rctx.lineTo(topX + wTop, 0);
          rctx.lineTo(bottomX + wBottom, mainBottom);
          rctx.lineTo(bottomX - wBottom, mainBottom);
          rctx.closePath();
          rctx.fill();
        }

        // Narrow brighter core.
        {
          const wTop = 0.35 + Math.sin(t / 3200 + seed * 1.3) * 0.1;
          const wBottom = wTop + 0.7;
          const alpha = 0.5 + Math.sin(t / 2800 + seed * 2.3) * 0.07;
          const grad = rctx.createLinearGradient(topX, 0, bottomX, mainBottom);
          grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
          grad.addColorStop(0.6, `rgba(255,255,255,${alpha * 0.6})`);
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          rctx.fillStyle = grad;
          rctx.beginPath();
          rctx.moveTo(topX - wTop, 0);
          rctx.lineTo(topX + wTop, 0);
          rctx.lineTo(bottomX + wBottom, mainBottom);
          rctx.lineTo(bottomX - wBottom, mainBottom);
          rctx.closePath();
          rctx.fill();
        }
      }

      // Micro-rays: even shorter (~22% down) and hair-thin.
      const microBottom = rows * 0.22;
      for (let i = 0; i < MICRO_RAY_COUNT; i++) {
        const seed = 10 + i * 1.7;
        const t01 = MICRO_RAY_COUNT === 1 ? 0.5 : i / (MICRO_RAY_COUNT - 1);
        const targetX = cols * (0.68 + t01 * 0.28);
        const baseAngle = (targetX - sunX) / (microBottom - sunY);
        const angle = baseAngle + Math.sin(t / 4200 + seed) * 0.02;
        const topX = sunX + (0 - sunY) * angle;
        const bottomX = sunX + (microBottom - sunY) * angle;
        const wTop = 0.14 + Math.sin(t / 2500 + seed * 1.9) * 0.05;
        const wBottom = wTop + 0.32;
        // Micro-rays are tagged via the G channel so the ASCII pass can
        // pick the brighter hue for them.
        const alpha = 0.42 + Math.sin(t / 1900 + seed * 2.7) * 0.07;
        const grad = rctx.createLinearGradient(topX, 0, bottomX, microBottom);
        grad.addColorStop(0, `rgba(0,255,0,${alpha})`);
        grad.addColorStop(0.55, `rgba(0,255,0,${alpha * 0.45})`);
        grad.addColorStop(1, 'rgba(0,255,0,0)');
        rctx.fillStyle = grad;
        rctx.beginPath();
        rctx.moveTo(topX - wTop, 0);
        rctx.lineTo(topX + wTop, 0);
        rctx.lineTo(bottomX + wBottom, microBottom);
        rctx.lineTo(bottomX - wBottom, microBottom);
        rctx.closePath();
        rctx.fill();
      }

      rctx.globalCompositeOperation = 'source-over';
    };

    // ----- Compose one frame on the grid canvas -----
    const paintScene = (t) => {
      const secs = t / 1000;

      // Grid: creatures + bubbles, no rays. Rays live in their own canvas
      // and get applied at the ASCII stage as a hue override.
      gctx.clearRect(0, 0, cols, rows);
      gctx.globalCompositeOperation = 'lighter';
      drawBubbles();
      animateScene(secs);
      gctx.drawImage(threeCanvas, 0, 0, cols * RENDER_SCALE, rows * RENDER_SCALE, 0, 0, cols, rows);
      gctx.globalCompositeOperation = 'source-over';

      // Rays + kelp live in their own alpha masks.
      drawLightRays(t);
      drawKelp(t);
    };

    // ----- Convert grid pixels to ASCII with cursor reactivity -----
    // Preserves per-cell colour by sampling the source pixel , so warm sun
    // rays stamp as warm characters, cool water stamps as cool ones. Colours
    // are quantised in steps of 8 per channel and cached, so setStyle only
    // fires on real colour changes and the loop stays cheap.
    const renderASCII = () => {
      const img = gctx.getImageData(0, 0, cols, rows);
      const data = img.data;
      // Ray mask: R = main-ray intensity (from white fills), G = micro-ray
      // intensity (from green-tagged fills), A = combined coverage.
      const rayImg = rctx.getImageData(0, 0, cols, rows);
      const rayData = rayImg.data;
      // Kelp mask: any channel carries strand coverage.
      const kelpImg = kctx.getImageData(0, 0, cols, rows);
      const kelpData = kelpImg.data;
      const rampLen = RAMP.length;

      dctx.clearRect(0, 0, W, H);

      const inf = cursor.influence;
      const cx = cursor.x;
      const cy = cursor.y;
      const R = 140;
      const R2 = R * R;
      const DISPLACE = 12;
      // Thresholds for a cell to count as under each mask.
      const RAY_THRESHOLD = 24;
      const KELP_THRESHOLD = 30;

      let lastStyleKey = -1;

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Ray + kelp intensities for this cell.
          const rayMain = rayData[idx];
          const rayMicro = rayData[idx + 1];
          const rayStrength = Math.max(rayMain, rayMicro);
          const underRay = rayStrength >= RAY_THRESHOLD;
          const kelpStrength = kelpData[idx];
          const underKelp = kelpStrength >= KELP_THRESHOLD;

          // Combined brightness: base scene plus ray + kelp boosts so
          // both effects get their own dense glyph coverage.
          const sceneBright = 0.299 * r + 0.587 * g + 0.114 * b;
          const bright =
            sceneBright + rayStrength * 0.55 + kelpStrength * 0.45;
          if (bright < 22 && !underRay && !underKelp) continue;

          const rampIdx = Math.min(rampLen - 1, Math.floor((bright / 255) * rampLen));
          let ch = RAMP[rampIdx];
          if (ch === ' ') continue;

          const px = x * CELL_W;
          const py = y * CELL_H;
          let offX = 0;
          let offY = 0;
          let isGlitch = false;

          if (inf > 0.01) {
            const dx = px + CELL_W * 0.5 - cx;
            const dy = py + CELL_H * 0.5 - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const d = Math.sqrt(d2) || 1;
              const f = (1 - d / R) * inf;
              offX = (dx / d) * f * DISPLACE;
              offY = (dy / d) * f * DISPLACE;
              if (Math.random() < f * 0.55) {
                ch = GLITCH[Math.floor(Math.random() * GLITCH.length)];
                isGlitch = true;
              }
            }
          }

          // Colour selection.
          //   - Glitch chars are pure white.
          //   - Kelp wins when there is nothing else in front, painted in
          //     the fixed deep-teal so strands stay a single hue.
          //   - Rays live behind the 3D scene: if there is significant
          //     jellyfish/fish content on top, use its colour and let the
          //     ray only contribute density (from the brightness boost).
          //   - Otherwise, ray cells take the warm-cream tone (main) or
          //     one shade brighter (micro).
          //   - Everything else uses the sampled scene colour, quantised.
          const SCENE_OPAQUE = 26;
          let qr, qg, qb;
          if (isGlitch) {
            qr = 255; qg = 255; qb = 255;
          } else if (underKelp && sceneBright < SCENE_OPAQUE) {
            qr = KELP_COLOR[0] & 0xf8;
            qg = KELP_COLOR[1] & 0xf8;
            qb = KELP_COLOR[2] & 0xf8;
          } else if (underRay && sceneBright < SCENE_OPAQUE) {
            const useMicro = rayMicro > rayMain;
            const c = useMicro ? RAY_COLOR_MICRO : RAY_COLOR_MAIN;
            qr = c[0] & 0xf8;
            qg = c[1] & 0xf8;
            qb = c[2] & 0xf8;
          } else {
            qr = r & 0xf8;
            qg = g & 0xf8;
            qb = b & 0xf8;
          }

          const styleKey = (qr << 16) | (qg << 8) | qb;
          if (styleKey !== lastStyleKey) {
            dctx.fillStyle = `rgb(${qr},${qg},${qb})`;
            lastStyleKey = styleKey;
          }

          dctx.fillText(ch, px + offX, py + offY);
        }
      }
    };

    // ----- Sim tick (bubbles + cursor influence easing) -----
    const update = (t) => {
      cursor.influence += (cursor.target - cursor.influence) * 0.15;
      for (const b of bubbles) {
        b.y += b.vy;
        b.x += Math.sin(t / 800 + b.phase) * b.drift;
        if (b.y < -3) {
          b.y = rows + 3;
          b.x = Math.random() * cols;
        }
      }
    };

    // ----- Cursor input -----
    const onMouseMove = (e) => {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
      cursor.target = 1;
    };
    const onMouseLeave = () => {
      cursor.target = 0;
    };
    const onTouchMove = (e) => {
      if (!e.touches[0]) return;
      cursor.x = e.touches[0].clientX;
      cursor.y = e.touches[0].clientY;
      cursor.target = 1;
    };
    const onTouchEnd = () => {
      cursor.target = 0;
    };

    // ----- Main loop, throttled to 30fps, paused when a panel is open -----
    const loop = (t) => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) return;
      if (t - lastFrame < targetInterval) return;
      lastFrame = t;
      update(t);
      paintScene(t);
      renderASCII();
    };

    resize();
    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (raf) cancelAnimationFrame(raf);
      for (const d of disposables) d.dispose?.();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={displayCanvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
