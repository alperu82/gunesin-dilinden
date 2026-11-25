/* Güneşin Dilinden — beta site. Vanilla JS, derleme adımı yok, dış kaynak yok. */
(() => {
  "use strict";

  // /tr/, /fil/, /en/ alt sayfaları <html data-root="../" data-ui="tr"> taşır
  const ROOT = document.documentElement.dataset.root || "";
  const SURUM = document.documentElement.dataset.v || ""; // önbellek kırıcı (build_site.py yazar)
  const URL_UI = document.documentElement.dataset.ui || "";
  if (URL_UI) { try { localStorage.setItem("gd_ui", URL_UI); } catch (e) {} }
  const REPO_ISSUES = "https://github.com/alperu82/gunesin-dilinden/issues";
  const PAGE = 48;

  // ---------------- arayüz metinleri ----------------
  const T = {
    tr: {
      skip: "İçeriğe geç", nav_cards: "Kartlar", nav_hece: "Hece kartları", nav_dl: "İndir", nav_about: "Hakkında",
      cards_h: "1000 kelime kartı", f_ed: "Baskı", f_q: "Ara", f_g: "Anlam grubu", f_s: "Dayanak gücü",
      q_ph: "Tagalog, Türkçe ya da İngilizce kelime…", all_g: "Tüm gruplar", all_s: "Tümü",
      count: (n, t) => `${n} / ${t} kart`, none: "Bu ölçütlere uyan kart yok.", more: "Daha fazla göster",
      prev: "Önceki kart", next: "Sonraki kart", close: "Kapat", loading: "yükleniyor…",
      s_gdt: "GDT okuması", s_ez: "Ezber cümlesi", s_basis: "Dayanak", s_bridge: "Ses köprüsü",
      s_ex: "Örnek", s_cj: "Çekim", cj_h: ["geçmiş", "şimdiki", "gelecek"], root: "kök",
      no_bridge: "Bu kelime için ses köprüsü yok.", fallback: "çeviri yok, özgün etiket", familiar: "tanıdık kelime",
      hece_h: "Hece kartları",
      hece_lead: "34 kart, GDT okumasının sözlüğüdür: her kök ve ek hecesi için kitapta verilen anlam. Kelime kartlarındaki kutular bu etiketleri kullanır. Kartlar 4 basamakta, en dar ve kesin çerçeve önce dizilir: önce 1. basamağı öğrenin; bir kelimede önce 1., sonra 2. ve 3. basamağın hecelerini bulun; 4. basamağın anlamını bağlam seçer.",
      h_tier: "Basamak", h_n: "kart",
      h_tr: "Türkçe", h_fil: "Filipince", h_en: "İngilizce", h_book: "Kitapta", h_ex: "Örnekler", h_rule: "Okuma kuralı", h_src: "Kaynak",
      dl_h: "İndir", dl_lead: "Dört baskının taslak PDF'leri. Onaydan önce değişebilir.",
      draft: "TASLAK", pages: "sayfa", part: "Bölüm", pp: "s.", dl_data_h: "Açık veri",
      dl_data: 'Tüm kart verisi tek dosyada: <a href="' + ROOT + 'data/cards.json" download>data/cards.json</a> (CC BY-NC-SA 4.0).',
      no_pdf: "Henüz PDF yok.",
      ed_lead: {
        tr: "Türkçe bilenler için Tagalog: üstte Tagalog kelime, altında GDT okuması ve Türkçe anlam.",
        fil: "Tagalog bilenler için Türkçe: üstte Türkçe kelime ve okunuşu, açıklamalar Tagalogca.",
        en_tr: "İngilizce bilenler için Türkçe: Türkçe kelime, GDT okuması ve açıklamalar İngilizce.",
        en_fil: "İngilizce bilenler için Filipince: Tagalog kelime, GDT okuması ve açıklamalar İngilizce.",
      },
      strength: { kaynak: "kaynak", emsal: "emsal", "köprü": "köprü" },
      strength_d: {
        kaynak: "Kelime kitapta doğrudan çözümlenmiş.",
        emsal: "Kitapta benzer bir kelime aynı yolla çözümlenmiş (sayfa verilir).",
        "köprü": "Yalnız kitabın genel tablolarına dayanan okuma; ezber köprüsüdür.",
      },
      pos: { isim: "isim", fiil: "fiil", "sıfat": "sıfat", zarf: "zarf", zamir: "zamir", edat: "edat", "sayı": "sayı", selam: "selam" },
      nav_read: "Okuma", read_h: "Okuma metinleri", sayi: "Sayılar",
      read_lead: "Her bölümün sonunda kısa bir metin. Altı noktalı kelimeye dokunun: kartı açılır; “Metne dön” ile geri gelirsiniz.",
      read_ver: (v, d) => `Metin sürümü ${v}${d ? " · " + d : ""}`, cev_show: "Çeviriyi göster", cev_hide: "Çeviriyi gizle",
      prev_text: "Önceki metin", next_text: "Sonraki metin", all_texts: "Tüm metinler", back_text: "Metne dön", back_card: "Geri",
      in_texts: "Geçtiği metinler", sent: "cümle", n_sent: (n, k) => `${n} cümle · ${k} kart`,
      no_text: "henüz yok", no_texts: "Okuma metinleri hazırlanıyor.",
      footer_extra: "",
    },
    fil: {
      skip: "Lumaktaw sa nilalaman", nav_cards: "Mga kard", nav_hece: "Mga kard ng pantig", nav_dl: "I-download", nav_about: "Tungkol",
      cards_h: "1000 kard ng salita", f_ed: "Edisyon", f_q: "Maghanap", f_g: "Pangkat ng kahulugan", f_s: "Lakas ng batayan",
      q_ph: "Salitang Tagalog, Turko o Ingles…", all_g: "Lahat", all_s: "Lahat",
      count: (n, t) => `${n} / ${t} kard`, none: "Walang kard na tugma.", more: "Magpakita pa",
      prev: "Nakaraang kard", next: "Susunod na kard", close: "Isara", loading: "naglo-load…",
      s_gdt: "Pagbasa ng GDT", s_ez: "Pangungusap na pantanda", s_basis: "Batayan", s_bridge: "Tulay ng tunog",
      s_ex: "Halimbawa", s_cj: "Banghay", cj_h: ["nakaraan", "kasalukuyan", "hinaharap"], root: "ugat",
      no_bridge: "Walang tulay ng tunog para sa salitang ito.", fallback: "walang salin, orihinal na etiketa", familiar: "kilalang salita",
      hece_h: "Mga kard ng pantig",
      hece_lead: "34 na kard: ang talahuluganan ng pagbasa ng GDT — ang kahulugan ng bawat ugat at panlapi ayon sa aklat. Ginagamit ito ng mga kahon sa mga kard ng salita. Nakaayos ang mga kard sa 4 na baitang, ang pinakamakitid na balangkas muna: aralin muna ang baitang 1; sa isang salita, hanapin muna ang mga pantig ng baitang 1, saka ng 2 at 3; ang konteksto ang pipili ng kahulugan sa baitang 4.",
      h_tier: "Baitang", h_n: "kard",
      h_tr: "Turko", h_fil: "Filipino", h_en: "Ingles", h_book: "Sa aklat", h_ex: "Mga halimbawa", h_rule: "Tuntunin (Turko)", h_src: "Sanggunian",
      dl_h: "I-download", dl_lead: "Mga borador na PDF ng apat na edisyon. Maaari pang magbago bago aprubahan.",
      draft: "BORADOR", pages: "pahina", part: "Bahagi", pp: "p.", dl_data_h: "Bukas na datos",
      dl_data: 'Lahat ng datos ng kard sa isang file: <a href="' + ROOT + 'data/cards.json" download>data/cards.json</a> (CC BY-NC-SA 4.0).',
      no_pdf: "Wala pang PDF.",
      ed_lead: {
        tr: "Tagalog para sa mga nagsasalita ng Turko: salitang Tagalog sa itaas, pagbasa ng GDT at kahulugang Turko.",
        fil: "Turko para sa mga nagsasalita ng Tagalog: salitang Turko at bigkas sa itaas, paliwanag sa Tagalog.",
        en_tr: "Turko para sa mga nagsasalita ng Ingles: salitang Turko, pagbasa ng GDT at paliwanag sa Ingles.",
        en_fil: "Filipino para sa mga nagsasalita ng Ingles: salitang Tagalog, pagbasa ng GDT at paliwanag sa Ingles.",
      },
      strength: { kaynak: "nasa aklat", emsal: "katulad", "köprü": "tulay" },
      strength_d: {
        kaynak: "Direktang sinuri ang salita sa aklat.",
        emsal: "May katulad na salitang sinuri sa aklat sa parehong paraan (may pahina).",
        "köprü": "Pagbasang batay lamang sa pangkalahatang talaan ng aklat; tulay sa pagsasaulo.",
      },
      nav_read: "Pagbasa", read_h: "Mga babasahin", sayi: "Mga bilang",
      read_lead: "Isang maikling teksto sa dulo ng bawat bahagi. Pindutin ang salitang may tuldok na salungguhit: bubukas ang kard nito; bumalik sa “Bumalik sa teksto”.",
      read_ver: (v, d) => `Bersiyon ng teksto ${v}${d ? " · " + d : ""}`, cev_show: "Ipakita ang salin", cev_hide: "Itago ang salin",
      prev_text: "Nakaraang teksto", next_text: "Susunod na teksto", all_texts: "Lahat ng teksto", back_text: "Bumalik sa teksto", back_card: "Bumalik",
      in_texts: "Lumalabas sa mga teksto", sent: "pangungusap", n_sent: (n, k) => `${n} pangungusap · ${k} kard`,
      no_text: "wala pa", no_texts: "Inihahanda pa ang mga babasahin.",
      pos: { isim: "pangngalan", fiil: "pandiwa", "sıfat": "pang-uri", zarf: "pang-abay", zamir: "panghalip", edat: "pang-ukol", "sayı": "bilang", selam: "pagbati" },
    },
    en: {
      skip: "Skip to content", nav_cards: "Cards", nav_hece: "Syllable cards", nav_dl: "Downloads", nav_about: "About",
      cards_h: "1000 word cards", f_ed: "Edition", f_q: "Search", f_g: "Meaning group", f_s: "Strength of basis",
      q_ph: "Tagalog, Turkish or English word…", all_g: "All groups", all_s: "All",
      count: (n, t) => `${n} / ${t} cards`, none: "No cards match.", more: "Show more",
      prev: "Previous card", next: "Next card", close: "Close", loading: "loading…",
      s_gdt: "GDT reading", s_ez: "Memory sentence", s_basis: "Basis", s_bridge: "Sound bridge",
      s_ex: "Example", s_cj: "Conjugation", cj_h: ["past", "present", "future"], root: "root",
      no_bridge: "No sound bridge for this word.", fallback: "no translation, original label", familiar: "familiar word",
      hece_h: "Syllable cards",
      hece_lead: "34 cards form the dictionary of the GDT reading: the meaning the book gives for each root and suffix syllable. The boxes on the word cards use these labels. The cards come in 4 tiers, narrowest frame first: learn tier 1 first; in a word, find the tier-1 syllables first, then tiers 2 and 3; in tier 4, the context chooses the meaning.",
      h_tier: "Tier", h_n: "cards",
      h_tr: "Turkish", h_fil: "Filipino", h_en: "English", h_book: "In the book", h_ex: "Examples", h_rule: "Reading rule (Turkish)", h_src: "Source",
      dl_h: "Downloads", dl_lead: "Draft PDFs of the four editions. They may change before approval.",
      draft: "DRAFT", pages: "pages", part: "Part", pp: "p.", dl_data_h: "Open data",
      dl_data: 'All card data in one file: <a href="' + ROOT + 'data/cards.json" download>data/cards.json</a> (CC BY-NC-SA 4.0).',
      no_pdf: "No PDFs yet.",
      ed_lead: {
        tr: "Tagalog for Turkish speakers: Tagalog word on top, GDT reading and Turkish meaning below.",
        fil: "Turkish for Tagalog speakers: Turkish word and pronunciation on top, notes in Tagalog.",
        en_tr: "Turkish for English speakers: Turkish word, GDT reading and notes in English.",
        en_fil: "Filipino for English speakers: Tagalog word, GDT reading and notes in English.",
      },
      strength: { kaynak: "source", emsal: "precedent", "köprü": "bridge" },
      strength_d: {
        kaynak: "The word itself is analysed in the book.",
        emsal: "A similar word is analysed the same way in the book (page given).",
        "köprü": "A reading based only on the book's general tables; a memory bridge.",
      },
      nav_read: "Reading", read_h: "Reading texts", sayi: "Numbers",
      read_lead: "A short text at the end of each section. Tap a word with a dotted underline to open its card; “Back to text” brings you back.",
      read_ver: (v, d) => `Text version ${v}${d ? " · " + d : ""}`, cev_show: "Show translation", cev_hide: "Hide translation",
      prev_text: "Previous text", next_text: "Next text", all_texts: "All texts", back_text: "Back to text", back_card: "Back",
      in_texts: "Appears in texts", sent: "sentence", n_sent: (n, k) => `${n} sentences · ${k} cards`,
      no_text: "not yet", no_texts: "The reading texts are being prepared.",
      pos: { isim: "noun", fiil: "verb", "sıfat": "adjective", zarf: "adverb", zamir: "pronoun", edat: "preposition", "sayı": "number", selam: "greeting" },
    },
  };

  const EDS = {
    tr: { svg: "tr", label: { tr: "TR · Türkler için Tagalog", fil: "TR · Tagalog para sa mga Turko", en: "TR · Tagalog for Turkish speakers" } },
    fil: { svg: "fil", label: { tr: "FIL · Filipinliler için Türkçe", fil: "FIL · Turko para sa mga Pilipino", en: "FIL · Turkish for Filipinos" } },
    en_tr: { svg: "en_tr", label: { tr: "EN-TR · İngilizce bilenler için Türkçe", fil: "EN-TR · Turko para sa mga nag-i-Ingles", en: "EN-TR · Turkish for English speakers" } },
    en_fil: { svg: "en_fil", label: { tr: "EN-FIL · İngilizce bilenler için Filipince", fil: "EN-FIL · Filipino para sa mga nag-i-Ingles", en: "EN-FIL · Filipino for English speakers" } },
  };
  const ED_TITLE = {
    tr: { tr: "Güneşin Dilinden — Filipince 1000 Kelime", fil: "Güneşin Dilinden — 1000 salitang Filipino (para sa mga Turko)", en: "Güneşin Dilinden — 1000 Filipino words (Turkish edition)" },
    fil: { tr: "Mula sa Wika ng Araw — 1000 Türkçe kelime (Filipince baskı)", fil: "Mula sa Wika ng Araw — 1000 Salitang Turko", en: "Mula sa Wika ng Araw — 1000 Turkish words (Filipino edition)" },
    en_tr: { tr: "From the Language of the Sun — 1000 Türkçe kelime (İngilizce baskı)", fil: "From the Language of the Sun — 1000 salitang Turko (edisyong Ingles)", en: "From the Language of the Sun — First 1000 Turkish Words" },
    en_fil: { tr: "From the Language of the Sun — 1000 Filipince kelime (İngilizce baskı)", fil: "From the Language of the Sun — 1000 salitang Filipino (edisyong Ingles)", en: "From the Language of the Sun — First 1000 Filipino Words" },
  };

  // ---------------- durum ----------------
  const $ = (s, r = document) => r.querySelector(s);
  const S = {
    ui: URL_UI || localStorage.getItem("gd_ui") || guessLang(),
    ed: localStorage.getItem("gd_ed") || null,
    q: "", g: "", s: "",
    data: null, hece: null, pdfs: null, list: [], shown: 0, cur: -1,
    metin: null, gecis: null, ctx: null, okPushed: false, okSec: null, prevHash: "",
    exStack: [], exFwd: [], exNav: false, exClose: null,  // örnek cümle kelimesi -> kart: geri / ileri yığını
  };
  if (!T[S.ui]) S.ui = "tr";
  if (!S.ed || !EDS[S.ed] || ({ tr: "tr", fil: "fil", en_tr: "en", en_fil: "en" }[S.ed] !== S.ui)) S.ed = { tr: "tr", fil: "fil", en: "en_fil" }[S.ui];
  const chunkCache = new Map();
  const blobCache = new Map();

  function guessLang() {
    const l = (navigator.language || "tr").toLowerCase();
    if (l.startsWith("tr")) return "tr";
    if (l.startsWith("fil") || l.startsWith("tl")) return "fil";
    return "en";
  }
  const t = (k) => T[S.ui][k] ?? T.en[k] ?? k;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s || "").toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[-·'’]/g, "");
  const mb = (n) => (n / 1048576).toFixed(1).replace(".", S.ui === "en" ? "." : ",") + " MB";

  // ---------------- veri ----------------
  async function getJSON(u) {
    const r = await fetch(/^(https?:)?\/\//.test(u) ? u : ROOT + u + (SURUM ? (u.includes("?") ? "&" : "?") + "v=" + SURUM : ""));
    if (!r.ok) throw new Error(u + " " + r.status);
    return r.json();
  }
  function svgChunk(kind, n) {
    const parts = S.data.meta.svg && S.data.meta.svg[kind];
    if (!Array.isArray(parts)) return Promise.resolve(null);
    const p = parts.find((x) => n >= x.from && n <= x.to);
    if (!p) return Promise.resolve(null);
    if (!chunkCache.has(p.file)) chunkCache.set(p.file, getJSON(p.file).catch(() => null));
    return chunkCache.get(p.file);
  }
  let heceSvg = null;
  function heceChunk() {
    if (!heceSvg) heceSvg = getJSON(S.data.meta.svg.hece || "data/svg_hece.json").catch(() => null);
    return heceSvg;
  }
  function blobUrl(key, svg) {
    if (!blobCache.has(key)) blobCache.set(key, URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })));
    return blobCache.get(key);
  }
  async function cardImgUrl(c, kind) {
    const ch = await svgChunk(kind, c.n);
    const svg = ch && ch[c.f];
    return svg ? blobUrl(kind + c.f, svg) : null;
  }

  // ---------------- baskıya göre kart görünümü ----------------
  function view(c, ed) {
    const en = c.en || {};
    const fil = c.fil || {};
    const enEd = ed === "en_tr" || ed === "en_fil";
    const trWord = ed === "fil" || ed === "en_tr"; // başlık Türkçe kelime mi
    const src = trWord ? { seg: fil.seg, k: fil.k || [], g: fil.g || c.g, s: fil.s || c.s, d: fil.d } : { seg: c.seg, k: c.k, g: c.g, s: c.s, d: c.d };
    const boxes = src.k.map((b) => {
      // "=" kutusu kelimenin kendisidir: İngilizce baskıda İngilizce anlam gösterilir
      if (enEd && b[0] === "=") return { g: b[0], a: (c.en && c.en.en) || b[1], root: !!b[2], fb: !(c.en && c.en.en) };
      const a = enEd ? b[3] || b[1] : b[1];
      return { g: b[0], a, root: !!b[2], fb: enEd && !b[3] };
    });
    const v = {
      head: trWord ? fil.w || c.tr : c.tl, headLang: trWord ? "tr" : "tl",
      pron: trWord && fil.ok ? `[${fil.ok}]` : "",
      seg: src.seg, boxes, g: src.g, s: src.s, d: src.d && src.d !== "—" ? src.d : "",
      svg: EDS[ed].svg,
    };
    if (ed === "tr") Object.assign(v, { xt: c.xl, mean: c.tr, meanLang: "tr", ez: c.ez, ezLang: "tr", br: c.br, ex: [c.ex[0], c.ex[1]], exL: ["tl", "tr"], cj: (c.cj || []).map((r) => [r[0], r[1]]), cjL: ["tl", "tr"] });
    if (ed === "fil") Object.assign(v, { xt: c.xr, mean: c.tl, meanLang: "tl", ez: fil.ez, ezLang: "fil", br: c.brf, ex: [c.ex[1], c.ex[0]], exL: ["tr", "tl"], cj: (c.cj || []).map((r) => [r[1], r[0]]), cjL: ["tr", "tl"] });
    if (ed === "en_tr") Object.assign(v, { xt: c.xr, mean: en.en || "", meanLang: "en", ez: en.ezber_en_tr, ezLang: "en", br: en.ses_en_tr, brTan: !!en.ses_en_tr_tanidik, ex: [c.ex[1], en.ornek_en], exL: ["tr", "en"], cj: (c.cj || []).map((r, i) => [r[1], (en.cekim_en || [])[i] || ""]), cjL: ["tr", "en"] });
    if (ed === "en_fil") Object.assign(v, { xt: c.xl, mean: en.en || "", meanLang: "en", ez: en.ezber_en_tl, ezLang: "en", br: en.ses_en_tl, brTan: !!en.ses_en_tl_tanidik, ex: [c.ex[0], en.ornek_en], exL: ["tl", "en"], cj: (c.cj || []).map((r, i) => [r[0], (en.cekim_en || [])[i] || ""]), cjL: ["tl", "en"] });
    if (enEd && v.d) {
      v.d = v.d.replace(/(^|[^\w=])s\.(?=\s?[\d≈])/g, "$1p.").replace(/168 kök/g, "168 roots").replace(/9 anlam/g, "9 meanings")
        .replace(/kök listesi/g, "root list").replace(/ikindi/g, "ikindi (afternoon)");
    }
    if (enEd && !v.mean) v.meanFb = `${c.tr} · ${c.tl}`;
    v.ex = v.ex.filter(Boolean).length ? v.ex : [];
    return v;
  }
  const gName = (g) => (S.data.meta.groups[g] || {})[S.ui] || g;
  const gColor = (g) => (S.data.meta.groups[g] || {}).c || "#6A6862";
  const sName = (s) => T[S.ui].strength[s] || s;
  const pips = (s) => ({ kaynak: "◆◆◆", emsal: "◆◆◇", "köprü": "◆◇◇" }[s] || "");

  // ---------------- çeviri uygula ----------------
  function applyI18n() {
    document.documentElement.lang = S.ui === "fil" ? "fil" : S.ui;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); el.title = t(el.dataset.i18nAria); });
    document.querySelectorAll("#lang-switch button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === S.ui)));
    const titles = S.data ? S.data.meta.title : { tr: "Güneşin Dilinden", fil: "Mula sa Wika ng Araw", en: "From the Language of the Sun" };
    $("#brand-title").textContent = titles[S.ui];
    $("#brand-sub").textContent = ["tr", "fil", "en"].filter((l) => l !== S.ui).map((l) => titles[l]).join(" · ");
    $("#f-q").placeholder = t("q_ph");
    const m = S.data && S.data.meta;
    const who = m ? m.author : "Alper Ulusoy";
    document.querySelectorAll(".site-footer p").forEach((p) => {
      p.innerHTML = `© 2026 ${esc(who)} · <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" rel="license">CC BY-NC-SA 4.0</a> · beta`;
    });
  }

  function fillSelects() {
    const ed = $("#f-ed");
    ed.innerHTML = Object.keys(EDS).map((k) => `<option value="${k}">${esc(EDS[k].label[S.ui])}</option>`).join("");
    ed.value = S.ed;
    const he = $("#hece-ed");
    he.innerHTML = ed.innerHTML; he.value = S.ed;
    const oe = $("#okuma-ed");
    oe.innerHTML = ed.innerHTML; oe.value = S.ed;
    const g = $("#f-g");
    g.innerHTML = `<option value="">${esc(t("all_g"))}</option>` +
      Object.keys(S.data.meta.groups).map((k) => `<option value="${k}">${k.replace("G", "")} · ${esc(gName(k))}</option>`).join("");
    g.value = S.g;
    const s = $("#f-s");
    s.innerHTML = `<option value="">${esc(t("all_s"))}</option>` +
      ["kaynak", "emsal", "köprü"].map((k) => `<option value="${k}">${pips(k)} ${esc(sName(k))}</option>`).join("");
    s.value = S.s;
  }

  // ---------------- kart ızgarası ----------------
  function filter() {
    const q = norm(S.q.trim());
    S.list = S.data.cards.filter((c) => {
      const v = view(c, S.ed);
      if (S.g && v.g !== S.g) return false;
      if (S.s && v.s !== S.s) return false;
      if (!q) return true;
      return [c.tl, c.tr, c.fil && c.fil.w, c.en && c.en.en].some((x) => x && norm(x).includes(q));
    });
    // tam eşleşmeler öne
    if (q) S.list.sort((a, b) => score(b, q) - score(a, q) || a.n - b.n);
  }
  function score(c, q) {
    const f = [c.tl, c.tr, c.fil && c.fil.w, c.en && c.en.en].map(norm);
    return f.includes(q) ? 2 : f.some((x) => x.startsWith(q)) ? 1 : 0;
  }

  let io = null;
  function observer() {
    if (io) return io;
    io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        loadTile(e.target);
      });
    }, { rootMargin: "400px 0px" });
    return io;
  }
  async function loadTile(btn) {
    const c = S.data.cards[+btn.dataset.i];
    const kind = EDS[S.ed].svg;
    if (!kind) return;
    const url = await cardImgUrl(c, kind);
    const ph = btn.querySelector(".ph");
    if (!url || !ph) return;
    const img = new Image();
    img.className = "img";
    img.alt = ph.dataset.alt;
    img.decoding = "async";
    img.src = url;
    img.width = 342; img.height = 212;
    ph.replaceWith(img);
  }

  function tileHTML(c, idx) {
    const v = view(c, S.ed);
    const alt = `${v.head} — ${v.mean || v.meanFb || ""}`;
    if (v.svg) {
      return `<li><button type="button" class="tile" data-i="${idx}" aria-label="${esc(alt)}">` +
        `<span class="img ph" data-alt="${esc(alt)}"><span lang="${v.headLang}">${esc(v.head)}</span></span></button></li>`;
    }
    const bx = v.boxes.slice(0, 3).map((b) => `<span class="${b.root ? "root" : ""}">${esc(b.g)}</span>`).join("");
    return `<li><button type="button" class="tile" data-i="${idx}" aria-label="${esc(alt)}">` +
      `<span class="img hcard" style="--gc:${gColor(v.g)}">` +
      `<span class="meta">${esc((T[S.ui].pos[c.pos] || c.pos))} · <b>${esc(gName(v.g))}</b></span>` +
      `<span class="w" lang="${v.headLang}">${esc(v.head)}</span>` +
      `<span class="seg">${esc(v.pron ? v.pron + "  " : "")}${esc(v.seg || "")}</span>` +
      `<span class="bx" aria-hidden="true">${bx}</span>` +
      `<span class="m" lang="${v.mean ? "en" : ""}">${v.mean ? esc(v.mean) : `<small>${esc(v.meanFb || "")}</small>`}</span>` +
      `</span></button></li>`;
  }

  function renderGrid(reset = true) {
    const grid = $("#grid");
    if (reset) {
      filter();
      S.shown = 0;
      grid.innerHTML = "";
      if (io) io.disconnect();
    }
    const end = Math.min(S.list.length, S.shown + PAGE);
    const html = [];
    for (let i = S.shown; i < end; i++) html.push(tileHTML(S.list[i], S.data.cards.indexOf(S.list[i])));
    grid.insertAdjacentHTML("beforeend", html.join(""));
    const o = observer();
    grid.querySelectorAll(".tile:not([data-o])").forEach((b) => { b.dataset.o = "1"; if (EDS[S.ed].svg) o.observe(b); });
    S.shown = end;
    $("#count").textContent = S.list.length ? t("count")(S.list.length, S.data.cards.length) : t("none");
    $("#more").hidden = S.shown >= S.list.length;
    $("#edition-lead").textContent = T[S.ui].ed_lead[S.ed];
  }

  // "daha fazla" düğmesi görünür olunca kendiliğinden yükle
  const moreIO = new IntersectionObserver((e) => {
    if (e[0].isIntersecting && !$("#more").hidden && route() === "kartlar") renderGrid(false);
  }, { rootMargin: "600px 0px" });

  // ---------------- ayrıntı penceresi ----------------
  const dlg = $("#modal");
  function openCard(listIdx, push = true) {
    if (listIdx < 0 || listIdx >= S.list.length) return;
    S.cur = listIdx; S.ctx = null;
    const c = S.list[listIdx];
    cardBody(c);
    $("#m-no").textContent = `${c.f} · ${listIdx + 1} / ${S.list.length}`;
    $("#m-prev").disabled = listIdx === 0;
    $("#m-next").disabled = listIdx === S.list.length - 1;
    $("#m-back").hidden = true;
    if (!dlg.open) dlg.showModal();
    $("#m-body").scrollTop = 0; dlg.scrollTop = 0;
    if (push) history.replaceState(null, "", `#/k/${c.f}`);
  }
  // okuma metninden açılan kart: ←/→ metindeki bağlı kartlar arasında gezer
  function openTextCard(sec, f, push = true) {
    const ids = textIds(sec);
    const i = ids.indexOf(f);
    const c = S.byF[f];
    if (!c) return;
    S.ctx = { sec, f, ids, i };
    cardBody(c);
    $("#m-no").textContent = i >= 0 ? `${c.f} · ${i + 1} / ${ids.length}` : c.f;
    $("#m-prev").disabled = i <= 0;
    $("#m-next").disabled = i < 0 || i === ids.length - 1;
    const back = $("#m-back");
    back.hidden = false; back.textContent = "← " + t("back_text");
    if (!dlg.open) dlg.showModal();
    $("#m-body").scrollTop = 0; dlg.scrollTop = 0;
    if (push) history.replaceState(null, "", `#/okuma/${sec}/k/${f}`);
  }
  function stepCard(d) {
    if (S.ctx) { const j = S.ctx.i + d; if (j >= 0 && j < S.ctx.ids.length) openTextCard(S.ctx.sec, S.ctx.ids[j]); }
    else openCard(S.cur + d);
  }
  function cardBody(c) {
    const v = view(c, S.ed);
    const L = T[S.ui];
    const gc = gColor(v.g);
    const boxes = v.boxes.map((b) =>
      `<li class="${b.root ? "root" : ""}" style="--gc:${gc}"><span class="g">${esc(b.g)}</span>` +
      `<span class="a">${b.fb ? `<i title="${esc(L.fallback)}">${esc(b.a)}</i>` : esc(b.a)}${b.root ? ` · ${esc(L.root)}` : ""}</span></li>`).join("");
    const cj = v.cj && v.cj.length
      ? `<section class="sec"><h3>${esc(L.s_cj)}</h3><table class="cj"><thead><tr><th scope="col"></th><th scope="col" lang="${v.cjL[0]}">${esc(v.head)}</th><th scope="col"></th></tr></thead><tbody>` +
        v.cj.map((r, i) => `<tr><th scope="row">${esc(L.cj_h[i] || "")}</th><td lang="${v.cjL[0]}"><b>${esc(r[0])}</b></td><td lang="${v.cjL[1]}">${esc(r[1])}</td></tr>`).join("") +
        `</tbody></table></section>` : "";
    const ex = v.ex.length
      ? `<section class="sec ex"><h3>${esc(L.s_ex)}</h3><p class="t" lang="${v.exL[0]}">${exHTML(v.ex[0] || "", v.xt, c.f)}</p><p class="u" lang="${v.exL[1]}">${esc(v.ex[1] || "")}</p></section>` : "";
    const img = v.svg ? `<div class="d-imgwrap"><span class="d-card ph" role="img" aria-label="${esc(v.head)}"></span></div>` : "";
    $("#m-body").innerHTML =
      img +
      `<div class="d-head"><h2 id="m-title" lang="${v.headLang}">${esc(v.head)}</h2>` +
      (v.pron ? `<div class="d-pron" lang="tr">${esc(v.pron)}</div>` : "") +
      `<p class="d-mean" lang="${v.meanLang}">${v.mean ? esc(v.mean) : `<span class="muted">${esc(v.meanFb || "")}</span>`}</p></div>` +
      `<div class="badges"><span class="badge" style="--gc:${gc}"><span class="dot"></span>${esc(v.g.replace("G", "G "))} · ${esc(gName(v.g))}</span>` +
      `<span class="badge s-${esc(v.s)}" title="${esc(L.strength_d[v.s] || "")}"><span class="pips" aria-hidden="true">${pips(v.s)}</span>${esc(sName(v.s))}</span>` +
      `<span class="badge">${esc(L.pos[c.pos] || c.pos)}</span></div>` +
      `<div class="d-split"><div>` +
      `<section class="sec"><h3>${esc(L.s_gdt)}</h3><p class="seg-line">${esc(v.seg || "")}</p><ul class="boxes">${boxes}</ul>` +
      (v.ez ? `<p class="ez" lang="${v.ezLang}">${esc(v.ez)}</p>` : "") + `</section>` +
      `<section class="sec"><h3>${esc(L.s_basis)}</h3><p class="basis"><b>${pips(v.s)} ${esc(sName(v.s))}</b> — ${esc(L.strength_d[v.s] || "")}${v.d ? `<br>${esc(v.d)}` : ""}</p></section>` +
      `</div><div>` +
      `<section class="sec"><h3>${esc(L.s_bridge)}</h3>${v.br ? (v.brTan  // tanıdık kelime (tren ≈ 'train'): tanıma yardımı, ezber hilesi ya da köken ipucu değil (K13)
        ? `<p class="bridge bridge-tanidik">${esc(v.br)} <span class="tag-tanidik">${esc(L.familiar)}</span></p>`
        : `<p class="bridge">${esc(v.br)}</p>`) : `<p class="muted">${esc(L.no_bridge)}</p>`}</section>` +
      ex + cj + `</div></div>` +
      `<section class="sec ok-in" id="m-in" hidden aria-labelledby="m-in-h"></section>`;
    const sel = c.f;
    const xb = $("#m-exback");
    xb.hidden = !S.exStack.length; xb.textContent = "← " + t("back_card");
    inTexts(c);
    if (v.svg) {
      cardImgUrl(c, v.svg).then((url) => {
        const ph = $("#m-body .d-card.ph");
        if (!url || !ph || $("#m-no").textContent.split(" ")[0] !== sel) return;
        const im = new Image();
        im.className = "d-card"; im.src = url; im.width = 342; im.height = 212;
        im.alt = `${v.head} — ${v.mean || ""}: ${v.seg || ""}`;
        ph.replaceWith(im);
      });
    }
  }
  // örnek cümle (öğrenilen dil): kartı olan kelime düğme olur (okuma metnindeki .ok-w gibi); kartın kendisi düz yazı.
  // Belirteçler cümlenin üstünde sırayla bulunur (boşluk farkına dayanıklı); uyuşmazsa cümle düz yazılır.
  function exHTML(text, toks, self) {
    if (!toks || !toks.length) return esc(text);
    let i = 0, h = "";
    for (const tk of toks) {
      const w = Array.isArray(tk) ? tk[0] : tk, id = Array.isArray(tk) ? tk[1] : 0;
      const p = String(w).replace(/\s+/g, "");
      if (!p) continue;
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      const a = j;
      let k = 0;
      while (j < text.length && k < p.length) {
        if (/\s/.test(text[j])) { j++; continue; }
        if (text[j] !== p[k]) return esc(text);
        j++; k++;
      }
      if (k < p.length) return esc(text);
      const seg = text.slice(a, j), f = id ? "W" + String(id).padStart(4, "0") : null, card = f && f !== self && S.byF[f];
      h += esc(text.slice(i, a));
      if (card) {
        const cv = view(card, S.ed);
        h += `<button type="button" class="ok-w ex-w" data-f="${f}" style="--gc:${gColor(cv.g)}" ` +
          `aria-label="${esc(seg)}: ${esc(cv.mean || cv.meanFb || "")}">${esc(seg)}</button>`;
      } else h += esc(seg);
      i = j;
    }
    return h + esc(text.slice(i));
  }
  // açık kartın adresi (ızgara: #/k/W0026 · metin: #/okuma/G3/k/W0026)
  function modalHash() {
    if (S.ctx) return `#/okuma/${S.ctx.sec}/k/${S.ctx.f}`;
    const c = S.list[S.cur];
    return c ? `#/k/${c.f}` : location.hash;
  }
  // örnek kelimesinden karta: geçmişe yeni adım (tarayıcı geri/ileri çalışır), yığın "← Geri" düğmesini besler
  function exGo(f) {
    if (!S.byF[f]) return;
    S.exStack.push(modalHash()); S.exFwd = []; S.exNav = true;
    location.hash = S.ctx ? `#/okuma/${S.ctx.sec}/k/${f}` : `#/k/${f}`;
  }
  // kart penceresinde "geçtiği metinler": #/okuma/G3#s2 bağlantıları
  async function inTexts(c) {
    await loadMetin();
    const box = $("#m-in");
    if (!box || $("#m-no").textContent.split(" ")[0] !== c.f) return;
    const o = OKU[S.ed], list = (S.gecis[o.dizi] || {})[c.f] || [];
    if (!list.length) { box.hidden = true; return; }
    // bölüme göre gruplanır: "G3 · cümle 2" tek bağlantı; birden çok cümle varsa numaralar ayrı bağlantı
    const by = [];
    list.forEach(([sec, n]) => { const g = by.find((x) => x[0] === sec); if (g) g[1].push(n); else by.push([sec, [n]]); });
    box.innerHTML = `<h3 id="m-in-h">${esc(t("in_texts"))}</h3><ul class="ok-chips">` +
      by.map(([sec, ns]) => `<li style="--gc:${secColor(sec)}" title="${esc(secTitle(sec, o))}">` +
        (ns.length === 1
          ? `<a href="#/okuma/${sec}#s${ns[0]}">${esc(secLabel(sec))} · ${esc(t("sent"))} ${ns[0]}</a>`
          : `<span class="ok-ck">${esc(secLabel(sec))} · ${esc(t("sent"))}</span>` +
            ns.map((n) => `<a class="ok-cn" href="#/okuma/${sec}#s${n}" aria-label="${esc(secLabel(sec))}, ${esc(t("sent"))} ${n}">${n}</a>`).join("")) +
        `</li>`).join("") + `</ul>`;
    box.hidden = false;
  }
  function closeCard() {
    if (dlg.open) dlg.close();
  }
  dlg.addEventListener("close", () => {
    const h = location.hash;
    // örnek kelimeleriyle açılan kartlar geçmişten geri alınır (n adım); vardığı adres sonra düzeltilir (show: exClose)
    const n = S.exStack.length, ilk = S.exStack[0];
    S.exStack = []; S.exFwd = [];
    if (h.startsWith("#/k/")) {
      if (n) { S.exClose = "#/kartlar"; history.go(-n); } else history.replaceState(null, "", "#/kartlar");
      const m0 = (ilk || "").match(/^#\/k\/(W\d{4})$/);
      if (m0) { const i0 = S.list.findIndex((c) => c.f === m0[1]); if (i0 >= 0) S.cur = i0; }
    }
    const mt = h.match(/^#\/okuma\/([A-Z0-9]+)\/k\//);
    if (mt) {
      // metne dön: metinden gelindiyse geçmişte geri (1 + örnek adımları), doğrudan bağlantıysa adres metne çevrilir
      const m1 = (ilk || "").match(/\/k\/(W\d{4})$/);
      if (m1 && S.ctx) S.ctx.f = m1[1];
      if (S.okPushed) { S.okPushed = false; history.go(-(n + 1)); }
      else if (n) { S.exClose = `#/okuma/${mt[1]}`; history.go(-n); }
      else history.replaceState(null, "", `#/okuma/${mt[1]}`);
    }
    const hs = h.match(/^#\/okuma\/[A-Z0-9]+#s(\d+)$/);
    if (hs) {  // "geçtiği metinler" bağlantısı: odak ve görünüm işaretli cümlede kalsın
      const li = $("#ok-s" + hs[1]);
      if (li) { li.focus({ preventScroll: true }); li.scrollIntoView({ block: "center" }); }
      return;
    }
    if (S.ctx) {
      const w = document.querySelector(`#okuma .ok-w[data-f="${S.ctx.f}"]`) || $("#okuma h1");
      if (w && route() === "okuma") w.focus();
      return;
    }
    const btn = document.querySelector(`.tile[data-i="${S.data.cards.indexOf(S.list[S.cur])}"]`);
    if (btn) btn.focus();
  });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) closeCard(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); stepCard(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); stepCard(1); }
  });
  $("#m-prev").onclick = () => stepCard(-1);
  $("#m-next").onclick = () => stepCard(1);
  $("#m-close").onclick = closeCard;
  $("#m-back").onclick = closeCard;
  $("#m-exback").onclick = () => { if (S.exStack.length) history.back(); };
  $("#m-body").addEventListener("click", (e) => {
    const b = e.target.closest(".ex-w");
    if (b) { e.preventDefault(); exGo(b.dataset.f); }
  });

  // ---------------- okuma metinleri (K17) ----------------
  // dizi: hangi metin dizisi; cev: okur dilindeki çeviri satırı; lang: öğrenilen dilin lang değeri
  const OKU = {
    tr: { dizi: "tl", cev: "tr", lang: "tl" }, en_fil: { dizi: "tl", cev: "en", lang: "tl" },
    fil: { dizi: "tr", cev: "fil", lang: "tr" }, en_tr: { dizi: "tr", cev: "en", lang: "tr" },
  };
  const SECS = ["SAYI", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"];
  const sidOf = (x) => { const m = /^W(\d+)/.exec(String(x || "")); return m ? "W" + String(+m[1]).padStart(4, "0") : null; };
  let metinP = null;
  function loadMetin() {
    if (!metinP) {
      metinP = getJSON("data/metinler.json").catch(() => ({ surum: null, tl: {}, tr: {} })).then((d) => {
        S.metin = d; S.gecis = { tl: {}, tr: {} };
        ["tl", "tr"].forEach((dz) => SECS.forEach((sec) => {
          const m = (d[dz] || {})[sec];
          if (!m) return;
          (m.cumleler || []).forEach((c, i) => (c.t || []).forEach((tk) => {
            const f = sidOf(tk[1]);
            if (!f) return;
            const L = (S.gecis[dz][f] = S.gecis[dz][f] || []);
            if (!L.some((x) => x[0] === sec && x[1] === i + 1)) L.push([sec, i + 1]);
          }));
        }));
        return d;
      });
    }
    return metinP;
  }
  const secText = (sec, ed = S.ed) => S.metin && (S.metin[OKU[ed].dizi] || {})[sec];
  const secList = () => SECS.filter((x) => secText(x));
  const secLabel = (sec) => (sec === "SAYI" ? t("sayi") : sec);
  const secColor = (sec) => (sec === "SAYI" ? "#854F0B" : gColor(sec));
  const secName = (sec) => (sec === "SAYI" ? t("sayi") : `${sec.replace("G", "G ")} · ${gName(sec)}`);
  function secTitle(sec, o = OKU[S.ed]) {
    const m = secText(sec);
    return m ? (m.baslik || {})[o.lang === "tl" ? "tl" : "tr"] || sec : sec;
  }
  function textIds(sec) {
    const m = secText(sec), out = [];
    if (!m) return out;
    m.cumleler.forEach((c) => (c.t || []).forEach((tk) => { const f = sidOf(tk[1]); if (f && S.byF[f] && !out.includes(f)) out.push(f); }));
    return out;
  }
  const NOSP_BEFORE = /^[.,!?;:…)\]}»”’%]+$/;
  const NOSP_AFTER = /[(\[{«“‘¿¡]$/;
  function sentenceHTML(c, o) {
    let h = "", prev = null;
    (c.t || []).forEach((tk) => {
      const w = String(tk[0]);
      if (prev !== null && !NOSP_BEFORE.test(w) && !NOSP_AFTER.test(prev)) h += " ";
      const f = sidOf(tk[1]), card = f && S.byF[f];
      if (card) {
        const v = view(card, S.ed);
        h += `<button type="button" class="ok-w" data-f="${f}" style="--gc:${gColor(v.g)}" ` +
          `aria-label="${esc(w)}: ${esc(v.mean || v.meanFb || "")}">${esc(w)}</button>`;
      } else h += esc(w);
      prev = w;
    });
    return h;
  }
  const cevOn = () => { try { return localStorage.getItem("gd_cev") !== "0"; } catch (e) { return true; } };
  function okumaHash() {
    const m = location.hash.match(/^#\/okuma(?:\/([A-Z0-9]+))?(?:\/k\/(W\d{4}))?(?:#s(\d+))?$/);
    return m ? { sec: m[1] || null, f: m[2] || null, s: m[3] ? +m[3] : null } : { sec: null, f: null, s: null };
  }
  async function renderOkuma() {
    await loadMetin();
    if (route() !== "okuma") return;
    const q = okumaHash(), o = OKU[S.ed], M = S.metin, box = $("#okuma");
    $("#okuma-ed").value = S.ed;
    const ver = M.surum ? `<p class="ok-ver">${esc(t("read_ver")(M.surum, M.tarih))}</p>` : "";
    if (!q.sec || !secText(q.sec)) {
      $("#okuma-list-wrap").hidden = false;
      box.hidden = true; S.okSec = null;
      const has = secList();
      $("#okuma-ver").innerHTML = ver;
      $("#okuma-list").innerHTML = has.length ? SECS.map((sec) => {
        const m = secText(sec);
        if (!m) return `<li class="ok-item off" style="--gc:${secColor(sec)}"><span class="ok-k">${esc(secName(sec))}</span><span class="ok-n">${esc(t("no_text"))}</span></li>`;
        const nk = textIds(sec).length;
        return `<li class="ok-item" style="--gc:${secColor(sec)}"><a href="#/okuma/${sec}">` +
          `<span class="ok-k">${esc(secName(sec))}</span>` +
          `<span class="ok-t" lang="${o.lang}">${esc(secTitle(sec))}</span>` +
          `<span class="ok-u" lang="${o.cev}">${esc((m.baslik || {})[o.cev] || "")}</span>` +
          `<span class="ok-n">${esc(t("n_sent")(m.cumleler.length, nk))}</span></a></li>`;
      }).join("") : `<li class="note">${esc(t("no_texts"))}</li>`;
      return;
    }
    $("#okuma-list-wrap").hidden = true; box.hidden = false;
    const sec = q.sec, m = secText(sec), has = secList(), k = has.indexOf(sec);
    const yeni = S.okSec !== sec + "|" + S.ed + "|" + S.ui;
    if (yeni) {
      S.okSec = sec + "|" + S.ed + "|" + S.ui;
      const on = cevOn();
      const pn = (j, rel, lab) => has[j]
        ? `<a class="btn ghost" id="ok-${rel}" rel="${rel}" href="#/okuma/${has[j]}">${rel === "prev" ? "← " : ""}${esc(lab)}<span class="ok-pn-t">${esc(secLabel(has[j]))}</span>${rel === "next" ? " →" : ""}</a>`
        : `<span class="btn ghost off" id="ok-${rel}" aria-disabled="true">${rel === "prev" ? "← " : ""}${esc(lab)}${rel === "next" ? " →" : ""}</span>`;
      box.innerHTML =
        `<p class="ok-top"><a href="#/okuma">← ${esc(t("all_texts"))}</a></p>` +
        `<p class="ok-kicker" style="--gc:${secColor(sec)}"><span class="dot"></span>${esc(secName(sec))}</p>` +
        `<h1 id="ok-h" tabindex="-1" lang="${o.lang}">${esc(secTitle(sec))}</h1>` +
        `<p class="ok-sub" lang="${o.cev}">${esc((m.baslik || {})[o.cev] || "")}</p>` +
        `<div class="ok-tools"><button type="button" class="btn ghost" id="ok-tog" aria-controls="ok-text" aria-pressed="${on}">${esc(on ? t("cev_hide") : t("cev_show"))}</button>${ver}</div>` +
        `<ol class="ok-text${on ? "" : " no-cev"}" id="ok-text">` +
        m.cumleler.map((c, i) => `<li class="ok-s" id="ok-s${i + 1}" tabindex="-1"><p class="ok-l" lang="${o.lang}">${sentenceHTML(c, o)}</p>` +
          `<p class="ok-c" lang="${o.cev}">${esc(c[o.cev] || "")}</p></li>`).join("") +
        `</ol><nav class="ok-pn" aria-label="${esc(t("read_h"))}">${pn(k - 1, "prev", t("prev_text"))}${pn(k + 1, "next", t("next_text"))}</nav>`;
      $("#ok-tog").onclick = (e) => {
        const now = !cevOn();
        try { localStorage.setItem("gd_cev", now ? "1" : "0"); } catch (x) {}
        $("#ok-text").classList.toggle("no-cev", !now);
        e.currentTarget.setAttribute("aria-pressed", String(now));
        e.currentTarget.textContent = now ? t("cev_hide") : t("cev_show");
      };
      if (!q.s && !q.f) { window.scrollTo(0, 0); $("#ok-h").focus({ preventScroll: true }); }
    }
    box.querySelectorAll(".ok-s.hl").forEach((x) => x.classList.remove("hl"));
    if (q.s) {
      const li = $("#ok-s" + q.s);
      if (li) { li.classList.add("hl"); li.scrollIntoView({ block: "center" }); li.focus({ preventScroll: true }); }
    }
  }

  // ---------------- hece sayfası ----------------
  async function renderHece() {
    if (!S.hece) S.hece = await getJSON("data/hece.json");
    const L = T[S.ui];
    $("#hece-ed").value = S.ed;
    const hy = (S.data.meta.svg && S.data.meta.svg.hece_yon) || ["tr", "fil"];
    const yon = hy.includes(S.ed) ? S.ed : (S.ui === "fil" ? "fil" : "tr");
    // K18: öğrenme sırası — 'sira'ya göre, basamak başına bir bölüm (başlık + not + kartlar)
    const hs = S.hece.slice().sort((a, b) => (a.sira || 0) - (b.sira || 0));
    const tiers = (S.data.meta.hece_tiers && S.data.meta.hece_tiers.length) ? S.data.meta.hece_tiers
      : [{ no: 0, ad: {}, not: {} }];
    const li = (h) => {
      const gc = h.g ? gColor(h.g) : "#6A6862";
      const tb = h.b ? `<span class="tier-b" title="${esc(L.h_tier + " " + h.b)}" aria-label="${esc(L.h_tier + " " + h.b)}">${h.b}</span>` : "";
      return `<li class="hece" style="--gc:${gc}" data-f="${h.f}" data-b="${h.b || ""}">` +
        `<span class="img ph hph" data-f="${h.f}" data-alt="${esc(h.glyph + " — " + (h[S.ui] || h.tr))}"></span>` +
        `<div class="body"><p class="glyph">${tb}${esc(h.glyph)}</p><dl>` +
        `<dt>${esc(L.h_tr)}</dt><dd lang="tr">${esc(h.tr)}</dd>` +
        `<dt>${esc(L.h_fil)}</dt><dd lang="fil">${esc(h.fil)}</dd>` +
        (h.en ? `<dt>${esc(L.h_en)}</dt><dd lang="en">${esc(h.en)}</dd>` : "") +
        `<dt>${esc(L.h_book)}</dt><dd lang="tr">${esc(h.kitapta)}</dd>` +
        `<dt>${esc(L.h_ex)}</dt><dd><span lang="tr">${esc(h.ex_tr)}</span><br><span lang="tl">${esc(h.ex_tl)}</span></dd>` +
        `</dl>` +
        (h.kural ? `<details><summary>${esc(L.h_rule)}</summary><p lang="tr">${esc(h.kural)}</p><p><b>${esc(L.h_src)}:</b> ${esc(h.src)}</p></details>` : "") +
        `</div></li>`;
    };
    $("#hece-grid").innerHTML = tiers.map((t) => {
      const ks = t.no ? hs.filter((h) => h.b === t.no) : hs;
      if (!ks.length) return "";
      const ad = t.ad[S.ui] || t.ad.tr || "", nt = t.not[S.ui] || t.not.tr || "";
      const hd = t.no ? `<header class="tier-h"><h2 id="ht-${t.no}"><span class="tier-b">${t.no}</span>` +
        `<span>${esc(L.h_tier + " " + t.no)} · ${esc(ad)}</span> <span class="cnt">${ks.length} ${esc(L.h_n)}</span></h2>` +
        (nt ? `<p class="tier-note">${esc(nt)}</p>` : "") + `</header>` : "";
      return `<section class="hece-tier" data-b="${t.no}"${t.no ? ` aria-labelledby="ht-${t.no}"` : ""}>${hd}` +
        `<ul class="hece-grid">${ks.map(li).join("")}</ul></section>`;
    }).join("");
    const svgs = await heceChunk();
    if (!svgs || !svgs[yon]) { document.querySelectorAll(".hph").forEach((p) => p.remove()); return; }
    const hio = new IntersectionObserver((ents) => ents.forEach((e) => {
      if (!e.isIntersecting) return;
      hio.unobserve(e.target);
      const ph = e.target, svg = svgs[yon][ph.dataset.f];
      if (!svg) { ph.remove(); return; }
      const im = new Image(); im.className = "img"; im.alt = ph.dataset.alt; im.width = 342; im.height = 212;
      im.src = blobUrl("h" + yon + ph.dataset.f, svg); ph.replaceWith(im);
    }), { rootMargin: "300px 0px" });
    document.querySelectorAll(".hph").forEach((p) => hio.observe(p));
  }

  // ---------------- indirme sayfası ----------------
  async function renderDl() {
    if (!S.pdfs) S.pdfs = await getJSON("data/pdfs.json").catch(() => []);
    const L = T[S.ui];
    const ul = $("#dl-list");
    if (!S.pdfs.length) { ul.innerHTML = `<li class="note">${esc(L.no_pdf)}</li>`; return; }
    ul.innerHTML = S.pdfs.map((p) => {
      const title = (ED_TITLE[p.edition] || ED_TITLE.tr)[S.ui];
      const parts = p.parts.map((x, i) =>
        `<li><a class="btn ghost" href="${esc(ROOT + x.file)}" download>${esc(p.parts.length > 1 ? `${L.part} ${i + 1}` : "PDF")}</a> ` +
        `<span class="file">${esc(L.pp)} ${x.from}–${x.to} · ${mb(x.size)}</span></li>`).join("");
      return `<li class="dl-item"><div class="info"><span class="name">${esc(title)}<span class="draft">${esc(L.draft === "DRAFT" ? "DRAFT" : L.draft + " / DRAFT")}</span></span>` +
        `<span class="file">${esc(p.version)} · ${esc(p.date)} · ${p.pages} ${esc(L.pages)}</span>` +
        `<ul class="parts">${parts}</ul></div></li>`;
    }).join("");
  }

  // ---------------- hakkında ----------------
  const ABOUT = {
    tr: {
      h: "Hakkında",
      intro: "<b>Güneşin Dilinden</b> ücretsiz, resimli bir kelime kartı projesidir: Türkçe ile Filipince (Tagalog) arasında ve İngilizce bilenler için 1000 temel kelime. Her kartta kelimenin Güneş Dil Teorisi (GDT) okuması, akılda kalması için bir ezber köprüsü olarak verilir.",
      m_h: "Yöntem",
      m: [
        "Kelime ünlü + ünsüz (V+K) hecelerine ayrılır; düşmüş ünlü parantezle geri konur: <code>(a)g</code>.",
        "Baştaki kök, kitaptaki “ağ” kökünün 9 anlamından (güneş, ışık, sıcaklık, ateş, kuvvet, hareket, su/renk, yer, ses) kelimeye en uygun olanla okunur; yokluk kökleri (ay/eğ) onuncu gruptur.",
        "Ek heceleri kitaptaki “alan” değerleriyle okunur (m = en yakın, n = bitişik, s = geniş alan, l = engin, t/d = yapıcı, k = tamamlar…). Bu etiketler <a href=\"#/hece\">hece kartlarında</a> toplanmıştır.",
        "Kutular bir ezber cümlesine bağlanır; yanına bir ses köprüsü eklenir (isa ≈ esas, lima ≈ el).",
      ],
      s_h: "Dayanak gücü",
      honest_h: "Dürüstlük notu",
      src_h: "Kaynak",
      src_note: "Kitap yalnız kaynak olarak gösterilir; sitede kitaptan metin, sayfa görüntüsü ya da tarama yoktur. Kartlardaki “s.” sayfa numaralarıdır.",
      au_h: "Yazar",
      ai_h: "Yapay zekâ notu",
      rev_h: "Ana dili konuşanlara çağrı",
      rev: "Tagalogca metinler ve Türkçe okunuşlar ana dili konuşanların gözden geçirmesini bekliyor. Hata gördüyseniz ya da daha doğal bir ifade önerebiliyorsanız lütfen yazın:",
      lic_h: "Lisans",
    },
    fil: {
      h: "Tungkol",
      intro: "Ang <b>Mula sa Wika ng Araw</b> ay libreng proyekto ng mga kard ng salita na may larawan: 1000 pangunahing salita sa pagitan ng Turko at Filipino (Tagalog), at para sa mga nagsasalita ng Ingles. Sa bawat kard, ibinibigay ang pagbasa ng salita ayon sa Güneş Dil Teorisi (GDT) bilang tulay sa pagsasaulo.",
      m_h: "Paraan",
      m: [
        "Hinahati ang salita sa mga pantig na patinig + katinig (V+K); ibinabalik sa panaklong ang nawalang patinig: <code>(a)g</code>.",
        "Ang ugat sa simula ay binabasa ayon sa 9 na kahulugan ng ugat na “ağ” sa aklat (araw, liwanag, init, apoy, lakas, galaw, tubig/kulay, lupa, salita); ang mga ugat ng pagkawala (ay/eğ) ang ikasampung pangkat.",
        "Binabasa ang mga panlapi ayon sa “lugar” sa aklat (m = pinakamalapit, n = katabi, s = malawak, l = lahat, t/d = gumagawa, k = bumubuo…). Nasa <a href=\"#/hece\">mga kard ng pantig</a> ang mga etiketang ito.",
        "Pinagdurugtong ang mga kahon sa isang pangungusap na pantanda, at may kasamang tulay ng tunog.",
      ],
      s_h: "Lakas ng batayan",
      honest_h: "Tala ng katapatan",
      src_h: "Sanggunian",
      src_note: "Binabanggit lamang ang aklat bilang sanggunian; walang teksto, larawan ng pahina o scan mula sa aklat sa site na ito. Ang “p.” sa mga kard ay numero ng pahina.",
      au_h: "May-akda",
      ai_h: "Tala tungkol sa AI",
      rev_h: "Panawagan sa mga katutubong tagapagsalita",
      rev: "Kailangan pa ng pagsusuri ng mga katutubong tagapagsalita ang mga tekstong Tagalog at ang mga bigkas sa Turko. Kung may nakita kayong mali o may mas natural na pahayag, sumulat po kayo:",
      lic_h: "Lisensiya",
    },
    en: {
      h: "About",
      intro: "<b>From the Language of the Sun</b> is a free picture-card vocabulary project: 1000 core words between Turkish and Filipino (Tagalog), and for English speakers. Each card gives the word's Güneş Dil Teorisi (Sun Language Theory, GDT) reading as a memory bridge.",
      m_h: "Method",
      m: [
        "The word is split into vowel + consonant (V+K) syllables; a dropped vowel is put back in brackets: <code>(a)g</code>.",
        "The first root is read with whichever of the book's 9 meanings of the root “ağ” fits the word best (sun, light, heat, fire, strength, motion, water/colour, place, sound); the absence roots (ay/eğ) form a tenth group.",
        "Suffix syllables are read with the book's “area” values (m = nearest, n = adjacent, s = wide area, l = vast, t/d = maker, k = completes…). These labels are collected in the <a href=\"#/hece\">syllable cards</a>.",
        "The boxes are joined into a memory sentence, with a sound bridge next to it.",
      ],
      s_h: "Strength of basis",
      honest_h: "Honesty note",
      src_h: "Source",
      src_note: "The book is cited only as a source; the site contains no text, page images or scans from it. “s.” / “p.” on the cards are page numbers.",
      au_h: "Author",
      ai_h: "Note on AI",
      rev_h: "Call for native speakers",
      rev: "The Tagalog texts and the Turkish pronunciations still need review by native speakers. If you see a mistake or can suggest a more natural wording, please write:",
      lic_h: "Licence",
    },
  };
  function renderAbout() {
    const A = ABOUT[S.ui], L = T[S.ui], m = S.data.meta;
    const K = (m.kunye && m.kunye[S.ui]) || {};
    const strength = ["kaynak", "emsal", "köprü"].map((k) =>
      `<tr><th scope="row">${pips(k)} ${esc(L.strength[k])}</th><td>${esc(L.strength_d[k])}</td></tr>`).join("");
    $("#about").innerHTML =
      `<h1>${esc(A.h)}</h1><p class="lead">${A.intro}</p>` +
      `<h2>${esc(K.durust || A.honest_h)}</h2><p class="honest">${esc(K.durust_m || "")}</p>` +
      `<h2>${esc(A.m_h)}</h2><ol>${A.m.map((x) => `<li>${x}</li>`).join("")}</ol>` +
      `<h3>${esc(A.s_h)}</h3><table class="strength-tbl"><tbody>${strength}</tbody></table>` +
      `<h2>${esc(A.src_h)}</h2><p class="cite">${esc(m.source.citation)}</p><p>${esc(A.src_note)}</p>` +
      `<h2>${esc(A.au_h)}</h2><p><b>${esc(m.author)}</b><br><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></p>` +
      `<h2>${esc(K.yz || A.ai_h)}</h2><p>${esc(K.yz_m || "")}</p>` +
      `<h2>${esc(A.rev_h)}</h2><p>${esc(A.rev)} <a href="mailto:${esc(m.email)}">${esc(m.email)}</a> · <a href="${REPO_ISSUES}" rel="noopener">GitHub Issues</a></p>` +
      `<h2>${esc(A.lic_h)}</h2><p>${esc(K.lisans_m || "CC BY-NC-SA 4.0")}</p>` +
      `<p><a rel="license" href="${esc(m.license.url)}">${esc(m.license.name)}</a> · ${esc(m.license.copyright)}</p>` +
      (K.taslak ? `<p class="note">${esc(K.taslak)}</p>` : "");
  }

  // ---------------- yönlendirme ----------------
  const ROUTES = ["kartlar", "okuma", "hece", "indir", "hakkinda"];
  function route() {
    const h = location.hash.replace(/^#\/?/, "");
    if (h.startsWith("k/")) return "kartlar";
    if (h === "okuma" || h.startsWith("okuma/") || h.startsWith("okuma#")) return "okuma";
    return ROUTES.includes(h) ? h : "kartlar";
  }
  let lastRoute = null;
  function show(focus) {
    if (S.exClose) { history.replaceState(null, "", S.exClose); S.exClose = null; }
    // örnek kelimesi geçmişi: yeni adım (exGo) · geri (yığının tepesi) · ileri · başka gezinme (yığın sıfırlanır)
    const now = location.hash;
    if (S.exNav) S.exNav = false;
    else if (S.exStack.length && S.exStack[S.exStack.length - 1] === now) { S.exFwd.push(modalHash()); S.exStack.pop(); }
    else if (S.exFwd.length && S.exFwd[S.exFwd.length - 1] === now && dlg.open) { S.exStack.push(modalHash()); S.exFwd.pop(); }
    else { S.exStack = []; S.exFwd = []; }
    const r = route();
    ROUTES.forEach((x) => { $("#page-" + x).hidden = x !== r; });
    document.querySelectorAll(".nav a").forEach((a) => {
      if (a.dataset.route === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (r === "hece") renderHece();
    if (r === "indir") renderDl();
    if (r === "hakkinda") renderAbout();
    const m = location.hash.match(/^#\/k\/(W\d{4})/);
    const ok = r === "okuma" ? okumaHash() : null;
    const prev = S.prevHash;
    S.prevHash = location.hash;
    if (r === "okuma") {
      renderOkuma().then(() => {
        if (location.hash !== S.prevHash) return;  // bu arada başka adrese geçildi
        if (ok.sec && ok.f && S.byF[ok.f]) {
          // metinden kelimeye tıklanarak gelindiyse "metne dön" geçmişte geri gider
          if (!dlg.open) S.okPushed = prev.split("#s")[0] === `#/okuma/${ok.sec}` || prev === `#/okuma/${ok.sec}`;
          openTextCard(ok.sec, ok.f, false);
        } else if (dlg.open) { S.okPushed = false; dlg.close(); }
      });
    } else if (m) {
      let i = S.list.findIndex((c) => c.f === m[1]);
      if (i < 0) { S.q = S.g = S.s = ""; $("#f-q").value = ""; fillSelects(); renderGrid(); i = S.list.findIndex((c) => c.f === m[1]); }
      if (i >= 0) openCard(i, false);
    } else if (dlg.open) { S.okPushed = false; dlg.close(); }
    if (focus && r !== lastRoute && !m && r !== "okuma") { $("#main").focus({ preventScroll: true }); window.scrollTo(0, 0); }
    if (focus && r !== lastRoute && r === "okuma" && !ok.sec) { $("#main").focus({ preventScroll: true }); window.scrollTo(0, 0); }
    lastRoute = r;
  }

  // ---------------- olaylar ----------------
  function bind() {
    document.querySelectorAll("#lang-switch button").forEach((b) => b.addEventListener("click", () => {
      if (URL_UI || b.dataset.lang !== S.ui) {
        // dil adresi: /tr/, /fil/, /en/ (sayfa ve kart bağlantısı korunur)
        localStorage.setItem("gd_ui", b.dataset.lang);
        const ed = { tr: "tr", fil: "fil", en: "en_fil" }[b.dataset.lang];
        const keep = ({ tr: "tr", fil: "fil", en_tr: "en", en_fil: "en" }[S.ed] === b.dataset.lang) ? S.ed : ed;
        localStorage.setItem("gd_ed", keep);
        location.href = ROOT + b.dataset.lang + "/" + location.hash; return;
      }
      S.ui = b.dataset.lang; localStorage.setItem("gd_ui", S.ui);
      // baskının okur dili arayüz diliyle aynı olsun (TR → Türkler için, FIL → Filipinliler için, EN → İngilizce baskı)
      const okur = { tr: "tr", fil: "fil", en_tr: "en", en_fil: "en" }[S.ed];
      if (okur !== S.ui) { S.ed = { tr: "tr", fil: "fil", en: "en_fil" }[S.ui]; localStorage.setItem("gd_ed", S.ed); $("#f-ed").value = S.ed; const h = $("#hece-ed"); if (h) h.value = S.ed; }
      applyI18n(); fillSelects(); renderGrid(); S.okSec = null; show(false);
    }));
    $("#f-ed").addEventListener("change", (e) => { S.ed = e.target.value; localStorage.setItem("gd_ed", S.ed); renderGrid(); });
    $("#okuma-ed").addEventListener("change", (e) => {
      S.ed = e.target.value; localStorage.setItem("gd_ed", S.ed); $("#f-ed").value = S.ed; $("#hece-ed").value = S.ed;
      renderGrid(); renderOkuma();
    });
    $("#okuma").addEventListener("click", (e) => {
      const b = e.target.closest(".ok-w");
      if (!b) return;
      const q = okumaHash();
      location.hash = `#/okuma/${q.sec}/k/${b.dataset.f}`;  // geçmişe yeni adım: tarayıcı geri tuşu metne döner
    });
    $("#hece-ed").addEventListener("change", (e) => { S.ed = e.target.value; localStorage.setItem("gd_ed", S.ed); $("#f-ed").value = S.ed; renderGrid(); renderHece(); });
    let tm;
    $("#f-q").addEventListener("input", (e) => { clearTimeout(tm); tm = setTimeout(() => { S.q = e.target.value; renderGrid(); }, 160); });
    $("#f-g").addEventListener("change", (e) => { S.g = e.target.value; renderGrid(); });
    $("#f-s").addEventListener("change", (e) => { S.s = e.target.value; renderGrid(); });
    $("#more").addEventListener("click", () => renderGrid(false));
    $("#grid").addEventListener("click", (e) => {
      const b = e.target.closest(".tile");
      if (!b) return;
      const c = S.data.cards[+b.dataset.i];
      openCard(S.list.indexOf(c));
    });
    window.addEventListener("hashchange", () => show(true));
    moreIO.observe($("#more"));
  }

  async function init() {
    applyI18n();
    try {
      S.data = await getJSON("data/cards.json");
    } catch (e) {
      $("#count").textContent = "Veri yüklenemedi / Hindi ma-load ang datos / Could not load data.";
      return;
    }
    S.byF = Object.fromEntries(S.data.cards.map((c) => [c.f, c]));
    applyI18n(); fillSelects(); bind(); renderGrid(); show(false);
  }
  init();
})();
