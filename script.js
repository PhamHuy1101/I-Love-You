/* ================== DETECT DEVICE ================== */
const isMobile =
  window.innerWidth < 768 ||
  /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/* ================== BASIC ELEMENTS ================== */
const rotatingContainer = document.getElementById("rotatingContainer");
const galaxy = document.getElementById("galaxy");

/* ================== DATA ================== */
const messages = [
  "I Love You",
  "Happy New Year 2026",
  "Love You 3000",
  "Forever and Always",
  "Chúc năm mới vui vẻ",
  "Mãi bên nhau nhé",
  "Năm mới hạnh phúc",
  "Yêu em nhiều lắm",
];

const imageURLs = [];
for (let i = 1; i <= 14; i++) {
  imageURLs.push(`style/img/Anh (${i}).jpg`);
}

const icons = ["❤️", "🍀", "🌸"];

const maxParticles = isMobile ? 40 : 120;
const activeParticles = new Set();

const colors = [
  "#ff69b4",
  "#ff4757",
  "#ffa502",
  "#fffa65",
  "#2ed573",
  "#1e90ff",
  "#3742fa",
  "#a55eea",
  "#00cec9",
  "#ffffff",
];

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

/* ================== PARTICLES ================== */
function createParticle(type = "text") {
  if (activeParticles.size >= maxParticles) return;

  const el =
    type === "text" ? document.createElement("div") : document.createElement("img");

  if (type === "text") {
    const isIcon = Math.random() < 0.3;
    el.className = "text-particle";
    const color = randomColor();
    el.style.color = color;
    el.style.textShadow = `
      0 0 5px ${color},
      0 0 10px ${color},
      0 0 20px ${color}
    `;
    el.textContent = isIcon
      ? icons[Math.floor(Math.random() * icons.length)]
      : messages[Math.floor(Math.random() * messages.length)];
    el.style.fontSize = (isIcon ? 20 : 18) + Math.random() * 10 + "px";
  } else {
    el.className = "image-particle";
    el.src = imageURLs[Math.floor(Math.random() * imageURLs.length)];
  }

  el.style.opacity = 0;
  rotatingContainer.appendChild(el);

  const w = el.offsetWidth || 40;
  el.style.left = Math.random() * (window.innerWidth - w) + "px";

  const z = -Math.random() * (isMobile ? 300 : 600);
  const startY = window.innerHeight + 50;
  const endY = -50;
  const duration = (isMobile ? 9000 : 7000) + Math.random() * 3000;
  const t0 = performance.now();

  function animate(t) {
    const p = (t - t0) / duration;
    if (p >= 1) {
      el.remove();
      activeParticles.delete(el);
    } else {
      const y = startY + p * (endY - startY);
      const op =
        p < 0.15 ? p * 6 : p > 0.85 ? (1 - p) * 6 : 1;
      el.style.opacity = op;
      el.style.transform = `translate3d(0, ${y}px, ${z}px)`;
      requestAnimationFrame(animate);
    }
  }

  activeParticles.add(el);
  requestAnimationFrame(animate);
}

function loopParticles() {
  let last = 0;
  function tick(t) {
    if (t - last > (isMobile ? 600 : 300)) {
      createParticle("text");
      if (!isMobile && Math.random() < 0.5) createParticle("image");
      last = t;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ================== STARS ================== */
function startStars() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 150;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !isMobile,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  galaxy.appendChild(renderer.domElement);

  const starsCount = isMobile ? 250 : 500;
  const positions = new Float32Array(starsCount * 3);
  const sizes = new Float32Array(starsCount);

  for (let i = 0; i < starsCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
    sizes[i] = Math.random() * 1.5 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xffffff) },
    },
    vertexShader: `
      attribute float size;
      uniform float time;
      varying float vOpacity;
      void main() {
        float twinkle = sin(time + size * 10.0);
        vOpacity = 0.5 + twinkle * 0.4;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(size * (200.0 / -mvPosition.z), 1.0, 5.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vOpacity;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        gl_FragColor = vec4(color, vOpacity);
      }
    `,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);

  function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value += isMobile ? 0.006 : 0.02;
    renderer.render(scene, camera);
  }
  animate();
}

/* ================== ROTATION (PC ONLY) ================== */
function initRotation() {
  if (isMobile) return;

  function updateRotation(x, y) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const rotY = ((x - cx) / cx) * 8;
    const rotX = (-(y - cy) / cy) * 8;
    rotatingContainer.style.transform =
      `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  document.addEventListener("mousemove", (e) =>
    updateRotation(e.clientX, e.clientY)
  );
}

/* ================== MUSIC ================== */
function setupMusic() {
  const audio = new Audio("nhac.mp3");
  audio.loop = true;
  audio.currentTime = 33;
  audio.volume = isMobile ? 0.6 : 0.8;

  let started = false;

  function play() {
    if (started) return;
    audio.play().then(() => {
      started = true;
      document.removeEventListener("click", play);
      document.removeEventListener("touchstart", play);
    });
  }

  document.addEventListener("click", play);
  document.addEventListener("touchstart", play);
}

/* ================== FIREWORKS ================== */
function startFireworks() {
  const canvas = document.getElementById("fireworks");
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const fireworks = [];
  const particles = [];

  class Firework {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height;
      this.targetY = Math.random() * canvas.height * 0.4 + 50;
      this.speed = isMobile ? 4 : 7;
      this.color = randomColor();
    }
    update() {
      this.y -= this.speed;
      if (this.y <= this.targetY) this.explode();
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    explode() {
      for (let i = 0; i < (isMobile ? 30 : 60); i++) {
        particles.push(new Particle(this.x, this.y, this.color));
      }
      this.done = true;
    }
  }

  class Particle {
    constructor(x, y, color) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.x = x;
      this.y = y;
      this.alpha = 1;
      this.color = color;
    }
    update() {
      this.vy += 0.04;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= 0.02;
    }
    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function animate() {
    ctx.fillStyle = isMobile
      ? "rgba(0,0,0,0.35)"
      : "rgba(0,0,0,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (Math.random() < (isMobile ? 0.015 : 0.04)) {
      fireworks.push(new Firework());
    }

    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw();
      if (fireworks[i].done) fireworks.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) particles.splice(i, 1);
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/* ================== START ================== */
window.addEventListener("DOMContentLoaded", () => {
  const countdownEl = document.getElementById("countdown");
  const newYearEl = document.getElementById("newyear");
  const intro = document.getElementById("intro");

  let count = 3;

  const interval = setInterval(() => {
    if (count > 0) {
      setupMusic();
      countdownEl.textContent = count--;
    } else {
      clearInterval(interval);
      countdownEl.style.display = "none";
      setTimeout(() => {
        intro.remove();
        startFireworks();
        startStars();
        loopParticles();
        initRotation();
      }, 1500);
    }
  }, 1000);
});
