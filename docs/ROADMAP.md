# CafeMap — Yol Haritası

Harita üzerinde kafeleri gösteren, pine dokununca bottom sheet ile detay açan mobil keşif uygulaması.

- **Önerilen repo adı:** `cafe-map`
- **Teknoloji:** Expo (managed), React Native, TypeScript, NativeWind, expo-router
- **Kurallar:** `CONTRIBUTING.md` · **Tasarım:** `docs/DESIGN.md`

Her aşama ayrı bir branch ve PR olarak yapılır (`stage/<no>-<kisa-ad>`). Bir aşama ancak tüm maddeleri bitince, build/testler geçince ve ekran görüntüleri eklenince tamamlanmış sayılır. Biten maddeler `[x]` yapılır.

> Orijinal ödev metni yalnızca yerelde `docs/brief/` klasöründe durur (git'e girmez); bütün gereksinimler bu dosyaya işlenmiştir. Gereksinim: Expo Maps, Gorhom Bottom Sheet, NativeWind, app icon + splash, dev build notları.

## Aşama 1 — Kurulum ve harita
- [x] Expo (TypeScript, expo-router, NativeWind) kurulumu; `docs/DESIGN.md` token'ları
- [x] `src/data/cafes.json`: 15 kafe (ad, koordinat, görsel, açıklama, puan, adres) — İstanbul
- [x] Tam ekran harita (SafeArea çözümüyle), varsayılan kamera, tüm pinler
- [x] Web için Leaflet yedeği (expo-maps web'i desteklemiyor); birim testleri, uçtan uca test ve CI

## Aşama 2 — Bottom sheet ve etkileşim
- [x] Pine dokununca Gorhom Bottom Sheet: görsel, ad, açıklama, adres; kapanınca seçim sıfırlanır
- [x] Seçili pin farklı görünür; kamera seçilen kafeye animasyonla gider
- [x] Alt kısımda yatay kafe kartı listesi (harita ile senkron), arama

## Aşama 3 — Teslim
- [x] App icon + splash (`app.json`)
- [x] `npx tsc --noEmit` ve lint temiz
- [x] README (TR + EN): teknolojiler, kafe JSON örneği, dev build notları (`npx expo run:android|ios`), ekran görüntüleri
- [ ] Berat'ın kendi cihazında dev build ile doğrulaması (elle)
