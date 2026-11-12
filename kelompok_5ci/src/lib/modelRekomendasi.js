/*
  Hybrid recommender (collaborative + content) dalam JavaScript murni, tanpa dependensi.
  Ini port dari k5_recommender/train.py (bagian "model final"), supaya admin bisa melatih
  ulang langsung dari aplikasi tanpa server Python.

  Ide yang sama dengan train.py:
    - Sinyal perilaku : keranjang (bobot 1) + pesanan (bobot 3), dijumlah per (user, produk).
    - Sinyal konten   : TF-IDF nama + deskripsi, ditambah one-hot kategori.
    - Model           : BPR dengan embedding.
                        vektor item = E[i] + F[i] @ W   <- bagian hybrid
                        skor(u, i)  = P[u] . vektor_item(i) + b[i]
    - Produk yang belum pernah muncul di data: E = 0, bias = median, jadi skornya murni dari
      fitur konten (produk baru tetap bisa direkomendasikan).

  Catatan: evaluasi Precision@5 / Recall@5 untuk paper tetap memakai train.py.
  File ini hanya untuk menghasilkan rekomendasi yang tampil di aplikasi.
*/

const W_BELI = 3.0;
const W_KERANJANG = 1.0;
const STOP = new Set(
  'dan yang di ke dari the and with for a an of in on to is are dengan untuk atau'.split(' '),
);

// Pengacak berbenih (mulberry32) supaya hasil bisa diulang.
function buatRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------ 1. Data ------------------------------ */

// Gabungkan keranjang + pesanan jadi satu daftar (user, item, bobot, beli).
function bangunInteraksi(iMap, penjualan, keranjang) {
  const peta = new Map(); // "user|produk" -> { user, produk, jumlah, n }
  const ambil = (user, produk) => {
    const k = `${user}\u0001${produk}`;
    if (!peta.has(k)) peta.set(k, { user, produk, jumlah: 0, n: 0 });
    return peta.get(k);
  };

  for (const r of penjualan || []) {
    const p = String(r.product_id);
    if (!r.user_id || !iMap.has(p)) continue;
    ambil(String(r.user_id), p).jumlah += Math.max(1, Number(r.jumlah) || 1);
  }
  for (const r of keranjang || []) {
    const p = String(r.product_id);
    if (r.aksi !== 'tambah' || !r.user_id || !iMap.has(p)) continue;
    ambil(String(r.user_id), p).n += 1;
  }

  const hasil = [];
  for (const x of peta.values()) {
    let w = 0;
    if (x.jumlah > 0) w += W_BELI * (1 + Math.log(x.jumlah));
    if (x.n > 0) w += W_KERANJANG * (1 + Math.log(x.n));
    hasil.push({ user: x.user, produk: x.produk, w, beli: x.jumlah > 0 });
  }
  return hasil;
}

function l2(v) {
  let s = 0;
  for (let k = 0; k < v.length; k++) s += v[k] * v[k];
  const d = Math.max(Math.sqrt(s), 1e-12);
  for (let k = 0; k < v.length; k++) v[k] /= d;
  return v;
}

// TF-IDF (nama + deskripsi) + one-hot kategori. Mengembalikan { Fsp, D } (bentuk sparse).
function fiturKonten(produk) {
  const docs = produk.map((p) =>
    (`${p.nama ?? ''} ${p.deskripsi ?? ''}`.toLowerCase().match(/[a-z0-9]+/g) || [])
      .filter((k) => k.length > 2 && !STOP.has(k)),
  );
  const kata = [...new Set(docs.flat())].sort();
  const vocab = new Map(kata.map((k, n) => [k, n]));
  const N = docs.length;
  const V = vocab.size;
  const kat = [...new Set(produk.map((p) => String(p.kategori ?? '').toLowerCase()))].sort();
  const D = V + kat.length;

  const df = new Float64Array(V);
  docs.forEach((d) => new Set(d).forEach((k) => { df[vocab.get(k)] += 1; }));

  const Fsp = docs.map((d, n) => {
    const teks = new Float64Array(V);
    d.forEach((k) => { teks[vocab.get(k)] += 1; });
    for (let j = 0; j < V; j++) teks[j] *= Math.log((1 + N) / (1 + df[j])) + 1;
    l2(teks);
    const row = new Float64Array(D);
    row.set(teks, 0);
    row[V + kat.indexOf(String(produk[n].kategori ?? '').toLowerCase())] = 1;
    l2(row);
    const idx = [];
    const val = [];
    for (let j = 0; j < D; j++) if (row[j] !== 0) { idx.push(j); val.push(row[j]); }
    return { idx: Int32Array.from(idx), val: Float64Array.from(val) };
  });
  return { Fsp, D };
}

/* ------------------------------ 2. Model ------------------------------ */

function latihBPR({ nUsers, nItems, Fsp, D, u, i, w, dim, reg, lr, epochs, batch, seed }) {
  const rand = buatRng(seed);
  const randn = () => {
    let a = 0;
    while (a === 0) a = rand();
    return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * rand());
  };
  const acak = (n) => {
    const a = new Float64Array(n);
    for (let k = 0; k < n; k++) a[k] = 0.1 * randn();
    return a;
  };

  const P = acak(nUsers * dim);
  const E = acak(nItems * dim);
  const W = acak(D * dim);
  const b = new Float64Array(nItems);
  const params = { P, E, b, W };
  const m = {};
  const v = {};
  for (const k of Object.keys(params)) {
    m[k] = new Float64Array(params[k].length);
    v[k] = new Float64Array(params[k].length);
  }
  let langkah = 0;

  const seen = new Uint8Array(nUsers * nItems);
  for (let k = 0; k < u.length; k++) seen[u[k] * nItems + i[k]] = 1;
  const warm = Int32Array.from(new Set(i)).sort();

  // sampling pasangan positif sebanding dengan bobot
  const cum = new Float64Array(w.length);
  let tot = 0;
  for (let k = 0; k < w.length; k++) { tot += w[k]; cum[k] = tot; }
  const pilih = () => {
    const r = rand() * tot;
    let lo = 0;
    let hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < r) lo = mid + 1; else hi = mid;
    }
    return lo;
  };

  const nSamp = Math.max(u.length, 2048);
  const uu = new Int32Array(nSamp);
  const ii = new Int32Array(nSamp);
  const jj = new Int32Array(nSamp);
  const Q = new Float64Array(nItems * dim);
  const gP = new Float64Array(P.length);
  const gE = new Float64Array(E.length);
  const gW = new Float64Array(W.length);
  const gb = new Float64Array(nItems);
  const gQ = new Float64Array(E.length);
  const grads = { P: gP, E: gE, b: gb, W: gW };

  const hitungQ = () => {
    for (let it = 0; it < nItems; it++) {
      for (let d = 0; d < dim; d++) Q[it * dim + d] = E[it * dim + d];
      const { idx, val } = Fsp[it];
      for (let t = 0; t < idx.length; t++) {
        const f = idx[t] * dim;
        const x = val[t];
        for (let d = 0; d < dim; d++) Q[it * dim + d] += x * W[f + d];
      }
    }
  };

  for (let ep = 0; ep < epochs; ep++) {
    for (let s = 0; s < nSamp; s++) {
      const k = pilih();
      uu[s] = u[k];
      ii[s] = i[k];
      // negatif: produk "warm" yang belum pernah disentuh user itu
      let j = warm[Math.floor(rand() * warm.length)];
      for (let r = 0; r < 5 && seen[uu[s] * nItems + j]; r++) {
        j = warm[Math.floor(rand() * warm.length)];
      }
      jj[s] = j;
    }

    for (let s0 = 0; s0 < nSamp; s0 += batch) {
      const bs = Math.min(batch, nSamp - s0);
      hitungQ();
      gP.fill(0); gE.fill(0); gW.fill(0); gb.fill(0); gQ.fill(0);

      for (let k = 0; k < bs; k++) {
        const ub = uu[s0 + k] * dim;
        const ib = ii[s0 + k];
        const jb = jj[s0 + k];
        const pi = ib * dim;
        const pj = jb * dim;
        let x = b[ib] - b[jb];
        for (let d = 0; d < dim; d++) x += (Q[pi + d] - Q[pj + d]) * P[ub + d];
        const g = 1 / (1 + Math.exp(Math.min(30, Math.max(-30, x)))); // sigma(-x)
        const c = g / bs;
        for (let d = 0; d < dim; d++) {
          const pu = P[ub + d];
          const diff = Q[pi + d] - Q[pj + d];
          gP[ub + d] += -c * diff + (reg * pu) / bs;
          gQ[pi + d] += -c * pu;
          gQ[pj + d] += c * pu;
          gE[pi + d] += -c * pu + (reg * E[pi + d]) / bs;
          gE[pj + d] += c * pu + (reg * E[pj + d]) / bs;
        }
        gb[ib] -= c;
        gb[jb] += c;
      }

      // gradien W = F^T gQ + regularisasi
      for (let it = 0; it < nItems; it++) {
        const { idx, val } = Fsp[it];
        for (let t = 0; t < idx.length; t++) {
          const f = idx[t] * dim;
          const x = val[t];
          for (let d = 0; d < dim; d++) gW[f + d] += x * gQ[it * dim + d];
        }
      }
      for (let q = 0; q < W.length; q++) gW[q] += (reg * W[q]) / bs;

      // Adam
      langkah += 1;
      const c1 = 1 - Math.pow(0.9, langkah);
      const c2 = 1 - Math.pow(0.999, langkah);
      for (const key of Object.keys(params)) {
        const p = params[key];
        const gr = grads[key];
        const mk = m[key];
        const vk = v[key];
        for (let q = 0; q < p.length; q++) {
          mk[q] = 0.9 * mk[q] + 0.1 * gr[q];
          vk[q] = 0.999 * vk[q] + 0.001 * gr[q] * gr[q];
          p[q] -= (lr * (mk[q] / c1)) / (Math.sqrt(vk[q] / c2) + 1e-8);
        }
      }
    }
  }

  // Produk yang belum pernah muncul di data: tanpa embedding bebas, bias = median produk lain
  const adaWarm = new Set(warm);
  const biasWarm = Array.from(warm, (it) => b[it]).sort((x, y) => x - y);
  const median = biasWarm.length % 2
    ? biasWarm[(biasWarm.length - 1) / 2]
    : (biasWarm[biasWarm.length / 2 - 1] + biasWarm[biasWarm.length / 2]) / 2;
  for (let it = 0; it < nItems; it++) {
    if (!adaWarm.has(it)) {
      for (let d = 0; d < dim; d++) E[it * dim + d] = 0;
      b[it] = median;
    }
  }
  hitungQ();
  return { P, Q, b, dim, seen };
}

/* ------------------------------ 3. Pintu masuk ------------------------------ */

/*
  data = { produk: [{id, nama, kategori, deskripsi}],
           penjualan: [{user_id, product_id, jumlah, created_at}],
           keranjang: [{user_id, product_id, aksi, created_at}] }
  Hasil: { rows: [{user_id, product_id, rank, skor, strategi}], ringkasan }
*/
export function hitungRekomendasi(data, opsi = {}) {
  const { dim = 16, reg = 0.05, lr = 0.02, epochs = 60, topN = 10, seed = 0 } = opsi;
  const produk = data.produk || [];
  if (produk.length === 0) throw new Error('Belum ada produk.');

  const items = produk.map((p) => String(p.id));
  const iMap = new Map(items.map((id, n) => [id, n]));
  const inter = bangunInteraksi(iMap, data.penjualan, data.keranjang);
  if (inter.length === 0) throw new Error('Belum ada riwayat keranjang atau pesanan.');

  const userIds = [...new Set(inter.map((x) => x.user))].sort();
  const uMap = new Map(userIds.map((id, n) => [id, n]));
  const u = Int32Array.from(inter, (x) => uMap.get(x.user));
  const i = Int32Array.from(inter, (x) => iMap.get(x.produk));
  const w = Float64Array.from(inter, (x) => x.w);
  const { Fsp, D } = fiturKonten(produk);
  const nUsers = userIds.length;
  const nItems = items.length;

  const model = latihBPR({
    nUsers, nItems, Fsp, D, u, i, w, dim, reg, lr, epochs, batch: 256, seed,
  });

  const rows = [];
  for (let uIdx = 0; uIdx < nUsers; uIdx++) {
    const kandidat = [];
    for (let it = 0; it < nItems; it++) {
      if (model.seen[uIdx * nItems + it]) continue; // jangan ulang yang sudah dikeranjang/dibeli
      let s = model.b[it];
      for (let d = 0; d < dim; d++) s += model.P[uIdx * dim + d] * model.Q[it * dim + d];
      if (Number.isFinite(s)) kandidat.push([it, s]);
    }
    kandidat.sort((a, c) => c[1] - a[1]);
    kandidat.slice(0, topN).forEach(([it, s], r) => {
      rows.push({
        user_id: userIds[uIdx],
        product_id: items[it],
        rank: r + 1,
        skor: Math.round(s * 1e6) / 1e6,
        strategi: 'hybrid',
      });
    });
  }

  return {
    rows,
    ringkasan: {
      nUser: nUsers,
      nProduk: nItems,
      nInteraksi: inter.length,
      nPembelian: inter.filter((x) => x.beli).length,
      nBaris: rows.length,
    },
  };
}
