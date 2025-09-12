/* JS Christhio Hermawan 535240050 */
const toggle = document.getElementById('themeToggle');
const root = document.documentElement;

function setThemeDark(isDark){
  if(isDark){
    root.classList.add('dark');
    toggle.textContent = '☀️';
    localStorage.setItem('fitcalc-dark', '1');
  } else {
    root.classList.remove('dark');
    toggle.textContent = '🌙';
    localStorage.removeItem('fitcalc-dark');
  }
}

(function(){
  const has = localStorage.getItem('fitcalc-dark');
  if(has === '1') setThemeDark(true);
  else if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setThemeDark(true);
  else setThemeDark(false);
})();
toggle.addEventListener('click', ()=>setThemeDark(!root.classList.contains('dark')));

// smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

const weightEl = document.getElementById('weight');
const heightEl = document.getElementById('height');
const calcBtn = document.getElementById('calc');
const resetBtn = document.getElementById('reset');
const copyBtn = document.getElementById('copy');
const bmiText = document.getElementById('bmiText');
const bmiCat = document.getElementById('bmiCat');
const arc = document.getElementById('arc');
const needle = document.getElementById('needle');

function computeBMI(w, hCm){
  const h = hCm / 100;
  return w / (h*h);
}
function classify(bmi){
  if(bmi === null) return ['—','Masukkan data'];
  if(bmi < 18.5) return ["Underweight", "Berat badan kurang — pertimbangkan konsumsi kalori seimbang"];
  if(bmi < 25) return ["Normal", "Berat badan sehat — pertahankan gaya hidup aktif"];
  if(bmi < 30) return ["Overweight", "Kelebihan berat — olahraga & atur pola makan"];
  return ["Obesitas", "Konsultasikan dengan profesional kesehatan"];
}
function animateNeedle(targetAngle){
  const current = needle.getAttribute('data-angle') || -90;
  const start = parseFloat(current);
  const end = targetAngle;
  const dur = 700;
  const startTime = performance.now();
  function step(t){
    const p = Math.min((t - startTime) / dur, 1);
    const eased = 1 - Math.pow(1-p,3);
    const angle = start + (end - start) * eased;
    needle.setAttribute('transform', `translate(150,140) rotate(${angle})`);
    needle.setAttribute('data-angle', angle);
    requestAnimationFrame((nt)=>{ if(p<1) step(nt); });
  }
  requestAnimationFrame(step);
}
function setArcProgress(percentage){
  const total = 754;
  const filled = total * Math.max(0, Math.min(1, percentage));
  arc.setAttribute('stroke-dasharray', `${filled} ${total}`);
}
function showResult(bmi){
  if(!isFinite(bmi) || bmi <= 0){
    bmiText.textContent = '—';
    bmiCat.textContent = 'Masukkan angka berat & tinggi yang valid.';
    animateNeedle(-90);
    setArcProgress(0);
    return;
  }
  const v = Math.round(bmi * 10) / 10;
  bmiText.textContent = v;
  const [label,desc] = classify(bmi);
  bmiCat.textContent = label + ' — ' + desc;
  const clamped = Math.max(10, Math.min(40, bmi));
  const pct = (clamped - 10) / (40 - 10);
  const angle = -90 + pct * 180;
  animateNeedle(angle);
  setArcProgress(pct);
}
calcBtn.addEventListener('click', ()=>{
  const w = parseFloat(weightEl.value);
  const h = parseFloat(heightEl.value);
  if(!w || !h){ showResult(NaN); return; }
  const bmi = computeBMI(w,h);
  showResult(bmi);
});
resetBtn.addEventListener('click', ()=>{
  weightEl.value = '';
  heightEl.value = '';
  bmiText.textContent = '—';
  bmiCat.textContent = 'Masukkan data lalu tekan Hitung BMI';
  animateNeedle(-90);
  setArcProgress(0);
});
copyBtn.addEventListener('click', ()=>{
  const text = bmiText.textContent + ' — ' + bmiCat.textContent;
  if(bmiText.textContent === '—'){
    alert('Belum ada hasil untuk disalin.');
    return;
  }
  navigator.clipboard?.writeText(text).then(()=>{
    copyBtn.textContent = 'Tersalin!';
    setTimeout(()=>copyBtn.textContent = 'Salin hasil',1200);
  }).catch(()=>alert('Gagal menyalin. Silakan salin manual.'));
});

animateNeedle(-90);
setArcProgress(0);
