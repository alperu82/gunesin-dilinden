# Güneşin Dilinden · Mula sa Wika ng Araw · From the Language of the Sun

> **BETA** — içerik taslaktır, onaydan önce değişebilir.

Ücretsiz, resimli **1000 kelime kartı** projesi. Güneş Dil Teorisi (GDT, Atatürk 1935) okumaları **ezber köprüsü** olarak kullanılır.

## Baskılar

| Baskı | Kim için | Kartın başı |
|---|---|---|
| **TR** | Tagalog öğrenen Türkler | Tagalog kelime, açıklamalar Türkçe |
| **FIL** | Türkçe öğrenen Filipinliler | Türkçe kelime + okunuş, açıklamalar Tagalogca |
| **EN-TR** | Türkçe öğrenen İngilizce bilenler | Türkçe kelime, açıklamalar İngilizce |
| **EN-FIL** | Filipince öğrenen İngilizce bilenler | Tagalog kelime, açıklamalar İngilizce |

## Site

- **Kartlar:** arama (Tagalog / Türkçe / İngilizce), anlam grubu (G1–G10) ve dayanak gücü (kaynak / emsal / köprü) süzgeçleri; ayrıntı penceresinde GDT okuması, kutu anlamları, ezber cümlesi, ses köprüsü, örnek ve çekim.
- **Hece kartları:** 34 kartlık GDT etiket sözlüğü.
- **İndir:** dört baskının taslak PDF'leri.
- **Hakkında:** yöntem, dürüstlük notu, kaynak, yazar, yapay zekâ notu, lisans.
- Arayüz dili: TR / FIL / EN. Derleme adımı yok, dış kaynak (CDN) yok; düz HTML + CSS + JS.

## Dosyalar

```
index.html  app.js  style.css      site
build_site.py                      veriyi yeniden üretir (yalnız yazarın makinesinde)
data/cards.json                    1000 kart, tüm baskılar + meta (yazar, lisans, kaynak)
data/hece.json                     34 hece kartı
data/pdfs.json                     PDF listesi
data/svg_<baskı>_N.json            kart resimleri (tr, fil, en_tr, en_fil; SVG, 250'şer kartlık paketler)
data/svg_hece.json                 hece kartı resimleri (4 baskı)
pdf/*_taslak_*.pdf                 taslak PDF'ler (her baskının en yenisi)
```

Yerelde denemek için: `python3 -m http.server` ve tarayıcıda `http://localhost:8000`.

## Dürüstlük notu

Güneş Dil Teorisi bu projede bir ezber yöntemi olarak kullanılır. Proje, bir dilin başka bir dilden geldiğini iddia etmez. Gerçek köken / etimoloji bilgisi kullanılmaz.

## Kaynak

Atatürk, M. K. (1935). *Güneş-Dil Teorisi – Ulus Dil Yazıları / Etimoloji, Morfoloji ve Fonetik Bakımından Türk Dili.* Yay. haz. Doğu Polat. İstanbul: Alaca Yayınları, 2019. ISBN 978-605-68261-4-6.
Kitap yalnız kaynak olarak gösterilir; bu depoda kitaptan metin ya da tarama yoktur.

## Yazar

**Alper Ulusoy** · ulusoy.alper@gmail.com

## Yapay zekâ notu

Bu kitap yapay zekâ desteğiyle (Claude, Anthropic) hazırlanmıştır. Çözümlemeler, örnekler ve çizimler yazarın yönlendirmesiyle üretilmiştir; yazar denetimi ve ana dili Tagalog olan editör incelemesi sürmektedir.

## Ana dili konuşanlara çağrı

Tagalogca metinler ve Türkçe okunuşlar ana dili konuşanların gözden geçirmesini bekliyor. Hata ve öneriler için yazara e-posta ya da GitHub Issues.

## Lisans

© 2026 Alper Ulusoy · [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) — ayrıntı: `LICENSE`.

---

## English summary

A free picture-card project with **1000 words** for Turkish ↔ Filipino (Tagalog) and for English speakers (EN-TR, EN-FIL). Readings from Atatürk's Sun Language Theory (1935) are used **only as a memory method**; the project does not claim that any language comes from another. Author: **Alper Ulusoy** (ulusoy.alper@gmail.com). Prepared with the help of AI (Claude, Anthropic) under the author's direction; review by the author and native-speaker editors is ongoing. Licence: CC BY-NC-SA 4.0. Status: beta / draft.

## Buod sa Filipino

Libreng proyekto ng mga kard na may larawan: **1000 salita** para sa Turko ↔ Filipino (Tagalog) at para sa mga nagsasalita ng Ingles. Ginagamit ang Güneş Dil Teorisi (Atatürk, 1935) **bilang paraan lamang ng pagsasaulo**; hindi sinasabi ng proyekto na nagmula ang isang wika sa ibang wika. May-akda: **Alper Ulusoy** (ulusoy.alper@gmail.com). Inihanda sa tulong ng AI (Claude, Anthropic) sa ilalim ng direksiyon ng may-akda; patuloy ang pagsusuri ng may-akda at ng mga katutubong editor. Lisensiya: CC BY-NC-SA 4.0. Katayuan: beta / borador.
