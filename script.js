/* ==========================================================================
   H BURGER - Interactive Script & Client-side QR Code Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Auto-detect current page URL for QR Code (or fallback to placeholder netlify url)
  const currentUrl = window.location.href.includes('http') 
    ? window.location.href 
    : 'https://hburger-menu.netlify.app';

  const qrUrlInput = document.getElementById('qrUrlInput');
  if (qrUrlInput) {
    qrUrlInput.value = currentUrl;
  }

  // Initialize QR Code Generator
  initQrCodeEngine();

  // Initialize Price Overlay Engine
  initPriceBadges();

  // ScrollSpy for page pills
  initScrollSpy();
});

/* --------------------------------------------------------------------------
   QR Code Generation & Table Stand Engine
   -------------------------------------------------------------------------- */
let qrcodeInstance = null;

function initQrCodeEngine() {
  const qrUrlInput = document.getElementById('qrUrlInput');
  const tableNumInput = document.getElementById('tableNumInput');
  const previewTableLabel = document.getElementById('previewTableLabel');
  const qrcodeContainer = document.getElementById('qrcodeCanvas');
  const standColorBar = document.getElementById('standColorBar');
  const colorSwatches = document.querySelectorAll('.color-swatch');

  function renderQr() {
    if (!qrcodeContainer) return;
    const url = qrUrlInput.value.trim() || 'https://hburger-menu.netlify.app';
    
    qrcodeContainer.innerHTML = '';
    
    if (typeof QRCode !== 'undefined') {
      qrcodeInstance = new QRCode(qrcodeContainer, {
        text: url,
        width: 180,
        height: 180,
        colorDark: "#121316",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Fallback API if library script fails to load
      qrcodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}" alt="QR Code">`;
    }
  }

  renderQr();

  // Live URL input update
  if (qrUrlInput) {
    qrUrlInput.addEventListener('input', renderQr);
  }

  // Live Table label update
  if (tableNumInput && previewTableLabel) {
    tableNumInput.addEventListener('input', (e) => {
      previewTableLabel.textContent = e.target.value.toUpperCase() || 'TABLE 01';
    });
  }

  // Color Swatch changes
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const color = swatch.getAttribute('data-color');
      if (standColorBar) standColorBar.style.background = color;
    });
  });

  // Modal Toggle
  const openQrBtn = document.getElementById('openQrModalBtn');
  const closeQrBtn = document.getElementById('closeQrModalBtn');
  const qrModal = document.getElementById('qrModal');

  if (openQrBtn && qrModal) {
    openQrBtn.addEventListener('click', () => {
      qrModal.style.display = 'flex';
      renderQr();
    });
  }
  if (closeQrBtn && qrModal) {
    closeQrBtn.addEventListener('click', () => {
      qrModal.style.display = 'none';
    });
  }

  // Print Table Stand
  const printStandBtn = document.getElementById('printStandBtn');
  if (printStandBtn) {
    printStandBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Download QR Code PNG
  const downloadQrBtn = document.getElementById('downloadQrBtn');
  if (downloadQrBtn) {
    downloadQrBtn.addEventListener('click', () => {
      const img = qrcodeContainer.querySelector('img') || qrcodeContainer.querySelector('canvas');
      if (img) {
        let imgSrc = img.src;
        if (img.tagName.toLowerCase() === 'canvas') {
          imgSrc = img.toDataURL("image/png");
        }
        const a = document.createElement('a');
        a.href = imgSrc;
        a.download = `H_Burger_QR_${tableNumInput ? tableNumInput.value.replace(/\s+/g, '_') : 'Table'}.png`;
        a.click();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   Lightbox Zoom Viewer
   -------------------------------------------------------------------------- */
function openLightbox(src, captionText) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');

  if (modal && img) {
    img.src = src;
    if (caption) caption.textContent = captionText || 'Menu Page';
    modal.style.display = 'flex';
  }
}

function closeLightbox(event, force = false) {
  const modal = document.getElementById('lightboxModal');
  if (force || (event && event.target.id === 'lightboxModal')) {
    if (modal) modal.style.display = 'none';
  }
}

/* --------------------------------------------------------------------------
   Price Badge Overlay Manager
   -------------------------------------------------------------------------- */
let activeBadges = JSON.parse(localStorage.getItem('hburger_price_badges') || '[]');

function initPriceBadges() {
  const priceModal = document.getElementById('priceModal');
  const toggleBtn = document.getElementById('togglePriceOverlayBtn');
  const closeBtn = document.getElementById('closePriceModalBtn');
  const form = document.getElementById('priceBadgeForm');

  if (toggleBtn && priceModal) {
    toggleBtn.addEventListener('click', () => {
      priceModal.style.display = 'flex';
      renderBadgesList();
    });
  }
  if (closeBtn && priceModal) {
    closeBtn.addEventListener('click', () => {
      priceModal.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const page = document.getElementById('pricePageSelect').value;
      const name = document.getElementById('priceItemName').value.trim();
      const val = document.getElementById('priceItemValue').value.trim();

      if (name && val) {
        const badge = { id: Date.now(), page, name, val };
        activeBadges.push(badge);
        saveAndRenderBadges();
        form.reset();
      }
    });
  }

  renderBadgesOnCards();
}

function saveAndRenderBadges() {
  localStorage.setItem('hburger_price_badges', JSON.stringify(activeBadges));
  renderBadgesOnCards();
  renderBadgesList();
}

function renderBadgesOnCards() {
  document.querySelectorAll('.price-overlays-container').forEach(c => c.innerHTML = '');

  activeBadges.forEach(b => {
    const container = document.querySelector(`.price-overlays-container[data-page="${b.page}"]`);
    if (container) {
      const badgeEl = document.createElement('div');
      badgeEl.className = 'badge-item';
      badgeEl.innerHTML = `<span>🏷️ ${b.name}:</span> <strong>${b.val}</strong>`;
      container.appendChild(badgeEl);
    }
  });
}

function renderBadgesList() {
  const list = document.getElementById('activeBadgesList');
  if (!list) return;

  if (activeBadges.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem;">No custom price badges created yet.</p>';
    return;
  }

  list.innerHTML = activeBadges.map(b => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
      <span style="font-size:0.85rem;"><strong>Page ${b.page}:</strong> ${b.name} - <span style="color:var(--accent-gold);">${b.val}</span></span>
      <button onclick="deleteBadge(${b.id})" style="background:#ff4757; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.75rem;">Delete</button>
    </div>
  `).join('');
}

function deleteBadge(id) {
  activeBadges = activeBadges.filter(b => b.id !== id);
  saveAndRenderBadges();
}

/* --------------------------------------------------------------------------
   Scroll Spy & Back to Top
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const pills = document.querySelectorAll('.page-pills .pill');
  const pages = document.querySelectorAll('.menu-card');

  window.addEventListener('scroll', () => {
    let current = '';
    pages.forEach(page => {
      const pageTop = page.offsetTop;
      if (window.scrollY >= pageTop - 200) {
        current = page.getAttribute('id');
      }
    });

    pills.forEach(pill => {
      pill.classList.remove('active');
      if (pill.getAttribute('href') === `#${current}`) {
        pill.classList.add('active');
      }
    });
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
