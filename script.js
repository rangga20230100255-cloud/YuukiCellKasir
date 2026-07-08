// ==========================================
// 1. FITUR UTILITAS (JAM, TANGGAL, & TEMA)
// ==========================================
function updateDateTime() {
  const now = new Date();
  const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateDisplay = document.getElementById('dateDisplay');
  const timeDisplay = document.getElementById('timeDisplay');

  if (dateDisplay && timeDisplay) {
    dateDisplay.textContent = now.toLocaleDateString('id-ID', optionsDate);
    timeDisplay.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }
}
setInterval(updateDateTime, 1000);

const themeToggleBtn = document.getElementById('themeToggle');
const bodyElement = document.documentElement;
const currentTheme = localStorage.getItem('theme');
if (currentTheme) bodyElement.setAttribute('data-theme', currentTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    let targetTheme = bodyElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (targetTheme === 'light') bodyElement.removeAttribute('data-theme');
    else bodyElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', targetTheme);
    if (typeof renderChart === 'function') setTimeout(renderChart, 100);
  });
}

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function getWaktuSekarang() {
  const now = new Date();
  return {
    tgl: now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
    jam: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
  };
}

// ==========================================
// 2. INISIALISASI DATA LOCAL STORAGE
// ==========================================
let dataTransaksi = JSON.parse(localStorage.getItem('riwayat_yuuki')) || [];
let dataLaporan = JSON.parse(localStorage.getItem('laporan_yuuki')) || [];
let dataProduk = JSON.parse(localStorage.getItem('produk_yuuki')) || [];
let dataKategori = JSON.parse(localStorage.getItem('kategori_yuuki')) || [];
let dataFaktur = JSON.parse(localStorage.getItem('faktur_yuuki')) || [];

dataTransaksi = dataTransaksi.map((trx, index) => {
  if (!trx.id) trx.id = Date.now() + index;
  return trx;
});

dataProduk = dataProduk.map(p => {
  if (!p.riwayat) p.riwayat = [];
  return p;
});

if (dataKategori.length === 0 && dataProduk.length > 0) {
  const cats = new Set();
  dataProduk.forEach(p => cats.add((p.kategori || 'UMUM').toUpperCase()));
  dataKategori = Array.from(cats);
  localStorage.setItem('kategori_yuuki', JSON.stringify(dataKategori));
}

// ==========================================
// 3. IKON SVG MODERN (FIXED FILL NONE)
// ==========================================
const iconEdit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iconDelete = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const iconCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const iconBook = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
const iconDownload = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const iconPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const iconMinus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const iconHistory = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

// ==========================================
// 4. MANAGEMENT DASHBOARD & SENSOR MATA
// ==========================================
function updateDashboard() {
  const elPenjualan = document.getElementById('totalPenjualan');
  const elModal = document.getElementById('totalModal');
  const elLaba = document.getElementById('totalLaba');
  const chartContainer = document.getElementById('chartContainer');

  let totalPenjualan = 0, totalModal = 0, totalLaba = 0;

  dataTransaksi.forEach(trx => {
    totalPenjualan += trx.hargaJual;
    totalModal += trx.hargaBeli;
    totalLaba += (trx.hargaJual - trx.hargaBeli);
  });

  dataFaktur.forEach(fak => {
    totalPenjualan += fak.grandTotal;
    totalLaba += fak.grandTotal;
  });

  const isVisible = localStorage.getItem('saldo_visible') !== 'false';

  if (elPenjualan) elPenjualan.textContent = isVisible ? formatRupiah(totalPenjualan) : 'Rp •••••••';
  if (elModal) elModal.textContent = isVisible ? formatRupiah(totalModal) : 'Rp •••••••';
  if (elLaba) elLaba.textContent = isVisible ? formatRupiah(totalLaba) : 'Rp •••••••';

  if (chartContainer) chartContainer.style.display = isVisible ? 'block' : 'none';
}

const btnToggleSaldo = document.getElementById('btnToggleSaldo');
if (btnToggleSaldo) {
  btnToggleSaldo.addEventListener('click', () => {
    const isVisible = localStorage.getItem('saldo_visible') !== 'false';
    localStorage.setItem('saldo_visible', isVisible ? 'false' : 'true');
    const iconEye = document.getElementById('iconEye');
    if (iconEye) {
      iconEye.innerHTML = isVisible
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
    updateDashboard();
  });
}

// ==========================================
// 5. FITUR GRAFIK (CHART.JS 30 HARI)
// ==========================================
let profitChartInstance = null;
window.renderChart = function () {
  const canvas = document.getElementById('profitChart');
  if (!canvas) return;

  let profitByDate = {};
  dataLaporan.forEach(lap => {
    profitByDate[lap.tanggalTransaksi] = (profitByDate[lap.tanggalTransaksi] || 0) + lap.totalLaba;
  });

  let labels = Object.keys(profitByDate);
  if (labels.length > 30) labels = labels.slice(labels.length - 30);

  let displayLabels = labels.map(label => label.includes(',') ? label.split(',')[1].trim().replace(/ \d{4}$/, '') : label);
  let dataPoints = labels.map(date => profitByDate[date]);

  if (profitChartInstance) profitChartInstance.destroy();

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? '#27272a' : '#e4e4e7';
  const textColor = isDark ? '#a1a1aa' : '#666666';

  profitChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: displayLabels,
      datasets: [{
        label: 'Keuntungan', data: dataPoints, borderColor: '#39FF14', backgroundColor: 'rgba(57, 255, 20, 0.1)', borderWidth: 3,
        pointBackgroundColor: isDark ? '#121212' : '#ffffff', pointBorderColor: '#39FF14', pointBorderWidth: 2, pointRadius: 4, fill: true, tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { return formatRupiah(context.raw); } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Space Grotesk' }, precision: 0, callback: function (value) { return 'Rp ' + value.toLocaleString('id-ID'); } } },
        x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Space Grotesk' } } }
      }
    }
  });

  const scrollWrapper = document.getElementById('chartScrollWrapper');
  if (scrollWrapper) setTimeout(() => scrollWrapper.scrollLeft = scrollWrapper.scrollWidth, 100);
}

// ==========================================
// 6. MANAJEMEN DATA TRANSAKSI & LAPORAN
// ==========================================
window.toggleRiwayat = function (id) {
  const detailDiv = document.getElementById('riwayat-detail-' + id);
  const iconSvg = document.getElementById('icon-riwayat-toggle-' + id);
  if (detailDiv && iconSvg) {
    if (detailDiv.style.display === 'none') { detailDiv.style.display = 'block'; iconSvg.style.transform = 'rotate(180deg)'; }
    else { detailDiv.style.display = 'none'; iconSvg.style.transform = 'rotate(0deg)'; }
  }
}

function renderDaftarTransaksi() {
  const transactionList = document.getElementById('transactionList');
  if (!transactionList) return;
  transactionList.innerHTML = '';

  if (dataTransaksi.length === 0) {
    transactionList.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada transaksi.</p>`;
    return;
  }

  [...dataTransaksi].reverse().forEach(trx => {
    const keuntungan = trx.hargaJual - trx.hargaBeli;
    const trxCard = document.createElement('div');
    trxCard.classList.add('trx-card');

    let statusHtml = '', tombolHutang = `<button class="action-btn" onclick="bukaModalHutang(${trx.id})">${iconBook} Hutang</button>`;
    if (trx.status === 'hutang') {
      statusHtml = `<div class="status-box hutang"><p class="title">BELUM LUNAS (A/n: ${trx.namaPenghutang})</p></div>`;
      tombolHutang = `<button class="action-btn btn-lunas" onclick="bukaModalLunas(${trx.id})">${iconCheck} Lunaskan</button>`;
    } else if (trx.status === 'lunas') {
      statusHtml = `<div class="status-box lunas"><p class="title">LUNAS (A/n: ${trx.namaPenghutang})</p><p class="time">${trx.waktuLunas}</p></div>`;
      tombolHutang = `<button class="action-btn" disabled>${iconCheck} Selesai</button>`;
    }

    trxCard.innerHTML = `
            <div class="trx-header" style="border-bottom: 2px solid var(--stabilo-green); padding-bottom: 12px; cursor: pointer;" onclick="toggleRiwayat(${trx.id})">
                <span class="trx-name" style="color: var(--stabilo-green); font-size: 1.1rem;">${trx.nama}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="trx-date" style="font-size: 0.75rem;">${trx.tanggal} • ${trx.jam}</span>
                    <svg id="icon-riwayat-toggle-${trx.id}" style="transition: transform 0.3s ease; color: var(--text-main);" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            <div id="riwayat-detail-${trx.id}" style="display: none; padding-top: 10px;">
                <div class="trx-details">
                    <div class="trx-detail-item"><p>Harga Beli</p><h4>${formatRupiah(trx.hargaBeli)}</h4></div>
                    <div class="trx-detail-item"><p>Harga Jual</p><h4>${formatRupiah(trx.hargaJual)}</h4></div>
                </div>
                <div class="trx-profit" style="margin-top: 12px;"><p>Keuntungan</p><h4>${formatRupiah(keuntungan)}</h4></div>
                ${statusHtml}
                <div class="trx-actions">
                    <button class="action-btn" onclick="bukaModalEdit(${trx.id})">${iconEdit} Edit</button>
                    <button class="action-btn btn-hapus" onclick="hapusTransaksi(${trx.id})">${iconDelete} Hapus</button>
                    ${tombolHutang}
                </div>
            </div>
        `;
    transactionList.appendChild(trxCard);
  });
}

window.toggleLaporan = function (id) {
  const detailDiv = document.getElementById('laporan-detail-' + id);
  const iconSvg = document.getElementById('icon-toggle-' + id);
  if (detailDiv && iconSvg) {
    if (detailDiv.style.display === 'none') { detailDiv.style.display = 'block'; iconSvg.style.transform = 'rotate(180deg)'; }
    else { detailDiv.style.display = 'none'; iconSvg.style.transform = 'rotate(0deg)'; }
  }
}

function renderLaporan() {
  const laporanList = document.getElementById('laporanList');
  if (!laporanList) return;
  laporanList.innerHTML = '';

  if (dataLaporan.length === 0) {
    laporanList.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada laporan yang diekspor.</p>`;
    return;
  }

  [...dataLaporan].reverse().forEach(lap => {
    const lapCard = document.createElement('div');
    lapCard.classList.add('trx-card');
    lapCard.innerHTML = `
            <div class="trx-header" style="border-bottom: 2px solid var(--stabilo-green); padding-bottom: 12px; cursor: pointer;" onclick="toggleLaporan(${lap.id})">
                <span class="trx-name" style="color: var(--stabilo-green);">Trans: ${lap.tanggalTransaksi}</span>
                <svg id="icon-toggle-${lap.id}" style="transition: transform 0.3s ease; color: var(--text-main);" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            <div id="laporan-detail-${lap.id}" style="display: none; padding-top: 10px;">
                <div style="margin-bottom: 12px;"><p style="font-size: 0.75rem; color: var(--text-muted);"><strong style="color: var(--text-main);">Waktu Tutup Kasir:</strong><br> ${lap.waktuEkspor}</p></div>
                <div class="trx-details">
                    <div class="trx-detail-item"><p>Total Modal</p><h4>${formatRupiah(lap.totalModal)}</h4></div>
                    <div class="trx-detail-item"><p>Total Jual</p><h4>${formatRupiah(lap.totalJual)}</h4></div>
                </div>
                <div class="trx-profit" style="margin-top: 12px;"><p>Keuntungan Bersih</p><h4>${formatRupiah(lap.totalLaba)}</h4></div>
                <div style="margin-top: 12px; border-top: 1px dashed var(--border-color); padding-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <button class="action-btn" style="width: 100%; color: var(--text-main); border-color: var(--border-color);" onclick="bukaModalDownload(${lap.id})">${iconDownload} Download .xls</button>
                    <button class="action-btn btn-hapus" style="width: 100%;" onclick="hapusLaporan(${lap.id})">${iconDelete} Hapus</button>
                </div>
            </div>
        `;
    laporanList.appendChild(lapCard);
  });
}

// ==========================================
// 7. MANAJEMEN KATALOG & STOK PRODUK
// ==========================================
let currentKategoriView = null;

function renderProdukUI() {
  const viewKat = document.getElementById('viewKategori');
  const viewProd = document.getElementById('viewProduk');
  if (!viewKat || !viewProd) return;

  if (currentKategoriView) {
    renderDaftarProdukKategori(currentKategoriView);
    viewKat.style.display = 'none';
    viewProd.style.display = 'block';
  } else {
    renderKeranjangKategori();
    viewKat.style.display = 'block';
    viewProd.style.display = 'none';
  }
}

function renderKeranjangKategori() {
  const list = document.getElementById('kategoriList');
  if (!list) return; list.innerHTML = '';

  if (dataKategori.length === 0) {
    list.innerHTML = `<p style="grid-column: span 2; text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada keranjang. Tambahkan kategori baru.</p>`;
    return;
  }

  dataKategori.forEach(kat => {
    let count = 0, modal = 0, jual = 0;
    dataProduk.forEach(p => {
      if ((p.kategori || '').toUpperCase() === kat) { count++; modal += (p.hargaBeli * p.stok); jual += (p.hargaJual * p.stok); }
    });

    const card = document.createElement('div');
    card.classList.add('cat-card');
    card.onclick = () => { currentKategoriView = kat; renderProdukUI(); };
    card.innerHTML = `
            <h4>${kat}</h4>
            <div class="cat-stat">Banyak Item <span>${count}</span></div>
            <div class="cat-stat">Total Modal <span>${formatRupiah(modal)}</span></div>
            <div class="cat-stat" style="margin-bottom: 10px;">Total Jual <span style="color:var(--stabilo-green);">${formatRupiah(jual)}</span></div>
            <div class="cat-actions">
                <button class="action-btn" onclick="bukaModalEditKategori('${kat}', event)">${iconEdit} Edit</button>
                <button class="action-btn btn-hapus" onclick="bukaModalHapusKategori('${kat}', event)">${iconDelete} Hapus</button>
            </div>
        `;
    list.appendChild(card);
  });
}

function renderHTMLRiwayatProduk(riwayatArray) {
  if (!riwayatArray || riwayatArray.length === 0) return '<p style="font-size:0.75rem; color:var(--text-muted); text-align:center;">Belum ada catatan.</p>';
  let html = '', currentDate = '';
  riwayatArray.forEach(r => {
    if (r.tanggal !== currentDate) { html += `<div class="history-date">${r.tanggal}</div>`; currentDate = r.tanggal; }
    html += `<div class="history-item"><span class="history-time">${r.jam}</span> ${r.aksi}</div>`;
  });
  return html;
}

function renderDaftarProdukKategori(kategoriTujuan) {
  const list = document.getElementById('produkList');
  if (!list) return;
  document.getElementById('judulKategori').textContent = `Keranjang: ${kategoriTujuan}`;
  list.innerHTML = '';

  const filtered = dataProduk.filter(p => (p.kategori || '').toUpperCase() === kategoriTujuan).reverse();
  if (filtered.length === 0) { list.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Keranjang kosong.</p>`; return; }

  filtered.forEach(prod => {
    const prodCard = document.createElement('div');
    prodCard.classList.add('trx-card');
    prodCard.innerHTML = `
            <div class="trx-header" style="align-items: flex-start; border-bottom: none; padding-bottom: 0;">
                <div><span class="trx-name" style="font-size: 1.15rem; color: var(--text-main);">${prod.nama}</span></div>
                <div style="text-align: right;"><p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin:0;">Sisa Stok</p><h4 style="color: var(--stabilo-green); font-size: 1.5rem; line-height: 1;">${prod.stok}</h4></div>
            </div>
            <div class="trx-details" style="margin-top: 12px;">
                <div class="trx-detail-item"><p>Harga Modal Satuan</p><h4>${formatRupiah(prod.hargaBeli)}</h4></div>
                <div class="trx-detail-item"><p>Harga Jual Satuan</p><h4>${formatRupiah(prod.hargaJual)}</h4></div>
            </div>
            <div class="trx-details" style="margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 12px;">
                <div class="trx-detail-item"><p>Total Modal Stok</p><h4>${formatRupiah(prod.hargaBeli * prod.stok)}</h4></div>
                <div class="trx-detail-item"><p>Total Jual Stok</p><h4 style="color:var(--stabilo-green);">${formatRupiah(prod.hargaJual * prod.stok)}</h4></div>
            </div>
            <div class="trx-actions" style="grid-template-columns: 1fr 1fr; margin-top: 16px;">
                <button class="action-btn" onclick="bukaModalTambahStok(${prod.id})" style="border-color: rgba(57,255,20,0.3); color: var(--stabilo-green);">${iconPlus} Tambah Stok</button>
                <button class="action-btn" onclick="bukaModalKurangStok(${prod.id})" style="border-color: rgba(255,159,10,0.3); color: #ff9f0a;">${iconMinus} Kurangi Stok</button>
                <button class="action-btn" onclick="bukaModalEditProduk(${prod.id})">${iconEdit} Edit Info</button>
                <button class="action-btn btn-hapus" onclick="hapusProduk(${prod.id})">${iconDelete} Hapus</button>
            </div>
            <div style="margin-top: 12px; text-align: center;">
                <button class="action-btn" style="width: 100%; justify-content: center; background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); padding: 10px; border-radius: 8px;" onclick="toggleRiwayatProd(${prod.id})">
                    ${iconHistory} Catatan Riwayat & Stok <svg id="icon-riwayat-prod-${prod.id}" width="16" height="16" style="transition: transform 0.3s ease; margin-left: auto;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
            </div>
            <div id="riwayat-prod-${prod.id}" class="prod-history" style="display: none; margin-top: 12px; text-align: left; background-color: var(--bg-color); padding: 12px; border-radius: 12px; border: 1px solid var(--border-color);">${renderHTMLRiwayatProduk(prod.riwayat)}</div>
        `;
    list.appendChild(prodCard);
  });
}

window.toggleRiwayatProd = function (id) {
  const detailDiv = document.getElementById('riwayat-prod-' + id);
  const iconSvg = document.getElementById('icon-riwayat-prod-' + id);
  if (detailDiv && iconSvg) {
    if (detailDiv.style.display === 'none') { detailDiv.style.display = 'block'; iconSvg.style.transform = 'rotate(180deg)'; }
    else { detailDiv.style.display = 'none'; iconSvg.style.transform = 'rotate(0deg)'; }
  }
}

window.kembaliKeKategori = function () { currentKategoriView = null; renderProdukUI(); }
function simpanDataProduk() { localStorage.setItem('produk_yuuki', JSON.stringify(dataProduk)); localStorage.setItem('kategori_yuuki', JSON.stringify(dataKategori)); renderProdukUI(); }

// MODAL HANDLING KATEGORI & STOK
window.bukaModalTambahKategori = function () { document.getElementById('modalTambahKategori').classList.add('active'); }
window.simpanKategoriBaru = function () {
  const name = document.getElementById('katNama').value.trim().toUpperCase();
  if (name && !dataKategori.includes(name)) { dataKategori.push(name); simpanDataProduk(); }
  tutupModal('modalTambahKategori'); document.getElementById('katNama').value = '';
}
window.bukaModalEditKategori = function (namaLama, event) {
  event.stopPropagation(); document.getElementById('oldKatNama').value = namaLama;
  document.getElementById('newKatNama').value = namaLama; document.getElementById('modalEditKategori').classList.add('active');
}
window.simpanEditKategori = function () {
  const oldN = document.getElementById('oldKatNama').value;
  let newN = document.getElementById('newKatNama').value.trim().toUpperCase();
  if (!newN) return alert('Nama tidak boleh kosong!');
  if (newN !== oldN && !dataKategori.includes(newN)) {
    const idx = dataKategori.indexOf(oldN); if (idx !== -1) dataKategori[idx] = newN;
    dataProduk.forEach(p => { if ((p.kategori || '').toUpperCase() === oldN) p.kategori = newN; });
    simpanDataProduk();
  }
  tutupModal('modalEditKategori');
}
window.bukaModalHapusKategori = function (namaKat, event) {
  event.stopPropagation(); document.getElementById('hapusKatNama').value = namaKat;
  document.getElementById('hapusKatLabel').textContent = namaKat; document.getElementById('modalHapusKategori').classList.add('active');
}
window.konfirmasiHapusKategori = function () {
  const name = document.getElementById('hapusKatNama').value;
  dataKategori = dataKategori.filter(k => k !== name); dataProduk = dataProduk.filter(p => (p.kategori || '').toUpperCase() !== name);
  simpanDataProduk(); tutupModal('modalHapusKategori');
}
window.bukaModalTambahProduk = function () { document.getElementById('modalTambahProduk').classList.add('active'); }
window.simpanProdukBaru = function () {
  const nama = document.getElementById('prodNama').value || 'Tanpa Nama', kategori = currentKategoriView || 'UMUM';
  const stok = parseInt(document.getElementById('prodStok').value) || 0, beli = parseInt(document.getElementById('prodBeli').value) || 0, jual = parseInt(document.getElementById('prodJual').value) || 0;
  const w = getWaktuSekarang();
  const r = [{ id: Date.now(), tanggal: w.tgl, jam: w.jam, aksi: `Produk didaftarkan dengan stok awal: <b>${stok}</b>` }];
  dataProduk.push({ id: Date.now(), nama, kategori, stok, hargaBeli: beli, hargaJual: jual, riwayat: r });
  simpanDataProduk(); tutupModal('modalTambahProduk');
  document.getElementById('prodNama').value = ''; document.getElementById('prodStok').value = ''; document.getElementById('prodBeli').value = ''; document.getElementById('prodJual').value = '';
}
window.bukaModalTambahStok = function (id) {
  const p = dataProduk.find(x => x.id === id);
  if (p) { document.getElementById('tambahStokId').value = p.id; document.getElementById('tambahStokNama').textContent = p.nama; document.getElementById('inputTambahStok').value = ''; document.getElementById('modalTambahStok').classList.add('active'); }
}
window.simpanTambahStok = function () {
  const id = parseInt(document.getElementById('tambahStokId').value), qty = parseInt(document.getElementById('inputTambahStok').value);
  if (isNaN(qty) || qty <= 0) return alert('Masukkan jumlah!');
  const idx = dataProduk.findIndex(x => x.id === id);
  if (idx !== -1) {
    dataProduk[idx].stok += qty; const w = getWaktuSekarang();
    dataProduk[idx].riwayat.unshift({ id: Date.now(), tanggal: w.tgl, jam: w.jam, aksi: `Stok <span style="color:var(--stabilo-green);">ditambah ${qty}</span> (Sisa: ${dataProduk[idx].stok})` });
    simpanDataProduk(); tutupModal('modalTambahStok');
  }
}
window.bukaModalKurangStok = function (id) {
  const p = dataProduk.find(x => x.id === id);
  if (p) { document.getElementById('kurangStokId').value = p.id; document.getElementById('kurangStokNama').textContent = p.nama; document.getElementById('inputKurangStok').value = ''; document.getElementById('modalKurangStok').classList.add('active'); }
}
window.simpanKurangStok = function () {
  const id = parseInt(document.getElementById('kurangStokId').value), qty = parseInt(document.getElementById('inputKurangStok').value);
  if (isNaN(qty) || qty <= 0) return alert('Masukkan jumlah!');
  const idx = dataProduk.findIndex(x => x.id === id);
  if (idx !== -1) {
    if (dataProduk[idx].stok < qty) return alert('Stok tidak cukup!');
    dataProduk[idx].stok -= qty; const w = getWaktuSekarang();
    dataProduk[idx].riwayat.unshift({ id: Date.now(), tanggal: w.tgl, jam: w.jam, aksi: `Stok <span style="color:#ff9f0a;">dikurangi ${qty}</span> (Sisa: ${dataProduk[idx].stok})` });
    simpanDataProduk(); tutupModal('modalKurangStok');
  }
}
window.bukaModalEditProduk = function (id) {
  const p = dataProduk.find(x => x.id === id);
  if (p) { document.getElementById('editProdId').value = p.id; document.getElementById('editProdNama').value = p.nama; document.getElementById('editProdBeli').value = p.hargaBeli; document.getElementById('editProdJual').value = p.hargaJual; document.getElementById('modalEditProduk').classList.add('active'); }
}
window.simpanEditProduk = function () {
  const id = parseInt(document.getElementById('editProdId').value), idx = dataProduk.findIndex(x => x.id === id);
  if (idx !== -1) {
    const old = { ...dataProduk[idx] };
    dataProduk[idx].nama = document.getElementById('editProdNama').value || 'Tanpa Nama';
    dataProduk[idx].hargaBeli = parseInt(document.getElementById('editProdBeli').value) || 0;
    dataProduk[idx].hargaJual = parseInt(document.getElementById('editProdJual').value) || 0;
    let c = [];
    if (old.nama !== dataProduk[idx].nama) c.push(`Nama jadi "${dataProduk[idx].nama}"`);
    if (old.hargaBeli !== dataProduk[idx].hargaBeli) c.push(`Modal jadi ${formatRupiah(dataProduk[idx].hargaBeli)}`);
    if (old.hargaJual !== dataProduk[idx].hargaJual) c.push(`Jual jadi ${formatRupiah(dataProduk[idx].hargaJual)}`);
    if (c.length > 0) { const w = getWaktuSekarang(); dataProduk[idx].riwayat.unshift({ id: Date.now(), tanggal: w.tgl, jam: w.jam, aksi: `Info diedit: ` + c.join(', ') }); }
    simpanDataProduk(); tutupModal('modalEditProduk');
  }
}
let idProdukYangAkanDihapus = null;
window.hapusProduk = function (id) { idProdukYangAkanDihapus = id; document.getElementById('modalHapusProduk').classList.add('active'); }
window.konfirmasiHapusProduk = function () { if (idProdukYangAkanDihapus !== null) { dataProduk = dataProduk.filter(p => p.id !== idProdukYangAkanDihapus); simpanDataProduk(); idProdukYangAkanDihapus = null; tutupModal('modalHapusProduk'); } }
window.bukaModalHapusSemuaProduk = function () { document.getElementById('modalHapusSemuaProduk').classList.add('active'); }
window.konfirmasiHapusSemuaProduk = function () { dataProduk = []; dataKategori = []; simpanDataProduk(); tutupModal('modalHapusSemuaProduk'); currentKategoriView = null; renderProdukUI(); }

// ==========================================
// 8. MANAGEMENT DATA FAKTUR & PDF GENERATOR
// ==========================================
function renderFakturList() {
  const list = document.getElementById('fakturList'); if (!list) return; list.innerHTML = '';
  if (dataFaktur.length === 0) { list.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada faktur.</p>`; return; }
  [...dataFaktur].reverse().forEach(fak => {
    const card = document.createElement('div'); card.classList.add('trx-card');
    card.innerHTML = `
            <div class="trx-header" style="align-items: flex-start; border-bottom: 1px dashed var(--border-color); padding-bottom: 12px;">
                <div><span class="trx-name">INV-${fak.id}</span><br><span style="font-size: 0.75rem; color: var(--text-muted);">Pembeli: <strong>${fak.pembeli}</strong></span></div>
                <div style="text-align: right;"><span class="trx-date">${fak.tanggalStr}</span></div>
            </div>
            <div class="trx-profit" style="margin-top: 12px; display: flex; justify-content: space-between; background:none; border:none; padding:0;">
                <p>Grand Total</p><h4 style="color: var(--stabilo-green); font-size: 1.2rem;">${formatRupiah(fak.grandTotal)}</h4>
            </div>
            <div class="trx-actions" style="grid-template-columns: 1fr 1fr 1fr; margin-top: 16px;">
                <button class="action-btn" style="border-color: rgba(57,255,20,0.3); color: var(--stabilo-green);" onclick="downloadPDF(${fak.id})">${iconDownload} PDF</button>
                <button class="action-btn" onclick="bukaModalFaktur(${fak.id})">${iconEdit} Edit</button>
                <button class="action-btn btn-hapus" onclick="hapusFaktur(${fak.id})">${iconDelete} Hapus</button>
            </div>
        `;
    list.appendChild(card);
  });
}

window.tambahBarisFaktur = function (nama = '', harga = '') {
  const container = document.getElementById('fakItemContainer'); if (!container) return;
  const row = document.createElement('div'); row.className = 'dynamic-row';
  row.innerHTML = `
        <input type="text" class="item-nama" placeholder="Nama barang / layanan" value="${nama}">
        <input type="number" class="item-harga" placeholder="Harga" value="${harga === 0 ? '' : harga}">
        <button class="action-btn btn-hapus" style="padding:0; border-radius: 8px;" onclick="this.parentElement.remove()">${iconDelete}</button>
    `;
  container.appendChild(row);
}

window.bukaModalFaktur = function (id = null) {
  const today = new Date().toISOString().split('T')[0];
  const container = document.getElementById('fakItemContainer'); if (!container) return;
  container.innerHTML = '';
  if (id) {
    const f = dataFaktur.find(x => x.id === id);
    document.getElementById('modalFakturTitle').textContent = 'Edit Faktur'; document.getElementById('fakId').value = f.id;
    document.getElementById('fakTanggal').value = f.tanggalRaw; document.getElementById('fakPembeli').value = f.pembeli;
    document.getElementById('fakCatatan').value = f.catatan; f.items.forEach(i => tambahBarisFaktur(i.nama, i.harga));
  } else {
    document.getElementById('modalFakturTitle').textContent = 'Buat Faktur Baru'; document.getElementById('fakId').value = '';
    document.getElementById('fakTanggal').value = today; document.getElementById('fakPembeli').value = '';
    document.getElementById('fakCatatan').value = ''; tambahBarisFaktur();
  }
  document.getElementById('modalFaktur').classList.add('active');
}

window.simpanFaktur = function () {
  const idStr = document.getElementById('fakId').value, tglRaw = document.getElementById('fakTanggal').value;
  if (!tglRaw) return alert('Pilih tanggal!');
  const tglObj = new Date(tglRaw), tglStr = tglObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const pembeli = document.getElementById('fakPembeli').value || 'Pelanggan Umum', catatan = document.getElementById('fakCatatan').value || '-';
  const rows = document.querySelectorAll('#fakItemContainer .dynamic-row'), validItems = []; let grandTotal = 0;

  rows.forEach(row => {
    const nama = row.querySelector('.item-nama').value.trim(), harga = parseInt(row.querySelector('.item-harga').value) || 0;
    if (nama !== '') { validItems.push({ nama, harga }); grandTotal += harga; }
  });
  if (validItems.length === 0) return alert('Masukkan minimal 1 barang!');

  if (idStr) {
    const id = parseInt(idStr), idx = dataFaktur.findIndex(x => x.id === id);
    dataFaktur[idx] = { id, tanggalRaw: tglRaw, tanggalStr: tglStr, pembeli, catatan, items: validItems, grandTotal };
  } else {
    const shortId = Math.floor(100000 + Math.random() * 900000);
    dataFaktur.push({ id: shortId, tanggalRaw: tglRaw, tanggalStr: tglStr, pembeli, catatan, items: validItems, grandTotal });
  }
  localStorage.setItem('faktur_yuuki', JSON.stringify(dataFaktur));
  updateDashboard(); renderFakturList(); tutupModal('modalFaktur');
}

let idFakturAkanDihapus = null;
window.hapusFaktur = function (id) { idFakturAkanDihapus = id; document.getElementById('modalHapusFaktur').classList.add('active'); }
window.konfirmasiHapusFaktur = function () {
  dataFaktur = dataFaktur.filter(x => x.id !== idFakturAkanDihapus); localStorage.setItem('faktur_yuuki', JSON.stringify(dataFaktur));
  updateDashboard(); renderFakturList(); tutupModal('modalHapusFaktur');
}

window.downloadPDF = function (id) {
  const f = dataFaktur.find(x => x.id === id); if (!f) return;
  let tbodyHtml = '';
  f.items.forEach((item, index) => {
    tbodyHtml += `
            <tr style="border-bottom: 1px solid #e4e4e7;">
                <td style="padding: 14px 12px; font-size: 14px; color: #121212;">${index + 1}</td>
                <td style="padding: 14px 12px; font-size: 14px; color: #121212;">${item.nama}</td>
                <td style="padding: 14px 12px; font-size: 14px; color: #121212; text-align: right; font-weight: bold;">${formatRupiah(item.harga)}</td>
            </tr>
        `;
  });

  const printContent = `
        <div style="background: #ffffff; color: #121212; width: 100%; padding: 40px; box-sizing: border-box; font-family: Arial, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #39FF14; padding-bottom: 24px; margin-bottom: 32px;">
    <div>
        <h1 style="margin: 0; font-size: 38px; font-weight: 900; color: #121212;">YUUKI CELL</h1>
        <p style="margin:6px 0 0 0; font-size:15px; color:#555;">Mitra Agen PPOB, Gedget & Aksesoris</p>
        <p style="margin:2px 0 0 0; font-size:15px; color:#555;">Telp: 0851-7344-9016</p>
    </div>
    <div style="text-align: right;">
        <h2 style="margin:0; font-size:32px; color:#39FF14; text-transform:uppercase;">Faktur</h2>
        <p style="margin:8px 0 0 0; font-weight:700;">INV-${f.id}</p>
        <p style="margin:4px 0 0 0; color:#666;">${f.tanggalStr}</p>
    </div>
</div>
            <div style="margin-bottom: 36px;"><p style="font-size:13px; font-weight:700; color:#888; text-transform:uppercase;">Ditagihkan Kepada:</p><p style="margin:6px 0 0 0; font-size:20px; font-weight:700;">${f.pembeli}</p></div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 36px;">
                <thead><tr style="background-color:#f4f4f5; border-bottom:2px solid #121212;"><th style="padding:14px 12px; text-align:left; font-size:14px; width:8%;">No</th><th style="padding:14px 12px; text-align:left; font-size:14px; width:62%;">Barang/Layanan</th><th style="padding:14px 12px; text-align:right; font-size:14px; width:30%;">Harga</th></tr></thead>
                <tbody>${tbodyHtml}</tbody>
            </table>
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="width: 50%;"><p style="font-size:13px; font-weight:700; color:#888; text-transform:uppercase;">Catatan:</p><p style="margin:8px 0 0 0; font-style:italic; color:#444;">${f.catatan}</p></div>
                <div style="width: 45%; background-color: #f4f4f5; padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;"><span style="font-size:16px; font-weight:700; color:#555;">GRAND TOTAL</span><span style="font-size:26px; font-weight:800;">${formatRupiah(f.grandTotal)}</span></div>
            </div>
        </div>
    `;
  const opt = { margin: 10, filename: `Faktur_${f.pembeli.replace(/ /g, '_')}_INV${f.id}.pdf`, image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
  html2pdf().set(opt).from(printContent).save();
}

// ==========================================
// 9. LOGIKA KALKULATOR DINAMIS
// ==========================================
let currentCalcInput = '0';
window.tekanKalkulator = function (val) {
  if (currentCalcInput === '0' && val !== '.' && val !== '*' && val !== '/' && val !== '+' && val !== '-') { currentCalcInput = val; }
  else {
    const lastChar = currentCalcInput.slice(-1), isOp = (char) => ['+', '-', '*', '/'].includes(char);
    if (isOp(lastChar) && isOp(val)) { currentCalcInput = currentCalcInput.slice(0, -1) + val; }
    else { currentCalcInput += val; }
  }
  updateLayarKalkulator();
}
window.hitungKalkulator = function () {
  try {
    let hasil = eval(currentCalcInput); if (!Number.isInteger(hasil)) hasil = parseFloat(hasil.toFixed(4));
    currentCalcInput = String(hasil); updateLayarKalkulator();
  } catch (e) {
    const calcScreen = document.getElementById('calcScreen'); if (calcScreen) calcScreen.textContent = 'Error';
    setTimeout(() => { currentCalcInput = '0'; updateLayarKalkulator(); }, 1000);
  }
}
window.hapusKalkulator = function () { currentCalcInput = '0'; updateLayarKalkulator(); }
window.hapusSatuKalkulator = function () {
  if (currentCalcInput.length > 1) { currentCalcInput = currentCalcInput.slice(0, -1); }
  else { currentCalcInput = '0'; }
  updateLayarKalkulator();
}
function updateLayarKalkulator() {
  const calcScreen = document.getElementById('calcScreen');
  if (calcScreen) calcScreen.textContent = currentCalcInput.replace(/\*/g, '×').replace(/\//g, '÷');
}

// ==========================================
// 10. OPERASI KASIR CORE (TAMBAH, EDIT, EKSPOR)
// ==========================================
function simpanData() { localStorage.setItem('riwayat_yuuki', JSON.stringify(dataTransaksi)); renderDaftarTransaksi(); updateDashboard(); if (typeof renderChart === 'function') renderChart(); }
function tutupModal(idModal) { const m = document.getElementById(idModal); if (m) m.classList.remove('active'); }

const btnTransaksiBaru = document.getElementById('btnTransaksiBaru');
if (btnTransaksiBaru) {
  btnTransaksiBaru.addEventListener('click', () => document.getElementById('transactionModal').classList.add('active'));
  document.getElementById('btnBatal').addEventListener('click', () => tutupModal('transactionModal'));
  document.getElementById('btnTambah').addEventListener('click', () => {
    const now = new Date(), trxBaru = {
      id: Date.now(), nama: document.getElementById('inputNama').value || 'Tanpa Nama',
      hargaBeli: parseInt(document.getElementById('inputBeli').value) || 0, hargaJual: parseInt(document.getElementById('inputJual').value) || 0,
      tanggal: now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      jam: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'), status: 'normal'
    };
    dataTransaksi.push(trxBaru); simpanData(); tutupModal('transactionModal');
    document.getElementById('inputNama').value = ''; document.getElementById('inputBeli').value = ''; document.getElementById('inputJual').value = '';
  });
}

let idYangAkanDihapus = null;
window.hapusTransaksi = function (id) { idYangAkanDihapus = id; document.getElementById('modalHapus').classList.add('active'); }
window.konfirmasiHapus = function () { if (idYangAkanDihapus !== null) { dataTransaksi = dataTransaksi.filter(trx => trx.id !== idYangAkanDihapus); simpanData(); idYangAkanDihapus = null; tutupModal('modalHapus'); } }
window.bukaModalEdit = function (id) {
  const trx = dataTransaksi.find(t => t.id === id);
  if (trx) {
    document.getElementById('editId').value = trx.id; document.getElementById('editNama').value = trx.nama;
    document.getElementById('editBeli').value = trx.hargaBeli; document.getElementById('editJual').value = trx.hargaJual;
    document.getElementById('modalEdit').classList.add('active');
  }
}
window.simpanEdit = function () {
  const id = parseInt(document.getElementById('editId').value), idx = dataTransaksi.findIndex(t => t.id === id);
  if (idx !== -1) {
    dataTransaksi[idx].nama = document.getElementById('editNama').value || 'Tanpa Nama';
    dataTransaksi[idx].hargaBeli = parseInt(document.getElementById('editBeli').value) || 0;
    dataTransaksi[idx].hargaJual = parseInt(document.getElementById('editJual').value) || 0;
    simpanData(); tutupModal('modalEdit');
  }
}
window.bukaModalHutang = function (id) { document.getElementById('hutangId').value = id; document.getElementById('inputNamaHutang').value = ''; document.getElementById('modalHutang').classList.add('active'); }
window.simpanHutang = function () {
  const id = parseInt(document.getElementById('hutangId').value), name = document.getElementById('inputNamaHutang').value || 'Tanpa Nama', idx = dataTransaksi.findIndex(t => t.id === id);
  if (idx !== -1) { dataTransaksi[idx].status = 'hutang'; dataTransaksi[idx].namaPenghutang = name; simpanData(); tutupModal('modalHutang'); }
}
window.bukaModalLunas = function (id) { document.getElementById('lunasId').value = id; document.getElementById('modalLunas').classList.add('active'); }
window.simpanLunas = function () {
  const id = parseInt(document.getElementById('lunasId').value), idx = dataTransaksi.findIndex(t => t.id === id);
  if (idx !== -1) {
    const now = new Date(); dataTransaksi[idx].status = 'lunas';
    dataTransaksi[idx].waktuLunas = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) + ' • ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    simpanData(); tutupModal('modalLunas');
  }
}
window.bukaModalEkspor = function () { document.getElementById('modalEkspor').classList.add('active'); }
window.prosesEkspor = function () {
  const now = new Date(), todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const waktuEkspor = todayStr + ' • ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const dataHariIni = dataTransaksi.filter(trx => trx.tanggal === todayStr);
  if (dataHariIni.length === 0) { alert('Data kosong untuk hari ini.'); tutupModal('modalEkspor'); return; }
  let totalModal = 0, totalJual = 0, totalLaba = 0;
  dataHariIni.forEach(trx => { totalModal += trx.hargaBeli; totalJual += trx.hargaJual; totalLaba += (trx.hargaJual - trx.hargaBeli); });
  dataLaporan.push({ id: Date.now(), tanggalTransaksi: todayStr, waktuEkspor: waktuEkspor, totalModal, totalJual, totalLaba, detailTransaksi: dataHariIni });
  localStorage.setItem('laporan_yuuki', JSON.stringify(dataLaporan));
  dataTransaksi = dataTransaksi.filter(trx => trx.tanggal !== todayStr); simpanData();
  tutupModal('modalEkspor'); window.location.href = 'laporan.html';
}
window.bukaModalDownload = function (id) { document.getElementById('downloadLaporanId').value = id; document.getElementById('modalDownloadLaporan').classList.add('active'); }
window.konfirmasiDownloadLaporan = function () {
  const id = parseInt(document.getElementById('downloadLaporanId').value), lap = dataLaporan.find(l => l.id === id);
  if (lap) {
    let tableHTML = `<table border="1"><thead><tr><th>ID</th><th>Tanggal</th><th>Jam</th><th>Nama Barang</th><th>Modal</th><th>Harga Jual</th><th>Untung</th><th>Status</th></tr></thead><tbody>`;
    lap.detailTransaksi.forEach(trx => { tableHTML += `<tr><td>${trx.id}</td><td>${trx.tanggal}</td><td>${trx.jam}</td><td>${trx.nama}</td><td>${trx.hargaBeli}</td><td>${trx.hargaJual}</td><td>${trx.hargaJual - trx.hargaBeli}</td><td>${trx.status}</td></tr>`; });
    tableHTML += `</tbody></table>`;
    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' }), url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `Laporan_YuukiCell_${lap.tanggalTransaksi.replace(/ /g, '_')}.xls`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }
  tutupModal('modalDownloadLaporan');
}
let idLaporanYangAkanDihapus = null;
window.hapusLaporan = function (id) { idLaporanYangAkanDihapus = id; document.getElementById('modalHapusLaporan').classList.add('active'); }
window.konfirmasiHapusLaporan = function () {
  if (idLaporanYangAkanDihapus !== null) { dataLaporan = dataLaporan.filter(l => l.id !== idLaporanYangAkanDihapus); localStorage.setItem('laporan_yuuki', JSON.stringify(dataLaporan)); renderLaporan(); if (typeof renderChart === 'function') renderChart(); idLaporanYangAkanDihapus = null; tutupModal('modalHapusLaporan'); }
}


// ==========================================
// 11. SISTEM INJEKSI RENDER OTOMATIS (SAFE GATE)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateDateTime();
  updateDashboard();
  if (document.getElementById('transactionList')) renderDaftarTransaksi();
  if (document.getElementById('laporanList')) renderLaporan();
  if (document.getElementById('kategoriList') || document.getElementById('produkList')) renderProdukUI();
  if (document.getElementById('fakturList')) renderFakturList();
  if (document.getElementById('profitChart')) renderChart();
});