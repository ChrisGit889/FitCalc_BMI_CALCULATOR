/* JS Christhio Hermawan 535240050 */
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;
const weightEl = document.getElementById('weight');
const heightEl = document.getElementById('height');
const ageEl = document.getElementById('age');
const maleEl = document.getElementById('male');
const femaleEl = document.getElementById('female');
const calcBtn = document.getElementById('calc');
const resetBtn = document.getElementById('reset');
const copyBtn = document.getElementById('copy');
const bmiText = document.getElementById('bmiText');
const bmiCat = document.getElementById('bmiCat');
const arc = document.getElementById('arc');
const needle = document.getElementById('needle');

let gender = null;
// Buat Darkmode (Penting)
function setThemeDark(isDark) {
  if (isDark) {
    root.classList.add('dark');
    toggle.textContent = '☀️';
    localStorage.setItem('fitcalc-dark', '1');
  } else {
    root.classList.remove('dark');
    toggle.textContent = '🌙';
    localStorage.removeItem('fitcalc-dark');
  }
}

(function initTheme() {
  const has = localStorage.getItem('fitcalc-dark');
  if (has === '1') setThemeDark(true);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setThemeDark(true);
  } else {
    setThemeDark(false);
  }
})();

function calculateBMI(weight, heightCm) {
  const h = heightCm / 100;
  return (weight / (h * h));
}

function categoryAdult(gender, bmi) {
  if (gender === 'male') {
    if (bmi < 20) return 'Underweight';
    else if (bmi < 25) return 'Normal';
    else if (bmi < 30) return 'Overweight';
    else return 'Obese';
  } else if (gender === 'female') {
    if (bmi < 19) return 'Underweight';
    else if (bmi < 24) return 'Normal';
    else if (bmi < 29) return 'Overweight';
    else return 'Obese';
  }
  return '';
}

function categoryChild(gender, bmi, age) {
  let min = 0, max = 0;
  if (age <= 5) { min = 13; max = 17; }
  else if (age <= 8) { min = 13; max = 18; }
  else if (age <= 12) { min = 14; max = 20; }
  else if (age <= 17) { min = 16; max = 22; }

  if (bmi < min) return 'Underweight';
  else if (bmi <= max) return 'Normal';
  else return 'Overweight/Obese';
}

// Animasi jarum (penting)
function animateNeedle(targetAngle) {
  const current = needle.getAttribute('data-angle') || -90;
  const start = parseFloat(current);
  const end = targetAngle;
  const dur = 700;
  const startTime = performance.now();

  function step(t) {
    const p = Math.min((t - startTime) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const angle = start + (end - start) * eased;

    needle.setAttribute('transform', `translate(150,140) rotate(${angle})`);
    needle.setAttribute('data-angle', angle);

    requestAnimationFrame((nt) => { if (p < 1) step(nt); });
  }
  requestAnimationFrame(step);
}

function setArcProgress(percentage) {
  const total = 754;
  const filled = total * Math.max(0, Math.min(1, percentage));
  arc.setAttribute('stroke-dasharray', `${filled} ${total}`);
}

function showResult(bmi, label) {
  if (!isFinite(bmi) || bmi <= 0) {
    bmiText.textContent = '—';
    bmiCat.textContent = 'Masukkan angka valid.';
    animateNeedle(-90);
    setArcProgress(0);
    return;
  }

  const v = Math.round(bmi * 10) / 10;
  bmiText.textContent = v;
  bmiCat.textContent = label;

  let clamped = Math.max(15, Math.min(35, bmi));
  const pct = (clamped - 15) / (35 - 15);
  const angle = -90 + pct * 180;

  animateNeedle(angle);
  setArcProgress(pct);
}


toggle.addEventListener('click', () => setThemeDark(!root.classList.contains('dark')));

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

maleEl?.addEventListener('click', () => {
  gender = 'male';
  maleEl.classList.add('selected');
  femaleEl.classList.remove('selected');
});
femaleEl?.addEventListener('click', () => {
  gender = 'female';
  femaleEl.classList.add('selected');
  maleEl.classList.remove('selected');
});

calcBtn.addEventListener('click', () => {
  const w = parseFloat(weightEl.value);
  const h = parseFloat(heightEl.value);
  const age = parseInt(ageEl?.value || 18);

  if (!w || !h || !gender) {
    showResult(NaN, 'Lengkapi data (berat, tinggi, umur, gender)');
    return;
  }

  const bmi = calculateBMI(w, h);
  let label = '';

  if (age < 18) {
    label = categoryChild(gender, bmi, age);
  } else {
    label = categoryAdult(gender, bmi);
  }

  showResult(bmi, label);
});

resetBtn.addEventListener('click', () => {
  weightEl.value = '';
  heightEl.value = '';
  if (ageEl) ageEl.value = '';
  bmiText.textContent = '—';
  bmiCat.textContent = 'Masukkan data lalu tekan Hitung BMI';
  animateNeedle(-90);
  setArcProgress(0);
});

copyBtn.addEventListener('click', () => {
  const text = bmiText.textContent + ' — ' + bmiCat.textContent;
  if (bmiText.textContent === '—') {
    alert('Belum ada hasil untuk disalin.');
    return;
  }
  navigator.clipboard?.writeText(text).then(() => {
    copyBtn.textContent = 'Tersalin!';
    setTimeout(() => copyBtn.textContent = 'Salin hasil', 1200);
  }).catch(() => alert('Gagal menyalin. Silakan salin manual.'));
});

animateNeedle(-90);
setArcProgress(0);
