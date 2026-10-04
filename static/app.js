/* ═══════════════════════════════════════════════════════════════
   i18n – Çeviri Sözlüğü
   ═══════════════════════════════════════════════════════════════ */
const TRANSLATIONS = {
  tr: {
    pageTitle:       '🐧 Penguen Sınıflandırıcı',
    heroTitle:       'Penguen Türü Tahmin Et',
    heroSub:         'Ölçümleri girin, sinir ağı modelimiz türü tespit etsin.',
    formTitle:       '📐 Ölçüm Girin',
    labelCulmenLen:  'Gaga Uzunluğu',
    labelCulmenDep:  'Gaga Derinliği',
    labelFlipper:    'Yüzgeç Uzunluğu',
    labelBodyMass:   'Vücut Kütlesi',
    hintCulmenLen:   'Tipik aralık: 32 – 60 mm',
    hintCulmenDep:   'Tipik aralık: 13 – 22 mm',
    hintFlipper:     'Tipik aralık: 172 – 235 mm',
    hintBodyMass:    'Tipik aralık: 2700 – 6300 g',
    labelIsland:     'Ada',
    labelSex:        'Cinsiyet',
    chipFemale:      '♀ Dişi',
    chipMale:        '♂ Erkek',
    btnPredict:      'Tahmin Et',
    loadingText:     'Tahmin ediliyor…',
    resultTitle:     '🎯 Tahmin Sonucu',
    confidenceLabel: 'Güven:',
    btnReset:        'Yeniden Dene',
    errNoIsland:     'Lütfen bir ada seçin.',
    errNoSex:        'Lütfen cinsiyet seçin.',
    errPrefix:       'Hata:',
    footerText:      'Penguin Dataset · PyTorch Sinir Ağı · FastAPI Backend',
  },
  en: {
    pageTitle:       '🐧 Penguin Classifier',
    heroTitle:       'Predict Penguin Species',
    heroSub:         'Enter measurements and let our neural network identify the species.',
    formTitle:       '📐 Enter Measurements',
    labelCulmenLen:  'Culmen Length',
    labelCulmenDep:  'Culmen Depth',
    labelFlipper:    'Flipper Length',
    labelBodyMass:   'Body Mass',
    hintCulmenLen:   'Typical range: 32 – 60 mm',
    hintCulmenDep:   'Typical range: 13 – 22 mm',
    hintFlipper:     'Typical range: 172 – 235 mm',
    hintBodyMass:    'Typical range: 2700 – 6300 g',
    labelIsland:     'Island',
    labelSex:        'Sex',
    chipFemale:      '♀ Female',
    chipMale:        '♂ Male',
    btnPredict:      'Predict',
    loadingText:     'Predicting…',
    resultTitle:     '🎯 Prediction Result',
    confidenceLabel: 'Confidence:',
    btnReset:        'Try Again',
    errNoIsland:     'Please select an island.',
    errNoSex:        'Please select a sex.',
    errPrefix:       'Error:',
    footerText:      'Penguin Dataset · PyTorch Neural Network · FastAPI Backend',
  },
};

/* ═══════════════════════════════════════════════════════════════
   i18n – Dil motoru
   ═══════════════════════════════════════════════════════════════ */
let currentLang = localStorage.getItem('penguinLang') || 'tr';

/** Anahtar için aktif dildeki metni döndür */
function t(key) {
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key])
       ? TRANSLATIONS[currentLang][key]
       : (TRANSLATIONS.tr[key] || key);
}

/** Sayfadaki tüm çevirilebilir elemanları güncelle */
function applyTranslations() {
  /* <html lang> */
  document.documentElement.lang = currentLang;

  /* Tarayıcı sekmesi başlığı */
  document.title = t('pageTitle');

  /* data-i18n → textContent */
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n'));
  });

  /* data-i18n-chip → chip button text */
  document.querySelectorAll('[data-i18n-chip]').forEach(function(el) {
    el.textContent = t(el.getAttribute('data-i18n-chip'));
  });

  /* Dil butonlarının active sınıfını güncelle */
  document.querySelectorAll('.lang-btn').forEach(function(btn) {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

/** Dili değiştir ve kaydet */
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('penguinLang', lang);
  applyTranslations();
}

/* Dil butonlarına tıklama dinleyicisi */
document.querySelectorAll('.lang-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    setLanguage(this.getAttribute('data-lang'));
  });
});

/* Sayfa açılışında çevirileri uygula */
applyTranslations();

/* ═══════════════════════════════════════════════════════════════
   Chip (toggle) selection
   ═══════════════════════════════════════════════════════════════ */
function initChipGroup(groupId, hiddenId) {
  var group  = document.getElementById(groupId);
  var hidden = document.getElementById(hiddenId);
  group.querySelectorAll('.chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      group.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
      hidden.value = chip.getAttribute('data-value');
    });
  });
}

initChipGroup('islandGroup', 'island');
initChipGroup('sexGroup',    'sex');

/* ═══════════════════════════════════════════════════════════════
   Card helpers
   ═══════════════════════════════════════════════════════════════ */
var resultCard = document.getElementById('resultCard');
var errorCard  = document.getElementById('errorCard');

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

/* ═══════════════════════════════════════════════════════════════
   Emoji / Color maps
   ═══════════════════════════════════════════════════════════════ */
var EMOJIS = { Adelie: '🐧', Chinstrap: '🐦', Gentoo: '🦜' };
var COLORS  = {
  Adelie:    'linear-gradient(90deg, #6c63ff, #48b0f7)',
  Chinstrap: 'linear-gradient(90deg, #f7c948, #ff9a3c)',
  Gentoo:    'linear-gradient(90deg, #22d3a0, #48b0f7)',
};

/* ═══════════════════════════════════════════════════════════════
   Form submit
   ═══════════════════════════════════════════════════════════════ */
var form      = document.getElementById('penguinForm');
var submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', async function(e) {
  e.preventDefault();
  hideCards();

  var island = document.getElementById('island').value;
  var sex    = document.getElementById('sex').value;

  if (!island) { showError(t('errNoIsland')); return; }
  if (!sex)    { showError(t('errNoSex'));    return; }

  var payload = {
    culmen_length_mm:  parseFloat(document.getElementById('culmen_length_mm').value),
    culmen_depth_mm:   parseFloat(document.getElementById('culmen_depth_mm').value),
    flipper_length_mm: parseFloat(document.getElementById('flipper_length_mm').value),
    body_mass_g:       parseFloat(document.getElementById('body_mass_g').value),
    island: island,
    sex: sex,
  };

  /* Loading */
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div>&nbsp;' + t('loadingText');

  try {
    var res = await fetch('/predict', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      var errData = await res.json();
      throw new Error(errData.detail || 'HTTP ' + res.status);
    }

    var data = await res.json();
    renderResult(data);
    showResult();

  } catch(err) {
    showError(t('errPrefix') + ' ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">🔮</span>&nbsp;<span data-i18n="btnPredict">' + t('btnPredict') + '</span>';
  }
});

/* ═══════════════════════════════════════════════════════════════
   Render result
   ═══════════════════════════════════════════════════════════════ */
function renderResult(data) {
  var predicted_species = data.predicted_species;
  var confidence        = data.confidence;
  var probabilities     = data.probabilities;

  document.getElementById('resultEmoji').textContent   = EMOJIS[predicted_species] || '🐧';
  document.getElementById('resultSpecies').textContent = predicted_species;
  document.getElementById('resultConfidence').textContent = '%' + confidence.toFixed(1);

  var container = document.getElementById('probBars');
  container.innerHTML = '';

  var maxVal = Math.max.apply(null, Object.values(probabilities));

  Object.entries(probabilities)
    .sort(function(a, b) { return b[1] - a[1]; })
    .forEach(function(entry) {
      var species   = entry[0];
      var prob      = entry[1];
      var isWinner  = (prob === maxVal);
      var color     = COLORS[species] || COLORS.Adelie;
      var emoji     = EMOJIS[species] || '🐧';

      var row = document.createElement('div');
      row.className = 'prob-row';
      row.innerHTML =
        '<div class="prob-header">' +
          '<span class="prob-label">' + emoji + ' ' + species + '</span>' +
          '<span class="prob-value">%' + prob.toFixed(1) + '</span>' +
        '</div>' +
        '<div class="prob-track">' +
          '<div class="prob-fill ' + (isWinner ? 'winner' : '') + '"' +
               ' style="width:0%;background:' + color + ';"' +
               ' data-target="' + prob + '">' +
          '</div>' +
        '</div>';
      container.appendChild(row);
    });

  /* Bar animasyonu */
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      container.querySelectorAll('.prob-fill').forEach(function(fill) {
        fill.style.width = fill.getAttribute('data-target') + '%';
      });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════
   Reset
   ═══════════════════════════════════════════════════════════════ */
document.getElementById('resetBtn').addEventListener('click', function() {
  hideCards();
  form.reset();
  document.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
  document.getElementById('island').value = '';
  document.getElementById('sex').value    = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
