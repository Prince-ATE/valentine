const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const hint = document.getElementById("hint");
const btns = document.getElementById("btns");
const card = document.getElementById("card");

const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

// hard guarantee hidden on load
overlay.hidden = true;

let noClicks = 0;

// Track NO position in "btns" coordinate space using translate3d(x,y,0)
let noPos = { x: 120, y: 0 }; // initial (matches CSS)
const dangerRadius = 120;      // how close pointer must be before it flees
const fleeDistanceMin = 170;
const fleeDistanceMax = 320;

// Utility
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function updateHint() {
  const msgs = [
    "Try clicking “No” 👀",
    "Are you sure? 😭",
    "No is not an option 😤",
    "Stop it. I’m getting mad 😡",
    "BRO… WHY 😤",
    "OK NOW YOU’RE DOING IT ON PURPOSE 😭",
    "LAST WARNING 😈",
    "Fine. You can’t catch it 😌"
  ];
  hint.textContent = msgs[Math.min(noClicks, msgs.length - 1)];
}

// Place NO within bounds of the btns container
function setNoPosition(x, y) {
  const rect = btns.getBoundingClientRect();
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // Keep it inside container padding
  const pad = 8;
  const minX = -rect.width / 2 + pad;
  const maxX =  rect.width / 2 - bw - pad;
  const minY = -rect.height / 2 + pad;
  const maxY =  rect.height / 2 - bh - pad;

  noPos.x = clamp(x, minX, maxX);
  noPos.y = clamp(y, minY, maxY);

  noBtn.style.transform = `translate3d(${noPos.x}px, ${noPos.y}px, 0)`;
}

// Make NO flee away from pointer (smoothly)
function fleeFromPointer(clientX, clientY) {
  const rect = btns.getBoundingClientRect();

  // center coordinate system (0,0) at container center
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const px = clientX - cx;
  const py = clientY - cy;

  const dx = noPos.x - px;
  const dy = noPos.y - py;

  const dist = Math.hypot(dx, dy);

  if (dist > dangerRadius) return; // only flee if pointer is close

  // move opposite direction of pointer with some randomness
  const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
  const fleeDist = fleeDistanceMin + Math.random() * (fleeDistanceMax - fleeDistanceMin);

  const nx = noPos.x + Math.cos(angle) * fleeDist;
  const ny = noPos.y + Math.sin(angle) * fleeDist;

  setNoPosition(nx, ny);
}

// Desktop: dodge on pointer move near NO (hard to catch)
btns.addEventListener("pointermove", (e) => {
  // if pointer is near the NO button, flee
  fleeFromPointer(e.clientX, e.clientY);
});

// Also flee on hover/tap attempts
noBtn.addEventListener("pointerenter", (e) => {
  noClicks++;
  updateHint();

  // angry shake after a few tries
  if (noClicks >= 3) {
    card.classList.remove("shake");
    // force reflow so animation restarts reliably
    void card.offsetWidth;
    card.classList.add("shake");
  }

  fleeFromPointer(e.clientX, e.clientY);
});

noBtn.addEventListener("click", (e) => {
  // On touch devices, prevent "click" from catching it
  e.preventDefault();
  noClicks++;
  updateHint();

  if (noClicks >= 3) {
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }

  // send it somewhere else
  const rect = btns.getBoundingClientRect();
  const randomX = (Math.random() - 0.5) * rect.width * 0.9;
  const randomY = (Math.random() - 0.5) * rect.height * 0.8;
  setNoPosition(randomX, randomY);
});

// YES opens big modal + confetti
yesBtn.addEventListener("click", () => {
  overlay.hidden = false;
  confettiBurst();
});

// Close modal
closeBtn.addEventListener("click", () => {
  overlay.hidden = true;
});

// Confetti burst
function confettiBurst() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pieces = Array.from({ length: 260 }, () => ({
    x: width / 2,
    y: height / 3,
    vx: (Math.random() - 0.5) * 13,
    vy: Math.random() * -11 - 5,
    g: 0.25 + Math.random() * 0.18,
    r: 3 + Math.random() * 5,
    a: 1,
    color: `hsl(${Math.random() * 360}, 90%, 60%)`
  }));

  let frames = 0;

  function draw() {
    frames++;
    ctx.clearRect(0, 0, width, height);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.a -= 0.0065;

      if (p.a <= 0) continue;

      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (frames < 280) requestAnimationFrame(draw);
  }

  draw();
}

// Ensure NO position is valid after layout loads/resizes
function initNo() {
  // start somewhat to the right, centered
  setNoPosition(140, 0);
}
window.addEventListener("load", initNo);
window.addEventListener("resize", initNo);
updateHint();