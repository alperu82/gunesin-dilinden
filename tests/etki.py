"""Etki analizi: değişen dosyalardan (ve app.js'de değişen fonksiyonlardan) etkilenen kullanım
senaryolarını bulur, yalnız onların testlerini çalıştırır. Tam test yalnız gerektiğinde.

python3 tests/etki.py                 # çalışma kopyası + son commit'e göre (git diff HEAD~1)
python3 tests/etki.py --taban main~3  # belirli bir noktaya göre
python3 tests/etki.py --kuru          # yalnız raporla, çalıştırma
python3 tests/etki.py --hepsi         # tam test (yalnız gerçekten gerekirse)
"""
import argparse, fnmatch, json, pathlib, re, subprocess, sys

KOK = pathlib.Path(__file__).resolve().parent.parent
UC = json.load(open(KOK / "tests" / "use_cases.json"))["uc"]
# Bu dosyalar değişirse her şey etkilenir (ortak yükleme yolu)
GENEL = ["index.html", "style.css"]
# Testin kendisi değişirse yalnız o test
YOK_SAY_DESEN = ["tests/baseline/*", "*.pyc", ".gitignore"]
YOK_SAY = ["README.md", "LICENSE", "build_site.py", "tests/use_cases.json", "tests/etki.py"]


def git(*a):
    return subprocess.run(["git", *a], cwd=KOK, capture_output=True, text=True).stdout


def degisenler(taban):
    d = set(git("diff", "--name-only", taban).split()) | set(git("diff", "--name-only").split())
    d |= {l[3:] for l in git("status", "--porcelain").splitlines() if l[:2].strip()}
    return sorted(x for x in d if x)


def degisen_fonk(taban):
    """app.js diff'inden değişen fonksiyon adları (hunk başlığı + eklenen/silinen satırdaki tanımlar)."""
    out = git("diff", "-U0", taban, "--", "app.js") + git("diff", "-U0", "--", "app.js")
    f = set(re.findall(r"^@@[^@]*@@.*?function\s+(\w+)", out, re.M))
    f |= set(re.findall(r"^[+-]\s*(?:async\s+)?function\s+(\w+)", out, re.M))
    ust = any(re.match(r"^@@ -(\d+)", l) and int(re.match(r"^@@ -(\d+)", l).group(1)) < 130
              for l in out.splitlines())  # dosya başı: sabitler / sözlük (T) → metin + yönlendirme
    return f, ust, bool(out.strip())


def etkilenen(dosyalar, fonklar, ust):
    sec, neden = set(), {}
    for u in UC:
        b = u["bagli"]
        for d in dosyalar:
            if d in GENEL or any(fnmatch.fnmatch(d, p) for p in b["dosya"]):
                sec.add(u["id"]); neden.setdefault(u["id"], []).append(d)
        for fn in fonklar & set(b["fonk"]):
            sec.add(u["id"]); neden.setdefault(u["id"], []).append(f"app.js:{fn}()")
    if ust:  # çeviri sözlüğü / sabitler: metin gösteren her UC + dil
        for u in UC:
            if u["id"] in ("UC02", "UC09", "UC10", "UC11", "UC14"):
                sec.add(u["id"]); neden.setdefault(u["id"], []).append("app.js:sabitler/çeviri")
    for d in dosyalar:
        if d.startswith("tests/test_ui.py"):
            for u in UC:
                sec.add(u["id"]); neden.setdefault(u["id"], []).append("test dosyası")
    return sorted(sec), neden


def main():
    a = argparse.ArgumentParser(); a.add_argument("--taban", default="HEAD~1")
    a.add_argument("--kuru", action="store_true"); a.add_argument("--hepsi", action="store_true")
    o = a.parse_args()
    if o.hepsi:
        sys.exit(subprocess.call([sys.executable, "-m", "pytest", "-q", "tests/test_ui.py"], cwd=KOK))
    if not git("rev-parse", "--verify", "-q", o.taban).strip():
        o.taban = git("rev-list", "--max-parents=0", "HEAD").split()[0]
    dos = [d for d in degisenler(o.taban) if d not in YOK_SAY and not any(fnmatch.fnmatch(d, p) for p in YOK_SAY_DESEN)]
    fonk, ust, app_degisti = degisen_fonk(o.taban)
    if app_degisti and not fonk and not ust:
        fonk = {"route"}  # tanımlanamayan app.js değişikliği: en azından yönlendirme
    sec, neden = etkilenen(dos, fonk, ust)
    print("Değişen dosyalar:", ", ".join(dos) or "—")
    if fonk: print("Değişen app.js fonksiyonları:", ", ".join(sorted(fonk)))
    print(f"\nEtkilenen senaryolar ({len(sec)}/{len(UC)}):")
    adlar = {u["id"]: u for u in UC}
    for i in sec:
        print(f"  {i}  {adlar[i]['ad'][:70]}  ← {', '.join(sorted(set(neden[i])))[:80]}")
    testler = sorted({t for i in sec for t in adlar[i]["test"]})
    if not testler:
        print("\nTest gerekmiyor."); return
    print("\nÇalışacak testler:", " ".join(testler))
    if o.kuru: return
    sys.exit(subprocess.call([sys.executable, "-m", "pytest", "-q", "tests/test_ui.py", "-k", " or ".join(testler)], cwd=KOK))


if __name__ == "__main__":
    main()
