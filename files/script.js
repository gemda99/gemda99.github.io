/* =====================================================================
   ANIVERSARIO — script.js
   JavaScript puro, sin librerías externas.
   Todo el contenido personalizable está agrupado en CONFIG (abajo).
===================================================================== */

/* =====================================================================
   0. CONFIGURACIÓN — EDITA SOLO ESTA SECCIÓN PARA PERSONALIZAR TODO
===================================================================== */
const CONFIG = {
  // 💛 Nombre de la persona (por ahora no se muestra en el texto, pero
  // queda listo por si quieres usarlo en algún mensaje, ej: `Hola ${CONFIG.name}`)
  name: "Amor",

  // 📅 Fecha en la que empezó la relación (formato: "AAAA-MM-DD")
  // El contador de la Pantalla 3 se calcula automáticamente a partir de esta fecha.
  // Ajustada para que hoy marque: 0 años, 4 meses, 0 días.
  anniversaryDate: "2026-03-15",

  // 💬 Frases secuenciales de la Pantalla 2 (se muestran una por una)
  sequentialPhrases: [
    "Hemos compartido muchos momentos.",
    "Algunos felices.",
    "Otros difíciles.",
    "Pero siempre seguimos caminando juntos.",
    "Y hoy celebramos un mes más."
  ],

  // ⏱️ Duración (en milisegundos) que permanece cada frase en pantalla
  phraseDuration: 3000,

  // 🎁 Datos del regalo final
  gift: {
    title: "Una sesión de borrado láser de cejas",
    description:
      "Porque quiero verte feliz y porque tu sonrisa siempre será uno de mis lugares favoritos."
  },

  // 🎨 Cantidad de partículas doradas flotando de fondo
  particleCount: 60,

  // 💛 Cantidad de corazones flotando lentamente de fondo
  backgroundHeartCount: 12
};

/* =====================================================================
   1. ESTADO GENERAL Y REFERENCIAS DEL DOM
===================================================================== */
const totalScreens = 6;
let currentScreen = 1;

const appEl = document.getElementById("app");
const progressBar = document.getElementById("progress-bar");
const restartBtn = document.getElementById("restart-btn");

/* =====================================================================
   2. NAVEGACIÓN ENTRE PANTALLAS
===================================================================== */

/**
 * Muestra la pantalla indicada y oculta las demás.
 * También actualiza la barra de progreso superior.
 * @param {number} screenNumber
 */
function showScreen(screenNumber) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(`screen-${screenNumber}`);
  if (!target) return;

  target.classList.add("active");
  currentScreen = screenNumber;
  updateProgressBar();

  // Dispara la lógica específica de cada pantalla al entrar en ella
  handleScreenEnter(screenNumber);
}

/** Actualiza el ancho de la barra de progreso según la pantalla actual */
function updateProgressBar() {
  const percent = (currentScreen / totalScreens) * 100;
  progressBar.style.width = `${percent}%`;
}

/** Lógica que se ejecuta cada vez que se entra a una pantalla nueva */
function handleScreenEnter(screenNumber) {
  switch (screenNumber) {
    case 2:
      startSequentialPhrases();
      break;
    case 3:
      revealElementsIn(document.getElementById("screen-3"));
      animateCounter();
      break;
    case 4:
      revealElementsIn(document.getElementById("screen-4"));
      break;
    case 5:
      revealElementsIn(document.getElementById("screen-5"));
      break;
    default:
      break;
  }
}

/* Botones de navegación con atributo data-next="N" */
document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const next = parseInt(btn.getAttribute("data-next"), 10);
    showScreen(next);
  });
});

/* =====================================================================
   3. PANTALLA 1 — INTRO (secuencia de frases + botón)
===================================================================== */
function initIntroSequence() {
  // Las frases y el botón ya tienen la animación CSS "fadeInUp" aplicada
  // con delays escalonados definidos abajo mediante JS (más flexible que
  // depender solo de animation-delay fijo en CSS).
  const lines = document.querySelectorAll("#screen-1 .fade-line");
  const startBtn = document.getElementById("start-btn");

  const delays = [300, 2300, 4300]; // ms: aparecen escalonadas
  lines.forEach((line, i) => {
    line.style.animationDelay = `${delays[i] || 0}ms`;
  });

  // El botón "Comenzar" aparece después de la última frase
  setTimeout(() => {
    startBtn.style.transition = "opacity 1s ease, transform 1s ease";
    startBtn.style.opacity = "1";
    startBtn.style.transform = "translateY(0)";
  }, 6200);

  // Estado inicial del botón (antes de aparecer)
  startBtn.style.transform = "translateY(10px)";
}

document.getElementById("start-btn").addEventListener("click", () => {
  showScreen(2);
});

/* =====================================================================
   4. PANTALLA 2 — FRASES SECUENCIALES (fade in / fade out)
===================================================================== */
let phraseTimeoutId = null;

function startSequentialPhrases() {
  const phraseEl = document.getElementById("phrase-text");
  const phrases = CONFIG.sequentialPhrases;
  let index = 0;

  // Limpia cualquier secuencia previa (por si se reinicia la experiencia)
  clearTimeout(phraseTimeoutId);
  phraseEl.classList.remove("show");
  phraseEl.textContent = "";

  function showNextPhrase() {
    // Si el usuario ya salió de la pantalla 2, detenemos la secuencia
    if (currentScreen !== 2) return;

    phraseEl.classList.remove("show");

    phraseTimeoutId = setTimeout(() => {
      if (currentScreen !== 2) return;

      phraseEl.textContent = phrases[index];
      // Forzamos reflow para reiniciar la transición CSS correctamente
      void phraseEl.offsetWidth;
      phraseEl.classList.add("show");

      index++;

      if (index < phrases.length) {
        phraseTimeoutId = setTimeout(showNextPhrase, CONFIG.phraseDuration);
      } else {
        // Última frase: esperamos un poco más y avanzamos automáticamente
        phraseTimeoutId = setTimeout(() => {
          if (currentScreen === 2) showScreen(3);
        }, CONFIG.phraseDuration + 500);
      }
    }, 400); // pequeña pausa para el fade-out antes del fade-in
  }

  showNextPhrase();
}

/* =====================================================================
   5. PANTALLA 3 — CONTADOR DE TIEMPO JUNTOS
===================================================================== */

/**
 * Calcula el total de MESES completos (sin dividir en años) y los días
 * restantes transcurridos desde CONFIG.anniversaryDate hasta hoy.
 * Preparado para que solo se necesite cambiar la fecha en CONFIG.
 * Ej: si pasaron 16 meses, se mostrará "16 meses" (no "1 año 4 meses").
 */
function calculateTimeTogether() {
  const start = new Date(CONFIG.anniversaryDate);
  const now = new Date();

  // Meses completos transcurridos (acumulados, sin reiniciar cada 12)
  let totalMonths =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  let days = now.getDate() - start.getDate();

  if (days < 0) {
    totalMonths -= 1;
    // Días del mes anterior al mes actual
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (totalMonths < 0) totalMonths = 0; // seguridad ante fechas futuras

  return { totalMonths, days };
}

/** Anima los números del contador con un efecto de conteo ascendente */
function animateCounter() {
  const { totalMonths, days } = calculateTimeTogether();

  animateNumber("count-months", totalMonths);
  animateNumber("count-days", days);
}

function animateNumber(elementId, targetValue) {
  const el = document.getElementById(elementId);
  const duration = 1200; // ms
  const frameRate = 30;
  const totalFrames = Math.round((duration / 1000) * frameRate);
  let frame = 0;

  // Si el valor objetivo es 0, lo mostramos directamente
  if (targetValue === 0) {
    el.textContent = "0";
    return;
  }

  const counterInterval = setInterval(() => {
    frame++;
    const progress = frame / totalFrames;
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(eased * targetValue);
    el.textContent = current;

    if (frame >= totalFrames) {
      el.textContent = targetValue;
      clearInterval(counterInterval);
    }
  }, 1000 / frameRate);
}

/* =====================================================================
   6. REVELADO DE ELEMENTOS (".reveal-el") ESCALONADO
===================================================================== */

/**
 * Revela con animación escalonada todos los elementos ".reveal-el"
 * dentro de un contenedor dado. Se usa al entrar en pantallas 3, 4 y 5.
 */
function revealElementsIn(container) {
  if (!container) return;
  const elements = container.querySelectorAll(".reveal-el");
  elements.forEach((el, i) => {
    el.classList.remove("is-visible");
    // Forzamos reflow para poder reiniciar la animación si se reinicia la experiencia
    void el.offsetWidth;
    setTimeout(() => {
      el.classList.add("is-visible");
    }, 150 * i + 100);
  });
}

/* =====================================================================
   7. PANTALLA 5 — DESCUBRIR REGALO / CAJA ANIMADA
===================================================================== */
const discoverBtn = document.getElementById("discover-btn");
const giftBoxWrapper = document.getElementById("gift-box-wrapper");
const giftBox = document.getElementById("gift-box");

discoverBtn.addEventListener("click", () => {
  playGiftSound();

  // Ocultamos el botón grande con una transición suave
  discoverBtn.classList.add("hidden-btn");

  // Mostramos la caja de regalo
  giftBoxWrapper.hidden = false;

  // Pequeño delay para que la caja "aparezca" y luego se abra
  setTimeout(() => {
    giftBox.classList.add("opened");
  }, 500);

  // Después de la animación de apertura, pasamos a la pantalla final
  setTimeout(() => {
    showScreen(6);
  }, 2600);
});

/**
 * Reproduce el sonido mágico al abrir el regalo.
 * 🔊 Para activarlo:
 *   1) Coloca tu archivo de audio en /assets/ (ej: assets/sonido-magico.mp3)
 *   2) Descomenta la etiqueta <audio id="gift-sound"> en index.html
 *   3) Descomenta las líneas de abajo
 */
function playGiftSound() {
  const sound = document.getElementById("gift-sound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {
      /* Los navegadores pueden bloquear el autoplay sin interacción previa;
         como este sonido se dispara con un clic, normalmente funcionará. */
    });
  }
}

/* =====================================================================
   8. PANTALLA FINAL — TEXTOS, CONFETI Y CORAZONES
===================================================================== */
function playFinalSequence() {
  const title = document.getElementById("final-title");
  const sub = document.getElementById("final-sub");
  const giftCard = document.getElementById("gift-reveal-card");
  const giftTitle = document.getElementById("gift-title");
  const giftDescription = document.getElementById("gift-description");

  // Aplicamos los textos del regalo desde CONFIG (fácil de personalizar)
  giftTitle.textContent = CONFIG.gift.title;
  giftDescription.textContent = CONFIG.gift.description;

  // Reiniciamos estados por si la experiencia se reinicia
  title.classList.remove("show");
  sub.classList.remove("show");
  giftCard.classList.remove("show");
  void title.offsetWidth;

  // Secuencia escalonada de aparición
  setTimeout(() => title.classList.add("show"), 200);
  setTimeout(() => sub.classList.add("show"), 1600);
  setTimeout(() => giftCard.classList.add("show"), 2800);

  // Lanzamos el confeti, los fuegos artificiales y los destellos al entrar a la pantalla final
  launchConfetti();
  launchFireworks();
  createSparkles();
}

document.getElementById("love-btn").addEventListener("click", () => {
  spawnFallingHearts();
});

/* --- Confeti animado con <canvas> (sin librerías externas) --- */
const confettiCanvas = document.getElementById("confetti-canvas");
const confettiCtx = confettiCanvas.getContext("2d");
let confettiParticles = [];
let confettiAnimationId = null;

/* --- Fuegos artificiales dorados con <canvas> --- */
const fireworksCanvas = document.getElementById("fireworks-canvas");
const fireworksCtx = fireworksCanvas.getContext("2d");
let fireworkBursts = [];
let fireworksAnimationId = null;

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}

function launchConfetti() {
  resizeConfettiCanvas();
  const colors = ["#d4af37", "#f4e2a1", "#ffffff", "#b8860b"];
  confettiParticles = [];

  const count = window.innerWidth < 600 ? 90 : 160;

  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.5,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 2 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotationSpeed: Math.random() * 6 - 3,
      opacity: 1,
      shape: Math.random() > 0.5 ? "circle" : "rect"
    });
  }

  let elapsedFrames = 0;
  const maxFrames = 420; // aprox. 7 segundos a 60fps

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (elapsedFrames > maxFrames - 90) {
        p.opacity -= 0.012; // desvanecimiento final
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(p.opacity, 0);
      confettiCtx.fillStyle = p.color;

      if (p.shape === "circle") {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      confettiCtx.restore();
    });

    elapsedFrames++;

    if (elapsedFrames < maxFrames) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  cancelAnimationFrame(confettiAnimationId);
  animateConfetti();
}

/**
 * Crea una sola explosión de fuegos artificiales en un punto (x, y).
 * Se usa varias veces con distintos retrasos para un efecto extravagante.
 */
function createFireworkBurst(x, y) {
  const colors = ["#d4af37", "#f4e2a1", "#ffffff", "#fff8e0"];
  const particleCount = 46;
  const burst = [];

  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = Math.random() * 3.5 + 2;
    burst.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 2.5 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1
    });
  }

  fireworkBursts.push(burst);
}

/** Dispara varias explosiones de fuegos artificiales escalonadas en el tiempo */
function launchFireworks() {
  const positionsCount = 5;

  for (let i = 0; i < positionsCount; i++) {
    setTimeout(() => {
      const x = fireworksCanvas.width * (0.2 + Math.random() * 0.6);
      const y = fireworksCanvas.height * (0.15 + Math.random() * 0.35);
      createFireworkBurst(x, y);
    }, i * 550);
  }

  cancelAnimationFrame(fireworksAnimationId);
  animateFireworks();
}

function animateFireworks() {
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  fireworkBursts.forEach((burst) => {
    burst.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.035; // gravedad suave
      p.vx *= 0.985; // fricción del aire
      p.vy *= 0.985;
      p.life -= 0.014;

      if (p.life > 0) {
        fireworksCtx.save();
        fireworksCtx.globalAlpha = Math.max(p.life, 0);
        fireworksCtx.fillStyle = p.color;
        fireworksCtx.beginPath();
        fireworksCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        fireworksCtx.fill();
        fireworksCtx.restore();
      }
    });
  });

  // Eliminamos explosiones que ya se apagaron por completo
  fireworkBursts = fireworkBursts.filter((burst) => burst.some((p) => p.life > 0));

  if (fireworkBursts.length > 0 || currentScreen === 6) {
    fireworksAnimationId = requestAnimationFrame(animateFireworks);
  } else {
    fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  }
}

/** Genera pequeñas estrellitas doradas que titilan de fondo en la pantalla final */
function createSparkles() {
  const container = document.getElementById("sparkles-container");
  container.innerHTML = "";
  const sparkleCount = 26;
  const symbols = ["✦", "✧", "⋆", "✨"];

  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.fontSize = `${0.6 + Math.random() * 1.1}rem`;
    sparkle.style.animationDuration = `${2 + Math.random() * 3}s`;
    sparkle.style.animationDelay = `${Math.random() * 4}s`;
    container.appendChild(sparkle);
  }
}


function spawnFallingHearts() {
  const container = document.getElementById("falling-hearts-container");
  const heartCount = 26;

  for (let i = 0; i < heartCount; i++) {
    setTimeout(() => {
      const heart = document.createElement("span");
      heart.className = "falling-heart";
      heart.textContent = Math.random() > 0.5 ? "❤️" : "💛";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.fontSize = `${1 + Math.random() * 1.4}rem`;
      heart.style.animationDuration = `${3 + Math.random() * 2.5}s`;
      container.appendChild(heart);

      // Limpieza: eliminamos el corazón del DOM al terminar su animación
      heart.addEventListener("animationend", () => heart.remove());
    }, i * 90);
  }
}

/* =====================================================================
   9. PARTÍCULAS DORADAS DE FONDO (<canvas>)
===================================================================== */
const particlesCanvas = document.getElementById("particles-canvas");
const particlesCtx = particlesCanvas.getContext("2d");
let particles = [];

function resizeParticlesCanvas() {
  particlesCanvas.width = window.innerWidth;
  particlesCanvas.height = window.innerHeight;
}

function createParticles() {
  particles = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push({
      x: Math.random() * particlesCanvas.width,
      y: Math.random() * particlesCanvas.height,
      radius: Math.random() * 1.6 + 0.4,
      speedY: Math.random() * 0.25 + 0.05,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.5 + 0.15
    });
  }
}

function animateParticles() {
  particlesCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

  particles.forEach((p) => {
    p.y -= p.speedY;
    p.x += p.speedX;

    // Si la partícula sale por arriba, reaparece abajo (loop infinito)
    if (p.y < -10) {
      p.y = particlesCanvas.height + 10;
      p.x = Math.random() * particlesCanvas.width;
    }

    particlesCtx.beginPath();
    particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    particlesCtx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
    particlesCtx.fill();
  });

  requestAnimationFrame(animateParticles);
}

/* =====================================================================
   10. CORAZONES FLOTANDO LENTAMENTE (fondo, HTML + CSS)
===================================================================== */
function createBackgroundHearts() {
  const container = document.getElementById("hearts-container");
  container.innerHTML = "";

  for (let i = 0; i < CONFIG.backgroundHeartCount; i++) {
    const heart = document.createElement("span");
    heart.className = "floating-heart";
    heart.textContent = "❤";
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.fontSize = `${0.8 + Math.random() * 1.6}rem`;
    heart.style.setProperty("--drift", `${Math.random() * 60 - 30}px`);
    heart.style.animationDuration = `${16 + Math.random() * 14}s`;
    heart.style.animationDelay = `${Math.random() * 12}s`;
    container.appendChild(heart);
  }
}

/* =====================================================================
   11. CURSOR PERSONALIZADO
===================================================================== */
function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  const follower = document.getElementById("custom-cursor-follower");

  // En dispositivos táctiles no inicializamos el cursor personalizado
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  // El "follower" se mueve con un pequeño retraso (efecto elegante)
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;
    follower.style.left = `${followerX}px`;
    follower.style.top = `${followerY}px`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Efecto hover sobre elementos interactivos
  const interactiveSelector = "button, a, .icon-btn";
  document.body.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) {
      follower.classList.add("cursor-hover");
    }
  });
  document.body.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelector)) {
      follower.classList.remove("cursor-hover");
    }
  });
}

/* =====================================================================
   12. EFECTO PARALLAX SUTIL (movimiento del mouse)
===================================================================== */
function initParallax() {
  if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2; // -1 a 1
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const activeCard = document.querySelector(".screen.active .glass-card");
    if (activeCard) {
      activeCard.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
    }
  });
}

/* =====================================================================
   13. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
   (Preparado por si en el futuro se agrega contenido con scroll propio;
   actualmente cada pantalla ocupa el 100% del viewport, pero esta función
   queda lista y reutilizable para cualquier elemento con la clase
   "scroll-reveal" que se agregue más adelante).
===================================================================== */
function initScrollReveal() {
  const scrollElements = document.querySelectorAll(".scroll-reveal");
  if (!scrollElements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.25 }
  );

  scrollElements.forEach((el) => observer.observe(el));
}

/* =====================================================================
   14. REINICIAR LA EXPERIENCIA
===================================================================== */
function restartExperience() {
  // Detenemos secuencias activas
  clearTimeout(phraseTimeoutId);
  cancelAnimationFrame(confettiAnimationId);
  cancelAnimationFrame(fireworksAnimationId);
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  fireworkBursts = [];
  document.getElementById("sparkles-container").innerHTML = "";

  // Reseteamos elementos de la pantalla 5 (caja de regalo)
  giftBox.classList.remove("opened");
  giftBoxWrapper.hidden = true;
  discoverBtn.classList.remove("hidden-btn");

  // Limpiamos corazones cayendo
  document.getElementById("falling-hearts-container").innerHTML = "";

  // Reseteamos textos de la pantalla final
  document.getElementById("final-title").classList.remove("show");
  document.getElementById("final-sub").classList.remove("show");
  document.getElementById("gift-reveal-card").classList.remove("show");

  // Reseteamos elementos revelados de pantallas 3 y 4
  document.querySelectorAll(".reveal-el").forEach((el) => {
    el.classList.remove("is-visible");
  });

  // Volvemos a la pantalla 1 y reiniciamos su secuencia de intro
  showScreen(1);
  initIntroSequence();
}

restartBtn.addEventListener("click", restartExperience);

/* =====================================================================
   15. OBSERVADOR: cuando entra la pantalla final, disparamos su secuencia
===================================================================== */
const originalShowScreen = showScreen;
showScreen = function (screenNumber) {
  originalShowScreen(screenNumber);
  if (screenNumber === 6) {
    playFinalSequence();
  }
};

/* =====================================================================
   16. INICIALIZACIÓN GENERAL
===================================================================== */
function init() {
  resizeParticlesCanvas();
  resizeConfettiCanvas();
  createParticles();
  animateParticles();
  createBackgroundHearts();
  initCustomCursor();
  initParallax();
  initScrollReveal();
  initIntroSequence();
  updateProgressBar();
}

window.addEventListener("resize", () => {
  resizeParticlesCanvas();
  resizeConfettiCanvas();
});

document.addEventListener("DOMContentLoaded", init);
