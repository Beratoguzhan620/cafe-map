# CafeMap — Yol Haritası

Harita üzerinde kafeleri gösteren, pine dokununca bottom sheet ile detay açan mobil keşif uygulaması.

- **Önerilen repo adı:** `cafe-map`
- **Teknoloji:** Expo (managed), React Native, TypeScript, NativeWind, expo-router
- **Kurallar:** `CONTRIBUTING.md` · **Tasarım:** `docs/DESIGN.md`

Her aşama ayrı bir branch ve PR olarak yapılır (`stage/<no>-<kisa-ad>`). Bir aşama ancak tüm maddeleri bitince, build/testler geçince ve ekran görüntüleri eklenince tamamlanmış sayılır. Biten maddeler `[x]` yapılır.

> Orijinal ödev metni yalnızca yerelde `docs/brief/` klasöründe durur (git'e girmez); bütün gereksinimler bu dosyaya işlenmiştir. Gereksinim: Expo Maps, Gorhom Bottom Sheet, NativeWind, app icon + splash, dev build notları.

## Aşama 1 — Kurulum ve harita
- [ ] Expo (TypeScript, expo-router, NativeWind) kurulumu; `docs/DESIGN.md` token'ları
- [ ] `data/cafes.json`: 15 kafe (ad, koordinat, görsel, açıklama, puan, adres) — İstanbul
- [ ] Tam ekran harita (SafeArea çözümüyle), varsayılan kamera, tüm pinler

## Aşama 2 — Bottom sheet ve etkileşim
- [ ] Pine dokununca Gorhom Bottom Sheet: görsel, ad, açıklama, adres; kapanınca seçim sıfırlanır
- [ ] Seçili pin farklı görünür; kamera seçilen kafeye animasyonla gider
- [ ] Alt kısımda yatay kafe kartı listesi (harita ile senkron), arama

## Aşama 3 — Teslim
- [ ] App icon + splash (`app.json`)
- [ ] `npx tsc --noEmit` ve lint temiz
- [ ] README (TR + EN): teknolojiler, kafe JSON örneği, dev build notları (`npx expo run:android|ios`), ekran görüntüleri
- [ ] Berat'ın kendi cihazında dev build ile doğrulaması (elle)
