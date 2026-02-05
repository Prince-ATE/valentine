const noBtn = document.getElementById("noBtn");
const yesBtn = document.getElementById("yesBtn");
const hint = document.getElementById("hint");

const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

// FORCE HIDE ON LOAD (guaranteed)
overlay.hidden = true;

let noClicks = 0;

// Make "No" run away
function moveNoButton() {
  const container = document.getElementById("btns");
  const rect = container.getBoundingClientRect();

  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;

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
    "Stop pressing no 😡",
    "Just say yes already 🥺👉👈",
    "Ok now you're doing it on purpose 😭"
  ];
  hint.textContent = msgs[Math.min(noClicks, msgs.length - 1)];
}

// Confetti burst (canvas)
function confettiBurst() {
  const canvas = document.getElementById("confetti");
  const ctx = canvas.getContext("2d");

  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pieces = Array.from({ length: 200 }, () => ({
    x: width / 2,
    y: height / 3,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -10 - 5,
    g: 0.25 + Math.random() * 0.15,
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
      p.a -= 0.007;

      if (p.a <= 0) continue;

      ctx.globalAlpha = Math.max(p.a, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    if (frames < 240) requestAnimationFrame(draw);
  }

  draw();
}

// Desktop: run away when hovered
noBtn.addEventListener("pointerenter", () => {
  noClicks++;
  updateHint();
  moveNoButton();
});

// Mobile: run away when tapped
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  noClicks++;
  updateHint();
  moveNoButton();
});

// YES click
yesBtn.addEventListener("click", () => {
  overlay.hidden = false;
  confettiBurst();
});

// Close
closeBtn.addEventListener("click", () => {
  overlay.hidden = true;
});