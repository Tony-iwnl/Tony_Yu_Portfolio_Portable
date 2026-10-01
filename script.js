const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

const dialog = document.querySelector('.lightbox');
const dialogImage = dialog.querySelector('img');
const dialogTitle = dialog.querySelector('#lightbox-title');

document.querySelectorAll('[data-image]').forEach((button) => {
  button.addEventListener('click', () => {
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.dataset.title;
    dialogTitle.textContent = button.dataset.title;
    dialog.showModal();
  });
});

dialog.querySelector('.close-lightbox').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

document.querySelectorAll('.compare').forEach((compare) => {
  let current = Number(compare.getAttribute('aria-valuenow')) / 100;
  let target = current;
  let velocity = 0;
  let dragging = false;
  let lastPointerX = 0;
  let lastPointerTime = performance.now();

  const setTargetFromPointer = (event) => {
    const rect = compare.getBoundingClientRect();
    const next = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const now = performance.now();
    const elapsed = Math.max(8, now - lastPointerTime);
    velocity = (next - target) / elapsed;
    target = next;
    lastPointerX = event.clientX;
    lastPointerTime = now;
  };

  compare.addEventListener('pointerdown', (event) => {
    dragging = true;
    compare.classList.add('dragging');
    compare.setPointerCapture(event.pointerId);
    lastPointerX = event.clientX;
    lastPointerTime = performance.now();
    setTargetFromPointer(event);
  });

  compare.addEventListener('pointermove', (event) => {
    if (dragging) setTargetFromPointer(event);
  });

  const release = (event) => {
    if (!dragging) return;
    dragging = false;
    compare.classList.remove('dragging');
    if (compare.hasPointerCapture(event.pointerId)) compare.releasePointerCapture(event.pointerId);
    target = Math.min(1, Math.max(0, target + velocity * 105));
  };
  compare.addEventListener('pointerup', release);
  compare.addEventListener('pointercancel', release);

  compare.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = 1;
    else target = Math.min(1, Math.max(0, target + (event.key === 'ArrowRight' ? .06 : -.06)));
  });

  const animate = () => {
    const spring = (target - current) * (dragging ? .14 : .075);
    velocity = (velocity + spring) * (dragging ? .66 : .82);
    current += velocity;
    if (!dragging && Math.abs(target - current) < .0002 && Math.abs(velocity) < .0002) {
      current = target;
      velocity = 0;
    }
    current = Math.min(1, Math.max(0, current));
    const percent = current * 100;
    compare.style.setProperty('--split', `${percent}%`);
    compare.setAttribute('aria-valuenow', Math.round(percent));
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
});

window.addEventListener('pointermove', (event) => {
  const x = (event.clientX / window.innerWidth - .5) * 12;
  const y = (event.clientY / window.innerHeight - .5) * 12;
  document.documentElement.style.setProperty('--mx', `${x}px`);
  document.documentElement.style.setProperty('--my', `${y}px`);
}, { passive: true });
