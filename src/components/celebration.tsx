import confetti from "canvas-confetti";

const TEAM_COLORS = ["#22c55e", "#3b82f6", "#eab308", "#f97316", "#a855f7", "#ec4899"];

function burst(origin: confetti.Options["origin"]) {
  confetti({
    particleCount: 55,
    spread: 65,
    startVelocity: 38,
    origin,
    colors: TEAM_COLORS,
    ticks: 180,
    gravity: 0.9,
    scalar: 0.95,
  });
}

/** Single habit or roadmap block completed. */
export function celebrateCompletion() {
  burst({ x: 0.15, y: 0.72 });
  burst({ x: 0.85, y: 0.72 });
  confetti({
    particleCount: 30,
    spread: 80,
    origin: { x: 0.5, y: 0.55 },
    colors: TEAM_COLORS,
  });
}

/** All blocks in a roadmap day finished. */
export function celebrateDayComplete() {
  const duration = 2800;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 62,
      origin: { x: 0, y: 0.65 },
      colors: TEAM_COLORS,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 62,
      origin: { x: 1, y: 0.65 },
      colors: TEAM_COLORS,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };

  frame();
  setTimeout(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { x: 0.5, y: 0.45 },
      colors: TEAM_COLORS,
    });
  }, 400);
}

/** Every habit for today is done. */
export function celebrateAllHabitsDone() {
  celebrateDayComplete();
}
