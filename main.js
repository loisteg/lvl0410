"use strict";

// Стан квесту
const States = { FOUR: "FOUR", TEN: "TEN", THIRTY_EIGHT: "THIRTY_EIGHT" };
const Targets = {
  [States.FOUR]: 4,
  [States.TEN]: 10,
  [States.THIRTY_EIGHT]: 38,
};

// Тексти (українською)
const Copy = {
  start: "Натисни 4 рази",
  after4: "Щось не вийшло, давай ще раз, натисни 10 разів",
  after10: "Ну давай ще 20+18",
};

// DOM
const intro = document.getElementById("intro");
const startButton = document.getElementById("startButton");
const app = document.getElementById("app");
const instructionEl = document.getElementById("instruction");
const counterEl = document.getElementById("counter");
const heartBtn = document.getElementById("heartButton");
const overlay = document.getElementById("overlay");
const resetBtn = document.getElementById("resetButton");
const slideContainer = document.getElementById("slideshow");

// Runtime
let state = States.FOUR;
let count = 0;
let blockingTap = false;
let slideIndex = 0;
let slideTimer = null;

function vibrate(ms) {
  try {
    if (navigator.vibrate) navigator.vibrate(ms);
  } catch (_) {}
}

function updateInstruction() {
  if (state === States.FOUR) instructionEl.textContent = Copy.start;
  if (state === States.TEN) instructionEl.textContent = Copy.after4;
  if (state === States.THIRTY_EIGHT) instructionEl.textContent = Copy.after10;
}
function updateCounter() {
  counterEl.textContent = `${count}/${Targets[state]}`;
}

function transitionTo(next) {
  heartBtn.classList.remove("pop", "pop-strong", "shake", "explode");
  state = next;
  count = 0;
  updateInstruction();
  updateCounter();
  blockingTap = false;
}

function animatePop(nearingEnd) {
  const cls = nearingEnd ? "pop-strong" : "pop";
  heartBtn.classList.remove("pop", "pop-strong");
  void heartBtn.offsetWidth;
  heartBtn.classList.add(cls);
}
function animatePopStrong() {
  heartBtn.classList.remove("pop", "pop-strong");
  void heartBtn.offsetWidth;
  heartBtn.classList.add("pop-strong");
}
function animateShake() {
  heartBtn.classList.remove("shake");
  void heartBtn.offsetWidth;
  heartBtn.classList.add("shake");
}

function spawnParticles(n) {
  for (let i = 0; i < n; i++) {
    const span = document.createElement("span");
    span.className = "particle";
    const angle = (Math.PI * 2 * i) / n + Math.random() * 0.6 - 0.3;
    const dist = 40 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    span.style.setProperty("--dx", `${dx}px`);
    span.style.setProperty("--dy", `${dy}px`);
    span.style.animation = `particle-fly ${
      380 + Math.random() * 200
    }ms ease-out forwards`;
    heartBtn.appendChild(span);
  }
}
function clearParticles() {
  document.querySelectorAll(".particle").forEach((p) => p.remove());
}

function startSlideshow() {
  if (!slideContainer) return;
  // очистити
  slideContainer.innerHTML = "";
  // 3 випадкові фото (плейсхолдери — однаковий файл)
  const urls = [
    "assets/1.JPEG",
    "assets/2.JPEG",
    "assets/3.jpg",
    "assets/4.jpg",
    "assets/5.jpg",
    "assets/6.jpg",
    "assets/7.jpg",
    "assets/8.jpg",
    "assets/9.jpg",
    "assets/10.jpg",
    "assets/11.jpg",
    "assets/12.jpg",
    "assets/13.jpg",
    "assets/14.jpg",
  ];
  urls.forEach((src, idx) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Фото ${idx + 1}`;
    if (idx === 0) img.classList.add("active");
    slideContainer.appendChild(img);
  });
  const imgs = Array.from(slideContainer.querySelectorAll("img"));
  slideIndex = 0;
  if (slideTimer) clearInterval(slideTimer);
  slideTimer = setInterval(() => {
    const prev = imgs[slideIndex];
    slideIndex = (slideIndex + 1) % imgs.length;
    const next = imgs[slideIndex];
    if (prev) prev.classList.remove("active");
    if (next) next.classList.add("active");
  }, 2200);
}

function showOverlay() {
  overlay.classList.add("show");
  overlay.setAttribute("aria-hidden", "false");
  heartBtn.style.visibility = "hidden";
  instructionEl.style.visibility = "hidden";
  counterEl.style.visibility = "hidden";
  startSlideshow();
  blockingTap = false;
}
function hideOverlay() {
  overlay.classList.remove("show");
  overlay.setAttribute("aria-hidden", "true");
  if (slideTimer) {
    clearInterval(slideTimer);
    slideTimer = null;
  }
}

function finalExplosion() {
  animatePopStrong();
  setTimeout(() => {
    heartBtn.classList.add("shake");
    setTimeout(() => {
      spawnParticles(22);
      heartBtn.classList.add("explode");
      vibrate(30);
      setTimeout(() => {
        showOverlay();
        try {
          if (window.confetti)
            window.confetti({ particleCount: 180, spread: 70 });
        } catch (_) {}
        setTimeout(() => clearParticles(), 480);
      }, 480);
    }, 260);
  }, 140);
}

const onTap = (ev) => {
  ev.preventDefault();
  if (blockingTap) return;
  blockingTap = true;
  const target = Targets[state];
  if (count < target) {
    count += 1;
    const nearingEnd = state === States.THIRTY_EIGHT && count >= target - 5;
    animatePop(nearingEnd);
    vibrate(20);
    updateCounter();
  }
  if (count >= target) {
    if (state === States.FOUR) {
      animateShake();
      setTimeout(() => transitionTo(States.TEN), 220);
    } else if (state === States.TEN) {
      animatePopStrong();
      setTimeout(() => {
        animateShake();
        setTimeout(() => transitionTo(States.THIRTY_EIGHT), 220);
      }, 140);
    } else {
      finalExplosion();
    }
  } else {
    setTimeout(() => {
      blockingTap = false;
    }, 120);
  }
};

heartBtn.addEventListener("pointerdown", onTap, { passive: false });
resetBtn.addEventListener("click", () => {
  resetAll();
});

function resetAll() {
  hideOverlay();
  heartBtn.classList.remove("pop", "pop-strong", "shake", "explode");
  clearParticles();
  state = States.FOUR;
  count = 0;
  updateInstruction();
  updateCounter();
  blockingTap = false;
  heartBtn.style.visibility = "";
  instructionEl.style.visibility = "";
  counterEl.style.visibility = "";
}

// Intro flow
startButton.addEventListener("click", () => {
  intro.classList.add("hidden");
  app.setAttribute("aria-hidden", "false");
});

// Ініціалізація
updateInstruction();
updateCounter();
showOverlay();
