const shuffleBtn = document.getElementById('shuffleBtn');
const rocks = document.querySelectorAll('.rock-card');

shuffleBtn.addEventListener('click', () => {
  rocks.forEach(rock => {
    const randomX = Math.floor(Math.random() * 500 - 250);
    const randomY = Math.floor(Math.random() * 300 - 150);
    const randomR = Math.floor(Math.random() * 20 - 10);
    rock.style.setProperty('--x', `${randomX}px`);
    rock.style.setProperty('--y', `${randomY}px`);
    rock.style.setProperty('--r', `${randomR}deg`);
  });
});

const lightBtn = document.getElementById('lightBtn');
let nightMode = false;

lightBtn.addEventListener('click', () => {
  nightMode = !nightMode;
  document.body.classList.toggle('night', nightMode);
});

const linkedRocks = document.querySelectorAll('a.rock-card');

document.addEventListener('mousemove', (e) => {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  linkedRocks.forEach(rock => {
    const rect = rock.getBoundingClientRect();
    const rockX = rect.left + rect.width / 2;
    const rockY = rect.top + rect.height / 2;
    const distance = Math.hypot(mouseX - rockX, mouseY - rockY);

    const glowStrength = Math.max(0, 1 - distance / 200);
    if (glowStrength > 0.2) {
      rock.querySelector('img').style.filter = `drop-shadow(0 0 ${10 * glowStrength}px var(--glow)) drop-shadow(0 0 ${20 * glowStrength}px var(--glow))`;
    } else {
      rock.querySelector('img').style.filter = '';
    }
  });
});
