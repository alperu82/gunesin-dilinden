"""UI testleri (Playwright). Her test bir kullanım senaryosuna (tests/use_cases.json) bağlıdır.
Tümü:      pytest tests/test_ui.py
Etkilenen: python3 tests/etki.py   (değişen dosyalara göre yalnız gerekli testler)
Görsel taban çizgisini yenile: GORSEL_TABAN=yenile pytest tests/test_ui.py -k uc14
"""
import os, re, socket, subprocess, sys, time, pathlib
import pytest
from playwright.sync_api import sync_playwright, expect

KOK = pathlib.Path(__file__).resolve().parent.parent
TABAN = KOK / "tests" / "baseline"
CIKTI = pathlib.Path("/tmp/ui_test")
EKRAN = {"mobil": (390, 844), "masaustu": (1280, 900)}


def _bos_port():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close(); return p


@pytest.fixture(scope="session")
def site():
    port = _bos_port()
    p = subprocess.Popen([sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"], cwd=KOK,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    yield f"http://127.0.0.1:{port}"
    p.terminate()


@pytest.fixture(scope="session")
def tarayici():
    with sync_playwright() as pw:
        b = pw.chromium.launch(); yield b; b.close()


@pytest.fixture
def sayfa(tarayici):
    ctx = tarayici.new_context(locale="tr-TR", viewport={"width": 1280, "height": 900})
    pg = ctx.new_page(); pg.hatalar = []
    pg.on("pageerror", lambda e: pg.hatalar.append(str(e)))
    pg.on("response", lambda r: pg.hatalar.append(f"{r.status} {r.url}") if r.status >= 400 else None)
    yield pg
    assert not pg.hatalar, pg.hatalar
    ctx.close()


def bekle(pg, ms=1200):
    pg.wait_for_timeout(ms)


def ed(pg):
    return pg.eval_on_selector("#f-ed", "e => e.value")


# ---------------- UC01 ----------------
@pytest.mark.parametrize("loc,dil", [("tr-TR", "tr"), ("fil-PH", "fil"), ("en-GB", "en"), ("de-DE", "en")])
def test_uc01_kok_yonlendirme(tarayici, site, loc, dil):
    ctx = tarayici.new_context(locale=loc); pg = ctx.new_page()
    pg.goto(site + "/#/hece"); bekle(pg)
    assert pg.url == f"{site}/{dil}/#/hece"
    ctx.close()


# ---------------- UC02 ----------------
def test_uc02_dil_degistir(sayfa, site):
    sayfa.goto(site + "/tr/#/indir"); bekle(sayfa)
    for dil, baski in [("en", "en_fil"), ("fil", "fil"), ("tr", "tr")]:
        sayfa.click(f"#lang-switch button[data-lang={dil}]"); bekle(sayfa)
        assert sayfa.url.endswith(f"/{dil}/#/indir")
        assert ed(sayfa) == baski
        assert sayfa.get_attribute("html", "lang") == dil


# ---------------- UC03 ----------------
def test_uc03_dogrudan_baglanti(sayfa, site):
    sayfa.goto(site + "/en/#/k/W0026"); bekle(sayfa, 2000)
    expect(sayfa.locator("#modal")).to_be_visible()
    assert "araw" in sayfa.inner_text("#m-body").lower()
    assert sayfa.eval_on_selector_all("#modal img", "es => es.every(e => e.naturalWidth > 0)")


# ---------------- UC04 ----------------
@pytest.mark.parametrize("baski,bas", [("tr", "isa"), ("fil", "bir"), ("en_tr", "bir"), ("en_fil", "isa")])
def test_uc04_baski_sec(sayfa, site, baski, bas):
    sayfa.goto(site + "/tr/"); bekle(sayfa)
    sayfa.select_option("#f-ed", baski); bekle(sayfa, 1500)
    ilk = sayfa.locator("#grid .tile").first
    assert bas in ilk.inner_text().lower() or bas in (ilk.get_attribute("aria-label") or "").lower()


# ---------------- UC05 ----------------
@pytest.mark.parametrize("q,beklenen", [("araw", "araw"), ("gunes", "araw"), ("sun", "araw"), ("ısık", None)])
def test_uc05_arama(sayfa, site, q, beklenen):
    sayfa.goto(site + "/tr/"); bekle(sayfa)
    sayfa.fill("#f-q", q); bekle(sayfa, 600)
    n = int(re.match(r"\d+", sayfa.inner_text("#count")).group())
    assert 0 < n < 1000
    if beklenen:
        assert beklenen in sayfa.locator("#grid").inner_text().lower() or \
            beklenen in " ".join(sayfa.eval_on_selector_all("#grid [aria-label]", "es=>es.map(e=>e.getAttribute('aria-label'))")).lower()


# ---------------- UC06 ----------------
def test_uc06_suzgec(sayfa, site):
    sayfa.goto(site + "/tr/"); bekle(sayfa)
    toplam = sayfa.inner_text("#count")
    grup = sayfa.eval_on_selector("#f-g", "e => e.options[1].value")
    sayfa.select_option("#f-g", grup); bekle(sayfa, 500)
    n1 = int(re.match(r"\d+", sayfa.inner_text("#count")).group())
    guc = sayfa.eval_on_selector("#f-s", "e => e.options[1].value")
    sayfa.select_option("#f-s", guc); bekle(sayfa, 500)
    m = re.search(r"\d+", sayfa.inner_text("#count")); n2 = int(m.group()) if m else 0
    assert 0 < n1 < 1000 and n2 <= n1 and sayfa.inner_text("#count") != toplam


# ---------------- UC07 ----------------
def test_uc07_izgara_resim(sayfa, site):
    sayfa.goto(site + "/tr/"); bekle(sayfa, 2500)
    ilk = sayfa.locator("#grid img").first
    expect(ilk).to_be_visible()
    assert ilk.evaluate("e => e.naturalWidth") > 0
    once = sayfa.locator("#grid .tile").count()
    sayfa.mouse.wheel(0, 20000); bekle(sayfa, 1500)
    if sayfa.locator("#more").is_visible():
        sayfa.click("#more"); bekle(sayfa, 800)
    assert sayfa.locator("#grid .tile").count() > once


# ---------------- UC08 ----------------
def test_uc08_kart_penceresi(sayfa, site):
    sayfa.goto(site + "/tr/"); bekle(sayfa, 1500)
    sayfa.locator("#grid .tile").first.click(); bekle(sayfa, 1000)
    expect(sayfa.locator("#modal")).to_be_visible()
    no1 = sayfa.inner_text("#m-no")
    sayfa.keyboard.press("ArrowRight"); bekle(sayfa, 500)
    assert sayfa.inner_text("#m-no") != no1
    assert "#/k/" in sayfa.url
    sayfa.keyboard.press("Escape"); bekle(sayfa, 400)
    expect(sayfa.locator("#modal")).to_be_hidden()


# ---------------- UC09 ----------------
@pytest.mark.parametrize("baski", ["tr", "fil", "en_tr", "en_fil"])
def test_uc09_hece(sayfa, site, baski):
    sayfa.goto(site + "/tr/#/hece"); bekle(sayfa)
    sayfa.select_option("#hece-ed", baski); bekle(sayfa, 1500)
    assert sayfa.locator("#hece-grid > *").count() == 34
    assert ed(sayfa) == baski


# ---------------- UC10 ----------------
@pytest.mark.parametrize("dil", ["tr", "en"])
def test_uc10_indir(sayfa, site, dil):
    sayfa.goto(f"{site}/{dil}/#/indir"); bekle(sayfa)
    hrefs = sayfa.eval_on_selector_all("#page-indir a[href$='.pdf'], #page-indir a[href$='.json']", "es=>es.map(e=>e.href)")
    assert sum(h.endswith(".pdf") for h in hrefs) >= 4
    for h in hrefs:
        assert sayfa.request.head(h).status == 200, h


# ---------------- UC11 ----------------
@pytest.mark.parametrize("dil,kelimeler", [
    ("tr", ["Alper Ulusoy", "CC BY-NC-SA", "Atatürk", "yapay zekâ"]),
    ("fil", ["Alper Ulusoy", "CC BY-NC-SA", "Atatürk"]),
    ("en", ["Alper Ulusoy", "CC BY-NC-SA", "Atatürk", "artificial intelligence"])])
def test_uc11_hakkinda(sayfa, site, dil, kelimeler):
    sayfa.goto(f"{site}/{dil}/#/hakkinda"); bekle(sayfa)
    metin = sayfa.inner_text("#about")
    for k in kelimeler:
        assert k.lower() in metin.lower(), k


# ---------------- UC12 ----------------
def test_uc12_tercih_kalici(sayfa, site):
    sayfa.goto(site + "/en/"); bekle(sayfa)
    sayfa.select_option("#f-ed", "en_tr"); bekle(sayfa, 400)
    sayfa.goto(site + "/"); bekle(sayfa, 1500)
    assert sayfa.url.startswith(site + "/en/") and ed(sayfa) == "en_tr"


# ---------------- UC13 ----------------
def test_uc13_erisilebilirlik(sayfa, site):
    sayfa.goto(site + "/tr/"); bekle(sayfa, 2000)
    assert sayfa.eval_on_selector_all("img", "es => es.filter(e => !e.hasAttribute('alt')).length") == 0
    sayfa.locator("#grid .tile").first.focus(); sayfa.keyboard.press("Enter"); bekle(sayfa, 800)
    expect(sayfa.locator("#modal")).to_be_visible()
    sayfa.keyboard.press("Escape"); bekle(sayfa, 400)
    odak = sayfa.evaluate("document.activeElement && document.activeElement.closest('#grid') !== null")
    assert odak, "pencere kapanınca odak karta dönmeli"


# ---------------- UC14 ----------------
GORUNUM = [(d, s, e) for d in ("tr", "fil", "en") for s in ("", "#/hece", "#/indir", "#/hakkinda", "#/okuma", "#/okuma/G1")
           for e in EKRAN]


@pytest.mark.parametrize("dil,yol,ekran", GORUNUM)
def test_uc14_gorunum(tarayici, site, dil, yol, ekran):
    from PIL import Image, ImageChops
    w, h = EKRAN[ekran]
    ctx = tarayici.new_context(viewport={"width": w, "height": h}, locale="tr-TR"); pg = ctx.new_page()
    pg.goto(f"{site}/{dil}/{yol}"); bekle(pg, 2500)
    assert pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"), "yatay taşma"
    ad = f"{dil}_{(yol.strip('#/').replace('/', '_') or 'kartlar')}_{ekran}.png"
    CIKTI.mkdir(parents=True, exist_ok=True); yeni = CIKTI / ad; pg.screenshot(path=str(yeni))
    ctx.close()
    taban = TABAN / ad
    if os.environ.get("GORSEL_TABAN") == "yenile" or not taban.exists():
        TABAN.mkdir(parents=True, exist_ok=True); taban.write_bytes(yeni.read_bytes()); return
    a, b = Image.open(taban).convert("RGB"), Image.open(yeni).convert("RGB")
    assert a.size == b.size, f"boyut değişti: {a.size} → {b.size}"
    fark = ImageChops.difference(a, b).convert("L").point(lambda v: 255 if v > 24 else 0)
    oran = sum(fark.histogram()[255:]) / (a.size[0] * a.size[1])
    if oran > 0.02:
        fark.save(CIKTI / ("FARK_" + ad))
    assert oran <= 0.02, f"görsel fark %{oran*100:.1f} > %2 ({ad}); onaylıysa GORSEL_TABAN=yenile"


# ---------------- UC15 ----------------
@pytest.mark.parametrize("dil,lang_ogr,lang_cev", [("tr", "tl", "tr"), ("fil", "tr", "fil"), ("en", "tl", "en")])
def test_uc15_okuma_metni(sayfa, site, dil, lang_ogr, lang_cev):
    sayfa.goto(f"{site}/{dil}/#/okuma"); bekle(sayfa, 1500)
    ogeler = sayfa.locator("#okuma-list > li")
    assert ogeler.count() == 11
    sayfa.locator("#okuma-list a").nth(2).click(); bekle(sayfa, 800)
    assert re.search(r"#/okuma/G\d+$", sayfa.url)
    bolum = sayfa.url.rsplit("/", 1)[1]
    assert sayfa.get_attribute("#okuma h1", "lang") == lang_ogr
    assert sayfa.get_attribute("#ok-s1 .ok-c", "lang") == lang_cev
    assert re.search(r"\d+\.\d+", sayfa.inner_text(".ok-ver")), "metin sürümü görünmeli"
    # çeviri göster / gizle
    expect(sayfa.locator("#ok-s1 .ok-c")).to_be_visible()
    sayfa.click("#ok-tog"); expect(sayfa.locator("#ok-s1 .ok-c")).to_be_hidden()
    sayfa.click("#ok-tog"); expect(sayfa.locator("#ok-s1 .ok-c")).to_be_visible()
    # kelime -> kart (adres #/okuma/Gx/k/W....) -> metne dön
    w = sayfa.locator("#okuma .ok-w").first
    f = w.get_attribute("data-f"); w.click(); bekle(sayfa, 900)
    expect(sayfa.locator("#modal")).to_be_visible()
    assert sayfa.url.endswith(f"#/okuma/{bolum}/k/{f}")
    assert sayfa.inner_text("#m-no").startswith(f)
    sayfa.keyboard.press("ArrowRight"); bekle(sayfa, 400)
    assert re.search(rf"#/okuma/{bolum}/k/W\d{{4}}$", sayfa.url) and not sayfa.url.endswith(f)
    sayfa.click("#m-back"); bekle(sayfa, 600)
    expect(sayfa.locator("#modal")).to_be_hidden()
    assert sayfa.url.endswith(f"#/okuma/{bolum}")
    assert sayfa.evaluate("document.activeElement.classList.contains('ok-w')"), "odak kelimeye dönmeli"
    # tarayıcı ileri / geri
    sayfa.go_forward(); bekle(sayfa, 800); expect(sayfa.locator("#modal")).to_be_visible()
    sayfa.go_back(); bekle(sayfa, 800); expect(sayfa.locator("#modal")).to_be_hidden()
    # önceki / sonraki metin
    sayfa.click("#ok-next"); bekle(sayfa, 600)
    assert sayfa.url.endswith(f"#/okuma/G{int(bolum[1:]) + 1}")
    sayfa.click("#ok-prev"); bekle(sayfa, 600)
    assert sayfa.url.endswith(f"#/okuma/{bolum}")
    sayfa.go_back(); bekle(sayfa, 600)
    assert sayfa.url.endswith(f"#/okuma/G{int(bolum[1:]) + 1}")
    # doğrudan bağlantı: kart açık gelir, kapatınca metin kalır
    sayfa.goto(f"{site}/{dil}/#/okuma/{bolum}/k/{f}"); bekle(sayfa, 1500)
    expect(sayfa.locator("#modal")).to_be_visible()
    sayfa.keyboard.press("Escape"); bekle(sayfa, 500)
    assert sayfa.url.endswith(f"#/okuma/{bolum}") and sayfa.is_visible("#okuma h1")


# ---------------- UC16 ----------------
def test_uc16_kart_metin_gecisleri(sayfa, site):
    # ızgara penceresi (#/k/W0026 'araw'): geçtiği metinler -> cümle işaretli
    sayfa.goto(site + "/tr/#/k/W0026"); bekle(sayfa, 2000)
    expect(sayfa.locator("#m-in")).to_be_visible()
    a = sayfa.locator("#m-in a").first
    href = a.get_attribute("href"); a.click(); bekle(sayfa, 1000)
    m = re.match(r"#/okuma/(\w+)#s(\d+)$", href)
    assert m and sayfa.url.endswith(href)
    expect(sayfa.locator("#modal")).to_be_hidden()
    expect(sayfa.locator(f"#ok-s{m.group(2)}")).to_have_class(re.compile(r"\bhl\b"))
    assert sayfa.locator(".ok-s.hl").count() == 1
    assert sayfa.locator(f"#ok-s{m.group(2)} .ok-w[data-f=W0026]").count() >= 1, "cümlede kart geçmeli"
    # metin penceresi: aynı liste; başka bölüme geçiş
    sayfa.locator(f"#ok-s{m.group(2)} .ok-w[data-f=W0026]").first.click(); bekle(sayfa, 900)
    expect(sayfa.locator("#m-back")).to_be_visible()
    expect(sayfa.locator("#m-in")).to_be_visible()
    hrefs = sayfa.eval_on_selector_all("#m-in a", "es => es.map(e => e.getAttribute('href'))")
    assert all(re.match(r"#/okuma/\w+#s\d+$", h) for h in hrefs) and len(hrefs) >= 1
    diger = next((h for h in hrefs if not h.startswith(f"#/okuma/{m.group(1)}#")), hrefs[-1])
    sayfa.locator(f"#m-in a[href='{diger}']").click(); bekle(sayfa, 1000)
    assert sayfa.url.endswith(diger)
    expect(sayfa.locator("#modal")).to_be_hidden()
    expect(sayfa.locator(".ok-s.hl")).to_have_count(1)
    # tarayıcı geri: kart penceresi yeniden açılır
    sayfa.go_back(); bekle(sayfa, 1000)
    expect(sayfa.locator("#modal")).to_be_visible()
    # FIL baskısı Türkçe diziyi kullanır
    sayfa.goto(site + "/fil/#/k/W0026"); bekle(sayfa, 2000)
    expect(sayfa.locator("#m-in")).to_be_visible()
    assert "pangungusap" in sayfa.inner_text("#m-in")
