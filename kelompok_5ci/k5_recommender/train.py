#!/usr/bin/env python3
"""
k5_recommender/train.py
Hybrid recommender (collaborative + content) untuk Chikara Bake.

Ide hybrid:
  - Sinyal perilaku  : riwayat KERANJANG (tambah ke keranjang, bobot 1) dan
                       riwayat PESANAN (dibeli, bobot 3), dijumlah per (user, produk).
  - Sinyal konten    : TF-IDF dari nama + deskripsi produk + one-hot kategori.
  - Model            : BPR (Bayesian Personalized Ranking) dengan embedding.
                       vektor user  = P[u]
                       vektor item  = E[i] + F[i] @ W      <- bagian hybrid
                       skor(u, i)   = P[u] . vektor_item(i) + b[i]
                       E[i] = embedding bebas (collaborative),
                       F[i] @ W = embedding dari fitur konten (membuat produk BARU
                       yang belum pernah dibeli tetap bisa direkomendasikan).

Evaluasi: Precision@5 dan Recall@5, dibandingkan dengan 3 baseline:
  Popularity, Content-only (cosine), dan CF-only (BPR tanpa fitur konten).
Dua skenario:
  standar   : 20% interaksi terakhir tiap user disembunyikan (split berdasarkan waktu)
  item_baru : 20% produk "disembunyikan" dari training (cold-start item)

Cara pakai:
  python train.py --source synthetic                 # uji pipeline (DATA PALSU)
  python train.py --source csv --data-dir data/real  # data asli hasil export Supabase

Hanya butuh: numpy, pandas.
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys

import numpy as np
import pandas as pd

W_BELI = 3.0        # bobot pesanan (dibeli)
W_KERANJANG = 1.0   # bobot tambah ke keranjang
STOP = set("dan yang di ke dari the and with for a an of in on to is are dengan untuk atau".split())


# --------------------------------------------------------------------------- #
# 1. Data
# --------------------------------------------------------------------------- #
def baca_csv(data_dir):
    """products.csv: id,nama,kategori,deskripsi
       penjualan.csv: user_id,product_id,jumlah,created_at
       keranjang_log.csv: user_id,product_id,aksi,created_at   (opsional)"""
    produk = pd.read_csv(os.path.join(data_dir, "products.csv"), dtype=str).fillna("")
    penjualan = pd.read_csv(os.path.join(data_dir, "penjualan.csv"), dtype=str)
    f_kr = os.path.join(data_dir, "keranjang_log.csv")
    if os.path.exists(f_kr):
        keranjang = pd.read_csv(f_kr, dtype=str)
    else:
        keranjang = pd.DataFrame(columns=["user_id", "product_id", "aksi", "created_at"])
    return produk, penjualan, keranjang


def bangun_interaksi(produk, penjualan, keranjang):
    """Gabungkan keranjang + pesanan jadi satu tabel: (user, item, bobot, beli, waktu)."""
    p = penjualan.copy()
    p["jumlah"] = pd.to_numeric(p["jumlah"], errors="coerce").fillna(1).clip(lower=1)
    p["t"] = pd.to_datetime(p["created_at"], utc=True, errors="coerce")
    beli = p.groupby(["user_id", "product_id"]).agg(jumlah=("jumlah", "sum"), t=("t", "max")).reset_index()
    beli["w"] = W_BELI * (1 + np.log(beli["jumlah"]))
    beli["beli"] = True

    k = keranjang[keranjang["aksi"] == "tambah"].copy()
    k["t"] = pd.to_datetime(k["created_at"], utc=True, errors="coerce")
    cart = k.groupby(["user_id", "product_id"]).agg(n=("aksi", "size"), t=("t", "max")).reset_index()
    cart["w"] = W_KERANJANG * (1 + np.log(cart["n"].clip(lower=1)))
    cart["beli"] = False

    kolom = ["user_id", "product_id", "w", "beli", "t"]
    semua = pd.concat([beli[kolom], cart[kolom]], ignore_index=True)
    semua = semua[semua["product_id"].isin(set(produk["id"]))]
    out = semua.groupby(["user_id", "product_id"]).agg(
        w=("w", "sum"), beli=("beli", "max"), t=("t", "max")).reset_index()
    if out["t"].notna().any():
        out["t"] = (out["t"] - out["t"].min()).dt.total_seconds().fillna(0.0)
    else:
        out["t"] = 0.0
    return out


def fitur_konten(produk):
    """TF-IDF (nama + deskripsi) + one-hot kategori, tiap baris di-L2-normalisasi."""
    docs = []
    for _, r in produk.iterrows():
        kata = re.findall(r"[a-z0-9]+", f"{r['nama']} {r['deskripsi']}".lower())
        docs.append([w for w in kata if len(w) > 2 and w not in STOP])
    vocab = {w: n for n, w in enumerate(sorted({w for d in docs for w in d}))}
    N, V = len(docs), len(vocab)
    tf = np.zeros((N, V), dtype=np.float64)
    for n, d in enumerate(docs):
        for w in d:
            tf[n, vocab[w]] += 1
    df = (tf > 0).sum(0)
    idf = np.log((1 + N) / (1 + df)) + 1
    teks = tf * idf
    teks /= np.maximum(np.linalg.norm(teks, axis=1, keepdims=True), 1e-12)

    kat = sorted(set(produk["kategori"].str.lower()))
    onehot = np.zeros((N, len(kat)))
    for n, k in enumerate(produk["kategori"].str.lower()):
        onehot[n, kat.index(k)] = 1.0

    F = np.hstack([teks, onehot])
    F /= np.maximum(np.linalg.norm(F, axis=1, keepdims=True), 1e-12)
    return F.astype(np.float64)


# --------------------------------------------------------------------------- #
# 2. Data sintetis (HANYA untuk menguji pipeline, bukan hasil penelitian)
# --------------------------------------------------------------------------- #
KATALOG = [
    # (nama, kategori, deskripsi)
    ("Classic Sourdough", "Bread", "slow fermented sourdough loaf with crisp crust"),
    ("Baguette", "Bread", "french baguette crisp crust soft crumb butter"),
    ("Whole Wheat Loaf", "Bread", "healthy whole wheat bread with seeds"),
    ("Milk Bread", "Bread", "soft fluffy milk bread slightly sweet butter"),
    ("Focaccia Rosemary", "Bread", "olive oil focaccia with rosemary and cheese"),
    ("Garlic Bread", "Bread", "toasted bread with garlic butter and cheese"),
    ("Brioche", "Bread", "rich buttery brioche bun"),
    ("Ciabatta", "Bread", "rustic ciabatta olive oil crisp crust"),
    ("Butter Croissant", "Pastries", "flaky croissant layered with french butter"),
    ("Pain au Chocolat", "Pastries", "flaky pastry with dark chocolate filling"),
    ("Cinnamon Roll", "Pastries", "sweet roll with cinnamon and cream cheese frosting"),
    ("Apple Danish", "Pastries", "danish pastry with apple fruit filling"),
    ("Almond Croissant", "Pastries", "croissant with almond cream butter"),
    ("Cheese Danish", "Pastries", "danish pastry with creamy cheese"),
    ("Chocolate Eclair", "Pastries", "choux pastry with cream and chocolate glaze"),
    ("Sausage Puff", "Pastries", "puff pastry with sausage and cheese"),
    ("Red Velvet Slice", "Cakes", "red velvet cake with cream cheese frosting"),
    ("Chocolate Cake", "Cakes", "moist dark chocolate cake with chocolate ganache"),
    ("New York Cheesecake", "Cakes", "creamy cheese cake with biscuit base"),
    ("Tiramisu", "Cakes", "coffee soaked layered cake with mascarpone cheese"),
    ("Lemon Tart", "Cakes", "tart with fresh lemon fruit curd"),
    ("Strawberry Shortcake", "Cakes", "sponge cake with fresh strawberry fruit and cream"),
    ("Carrot Cake", "Cakes", "spiced carrot cake with cream cheese"),
    ("Matcha Cake", "Cakes", "green tea matcha sponge cake with cream"),
    ("Cafe Latte", "Drinks", "espresso coffee with steamed milk"),
    ("Cappuccino", "Drinks", "espresso coffee with milk foam"),
    ("Iced Americano", "Drinks", "cold espresso coffee over ice"),
    ("Matcha Latte", "Drinks", "green tea matcha with milk"),
    ("Hot Chocolate", "Drinks", "rich hot chocolate drink"),
    ("Cold Brew", "Drinks", "slow steeped cold brew coffee"),
    ("Choco Chip Cookie", "Other", "chewy cookie with chocolate chips butter"),
    ("Granola Bar", "Other", "oat granola bar with dried fruit"),
    ("Butter Cookies", "Other", "crisp butter cookies"),
    ("Fudge Brownie", "Other", "dense fudgy chocolate brownie"),
    ("Glazed Donut", "Other", "soft donut with sweet glaze"),
    ("Blueberry Muffin", "Other", "muffin with blueberry fruit"),
]
TAGS = ["chocolate", "cheese", "fruit", "coffee", "butter", "matcha"]


def data_sintetis(out_dir, n_users=300, seed=0):
    rng = np.random.default_rng(seed)
    produk = pd.DataFrame(
        [{"id": f"p{n:03d}", "nama": a, "kategori": b, "deskripsi": c, "harga": 20000 + 1000 * (n % 15)}
         for n, (a, b, c) in enumerate(KATALOG)])
    kats = sorted(produk["kategori"].unique())
    kat_idx = produk["kategori"].map({k: n for n, k in enumerate(kats)}).to_numpy()
    tag_mat = np.array([[1.0 if t in d else 0.0 for t in TAGS] for d in produk["deskripsi"]])
    pop = rng.pareto(1.5, len(produk)) + 0.2
    pop = np.log1p(pop)

    pen, ker = [], []
    for u in range(n_users):
        uid = f"u{u:04d}"
        pref_kat = rng.dirichlet(np.full(len(kats), 0.4))
        pref_tag = rng.dirichlet(np.full(len(TAGS), 0.4))
        aff = 3.0 * pref_kat[kat_idx] + 2.0 * (tag_mat @ pref_tag) + 0.3 * pop
        p = np.exp(2.0 * aff); p /= p.sum()
        n_ev = int(rng.integers(6, 26))
        t = 0
        for _ in range(n_ev):
            t += int(rng.integers(1, 5))
            i = int(rng.choice(len(produk), p=p))
            pid = produk.loc[i, "id"]
            waktu = pd.Timestamp("2026-09-01", tz="UTC") + pd.Timedelta(hours=6 * t)
            ker.append({"user_id": uid, "product_id": pid, "aksi": "tambah", "created_at": waktu.isoformat()})
            if rng.random() < 0.6:
                pen.append({"user_id": uid, "product_id": pid, "jumlah": int(rng.integers(1, 4)),
                            "created_at": (waktu + pd.Timedelta(minutes=5)).isoformat()})
    penjualan, keranjang = pd.DataFrame(pen), pd.DataFrame(ker)
    os.makedirs(out_dir, exist_ok=True)
    produk.to_csv(os.path.join(out_dir, "products.csv"), index=False)
    penjualan.to_csv(os.path.join(out_dir, "penjualan.csv"), index=False)
    keranjang.to_csv(os.path.join(out_dir, "keranjang_log.csv"), index=False)
    return produk, penjualan, keranjang


# --------------------------------------------------------------------------- #
# 3. Model
# --------------------------------------------------------------------------- #
class Adam:
    def __init__(self, params, lr, b1=0.9, b2=0.999, eps=1e-8):
        self.lr, self.b1, self.b2, self.eps, self.t = lr, b1, b2, eps, 0
        self.m = {k: np.zeros_like(v) for k, v in params.items()}
        self.v = {k: np.zeros_like(v) for k, v in params.items()}

    def step(self, params, grads):
        self.t += 1
        for k, g in grads.items():
            self.m[k] = self.b1 * self.m[k] + (1 - self.b1) * g
            self.v[k] = self.b2 * self.v[k] + (1 - self.b2) * g * g
            mh = self.m[k] / (1 - self.b1 ** self.t)
            vh = self.v[k] / (1 - self.b2 ** self.t)
            params[k] -= self.lr * mh / (np.sqrt(vh) + self.eps)


class BPR:
    """Embedding user/item + (opsional) fitur konten. F=None -> CF murni."""

    def __init__(self, n_users, n_items, F=None, dim=16, reg=0.05, lr=0.02, seed=0):
        rng = np.random.default_rng(seed)
        self.F, self.reg, self.lr, self.rng = F, reg, lr, rng
        self.params = {
            "P": rng.normal(0, 0.1, (n_users, dim)),
            "E": rng.normal(0, 0.1, (n_items, dim)),
            "b": np.zeros(n_items),
        }
        if F is not None:
            self.params["W"] = rng.normal(0, 0.1, (F.shape[1], dim))

    def vektor_item(self):
        Q = self.params["E"].copy()
        if self.F is not None:
            Q += self.F @ self.params["W"]
        return Q

    def skor(self, users):
        return self.params["P"][users] @ self.vektor_item().T + self.params["b"]

    def fit(self, u, i, w, epochs=60, batch=256):
        P, E, b = self.params["P"], self.params["E"], self.params["b"]
        n_users, n_items = P.shape[0], E.shape[0]
        seen = np.zeros((n_users, n_items), dtype=bool)
        seen[u, i] = True
        warm = np.unique(i)                  # produk yang pernah muncul di data training
        prob = w / w.sum()
        opt = Adam(self.params, self.lr)
        n_samp = max(len(u), 2048)
        for _ in range(epochs):
            idx = self.rng.choice(len(u), size=n_samp, p=prob)
            uu, ii = u[idx], i[idx]
            # negatif: produk warm yang belum pernah disentuh user. Produk BARU (belum ada di
            # data) tidak boleh dijadikan negatif, karena sistem belum tahu apa-apa tentangnya.
            jj = warm[self.rng.integers(0, len(warm), n_samp)]
            for _r in range(5):
                bad = seen[uu, jj]
                if not bad.any():
                    break
                jj[bad] = warm[self.rng.integers(0, len(warm), int(bad.sum()))]
            for s in range(0, n_samp, batch):
                ub, ib, jb = uu[s:s + batch], ii[s:s + batch], jj[s:s + batch]
                bs = len(ub)
                pu = P[ub]
                qi, qj = E[ib].copy(), E[jb].copy()
                if self.F is not None:
                    W = self.params["W"]
                    Fi, Fj = self.F[ib], self.F[jb]
                    qi += Fi @ W
                    qj += Fj @ W
                x = ((qi - qj) * pu).sum(1) + b[ib] - b[jb]
                g = 1.0 / (1.0 + np.exp(np.clip(x, -30, 30)))      # sigma(-x)
                c = (g / bs)[:, None]
                gP, gE, gb = np.zeros_like(P), np.zeros_like(E), np.zeros_like(b)
                np.add.at(gP, ub, -c * (qi - qj) + self.reg * pu / bs)
                np.add.at(gE, ib, -c * pu + self.reg * E[ib] / bs)
                np.add.at(gE, jb, c * pu + self.reg * E[jb] / bs)
                np.add.at(gb, ib, -c[:, 0])
                np.add.at(gb, jb, c[:, 0])
                grads = {"P": gP, "E": gE, "b": gb}
                if self.F is not None:
                    grads["W"] = -((Fi - Fj).T @ (c * pu)) + self.reg * self.params["W"] / bs
                opt.step(self.params, grads)

        # Produk yang belum pernah ada di training: tanpa embedding bebas (E=0) dan bias
        # median produk lain, jadi skornya murni berasal dari fitur konten (F @ W).
        baru = np.setdiff1d(np.arange(n_items), warm)
        if len(baru):
            E[baru] = 0.0
            b[baru] = np.median(b[warm])
        return self


# --------------------------------------------------------------------------- #
# 4. Baseline
# --------------------------------------------------------------------------- #
def skor_popularitas(u, i, w, n_items):
    pop = np.bincount(i, weights=w, minlength=n_items)
    return lambda users: np.tile(pop, (len(users), 1))


def skor_konten(u, i, w, n_users, F):
    prof = np.zeros((n_users, F.shape[1]))
    np.add.at(prof, u, w[:, None] * F[i])
    prof /= np.maximum(np.linalg.norm(prof, axis=1, keepdims=True), 1e-12)
    return lambda users: prof[users] @ F.T


# --------------------------------------------------------------------------- #
# 5. Split & evaluasi
# --------------------------------------------------------------------------- #
def split_waktu(inter, frac=0.2, min_items=3):
    tr, te = [], []
    for _, g in inter.groupby("u"):
        g = g.sort_values("t", kind="stable")
        if len(g) < min_items:
            tr.append(g)
            continue
        n_te = max(1, int(round(len(g) * frac)))
        tr.append(g.iloc[:-n_te])
        te.append(g.iloc[-n_te:])
    return pd.concat(tr), (pd.concat(te) if te else inter.iloc[0:0])


def split_item_baru(inter, n_items, frac, rng):
    cold = rng.choice(n_items, size=max(1, int(n_items * frac)), replace=False)
    is_cold = inter["i"].isin(cold)
    return inter[~is_cold], inter[is_cold]


def evaluasi(fn_skor, train, test, n_items, target, k, rng):
    rel = test[test["beli"]] if target == "beli" else test
    rel = rel.groupby("u")["i"].apply(set).to_dict()
    seen = train.groupby("u")["i"].apply(list).to_dict()
    users = np.array([u for u in rel if u in seen])      # hanya user yang punya riwayat training
    if len(users) == 0:
        return None
    S = np.asarray(fn_skor(users), dtype=np.float64)
    S = S + 1e-9 * rng.random(S.shape)                   # pecah seri secara acak
    for r, u in enumerate(users):
        S[r, seen[u]] = -np.inf                          # jangan rekomendasikan yang sudah ada
    top = np.argpartition(-S, k - 1, axis=1)[:, :k]
    hits = np.array([len(rel[u] & set(top[r])) for r, u in enumerate(users)], dtype=float)
    n_rel = np.array([len(rel[u]) for u in users], dtype=float)
    return {"P@5": float((hits / k).mean()), "R@5": float((hits / n_rel).mean()), "n_user": int(len(users))}


# --------------------------------------------------------------------------- #
# 6. Main
# --------------------------------------------------------------------------- #
def ringkas(daftar):
    arr = np.array(daftar)
    return float(arr.mean()), float(arr.std())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", choices=["synthetic", "csv"], default="synthetic")
    ap.add_argument("--data-dir", default="data/real")
    ap.add_argument("--out-dir", default=None)
    ap.add_argument("--seeds", type=int, default=5)
    ap.add_argument("--dim", type=int, default=16)
    ap.add_argument("--epochs", type=int, default=60)
    ap.add_argument("--reg", type=float, default=0.05)
    ap.add_argument("--lr", type=float, default=0.02)
    ap.add_argument("--k", type=int, default=5)
    ap.add_argument("--topn", type=int, default=10)
    ap.add_argument("--cold-frac", type=float, default=0.2)
    ap.add_argument("--target", choices=["semua", "beli"], default="semua",
                    help="item uji yang dianggap relevan: semua interaksi, atau hanya pembelian")
    a = ap.parse_args()

    out_dir = a.out_dir or os.path.join("artifacts", a.source)
    os.makedirs(out_dir, exist_ok=True)

    if a.source == "synthetic":
        print("=" * 72)
        print("PERINGATAN: ini DATA SINTETIS untuk menguji pipeline.")
        print("Angka di bawah BUKAN hasil penelitian. Untuk laporan/jurnal pakai --source csv.")
        print("=" * 72)
        produk, penjualan, keranjang = data_sintetis(os.path.join("data", "synthetic"))
    else:
        produk, penjualan, keranjang = baca_csv(a.data_dir)

    produk = produk.reset_index(drop=True)
    inter = bangun_interaksi(produk, penjualan, keranjang)
    users_id = sorted(inter["user_id"].unique())
    item_id = list(produk["id"])
    u_map = {x: n for n, x in enumerate(users_id)}
    i_map = {x: n for n, x in enumerate(item_id)}
    inter["u"] = inter["user_id"].map(u_map)
    inter["i"] = inter["product_id"].map(i_map)
    n_users, n_items = len(users_id), len(item_id)
    F = fitur_konten(produk)

    n_beli = int(inter["beli"].sum())
    print(f"User: {n_users} | Produk: {n_items} | Pasangan user-produk: {len(inter)} "
          f"(pernah dibeli: {n_beli}) | Dimensi fitur konten: {F.shape[1]}")
    if n_users < 20 or len(inter) < 100:
        print("CATATAN: data sangat sedikit, hasil evaluasi akan sangat tidak stabil.")

    hasil = {"standar": {}, "item_baru": {}}
    n_eval = {}
    for seed in range(a.seeds):
        rng = np.random.default_rng(seed)
        for skenario in ("standar", "item_baru"):
            if skenario == "standar":
                train, test = split_waktu(inter)
            else:
                train, test = split_item_baru(inter, n_items, a.cold_frac, rng)
            if len(train) == 0 or len(test) == 0:
                continue
            u, i, w = (train["u"].to_numpy(), train["i"].to_numpy(), train["w"].to_numpy())
            model_fn = {
                "Popularity": skor_popularitas(u, i, w, n_items),
                "Content-only": skor_konten(u, i, w, n_users, F),
                "CF-only (BPR)": BPR(n_users, n_items, None, a.dim, a.reg, a.lr, seed).fit(u, i, w, a.epochs).skor,
                "Hybrid (BPR+konten)": BPR(n_users, n_items, F, a.dim, a.reg, a.lr, seed).fit(u, i, w, a.epochs).skor,
            }
            for nama, fn in model_fn.items():
                m = evaluasi(fn, train, test, n_items, a.target, a.k, rng)
                if m is None:
                    continue
                n_eval[skenario] = m["n_user"]
                hasil[skenario].setdefault(nama, {"P@5": [], "R@5": []})
                hasil[skenario][nama]["P@5"].append(m["P@5"])
                hasil[skenario][nama]["R@5"].append(m["R@5"])

    ringkasan = {}
    for skenario, d in hasil.items():
        if not d:
            continue
        print(f"\nSkenario: {skenario}  (user dievaluasi: {n_eval.get(skenario, 0)}, {a.seeds} seed)")
        print(f"{'Model':<22}{'Precision@5':>18}{'Recall@5':>18}")
        ringkasan[skenario] = {}
        for nama, v in d.items():
            pm, ps = ringkas(v["P@5"])
            rm, rs = ringkas(v["R@5"])
            ringkasan[skenario][nama] = {"P@5_mean": pm, "P@5_std": ps, "R@5_mean": rm, "R@5_std": rs}
            print(f"{nama:<22}{pm:>10.4f} ±{ps:.4f}{rm:>10.4f} ±{rs:.4f}")

    with open(os.path.join(out_dir, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump({"sumber": a.source, "k": a.k, "target": a.target, "n_user": n_users,
                   "n_produk": n_items, "n_interaksi": int(len(inter)),
                   "hasil": ringkasan}, f, indent=2, ensure_ascii=False)

    # ---- Model final: latih di SEMUA data, simpan embedding + rekomendasi ----
    u, i, w = inter["u"].to_numpy(), inter["i"].to_numpy(), inter["w"].to_numpy()
    final = BPR(n_users, n_items, F, a.dim, a.reg, a.lr, seed=0).fit(u, i, w, a.epochs)
    np.save(os.path.join(out_dir, "user_embeddings.npy"), final.params["P"])
    np.save(os.path.join(out_dir, "item_embeddings.npy"), final.vektor_item())
    with open(os.path.join(out_dir, "index.json"), "w", encoding="utf-8") as f:
        json.dump({"users": users_id, "items": item_id}, f)

    S = final.skor(np.arange(n_users))
    seen = inter.groupby("u")["i"].apply(list).to_dict()
    baris = []
    for uu in range(n_users):
        S[uu, seen.get(uu, [])] = -np.inf
        top = np.argsort(-S[uu])[: a.topn]
        for rank, ii in enumerate(top, 1):
            if np.isfinite(S[uu, ii]):
                baris.append({"user_id": users_id[uu], "product_id": item_id[ii], "rank": rank,
                              "skor": round(float(S[uu, ii]), 6), "strategi": "hybrid"})
    pd.DataFrame(baris).to_csv(os.path.join(out_dir, "rekomendasi.csv"), index=False)
    print(f"\nTersimpan di {out_dir}/: metrics.json, rekomendasi.csv, user_embeddings.npy, "
          f"item_embeddings.npy, index.json")


if __name__ == "__main__":
    sys.exit(main())
