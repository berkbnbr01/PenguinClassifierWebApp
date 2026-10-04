/* ─── Chip (toggle) selection ─────────────────── */
function initChipGroup(groupId, hiddenId) {
  const group  = document.getElementById(groupId);
  const hidden = document.getElementById(hiddenId);

  group.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      hidden.value = chip.dataset.value;
    });
  });
}

initChipGroup('islandGroup', 'island');
initChipGroup('sexGroup',    'sex');

/* ─── Helper: show / hide cards ──────────────── */
const resultCard = document.getElementById('resultCard');
const errorCard  = document.getElementById('errorCard');

function showResult() {
  resultCard.classList.remove('hidden');
  errorCard.classList.add('hidden');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function showError(msg) {
  errorCard.classList.remove('hidden');
  resultCard.classList.add('hidden');
  document.getElementById('errorMsg').textContent = msg;
}
function hideCards() {
  resultCard.classList.add('hidden');
  errorCard.classList.add('hidden');
}

/* ─── Emoji map ───────────────────────────────── */
const EMOJIS = { Adelie: '🐧', Chinstrap: '🐦', Gentoo: '🦜' };
const COLORS  = {
  Adelie:    'linear-gradient(90deg, #6c63ff, #48b0f7)',
  Chinstrap: 'linear-gradient(90deg, #f7c948, #ff9a3c)',
  Gentoo:    'linear-gradient(90deg, #22d3a0, #48b0f7)',
};

/* ─── Form submit ─────────────────────────────── */
const form      = document.getElementById('penguinForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideCards();

  /* Validate chip fields */
  const island = document.getElementById('island').value;
  const sex    = document.getElementById('sex').value;

  if (!island) { showError('Lütfen bir ada seçin.'); return; }
  if (!sex)    { showError('Lütfen cinsiyet seçin.'); return; }

  /* Build payload */
  const payload = {
    culmen_length_mm:  parseFloat(document.getElementById('culmen_length_mm').value),
    culmen_depth_mm:   parseFloat(document.getElementById('culmen_depth_mm').value),
    flipper_length_mm: parseFloat(document.getElementById('flipper_length_mm').value),
    body_mass_g:       parseFloat(document.getElementById('body_mass_g').value),
    island,
    sex,
  };

  /* Loading state */
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Tahmin ediliyor…';

  try {
    const res  = await fetch('/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderResult(data);
    showResult();

  } catch (err) {
    showError(`Hata: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">🔮</span> Tahmin Et';
  }
});

/* ─── Render result ───────────────────────────── */
function renderResult(data) {
  const { predicted_species, confidence, probabilities } = data;

  document.getElementById('resultEmoji').textContent    = EMOJIS[predicted_species] ?? '🐧';
  document.getElementById('resultSpecies').textContent  = predicted_species;
  document.getElementById('resultConfidence').textContent = `%${confidence.toFixed(1)}`;

  /* Probability bars */
  const container = document.getElementById('probBars');
  container.innerHTML = '';

  const maxVal = Math.max(...Object.values(probabilities));

  Object.entries(probabilities)
    .sort((a, b) => b[1] - a[1])
    .forEach(([species, prob]) => {
      const isWinner = prob === maxVal;
      const color    = COLORS[species] ?? COLORS.Adelie;

      const row = document.createElement('div');
      row.className = 'prob-row';
      row.innerHTML = `
        <div class="prob-header">
          <span class="prob-label">${EMOJIS[species] ?? '🐧'} ${species}</span>
          <span class="prob-value">%${prob.toFixed(1)}</span>
        </div>
        <div class="prob-track">
          <div class="prob-fill ${isWinner ? 'winner' : ''}"
               style="width: 0%; background: ${color};"
               data-target="${prob}">
          </div>
        </div>`;
      container.appendChild(row);
    });

  /* Animate bars after DOM paint */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      container.querySelectorAll('.prob-fill').forEach(fill => {
        fill.style.width = `${fill.dataset.target}%`;
      });
    });
  });
}

/* ─── Reset ───────────────────────────────────── */
document.getElementById('resetBtn').addEventListener('click', () => {
  hideCards();
  form.reset();
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  document.getElementById('island').value = '';
  document.getElementById('sex').value    = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
