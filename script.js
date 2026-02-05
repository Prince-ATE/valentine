const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const hint = document.getElementById("hint");

const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

let noClicks = 0;

// Make "No" run away (works on desktop + mobile)
function moveNoButton() {
  const container = noBtn.parentElement; // .btns
  const rect = container.getBoundingClientRect();

  // button size
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

  // random position within container bounds
  const pad = 6;
  const x = Math.random() * (rect.width - bw - pad * 2) + pad;
  const y = Math.random() * (rect.height - bh - pad * 2) + pad;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function updateHint() {
  const msgs = [
    "Try clicking “No” 👀",
    "Are you sure? 😭",
    "No is not an option 😤",
    "I’ll keep asking 😌",
    "Just say yes already 🥺👉👈"
  ];
  hint.textContent = msgs[Math.min(noClicks, msgs.length - 1)];
}

// Confetti (simple canvas burst)
function confettiBurst() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: 160 }, () => ({
    x: width / 2,
    y: height / 3,
    vx: (Math.random() - 0.5) * 10,
    vy: Math.random() * -8 - 4,
    g: 0.22 + Math.random() * 0.12,
    r: 3 + Math.random() * 4,
    a: 1
  }));

  let t = 0;
  function frame() {
    t++;
    ctx.clearRect(0, 0, width, height);

    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.a -= 0.008;

      if (p.a <= 0) continue;

      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (t < 220) requestAnimationFrame(frame);
  }

  // random colors by changing fillStyle each particle draw
  const oldFill = ctx.fillStyle;
  pieces.forEach((p, i) => p.color = `hsl(${Math.random()*360}, 90%, 60%)`);
  const originalArc = ctx.arc.bind(ctx);

  ctx.arc = function(x, y, r, s, e) {
    // this hack isn't needed; keep simple
    return originalArc(x, y, r, s, e);
  };

  // draw with per-piece color
  const draw = () => {
    t++;
    ctx.clearRect(0, 0, width, height);
    for (const p of pieces) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.a -= 0.008;
      if (p.a <= 0) continue;

      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = oldFill;

    if (t < 220) requestAnimationFrame(draw);
  };

  draw();
}

noBtn.addEventListener("pointerenter", () => {
  noClicks++;
  updateHint();
  moveNoButton();
});

noBtn.addEventListener("click", (e) => {
  // On touch devices, move on tap too
  e.preventDefault();
  noClicks++;
  updateHint();
  moveNoButton();
});

yesBtn.addEventListener("click", () => {
  overlay.hidden = false;
  confettiBurst();
});

closeBtn.addEventListener("click", () => {
  overlay.hidden = true;
});

// initial hint
updateHint();