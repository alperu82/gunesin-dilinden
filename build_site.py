#!/usr/bin/env python3
"""Güneşin Dilinden — statik site verisini derler.

Kaynaklar (yalnız okunur):
  /home/claude/pictograph/decks/w1000_v3.json        ana kartlar
  /home/claude/kitap/v2/fil_denetim/fil_*.json       Türkçe kelimenin Tagalogca analizi (FIL baskısı)
  /home/claude/kitap/v2/benzer/ses_hepsi.json        ses köprüleri
  /home/claude/pictograph/decks/hece_kartlari.json   34 hece kartı (+ hece_sade.json)
  /home/claude/kitap/v2/en/en_0*.json                İngilizce alanlar (varsa; yoksa site yine çalışır)
  /home/claude/kitap/*_taslak_*.pdf                  taslak PDF'ler (her baskının en yenisi)
  /home/claude/kitap/metinler/metinler.json          okuma metinleri (K17; birlestir.py çıktısı)

Çıktılar (repo kökü):
  data/cards.json   bir kart = bir kayıt, tüm baskılar
  data/hece.json    34 hece kartı
  data/pdfs.json    indirilebilir PDF listesi
  data/svg_{tr,fil,en_tr,en_fil}_N.json  kart SVG paketleri (her biri < 3.6 MB; anahtar W0001…)
  data/svg_hece.json        34 hece kartı SVG'si (tr, fil, en_tr, en_fil)
  pdf/                      her baskının en yeni taslağı; ≤ 3.6 MB olduğu gibi, üstü gs + pypdf ile bölümlenir
  data/metinler.json        okuma metinleri (yoksa boş iskelet; site yine çalışır)
  tr/ fil/ en/index.html    dil sayfaları, kök index.html'den üretilir (dil_sayfalari)

K13: gerçek köken / etimoloji hiçbir yerde kullanılmaz -> 'koken', 'tr_koken', 'kaynak' (sözlük) alanları atılır.

Kullanım:  python3 build_site.py [--no-svg] [--metin DOSYA]
           python3 build_site.py --yalniz-metin [--metin DOSYA]   # yalnız metinler.json + dil sayfaları (hızlı)
Gereken: python3, pypdf; isteğe bağlı: ghostscript (gs), qpdf.
Klasör yapısı bilerek düz: kök, data/, pdf/ (GitHub web yüklemesi: dosya ≤ 3.6 MB).
"""
import glob
import importlib.util
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys

SITE = pathlib.Path(__file__).resolve().parent
PICTO = pathlib.Path("/home/claude/pictograph")
KITAP = pathlib.Path("/home/claude/kitap")
MASTER = PICTO / "decks" / "w1000_v3.json"
FIL_DIR = KITAP / "v2" / "fil_denetim"
SES = KITAP / "v2" / "benzer" / "ses_hepsi.json"
HECE = PICTO / "decks" / "hece_kartlari.json"
HECE_SADE = PICTO / "decks" / "hece_sade.json"
EN_GLOB = str(KITAP / "v2" / "en" / "en_0*.json")
LAYOUT = PICTO / "layout_w3.json"
METIN = KITAP / "metinler" / "metinler.json"
SITE_URL = "https://alperu82.github.io/gunesin-dilinden/"
DILLER = ("tr", "fil", "en")

# Kutu anlamları için küçük İngilizce sözlük (kart_sema_en.md çekirdek sözlüğü + sık geçenler).
# Sözlükte olmayan anlam İngilizce baskıda özgün haliyle gösterilir.
GLOSS_TR_EN = {
    "güneş": "sun", "gün": "day", "ışık": "light", "parlak": "bright", "sıcaklık": "heat", "ateş": "fire",
    "büyük": "big", "yüksek": "high", "kuvvet": "strength", "sahip": "owner", "çokluk": "many",
    "temel": "base", "gerçek": "true", "hareket": "motion", "uzama": "stretching", "zaman": "time",
    "ara": "gap", "hayat": "life", "büyüme": "growth", "yiyecek": "food", "su": "water", "renk": "colour",
    "yer": "place", "toprak": "earth", "ses": "sound", "söz": "word", "akıl": "mind", "ummak": "hope",
    "beklemek": "wait", "yapmak": "make", "emek": "effort", "soru": "question", "uzaklaşmak": "moving away",
    "uzaklaşır": "moves away", "bitmek": "ended", "yok": "none", "tamamlar": "completes", "kendisi": "itself",
    "en yakın": "nearest", "bizim": "our", "bitişik": "adjacent", "o an": "now", "geniş alan": "wide area",
    "daha geniş": "wider", "yokluk": "absence", "dar alan": "narrow area", "birlikte": "together",
    "engin": "vast", "kapsayan": "all-embracing", "yapılmış": "made", "yapıcı": "maker",
    "kesin alan": "definite place", "yakın": "near", "uzak": "far", "uzatma": "lengthening",
    "bilgi": "knowledge", "tekrar": "repeat", "ben": "I", "benim": "my", "sen": "you", "bu": "this",
    "önek": "prefix", "kavga": "fight", "tek esas": "single base", "on": "ten", "bir": "one", "iki": "two",
    "üç": "three", "dört": "four", "beş": "five", "altı": "six", "yedi": "seven", "sekiz": "eight",
    "dokuz": "nine",
}
GLOSS_FIL_EN = {
    "bumubuo": "completes", "katabi": "adjacent", "malayo": "far", "tiyak": "definite", "galaw": "motion",
    "makitid": "narrow", "gawin": "make", "atin": "our", "gumagawa": "maker", "malawak": "wide",
    "mas malawak": "wider", "ginawa": "made", "lakas": "strength", "akin": "my / nearest", "liwanag": "light",
    "tubig": "water", "malapit": "near", "araw": "sun / day", "laki": "big", "wala": "none", "lupa": "earth",
    "pagkain": "food", "buhay": "life", "taas": "high", "galaw doon": "motion there", "init": "heat",
    "salita": "word", "panahon": "time", "lugar": "place", "lumalayo": "moves away", "dami": "many",
    "tunog": "sound", "apoy": "fire", "lahat": "all-embracing", "kulay": "colour", "sama-sama": "together",
    "mismo": "itself", "natapos": "ended", "tanong": "question", "totoo": "true", "ngayon": "now",
    "may-ari": "owner", "ako": "I", "umasa": "hope", "lumayo": "moved away", "kaalaman": "knowledge",
    "isip": "mind", "paglaki": "growth", "layo": "distance", "haba": "length", "batayan": "base",
    "isa": "one", "dalawa": "two", "tatlo": "three", "lima": "five", "ikaw": "you", "sikap": "effort",
    "marami": "many", "siya": "he / she", "tayo": "we", "ito": "this", "iyan": "that", "sampu": "ten",
}

GROUPS = {
    "G1": {"tr": "güneş, gün", "fil": "araw", "en": "sun, day"},
    "G2": {"tr": "ışık, aydınlık", "fil": "liwanag", "en": "light, brightness"},
    "G3": {"tr": "sıcaklık", "fil": "init", "en": "heat"},
    "G4": {"tr": "ateş", "fil": "apoy", "en": "fire"},
    "G5": {"tr": "büyüklük, kuvvet", "fil": "lakas", "en": "greatness, strength"},
    "G6": {"tr": "hareket, zaman", "fil": "galaw", "en": "motion, time"},
    "G7": {"tr": "renk, su", "fil": "kulay, tubig", "en": "colour, water"},
    "G8": {"tr": "yer, toprak", "fil": "lupa", "en": "place, earth"},
    "G9": {"tr": "ses, söz", "fil": "salita", "en": "sound, word"},
    "G10": {"tr": "yokluk", "fil": "pagkawala", "en": "absence"},
}


def jload(p):
    return json.loads(pathlib.Path(p).read_text(encoding="utf-8"))


def short_id(cid):
    """'W001-isa' -> 'W0001' (dosya adı)."""
    m = re.match(r"[A-Z](\d+)", cid)
    return f"W{int(m.group(1)):04d}" if m else cid


def boxes(kutular, gloss):
    """[[glif, anlam, kök?], ...] -> [[glif, anlam, kök, en]] (en: sözlükte yoksa '')."""
    out = []
    for k in kutular or []:
        g, a = str(k[0]), str(k[1])
        r = int(k[2]) if len(k) > 2 and k[2] else 0
        out.append([g, a, r, gloss.get(a.strip().lower(), "")])
    return out


def fil_page(s):
    """FIL okur için 's.104' -> 'p.104' (build._fil_dayanak ile aynı)."""
    return re.sub(r"(?<![\w=])s\.(?=\s?[\d≈])", "p.", str(s or ""))


def load_fil():
    rec = {}
    for p in sorted(FIL_DIR.glob("fil_*.json")):
        d = jload(p)
        d = d.get("kartlar", []) if isinstance(d, dict) else d
        for f in d:
            if isinstance(f, dict) and f.get("id"):
                rec[f["id"]] = {**rec.get(f["id"], {}), **f}
    return rec


def load_en():
    rec, files = {}, sorted(glob.glob(EN_GLOB))
    for p in files:
        try:
            d = jload(p)
        except Exception as e:  # yarım yazılmış dosya: atla
            print(f"  ! EN dosyası okunamadı, atlandı: {p} ({e})")
            continue
        d = d.get("kartlar", []) if isinstance(d, dict) else d
        for e in d:
            if isinstance(e, dict) and e.get("id"):
                rec[e["id"]] = {**rec.get(e["id"], {}), **e}
    return rec, [os.path.basename(f) for f in files]


def load_kunye():
    """Yazar/YZ/dürüstlük metinleri: pictograph/kunye.py (M sözlüğü). Yoksa yedek metin."""
    try:
        spec = importlib.util.spec_from_file_location("picto_kunye", PICTO / "kunye.py")
        mod = importlib.util.module_from_spec(spec)
        sys.dont_write_bytecode = True
        spec.loader.exec_module(mod)
        keys = ("yazar", "iletisim", "lisans", "lisans_m", "kaynak", "yz", "yz_m", "durust", "durust_m", "taslak")
        return {"author": mod.YAZAR, "email": mod.EPOSTA, "web": mod.WEB, "source": mod.KAYNAK,
                "text": {d: {k: mod.M[d][k] for k in keys} for d in ("tr", "fil", "en")}}
    except Exception as ex:
        print("  ! kunye.py okunamadı:", ex)
        return {"author": "Alper Ulusoy", "email": "ulusoy.alper@gmail.com", "web": "", "source": SOURCE, "text": {}}


SOURCE = ("Atatürk, M. K. (1935). Güneş-Dil Teorisi – Ulus Dil Yazıları / Etimoloji, Morfoloji ve Fonetik "
          "Bakımından Türk Dili. Yay. haz. Doğu Polat. İstanbul: Alaca Yayınları, 2019. ISBN 978-605-68261-4-6.")


def import_renderer():
    """build.py'yi yan etkisiz içe aktarır (yalnız tanımlar; __main__ bloğu çalışmaz)."""
    spec = importlib.util.spec_from_file_location("picto_build", PICTO / "build.py")
    mod = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True  # kaynak klasöre __pycache__ yazma
    sys.path.insert(0, str(PICTO))
    try:
        spec.loader.exec_module(mod)
    finally:
        sys.path.remove(str(PICTO))
    for fn in ("render_w3", "render_w3_fil", "render_w3_en", "render_hece", "load"):
        if not hasattr(mod, fn):
            raise RuntimeError(f"build.py içinde {fn} yok")
    return mod


FONT_ATTR = re.compile(r' font-family="Helvetica, Arial, sans-serif"')


def svg_min(s):
    """Güvenli küçültme: font-family köke taşınır (kalıtılır), varsayılan değerler (text-anchor=start,
    font-weight=400) ve '18.0' gibi gereksiz ondalıklar atılır, öğeler arası satır sonları silinir.
    <text> içindeki boşluklara dokunulmaz (renderer metni tek satırda yazar).
    viewBox kartın çerçevesine kırpılır (380x230 sayfa boşluğu atılır -> 342x212)."""
    s = s.strip()
    s = FONT_ATTR.sub("", s)
    s = s.replace(' text-anchor="start"', "").replace(' font-weight="400"', "")
    s = re.sub(r'(?<=[\d])\.0(?=["\s,)])', "", s)
    s = re.sub(r">\s*\n\s*<", "><", s)
    s = re.sub(r'<svg xmlns="http://www.w3.org/2000/svg" width="380" height="230" viewBox="0 0 380 230">',
               '<svg xmlns="http://www.w3.org/2000/svg" viewBox="19 9 342 212" font-family="Helvetica, Arial, sans-serif">', s, count=1)
    return s


MAX_FILE = int(3.4 * 1024 * 1024)   # GitHub web yükleme sınırı 3.6 MB; pay bırakılır
CHUNK = 250                          # kart / paket (paket = data/svg_<baskı>_<n>.json)


def write_bundles(name, svgs):
    """svgs: [(n, dosya_id, svg)] -> data/svg_<name>_<k>.json paketleri; her biri MAX_FILE altında.
    Döner: [{"file", "from", "to"}] (kart sıra numarası aralığı)."""
    data = SITE / "data"
    for old in data.glob(f"svg_{name}_*.json"):
        old.unlink()
    out, k, i = [], 1, 0
    while i < len(svgs):
        size = CHUNK
        while True:
            part = svgs[i:i + size]
            body = json.dumps({f: sv for _, f, sv in part}, ensure_ascii=False, separators=(",", ":"))
            if len(body.encode()) <= MAX_FILE or size <= 10:
                break
            size = int(size * 0.8)
        fn = f"svg_{name}_{k}.json"
        (data / fn).write_text(body, encoding="utf-8")
        out.append({"file": f"data/{fn}", "from": part[0][0], "to": part[-1][0]})
        i += len(part); k += 1
    return out


def export_svgs(master, fil, hece):
    mod = import_renderer()
    L = mod.load("layout_w3.json")
    EN = mod.en_yukle() if hasattr(mod, "en_yukle") else {}
    out = {"tr": [], "fil": [], "en_tr": [], "en_fil": []}
    for i, c in enumerate(master, 1):
        sid = short_id(c["id"])
        out["tr"].append((i, sid, svg_min(mod.render_w3(c, L, "tr"))))
        f = fil.get(c["id"])
        if f:
            out["fil"].append((i, sid, svg_min(mod.render_w3_fil(c, f, L))))
        if c["id"] in EN:  # kitap_pdf_en.py gibi: f/e verilmez, renderer kendi yükler
            for yon in ("en_tr", "en_fil"):
                out[yon].append((i, sid, svg_min(mod.render_w3_en(c, L, yon))))
    yonler = ("tr", "fil", "en_tr", "en_fil") if EN else ("tr", "fil")
    hc = {yon: {h["id"].split("-")[0]: svg_min(mod.render_hece(h, L, yon)) for h in hece} for yon in yonler}
    body = json.dumps(hc, ensure_ascii=False, separators=(",", ":"))
    assert len(body.encode()) <= MAX_FILE, "svg_hece.json çok büyük"
    (SITE / "data" / "svg_hece.json").write_text(body, encoding="utf-8")
    res = {k: write_bundles(k, v) for k, v in out.items() if v}
    res["hece"] = "data/svg_hece.json"
    res["hece_yon"] = list(yonler)
    return res


PDF_MAX = int(3.5 * 1024 * 1024)    # bölme hedefi
PDF_LIMIT = int(3.6 * 1024 * 1024)  # bu boyuta kadar PDF olduğu gibi kopyalanır (sıkıştırma/bölme yok)


def _gs_compress(src, dst):
    """ghostscript /ebook; sonuç büyükse özgün dosya kullanılır. Ardından qpdf ile nesne akışı sıkıştırması."""
    tmp = dst.with_suffix(".gs.pdf")
    best = src
    if shutil.which("gs"):
        r = subprocess.run(["gs", "-q", "-dNOPAUSE", "-dBATCH", "-dSAFER", "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/ebook",
                            "-dCompatibilityLevel=1.5", f"-sOutputFile={tmp}", str(src)], capture_output=True)
        if r.returncode == 0 and tmp.exists() and tmp.stat().st_size < src.stat().st_size:
            best = tmp
    else:
        print("  ! gs yok: PDF sıkıştırılmadan bölünecek")
    _qpdf(best, dst)
    if tmp.exists():
        tmp.unlink()


def _qpdf(src, dst):
    if shutil.which("qpdf"):
        r = subprocess.run(["qpdf", "--object-streams=generate", "--compress-streams=y", "--recompress-flate",
                            "--compression-level=9", str(src), str(dst)], capture_output=True)
        if r.returncode in (0, 3) and dst.exists():
            return
    shutil.copy2(src, dst)


def _split(pdf, stem, out):
    """pdf'i ardışık sayfa bölümlerine ayırır; her bölüm PDF_MAX altında. Döner: [(Path, ilk, son)]."""
    from pypdf import PdfReader, PdfWriter
    rd = PdfReader(str(pdf)); n = len(rd.pages)
    parts = max(2, -(-pdf.stat().st_size // int(PDF_MAX * 0.85)))
    while True:
        step = -(-n // parts); res = []; ok = True
        for k in range(parts):
            a, b = k * step, min(n, (k + 1) * step)
            if a >= b:
                continue
            w = PdfWriter()
            for i in range(a, b):
                w.add_page(rd.pages[i])
            w.compress_identical_objects(remove_duplicates=True, remove_unreferenced=True)
            raw = out / f"{stem}_bolum{k + 1}.raw.pdf"
            with open(raw, "wb") as fh:
                w.write(fh)
            dst = out / f"{stem}_bolum{k + 1}.pdf"
            _qpdf(raw, dst); raw.unlink()
            res.append((dst, a + 1, b))
            if dst.stat().st_size > PDF_MAX:
                ok = False
        if ok:
            return res
        for p, _, _ in res:
            p.unlink()
        parts += 1


def copy_pdfs():
    """Her baskı önekinin (…_taslak_ öncesi) en yeni taslağı: sıkıştır, gerekirse böl, pdf/ altına yaz."""
    from pypdf import PdfReader
    out = SITE / "pdf"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir()
    newest = {}
    for p in KITAP.glob("*_taslak_*.pdf"):
        key = p.name.split("_taslak_")[0]
        if key not in newest or (p.stat().st_mtime, p.name) > (newest[key].stat().st_mtime, newest[key].name):
            newest[key] = p
    items = []
    order = {"tr": 0, "fil": 1, "en_tr": 2, "en_fil": 3}
    for key, p in sorted(newest.items()):
        stem = p.stem
        whole = out / p.name
        if p.stat().st_size <= PDF_LIMIT:
            shutil.copy2(p, whole)
        else:
            _gs_compress(p, whole)
        pages = len(PdfReader(str(whole)).pages)
        if whole.stat().st_size > PDF_LIMIT:
            files = _split(whole, stem, out)
            whole.unlink()
        else:
            files = [(whole, 1, pages)]
        m = re.search(r"_taslak_(v[\d.]+)_(\d{8})-(\d{4})", p.name)
        if "_EN_" in p.name:
            ed = "en_fil" if "_Filipino_" in p.name else "en_tr"
        else:
            ed = "fil" if ("_FIL_" in p.name or p.name.startswith("Mula")) else "tr"
        items.append({
            "edition": ed, "src": p.name, "orig_size": p.stat().st_size, "pages": pages,
            "version": m.group(1) if m else "",
            "date": (f"{m.group(2)[:4]}-{m.group(2)[4:6]}-{m.group(2)[6:]} {m.group(3)[:2]}:{m.group(3)[2:]}") if m else "",
            "draft": True,
            "parts": [{"file": f"pdf/{f.name}", "size": f.stat().st_size, "from": a, "to": b} for f, a, b in files],
        })
        print(f"PDF {p.name}: {p.stat().st_size/1e6:.1f} MB -> " + ", ".join(f"{f.name} {f.stat().st_size/1e6:.2f} MB" for f, _, _ in files))
    items.sort(key=lambda x: order.get(x["edition"], 9))
    return items


def _arg(ad):
    """'--metin DOSYA' biçimli seçenek değeri (yoksa None)."""
    a = sys.argv
    return a[a.index(ad) + 1] if ad in a and a.index(ad) + 1 < len(a) else None


def _kisa_id(cid):
    m = re.match(r"W(\d+)", str(cid or ""))
    return f"W{int(m.group(1)):04d}" if m else None


def copy_metinler(src=None):
    """metinler.json -> data/metinler.json (sıkıştırılmış; kart id'leri W0026 biçimine getirilir).
    Kaynak yoksa boş iskelet yazılır, böylece site 404 almaz."""
    src = pathlib.Path(src) if src else METIN
    out = SITE / "data" / "metinler.json"
    out.parent.mkdir(exist_ok=True)
    if src.exists():
        d = jload(src)
        for dizi in ("tl", "tr"):
            for m in (d.get(dizi) or {}).values():
                for c in m.get("cumleler") or []:
                    c["t"] = [[t[0], _kisa_id(t[1]) if t[1] else None] for t in c.get("t") or []]
        d = {"surum": d.get("surum"), "tarih": d.get("tarih"), "tl": d.get("tl") or {}, "tr": d.get("tr") or {}}
        print(f"metinler: {src} · sürüm {d['surum']} · tl {len(d['tl'])} · tr {len(d['tr'])} bölüm")
    else:
        d = {"surum": None, "tarih": None, "tl": {}, "tr": {}}
        print(f"  ! {src} yok: data/metinler.json boş iskelet")
    out.write_text(json.dumps(d, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def dil_sayfasi(kok_html, dil):
    """Kök index.html -> <dil>/index.html: yönlendirme betiği atılır, data-root/data-ui eklenir,
    yollar ../ olur, canonical + hreflang bağlantıları eklenir."""
    s = re.sub(r'<html lang="[^"]*">', f'<html lang="{dil}" data-root="../" data-ui="{dil}">', kok_html, count=1)
    s = re.sub(r"<script>\(function\(\)\{try\{var l=localStorage.*?</script>\n", "", s, count=1, flags=re.S)
    alt = "".join(f'\n<link rel="alternate" hreflang="{l}" href="{SITE_URL}{l}/">' for l in DILLER)
    s = s.replace('<link rel="stylesheet" href="style.css">',
                  f'<link rel="stylesheet" href="../style.css">\n<link rel="canonical" href="{SITE_URL}{dil}/">{alt}', 1)
    s = s.replace('<script src="app.js" defer></script>', '<script src="../app.js" defer></script>', 1)
    assert 'data-root="../"' in s and "../style.css" in s and "../app.js" in s and "location.replace" not in s, dil
    return s


def dil_sayfalari():
    kok = (SITE / "index.html").read_text(encoding="utf-8")
    for dil in DILLER:
        p = SITE / dil / "index.html"
        p.parent.mkdir(exist_ok=True)
        yeni = dil_sayfasi(kok, dil)
        degisti = not p.exists() or p.read_text(encoding="utf-8") != yeni
        p.write_text(yeni, encoding="utf-8")
        print(f"{dil}/index.html" + (" güncellendi" if degisti else " aynı"))


def main():
    no_svg = "--no-svg" in sys.argv
    metin_src = _arg("--metin")
    if "--yalniz-metin" in sys.argv:
        copy_metinler(metin_src); dil_sayfalari(); return
    master = jload(MASTER)
    fil = load_fil()
    ses = jload(SES) if SES.exists() else {}
    en, en_files = load_en()
    lay = jload(LAYOUT)
    print(f"ana kart: {len(master)} · FIL: {len(fil)} · ses: {len(ses)} · EN: {len(en)} ({', '.join(en_files) or 'yok'})")

    cards = []
    for i, c in enumerate(master, 1):
        s = ses.get(c["id"], {}) or {}
        r = {
            "id": c["id"], "f": short_id(c["id"]), "n": i,
            "tl": c["tl"], "tr": c["tr"], "pos": c.get("tur", ""),
            "g": c.get("grup", ""), "s": c.get("guc", ""),
            "seg": c.get("seg", ""), "k": boxes(c.get("kutular"), GLOSS_TR_EN),
            "ez": c.get("ezber", ""), "d": c.get("dayanak", ""),
            "ex": c.get("ornek", []), "cj": c.get("cekim", []),
            "br": s.get("ses_tr", ""), "brf": s.get("ses_fil", ""),
        }
        f = fil.get(c["id"])
        if f:
            gt = f.get("gdt_tr") or {}
            r["fil"] = {
                "w": f.get("tr_bas", c["tr"]), "ok": f.get("tr_okunus_fil", ""),
                "seg": gt.get("seg", ""), "k": boxes(gt.get("kutular"), GLOSS_FIL_EN),
                "g": gt.get("grup", r["g"]), "s": gt.get("guc", r["s"]), "d": fil_page(gt.get("dayanak", "")),
                "ez": f.get("ezber_fil", ""),
            }
        e = en.get(c["id"])
        if e:
            r["en"] = {k: e.get(k) for k in ("en", "ornek_en", "cekim_en", "ezber_en_tl", "ezber_en_tr",
                                              "ses_en_tl", "ses_en_tr", "tr_okunus_en",
                                              "ses_en_tl_tanidik", "ses_en_tr_tanidik") if e.get(k)}
            # *_tanidik: köprü İngilizce kelimenin kendisi (kitap/tanidik_en.py) -> modalda "familiar word" etiketi
        # K13: 'koken', 'tr_koken', 'kaynak' bilerek alınmaz
        cards.append(r)

    hece_sade = (jload(HECE_SADE).get("kartlar", {}) if HECE_SADE.exists() else {})
    hece_raw = jload(HECE)
    hece = []
    for h in hece_raw:
        sd = hece_sade.get(h["id"], {}) or {}
        et_tr = " · ".join(x for x in (h.get("etiket_tr"), h.get("etiket_tr_2")) if x)
        et_fil = " · ".join(x for x in (h.get("etiket_fil"), h.get("etiket_fil_2")) if x)
        et_en = " · ".join(x for x in (GLOSS_TR_EN.get(h.get("etiket_tr", ""), ""),
                                        GLOSS_TR_EN.get(h.get("etiket_tr_2", ""), "")) if x)
        hece.append({
            "id": h["id"], "f": h["id"].split("-")[0], "k": h.get("kanon_id", ""), "glyph": h.get("glyph", ""),
            "tur": h.get("tur", ""), "tr": et_tr, "fil": et_fil, "en": et_en,
            "kitapta": sd.get("kitapta") or h.get("kitaptaki_tum_anlamlar", ""),
            "kural": h.get("kural", ""), "ex_tr": sd.get("ornek_tr") or h.get("ornek_tr", ""),
            "ex_tl": sd.get("ornek_tl") or h.get("ornek_tl", ""), "src": h.get("src", ""),
            "g": sd.get("grup", ""),
        })

    svg_info, svg_note = {}, ""
    if no_svg:
        svg_note = "--no-svg ile atlandı"
    else:
        try:
            svg_info = export_svgs(master, fil, hece_raw)
            print("SVG paketleri:", ", ".join(f"{k}: {len(v)}" for k, v in svg_info.items() if isinstance(v, list) and k != "hece_yon"))
        except Exception as ex:
            svg_note = f"build.py içe aktarılamadı/çalışmadı: {ex}"
            print("  ! SVG atlandı:", svg_note)
    if not svg_info:  # önceki paketler duruyorsa onları kullan
        old = SITE / "data" / "cards.json"
        if old.exists():
            svg_info = json.loads(old.read_text(encoding="utf-8"))["meta"].get("svg", {})

    pdfs = copy_pdfs()
    colors = {g: v["C"] for g, v in lay["gruplar"].items()}
    ku = load_kunye()
    meta = {
        "author": ku["author"], "email": ku["email"], "web": ku["web"],
        "license": {"name": "CC BY-NC-SA 4.0", "url": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
                    "copyright": f"© 2026 {ku['author']}"},
        "source": {"citation": SOURCE, "short": ku["source"],
                   "note": "Yalnız kaynak gösterilir; kitaptan metin ya da tarama yer almaz. / Cited only; no book text or scans."},
        "kunye": ku["text"],
        "status": "beta",
        "title": {"tr": "Güneşin Dilinden", "fil": "Mula sa Wika ng Araw", "en": "From the Language of the Sun"},
        "count": len(cards), "fil_count": sum(1 for c in cards if "fil" in c),
        "en_count": sum(1 for c in cards if "en" in c), "en_files": en_files,
        "groups": {g: {**GROUPS[g], "c": colors.get(g, "#555")} for g in GROUPS},
        "svg": svg_info, "svg_note": svg_note,
    }
    data = SITE / "data"
    data.mkdir(exist_ok=True)
    dump = dict(ensure_ascii=False, separators=(",", ":"))
    (data / "cards.json").write_text(json.dumps({"meta": meta, "cards": cards}, **dump), encoding="utf-8")
    (data / "hece.json").write_text(json.dumps(hece, **dump), encoding="utf-8")
    (data / "pdfs.json").write_text(json.dumps(pdfs, **dump), encoding="utf-8")
    copy_metinler(metin_src)
    dil_sayfalari()
    sz = (data / "cards.json").stat().st_size
    print(f"data/cards.json {sz/1024:.0f} KB · hece {len(hece)} · PDF {len(pdfs)}")


if __name__ == "__main__":
    main()
