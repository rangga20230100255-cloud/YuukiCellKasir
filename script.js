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
    if (targetTheme === 'light') {
      bodyElement.removeAttribute('data-theme');
    } else {
      bodyElement.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('theme', targetTheme);
  });
}

// --- LOGIKA DATA TRANSAKSI ---
let dataTransaksi = JSON.parse(localStorage.getItem('riwayat_yuuki')) || [];
dataTransaksi = dataTransaksi.map((trx, index) => {
  if (!trx.id) trx.id = Date.now() + index;
  return trx;
});

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

// Render daftar transaksi
function renderDaftarTransaksi() {
  const transactionList = document.getElementById('transactionList');
  if (!transactionList) return;

  transactionList.innerHTML = '';

  [...dataTransaksi].reverse().forEach(trx => {
    const keuntungan = trx.hargaJual - trx.hargaBeli;
    const trxCard = document.createElement('div');
    trxCard.classList.add('trx-card');

    let statusHtml = '';
    let tombolHutang = `<button class="action-btn" onclick="bukaModalHutang(${trx.id})">📒 Hutang</button>`;

    if (trx.status === 'hutang') {
      statusHtml = `
                <div class="status-box hutang">
                    <p class="title">BELUM LUNAS (A/n: ${trx.namaPenghutang})</p>
                </div>`;
      tombolHutang = `<button class="action-btn btn-lunas" onclick="bukaModalLunas(${trx.id})">✅ Lunaskan</button>`;
    } else if (trx.status === 'lunas') {
      statusHtml = `
                <div class="status-box lunas">
                    <p class="title">LUNAS (A/n: ${trx.namaPenghutang})</p>
                    <p class="time">${trx.waktuLunas}</p>
                </div>`;
      tombolHutang = `<button class="action-btn" disabled>✅ Selesai</button>`;
    }

    trxCard.innerHTML = `
            <div class="trx-header">
                <span class="trx-name">${trx.nama}</span>
                <span class="trx-date">${trx.tanggal} • ${trx.jam}</span>
            </div>
            <div class="trx-details">
                <div class="trx-detail-item"><p>Harga Beli</p><h4>${formatRupiah(trx.hargaBeli)}</h4></div>
                <div class="trx-detail-item"><p>Harga Jual</p><h4>${formatRupiah(trx.hargaJual)}</h4></div>
            </div>
            <div class="trx-profit">
                <p>Keuntungan</p><h4>${formatRupiah(keuntungan)}</h4>
            </div>
            ${statusHtml}
            <div class="trx-actions">
                <button class="action-btn" onclick="bukaModalEdit(${trx.id})">✏️ Edit</button>
                <button class="action-btn" onclick="hapusTransaksi(${trx.id})">🗑️ Hapus</button>
                ${tombolHutang}
            </div>
        `;
    transactionList.appendChild(trxCard);
  });
}

// --- UPDATE ANGKA DASHBOARD & CEK SENSOR SALDO ---
function updateDashboard() {
  const elPenjualan = document.getElementById('totalPenjualan');
  if (!elPenjualan) return;

  let totalPenjualan = 0, totalModal = 0, totalLaba = 0;
  dataTransaksi.forEach(trx => {
    totalPenjualan += trx.hargaJual;
    totalModal += trx.hargaBeli;
    totalLaba += (trx.hargaJual - trx.hargaBeli);
  });

  // Cek memori apakah saldo sedang disembunyikan
  const isVisible = localStorage.getItem('saldo_visible') !== 'false';

  if (isVisible) {
    // Tampilkan Angka Asli
    elPenjualan.textContent = formatRupiah(totalPenjualan);
    document.getElementById('totalModal').textContent = formatRupiah(totalModal);
    document.getElementById('totalLaba').textContent = formatRupiah(totalLaba);
  } else {
    // Sembunyikan Angka
    elPenjualan.textContent = 'Rp •••••••';
    document.getElementById('totalModal').textContent = 'Rp •••••••';
    document.getElementById('totalLaba').textContent = 'Rp •••••••';
  }
}

// --- FITUR TOMBOL MATA (SEMBUNYIKAN SALDO) ---
const btnToggleSaldo = document.getElementById('btnToggleSaldo');
if (btnToggleSaldo) {
  btnToggleSaldo.addEventListener('click', () => {
    const isVisible = localStorage.getItem('saldo_visible') !== 'false';
    // Ubah status memori (dari true ke false, atau sebaliknya)
    localStorage.setItem('saldo_visible', isVisible ? 'false' : 'true');

    // Ganti Ikon Mata (Tercoret / Terbuka)
    const iconEye = document.getElementById('iconEye');
    if (isVisible) {
      iconEye.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      iconEye.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }

    updateDashboard(); // Segarkan teks saldo
  });

  // Pengecekan ikon saat pertama kali web dimuat
  const iconEye = document.getElementById('iconEye');
  if (localStorage.getItem('saldo_visible') === 'false') {
    iconEye.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
  }
}
renderDaftarTransaksi();
updateDashboard();

// --- FUNGSI GLOBAL UNTUK POPUP & AKSI ---
function simpanData() {
  localStorage.setItem('riwayat_yuuki', JSON.stringify(dataTransaksi));
  renderDaftarTransaksi();
  updateDashboard();
}

function tutupModal(idModal) {
  document.getElementById(idModal).classList.remove('active');
}

// 1. TAMBAH TRANSAKSI
const btnTransaksiBaru = document.getElementById('btnTransaksiBaru');
if (btnTransaksiBaru) {
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

// 2. HAPUS TRANSAKSI
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

// 3. EDIT TRANSAKSI
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

// 4. HUTANG
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

// 5. PELUNASAN
window.bukaModalLunas = function (id) {
  document.getElementById('lunasId').value = id;
  document.getElementById('modalLunas').classList.add('active');
}
window.simpanLunas = function () {
  const id = parseInt(document.getElementById('lunasId').value);
  const trxIndex = dataTransaksi.findIndex(t => t.id === id);
  if (trxIndex !== -1) {
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
    const jam = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    dataTransaksi[trxIndex].status = 'lunas';
    dataTransaksi[trxIndex].waktuLunas = `${tanggal} • ${jam}`;
    simpanData();
    tutupModal('modalLunas');
  }
}

// 6. FITUR EKSPOR EXCEL (.xls)
window.bukaModalEkspor = function () {
  document.getElementById('modalEkspor').classList.add('active');
}
window.prosesEkspor = function () {
  const now = new Date();
  // Mendapatkan tanggal hari ini dalam format yang sama dengan data yang disimpan
  const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

  // Saring hanya transaksi yang tanggalnya cocok dengan hari ini
  const dataHariIni = dataTransaksi.filter(trx => trx.tanggal === todayStr);

  if (dataHariIni.length === 0) {
    alert('Data kosong. Belum ada transaksi yang tercatat hari ini.');
    tutupModal('modalEkspor');
    return;
  }

  // Membuat struktur tabel HTML dengan Tag <b> untuk membuat huruf kolom TEBAL
  let tableHTML = `
        <table border="1">
            <thead>
                <tr>
                    <th style="background-color: #39FF14; color: #000;"><b>ID</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Tanggal</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Jam</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Nama Barang</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Harga Beli (Modal)</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Harga Jual</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Keuntungan</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Status</b></th>
                    <th style="background-color: #39FF14; color: #000;"><b>Keterangan</b></th>
                </tr>
            </thead>
            <tbody>
    `;

  dataHariIni.forEach(trx => {
    const untung = trx.hargaJual - trx.hargaBeli;
    let statusTeks = trx.status === 'normal' ? 'Lunas' : (trx.status === 'hutang' ? 'Hutang' : 'Lunas (Pelunasan Hutang)');
    let keterangan = trx.namaPenghutang ? `A/n: ${trx.namaPenghutang}` : '-';
    if (trx.status === 'lunas' && trx.waktuLunas) keterangan += ` (Waktu Lunas: ${trx.waktuLunas})`;

    tableHTML += `
            <tr>
                <td>${trx.id}</td>
                <td>${trx.tanggal}</td>
                <td>${trx.jam}</td>
                <td>${trx.nama}</td>
                <td>${trx.hargaBeli}</td>
                <td>${trx.hargaJual}</td>
                <td>${untung}</td>
                <td>${statusTeks}</td>
                <td>${keterangan}</td>
            </tr>
        `;
  });

  tableHTML += `</tbody></table>`;

  // Mengubah HTML menjadi format Excel (.xls)
  const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  // Membuat trigger download otomatis
  const a = document.createElement('a');
  a.href = url;
  a.download = `Laporan_Harian_YuukiCell_${todayStr.replace(/ /g, '_')}.xls`;

  document.body.appendChild(a);
  a.click();

  // Membersihkan memori browser setelah terunduh
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  tutupModal('modalEkspor');
}