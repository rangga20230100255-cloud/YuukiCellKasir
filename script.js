// --- FITUR JAM DAN TANGGAL ---
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
updateDateTime();

// --- FITUR TEMA (DARK MODE) ---
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

// --- INISIALISASI DATA LOCAL STORAGE ---
let dataTransaksi = JSON.parse(localStorage.getItem('riwayat_yuuki')) || [];
let dataLaporan = JSON.parse(localStorage.getItem('laporan_yuuki')) || [];
let dataProduk = JSON.parse(localStorage.getItem('produk_yuuki')) || [];
let dataKategori = JSON.parse(localStorage.getItem('kategori_yuuki')) || []; // Penyimpanan Keranjang

// Auto-Migrasi (Jika buka web versi baru tapi punya produk versi lama, otomatis buatkan kategorinya)
if (dataKategori.length === 0 && dataProduk.length > 0) {
  const cats = new Set();
  dataProduk.forEach(p => cats.add((p.kategori || 'UMUM').toUpperCase()));
  dataKategori = Array.from(cats);
  localStorage.setItem('kategori_yuuki', JSON.stringify(dataKategori));
}

dataTransaksi = dataTransaksi.map((trx, index) => {
  if (!trx.id) trx.id = Date.now() + index;
  return trx;
});

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

// --- IKON SVG MODERN UNTUK TOMBOL ---
const iconEdit = `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const iconDelete = `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
const iconCheck = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const iconBook = `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
const iconDownload = `<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
const iconPlus = `<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
const iconMinus = `<svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" fill="none"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

// --- RENDER DASHBOARD UTAMA & SENSOR MATA ---
function updateDashboard() {
  const elPenjualan = document.getElementById('totalPenjualan');
  const chartContainer = document.getElementById('chartContainer');
  if (!elPenjualan) return;

  let totalPenjualan = 0, totalModal = 0, totalLaba = 0;
  dataTransaksi.forEach(trx => {
    totalPenjualan += trx.hargaJual;
    totalModal += trx.hargaBeli;
    totalLaba += (trx.hargaJual - trx.hargaBeli);
  });

  const isVisible = localStorage.getItem('saldo_visible') !== 'false';
  if (isVisible) {
    elPenjualan.textContent = formatRupiah(totalPenjualan);
    document.getElementById('totalModal').textContent = formatRupiah(totalModal);
    document.getElementById('totalLaba').textContent = formatRupiah(totalLaba);
    if (chartContainer) chartContainer.style.display = 'block';
  } else {
    elPenjualan.textContent = 'Rp •••••••';
    document.getElementById('totalModal').textContent = 'Rp •••••••';
    document.getElementById('totalLaba').textContent = 'Rp •••••••';
    if (chartContainer) chartContainer.style.display = 'none';
  }
}

const btnToggleSaldo = document.getElementById('btnToggleSaldo');
if (btnToggleSaldo) {
  btnToggleSaldo.addEventListener('click', () => {
    const isVisible = localStorage.getItem('saldo_visible') !== 'false';
    localStorage.setItem('saldo_visible', isVisible ? 'false' : 'true');
    const iconEye = document.getElementById('iconEye');
    if (isVisible) {
      iconEye.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      iconEye.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
    updateDashboard();
  });
  const iconEye = document.getElementById('iconEye');
  if (localStorage.getItem('saldo_visible') === 'false') {
    iconEye.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  }
}

// --- LOGIKA GRAFIK BULANAN ---
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

  let displayLabels = labels.map(label => {
    if (label.includes(',')) return label.split(',')[1].trim().replace(/ \d{4}$/, '');
    return label;
  });

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
        label: 'Keuntungan',
        data: dataPoints,
        borderColor: '#39FF14',
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: isDark ? '#121212' : '#ffffff',
        pointBorderColor: '#39FF14',
        pointBorderWidth: 2,
        pointRadius: 4,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (context) { return formatRupiah(context.raw); } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor, font: { family: 'Space Grotesk' }, precision: 0, callback: function (value) { return 'Rp ' + value.toLocaleString('id-ID'); } } },
        x: { grid: { display: false }, ticks: { color: textColor, font: { family: 'Space Grotesk' } } }
      }
    }
  });

  const scrollWrapper = document.getElementById('chartScrollWrapper');
  if (scrollWrapper) {
    setTimeout(() => scrollWrapper.scrollLeft = scrollWrapper.scrollWidth, 100);
  }
}


// --- RENDER HALAMAN RIWAYAT & LAPORAN ---
window.toggleRiwayat = function (id) {
  const detailDiv = document.getElementById('riwayat-detail-' + id);
  const iconSvg = document.getElementById('icon-riwayat-toggle-' + id);
  if (detailDiv.style.display === 'none') {
    detailDiv.style.display = 'block';
    iconSvg.style.transform = 'rotate(180deg)';
  } else {
    detailDiv.style.display = 'none';
    iconSvg.style.transform = 'rotate(0deg)';
  }
}

function renderDaftarTransaksi() {
  const transactionList = document.getElementById('transactionList');
  const elRiwayatJual = document.getElementById('riwayatTotalJual');
  const elRiwayatModal = document.getElementById('riwayatTotalModal');
  const elRiwayatLaba = document.getElementById('riwayatTotalLaba');
  if (!transactionList) return;

  transactionList.innerHTML = '';
  let rTotalJual = 0, rTotalModal = 0, rTotalLaba = 0;

  if (dataTransaksi.length === 0) {
    transactionList.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada transaksi.</p>`;
    if (elRiwayatJual) elRiwayatJual.textContent = 'Rp 0';
    if (elRiwayatModal) elRiwayatModal.textContent = 'Rp 0';
    if (elRiwayatLaba) elRiwayatLaba.textContent = 'Rp 0';
    return;
  }

  [...dataTransaksi].reverse().forEach(trx => {
    const keuntungan = trx.hargaJual - trx.hargaBeli;
    rTotalJual += trx.hargaJual;
    rTotalModal += trx.hargaBeli;
    rTotalLaba += keuntungan;
    const trxCard = document.createElement('div');
    trxCard.classList.add('trx-card');

    let statusHtml = '';
    let tombolHutang = `<button class="action-btn" onclick="bukaModalHutang(${trx.id})">${iconBook} Hutang</button>`;
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

  if (elRiwayatJual) elRiwayatJual.textContent = formatRupiah(rTotalJual);
  if (elRiwayatModal) elRiwayatModal.textContent = formatRupiah(rTotalModal);
  if (elRiwayatLaba) elRiwayatLaba.textContent = formatRupiah(rTotalLaba);
}

window.toggleLaporan = function (id) {
  const detailDiv = document.getElementById('laporan-detail-' + id);
  const iconSvg = document.getElementById('icon-toggle-' + id);
  if (detailDiv.style.display === 'none') {
    detailDiv.style.display = 'block';
    iconSvg.style.transform = 'rotate(180deg)';
  } else {
    detailDiv.style.display = 'none';
    iconSvg.style.transform = 'rotate(0deg)';
  }
}

function renderLaporan() {
  const laporanList = document.getElementById('laporanList');
  const elGrandJual = document.getElementById('grandTotalJual');
  const elGrandModal = document.getElementById('grandTotalModal');
  const elGrandLaba = document.getElementById('grandTotalLaba');
  if (!laporanList) return;

  laporanList.innerHTML = '';
  if (dataLaporan.length === 0) {
    laporanList.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada laporan yang diekspor.</p>`;
    if (elGrandJual) elGrandJual.textContent = 'Rp 0';
    if (elGrandModal) elGrandModal.textContent = 'Rp 0';
    if (elGrandLaba) elGrandLaba.textContent = 'Rp 0';
    return;
  }

  let grandJual = 0, grandModal = 0, grandLaba = 0;
  [...dataLaporan].reverse().forEach(lap => {
    grandJual += lap.totalJual;
    grandModal += lap.totalModal;
    grandLaba += lap.totalLaba;
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

  if (elGrandJual) elGrandJual.textContent = formatRupiah(grandJual);
  if (elGrandModal) elGrandModal.textContent = formatRupiah(grandModal);
  if (elGrandLaba) elGrandLaba.textContent = formatRupiah(grandLaba);
}

// --- RENDER HALAMAN PRODUK (ALUR BARU: KATEGORI DULU, BARU PRODUK) ---
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
  if (!list) return;
  list.innerHTML = '';

  if (dataKategori.length === 0) {
    list.innerHTML = `<p style="grid-column: span 2; text-align:center; color:var(--text-muted); margin-top:20px;">Belum ada keranjang. Tambahkan kategori baru terlebih dahulu.</p>`;
    return;
  }

  // Buat kotak sesuai daftar Keranjang yang terdaftar di sistem
  dataKategori.forEach(kat => {
    let count = 0, modal = 0, jual = 0;

    // Hitung isi produk di dalam keranjang ini
    dataProduk.forEach(p => {
      if ((p.kategori || '').toUpperCase() === kat) {
        count++;
        modal += (p.hargaBeli * p.stok);
        jual += (p.hargaJual * p.stok);
      }
    });

    const card = document.createElement('div');
    card.classList.add('cat-card');
    card.onclick = () => {
      currentKategoriView = kat;
      renderProdukUI();
    };
    card.innerHTML = `
            <h4>${kat}</h4>
            <div class="cat-stat">Banyak Item <span>${count}</span></div>
            <div class="cat-stat">Total Modal <span>${formatRupiah(modal)}</span></div>
            <div class="cat-stat">Total Jual <span style="color:var(--stabilo-green);">${formatRupiah(jual)}</span></div>
        `;
    list.appendChild(card);
  });
}

function renderDaftarProdukKategori(kategoriTujuan) {
  const list = document.getElementById('produkList');
  document.getElementById('judulKategori').textContent = `Keranjang: ${kategoriTujuan}`;
  list.innerHTML = '';

  const filtered = dataProduk.filter(p => (p.kategori || '').toUpperCase() === kategoriTujuan).reverse();

  if (filtered.length === 0) {
    list.innerHTML = `<p style="text-align:center; color:var(--text-muted); margin-top:20px;">Keranjang ini masih kosong.</p>`;
    return;
  }

  filtered.forEach(prod => {
    const prodCard = document.createElement('div');
    prodCard.classList.add('trx-card');

    prodCard.innerHTML = `
            <div class="trx-header" style="align-items: flex-start; border-bottom: none; padding-bottom: 0;">
                <div>
                    <span class="trx-name" style="font-size: 1.15rem; color: var(--text-main);">${prod.nama}</span>
                </div>
                <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                    <p style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; margin:0;">Sisa Stok</p>
                    <div style="display: flex; align-items: center; gap: 10px; background: transparent; border: 1px solid var(--border-color); border-radius: 8px; padding: 2px 6px;">
                        <button class="action-btn" onclick="kurangiStok(${prod.id})" style="padding: 4px; border:none; background:transparent;">${iconMinus}</button>
                        <span style="font-weight: 700; color: var(--stabilo-green); font-size: 1.1rem; min-width: 20px; text-align: center;">${prod.stok}</span>
                        <button class="action-btn" onclick="tambahStok(${prod.id})" style="padding: 4px; border:none; background:transparent;">${iconPlus}</button>
                    </div>
                </div>
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
                <button class="action-btn" onclick="bukaModalEditProduk(${prod.id})">${iconEdit} Edit</button>
                <button class="action-btn btn-hapus" onclick="hapusProduk(${prod.id})">${iconDelete} Hapus</button>
            </div>
        `;
    list.appendChild(prodCard);
  });
}

window.kembaliKeKategori = function () {
  currentKategoriView = null;
  renderProdukUI();
}

window.tambahStok = function (id) {
  const prod = dataProduk.find(p => p.id === id);
  if (prod) {
    prod.stok++;
    simpanDataProduk();
  }
}
window.kurangiStok = function (id) {
  const prod = dataProduk.find(p => p.id === id);
  if (prod && prod.stok > 0) {
    prod.stok--;
    simpanDataProduk();
  }
}

// PEMANGGILAN AWAL
renderDaftarTransaksi();
updateDashboard();
renderLaporan();
renderProdukUI();
if (typeof renderChart === 'function') renderChart();

// --- FUNGSI GLOBAL & MODAL ---
function simpanData() {
  localStorage.setItem('riwayat_yuuki', JSON.stringify(dataTransaksi));
  renderDaftarTransaksi();
  updateDashboard();
  if (typeof renderChart === 'function') renderChart();
}

function simpanDataProduk() {
  localStorage.setItem('produk_yuuki', JSON.stringify(dataProduk));
  localStorage.setItem('kategori_yuuki', JSON.stringify(dataKategori)); // Menyimpan daftar kategori
  renderProdukUI();
}

function tutupModal(idModal) {
  document.getElementById(idModal).classList.remove('active');
}

// --- LOGIKA MANAJEMEN PRODUK KUSTOM ---
window.bukaModalTambahKategori = function () {
  document.getElementById('modalTambahKategori').classList.add('active');
}
window.simpanKategoriBaru = function () {
  const inputKategori = document.getElementById('katNama').value.trim().toUpperCase();
  const namaKategori = inputKategori || 'UMUM';

  // Jangan izinkan duplikat
  if (!dataKategori.includes(namaKategori)) {
    dataKategori.push(namaKategori);
    simpanDataProduk();
  }

  tutupModal('modalTambahKategori');
  document.getElementById('katNama').value = '';
}

window.bukaModalTambahProduk = function () {
  document.getElementById('modalTambahProduk').classList.add('active');
}
window.simpanProdukBaru = function () {
  const nama = document.getElementById('prodNama').value || 'Tanpa Nama';
  const kategori = currentKategoriView || 'UMUM'; // Otomatis mengisi Kategori sesuai layar keranjang
  const stok = parseInt(document.getElementById('prodStok').value) || 0;
  const beli = parseInt(document.getElementById('prodBeli').value) || 0;
  const jual = parseInt(document.getElementById('prodJual').value) || 0;

  dataProduk.push({ id: Date.now(), nama, kategori, stok, hargaBeli: beli, hargaJual: jual });
  simpanDataProduk();
  tutupModal('modalTambahProduk');

  document.getElementById('prodNama').value = '';
  document.getElementById('prodStok').value = '';
  document.getElementById('prodBeli').value = '';
  document.getElementById('prodJual').value = '';
}

window.bukaModalEditProduk = function (id) {
  const prod = dataProduk.find(p => p.id === id);
  if (prod) {
    document.getElementById('editProdId').value = prod.id;
    document.getElementById('editProdNama').value = prod.nama;
    document.getElementById('editProdStok').value = prod.stok;
    document.getElementById('editProdBeli').value = prod.hargaBeli;
    document.getElementById('editProdJual').value = prod.hargaJual;
    document.getElementById('modalEditProduk').classList.add('active');
  }
}

window.simpanEditProduk = function () {
  const id = parseInt(document.getElementById('editProdId').value);
  const index = dataProduk.findIndex(p => p.id === id);
  if (index !== -1) {
    dataProduk[index].nama = document.getElementById('editProdNama').value || 'Tanpa Nama';
    dataProduk[index].stok = parseInt(document.getElementById('editProdStok').value) || 0;
    dataProduk[index].hargaBeli = parseInt(document.getElementById('editProdBeli').value) || 0;
    dataProduk[index].hargaJual = parseInt(document.getElementById('editProdJual').value) || 0;
    simpanDataProduk();
    tutupModal('modalEditProduk');
  }
}

let idProdukYangAkanDihapus = null;
window.hapusProduk = function (id) {
  idProdukYangAkanDihapus = id;
  document.getElementById('modalHapusProduk').classList.add('active');
}
window.konfirmasiHapusProduk = function () {
  if (idProdukYangAkanDihapus !== null) {
    dataProduk = dataProduk.filter(p => p.id !== idProdukYangAkanDihapus);
    simpanDataProduk();
    idProdukYangAkanDihapus = null;
    tutupModal('modalHapusProduk');
  }
}

window.bukaModalHapusSemuaProduk = function () {
  if (dataKategori.length === 0 && dataProduk.length === 0) return alert('Katalog sudah kosong!');
  document.getElementById('modalHapusSemuaProduk').classList.add('active');
}
window.konfirmasiHapusSemuaProduk = function () {
  // Bersihkan semua produk dan keranjangnya sampai akarnya
  dataProduk = [];
  dataKategori = [];
  simpanDataProduk();
  tutupModal('modalHapusSemuaProduk');
  currentKategoriView = null;
  renderProdukUI();
}

// --- LOGIKA KALKULATOR DINAMIS ---
let currentCalcInput = '0';
const calcScreen = document.getElementById('calcScreen');

window.tekanKalkulator = function (val) {
  if (!calcScreen) return;
  if (currentCalcInput === '0' && val !== '.' && val !== '*' && val !== '/' && val !== '+' && val !== '-') {
    currentCalcInput = val;
  } else {
    const lastChar = currentCalcInput.slice(-1);
    const isOp = (char) => ['+', '-', '*', '/'].includes(char);
    if (isOp(lastChar) && isOp(val)) {
      currentCalcInput = currentCalcInput.slice(0, -1) + val;
    } else {
      currentCalcInput += val;
    }
  }
  updateLayarKalkulator();
}

window.hitungKalkulator = function () {
  if (!calcScreen) return;
  try {
    let hasil = eval(currentCalcInput);
    if (!Number.isInteger(hasil)) hasil = parseFloat(hasil.toFixed(4));
    currentCalcInput = String(hasil);
    updateLayarKalkulator();
  } catch (e) {
    calcScreen.textContent = 'Error';
    setTimeout(() => {
      currentCalcInput = '0';
      updateLayarKalkulator();
    }, 1000);
  }
}

window.hapusKalkulator = function () {
  if (!calcScreen) return;
  currentCalcInput = '0';
  updateLayarKalkulator();
}

window.hapusSatuKalkulator = function () {
  if (!calcScreen) return;
  if (currentCalcInput.length > 1) {
    currentCalcInput = currentCalcInput.slice(0, -1);
  } else {
    currentCalcInput = '0';
  }
  updateLayarKalkulator();
}

function updateLayarKalkulator() {
  calcScreen.textContent = currentCalcInput.replace(/\*/g, '×').replace(/\//g, '÷');
}

// --- LOGIKA TRANSAKSI ---
const btnTransaksiBaru = document.getElementById('btnTransaksiBaru');
if (btnTransaksiBaru && !document.getElementById('produkList')) {
  btnTransaksiBaru.addEventListener('click', () => document.getElementById('transactionModal').classList.add('active'));
  document.getElementById('btnBatal').addEventListener('click', () => tutupModal('transactionModal'));

  document.getElementById('btnTambah').addEventListener('click', () => {
    const now = new Date();
    const trxBaru = {
      id: Date.now(),
      nama: document.getElementById('inputNama').value || 'Tanpa Nama',
      hargaBeli: parseInt(document.getElementById('inputBeli').value) || 0,
      hargaJual: parseInt(document.getElementById('inputJual').value) || 0,
      tanggal: now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      jam: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
      status: 'normal'
    };
    dataTransaksi.push(trxBaru);
    simpanData();
    tutupModal('transactionModal');
    document.getElementById('inputNama').value = '';
    document.getElementById('inputBeli').value = '';
    document.getElementById('inputJual').value = '';
  });
}
let idYangAkanDihapus = null;
window.hapusTransaksi = function (id) {
  idYangAkanDihapus = id;
  document.getElementById('modalHapus').classList.add('active');
}
window.konfirmasiHapus = function () {
  if (idYangAkanDihapus !== null) {
    dataTransaksi = dataTransaksi.filter(trx => trx.id !== idYangAkanDihapus);
    simpanData();
    idYangAkanDihapus = null;
    tutupModal('modalHapus');
  }
}
window.bukaModalEdit = function (id) {
  const trx = dataTransaksi.find(t => t.id === id);
  if (trx) {
    document.getElementById('editId').value = trx.id;
    document.getElementById('editNama').value = trx.nama;
    document.getElementById('editBeli').value = trx.hargaBeli;
    document.getElementById('editJual').value = trx.hargaJual;
    document.getElementById('modalEdit').classList.add('active');
  }
}
window.simpanEdit = function () {
  const id = parseInt(document.getElementById('editId').value);
  const trxIndex = dataTransaksi.findIndex(t => t.id === id);
  if (trxIndex !== -1) {
    dataTransaksi[trxIndex].nama = document.getElementById('editNama').value || 'Tanpa Nama';
    dataTransaksi[trxIndex].hargaBeli = parseInt(document.getElementById('editBeli').value) || 0;
    dataTransaksi[trxIndex].hargaJual = parseInt(document.getElementById('editJual').value) || 0;
    simpanData();
    tutupModal('modalEdit');
  }
}
window.bukaModalHutang = function (id) {
  document.getElementById('hutangId').value = id;
  document.getElementById('inputNamaHutang').value = '';
  document.getElementById('modalHutang').classList.add('active');
}
window.simpanHutang = function () {
  const id = parseInt(document.getElementById('hutangId').value);
  const namaPenghutang = document.getElementById('inputNamaHutang').value || 'Tanpa Nama';
  const trxIndex = dataTransaksi.findIndex(t => t.id === id);
  if (trxIndex !== -1) {
    dataTransaksi[trxIndex].status = 'hutang';
    dataTransaksi[trxIndex].namaPenghutang = namaPenghutang;
    simpanData();
    tutupModal('modalHutang');
  }
}
window.bukaModalLunas = function (id) {
  document.getElementById('lunasId').value = id;
  document.getElementById('modalLunas').classList.add('active');
}
window.simpanLunas = function () {
  const id = parseInt(document.getElementById('lunasId').value);
  const trxIndex = dataTransaksi.findIndex(t => t.id === id);
  if (trxIndex !== -1) {
    const now = new Date();
    dataTransaksi[trxIndex].status = 'lunas';
    dataTransaksi[trxIndex].waktuLunas = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }) + ' • ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    simpanData();
    tutupModal('modalLunas');
  }
}
window.bukaModalEkspor = function () {
  document.getElementById('modalEkspor').classList.add('active');
}
window.prosesEkspor = function () {
  const now = new Date();
  const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  const waktuEkspor = todayStr + ' • ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  const dataHariIni = dataTransaksi.filter(trx => trx.tanggal === todayStr);
  if (dataHariIni.length === 0) {
    alert('Data kosong. Belum ada transaksi yang tercatat hari ini.');
    tutupModal('modalEkspor');
    return;
  }
  let totalModal = 0, totalJual = 0, totalLaba = 0;
  dataHariIni.forEach(trx => {
    totalModal += trx.hargaBeli;
    totalJual += trx.hargaJual;
    totalLaba += (trx.hargaJual - trx.hargaBeli);
  });
  const laporanBaru = {
    id: Date.now(),
    tanggalTransaksi: todayStr,
    waktuEkspor: waktuEkspor,
    totalModal: totalModal,
    totalJual: totalJual,
    totalLaba: totalLaba,
    detailTransaksi: dataHariIni
  };
  dataLaporan.push(laporanBaru);
  localStorage.setItem('laporan_yuuki', JSON.stringify(dataLaporan));
  dataTransaksi = dataTransaksi.filter(trx => trx.tanggal !== todayStr);
  simpanData();
  tutupModal('modalEkspor');
  window.location.href = 'laporan.html';
}
window.bukaModalDownload = function (id) {
  document.getElementById('downloadLaporanId').value = id;
  document.getElementById('modalDownloadLaporan').classList.add('active');
}
window.konfirmasiDownloadLaporan = function () {
  const id = parseInt(document.getElementById('downloadLaporanId').value);
  const lap = dataLaporan.find(l => l.id === id);
  if (lap && lap.detailTransaksi) {
    let tableHTML = `<table border="1"><thead><tr><th style="background-color: #39FF14; color: #000;"><b>ID</b></th><th style="background-color: #39FF14; color: #000;"><b>Tanggal</b></th><th style="background-color: #39FF14; color: #000;"><b>Jam</b></th><th style="background-color: #39FF14; color: #000;"><b>Nama Barang</b></th><th style="background-color: #39FF14; color: #000;"><b>Harga Beli (Modal)</b></th><th style="background-color: #39FF14; color: #000;"><b>Harga Jual</b></th><th style="background-color: #39FF14; color: #000;"><b>Keuntungan</b></th><th style="background-color: #39FF14; color: #000;"><b>Status</b></th><th style="background-color: #39FF14; color: #000;"><b>Keterangan</b></th></tr></thead><tbody>`;
    lap.detailTransaksi.forEach(trx => {
      const untung = trx.hargaJual - trx.hargaBeli;
      let statusTeks = trx.status === 'normal' ? 'Lunas' : (trx.status === 'hutang' ? 'Hutang' : 'Lunas (Pelunasan Hutang)');
      let keterangan = trx.namaPenghutang ? `A/n: ${trx.namaPenghutang}` : '-';
      if (trx.status === 'lunas' && trx.waktuLunas) keterangan += ` (Waktu Lunas: ${trx.waktuLunas})`;
      tableHTML += `<tr><td>${trx.id}</td><td>${trx.tanggal}</td><td>${trx.jam}</td><td>${trx.nama}</td><td>${trx.hargaBeli}</td><td>${trx.hargaJual}</td><td>${untung}</td><td>${statusTeks}</td><td>${keterangan}</td></tr>`;
    });
    tableHTML += `<tr><td colspan="4" style="text-align: right; background-color: #f4f4f5;"><b>TOTAL KESELURUHAN HARI INI:</b></td><td style="background-color: #f4f4f5;"><b>${lap.totalModal}</b></td><td style="background-color: #f4f4f5;"><b>${lap.totalJual}</b></td><td style="background-color: #f4f4f5;"><b>${lap.totalLaba}</b></td><td colspan="2" style="background-color: #f4f4f5;"></td></tr></tbody></table>`;
    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Laporan_Harian_YuukiCell_${lap.tanggalTransaksi.replace(/ /g, '_')}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else {
    alert('Maaf, detail transaksi tidak ditemukan untuk laporan ini.');
  }
  tutupModal('modalDownloadLaporan');
}