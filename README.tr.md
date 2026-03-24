# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Bahasa Indonesia](README.id.md) | [Italiano](README.it.md) | [Português](README.pt-BR.md) | Türkçe | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md)

**Tüm Claude Code hafızalarınızı, becerilerinizi, MCP sunucularınızı ve kancalarınızı düzenleyin — kapsam hiyerarşisine göre görüntüleyin, sürükle-bırak ile kapsamlar arasında taşıyın.**

![Claude Code Organizer Demo](docs/demo.gif)

## Sorun

Claude Code her çalışmanızda sessizce hafızalar, beceriler ve MCP yapılandırmaları oluşturur — bunları geçerli dizininize uyan kapsama bırakır. Her yerde geçerli olmasını istediğiniz bir tercih mi? Tek bir projede sıkışıp kaldı. Tek bir repoya ait bir dağıtım becerisini mi eklediniz? Global kapsama sızdı ve diğer tüm projelerinizi kirletti.

**Bu sadece dağınıklık değil — AI performansınıza zarar veriyor.** Her oturumda Claude, mevcut kapsamdan ve üst kapsamlardan devralınan tüm yapılandırmaları bağlam pencerenize yükler. Yanlış kapsamdaki öğeler = boşa harcanan token'lar, kirlenmiş bağlam ve düşük doğruluk. Global kapsama yerleşmiş bir Python pipeline becerisini React frontend oturumunuzda yüklüyor. Yinelenen MCP girdileri aynı sunucuyu iki kez başlatıyor. Eski hafızalar mevcut talimatlarınızla çelişiyor.

### "Claude'dan düzeltmesini iste"

Claude Code'un kendi yapılandırmasını yönetmesini isteyebilirsiniz. Ama ileri geri gideceksiniz — bir dizinde `ls`, her dosyada `cat`, metin çıktısı parçalarından tam resmi birleştirmeye çalışacaksınız. **Tüm kapsamlardaki, tüm öğelerdeki, tüm kalıtımdaki tam ağacı tek seferde gösteren hiçbir komut yok.**

### Çözüm: görsel bir kontrol paneli

```bash
npx @mcpware/claude-code-organizer
```

Tek komut. Claude'un depoladığı her şeyi görün — kapsam hiyerarşisine göre düzenlenmiş. **Öğeleri kapsamlar arasında sürükleyin.** Eski hafızaları silin. Yinelenenleri bulun. Claude'un davranışını gerçekten neyin etkilediğini kontrol altına alın.

### Örnek: Proje → Global

Claude'a bir proje içindeyken "TypeScript + ESM tercih ediyorum" dediniz, ama bu tercih her yerde geçerli. Kontrol panelini açın, o hafızayı Proje'den Global'e sürükleyin. **Bitti. Tek bir sürükleme.**

### Örnek: Global → Proje

Global kapsama yerleşmiş bir dağıtım becerisinin yalnızca tek bir repo için anlamlı olduğunu fark ettiniz. O Proje kapsamına sürükleyin — diğer projeler artık görmeyecek.

### Örnek: Eski hafızaları silin

Claude, rastgele söylediklerinizden ya da *hatırlanmasını istediğinizi düşündüğü* şeylerden otomatik olarak hafızalar oluşturur. Bir hafta sonra artık alakasız ama her oturuma hâlâ yükleniyor. Gözatın, okuyun, silin. **Claude'un sizin hakkınızda ne bildiğini düşündüğünü siz kontrol edin.**

---

## Özellikler

- **Kapsam bilincine sahip hiyerarşi** — Tüm öğeleri Global > Çalışma Alanı > Proje olarak düzenlenmiş şekilde görün, kalıtım göstergeleriyle birlikte
- **Sürükle-bırak** — Hafızaları kapsamlar arasında, becerileri global ile repo bazlı arasında, MCP sunucularını yapılandırmalar arasında taşıyın
- **Taşıma onayı** — Her taşıma işlemi, herhangi bir dosyaya dokunmadan önce onay modalı gösterir
- **Aynı tür güvenliği** — Hafızalar yalnızca hafıza klasörlerine, beceriler beceri klasörlerine, MCP ise MCP yapılandırmalarına taşınabilir
- **Arama ve filtreleme** — Tüm öğelerde anında arama yapın, kategoriye göre filtreleyin (Hafıza, Beceriler, MCP, Yapılandırma, Kancalar, Eklentiler, Planlar)
- **Detay paneli** — Tam meta verileri, açıklamayı, dosya yolunu görmek ve VS Code'da açmak için herhangi bir öğeye tıklayın
- **Proje bazında tam tarama** — Her kapsam tüm öğe türlerini gösterir: hafızalar, beceriler, MCP sunucuları, yapılandırmalar, kancalar ve planlar
- **Gerçek dosya taşıma** — Yalnızca bir görüntüleyici değil, `~/.claude/` içindeki dosyaları gerçekten taşır
- **45 E2E testi** — Her işlem sonrası gerçek dosya sistemi doğrulamalı Playwright test paketi

## Neden Görsel Bir Kontrol Paneli?

Claude Code, CLI aracılığıyla dosyaları listeleyip taşıyabilir — ama kendi yapılandırmanızla 20 soru oynamak zorunda kalırsınız. Kontrol paneli size **tek bakışta tam görünürlük** sağlar:

| İhtiyacınız olan | Claude'a sorun | Görsel Kontrol Paneli |
|-----------------|:-----------:|:----------------:|
| **Her şeyi bir arada görün** tüm kapsamlarda | Bir seferde bir dizinde `ls`, parçaları birleştir | Kapsam ağacı, tek bakış |
| **Mevcut projemde ne yüklü?** | Birden fazla komut çalıştır, hepsini aldığını umut et | Proje aç → tam kalıtım zincirini gör |
| **Öğeleri kapsamlar arasında taşı** | Kodlanmış yolları bul, elle `mv` | Onaylı sürükle-bırak |
| **Yapılandırma içeriğini oku** | Her dosyayı tek tek `cat` | Tıkla → yan panel |
| **Yinelenleri / eski öğeleri bul** | Şifreli dizinlerde `grep` | Kategoriye göre ara + filtrele |
| **Kullanılmayan hafızaları temizle** | Hangi dosyaları sileceğini çöz | Yerinde gözat, oku, sil |

## Hızlı Başlangıç

### Seçenek 1: npx (kurulum gerektirmez)

```bash
npx @mcpware/claude-code-organizer
```

### Seçenek 2: Global kurulum

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Seçenek 3: Claude'a sorun

Bunu Claude Code'a yapıştırın:

> `npx @mcpware/claude-code-organizer` komutunu çalıştır — Claude Code ayarlarını yönetmek için bir kontrol panelidir. Hazır olduğunda URL'yi bana söyle.

`http://localhost:3847` adresinde bir kontrol paneli açar. Gerçek `~/.claude/` dizininizle çalışır.

## Neler Yönetilir

| Tür | Görüntüle | Taşı | Taranır | Neden kilitli? |
|-----|:----:|:----:|:----------:|----------------|
| Hafızalar (geri bildirim, kullanıcı, proje, referans) | Evet | Evet | Global + Proje | — |
| Beceriler | Evet | Evet | Global + Proje | — |
| MCP Sunucuları | Evet | Evet | Global + Proje | — |
| Yapılandırma (CLAUDE.md, settings.json) | Evet | Kilitli | Global + Proje | Sistem ayarları — taşıma yapılandırmayı bozabilir |
| Kancalar | Evet | Kilitli | Global + Proje | Ayarlar bağlamına bağlı — taşınırsa sessiz hatalar oluşur |
| Planlar | Evet | Evet | Global + Proje | — |
| Eklentiler | Evet | Kilitli | Yalnızca Global | Claude Code tarafından yönetilen önbellek |

## Kapsam Hiyerarşisi

```
Global                       <- her yerde geçerli
  Company (workspace)        <- tüm alt projelerde geçerli
    CompanyRepo1             <- projeye özgü
    CompanyRepo2             <- projeye özgü
  SideProjects (project)     <- bağımsız proje
  Documents (project)        <- bağımsız proje
```

Alt kapsamlar, üst kapsamın hafızalarını, becerilerini ve MCP sunucularını devralır.

## Nasıl Çalışır

1. **Tarar** `~/.claude/` — tüm projeleri, hafızaları, becerileri, MCP sunucularını, kancaları, eklentileri, planları keşfeder
2. **Kapsam hiyerarşisini çözümler** — dosya sistemi yollarından ebeveyn-çocuk ilişkilerini belirler
3. **Kontrol panelini oluşturur** — kapsam başlıkları > kategori çubukları > öğe satırları, uygun girintilerle
4. **Taşımaları yönetir** — sürüklediğinizde veya "Şuraya taşı..." seçeneğine tıkladığınızda, güvenlik kontrolleriyle birlikte dosyaları disk üzerinde gerçekten taşır

## Karşılaştırma

Bulabildiğimiz her Claude Code yapılandırma aracına baktık. Hiçbiri bağımsız bir kontrol panelinde görsel kapsam hiyerarşisi + sürükle-bırak çapraz kapsam taşıma sunmuyordu.

| İhtiyacım olan | Masaüstü uygulaması (600+⭐) | VS Code eklentisi | Full-stack web uygulaması | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Kapsam hiyerarşisi ağacı | Hayır | Evet | Kısmi | **Evet** |
| Sürükle-bırak taşıma | Hayır | Hayır | Hayır | **Evet** |
| Çapraz kapsam taşıma | Hayır | Tek tıkla | Hayır | **Evet** |
| Eski öğeleri silme | Hayır | Hayır | Hayır | **Evet** |
| MCP araçları | Hayır | Hayır | Evet | **Evet** |
| Sıfır bağımlılık | Hayır (Tauri) | Hayır (VS Code) | Hayır (React+Rust+SQLite) | **Evet** |
| Bağımsız (IDE gerektirmez) | Evet | Hayır | Evet | **Evet** |

## Platform Desteği

| Platform | Durum |
|----------|:------:|
| Ubuntu / Linux | Destekleniyor |
| macOS (Intel + Apple Silicon) | Destekleniyor (topluluk tarafından Sequoia M3'te test edildi) |
| Windows | Henüz değil |
| WSL | Çalışması beklenir (test edilmedi) |

## Proje Yapısı

```
src/
  scanner.mjs       # ~/.claude/ tarar — saf veri, yan etki yok
  mover.mjs         # Dosyaları kapsamlar arasında taşır — güvenlik kontrolleri + geri alma
  server.mjs        # HTTP sunucusu — yalnızca yönlendirme, mantık yok
  ui/
    index.html       # HTML yapısı
    style.css        # Tüm stil (özgürce düzenle, mantığı bozmaz)
    app.js           # Frontend oluşturma + SortableJS + etkileşimler
bin/
  cli.mjs            # Giriş noktası
```

Frontend ve backend tamamen ayrılmıştır. Hiçbir mantığa dokunmadan görünümü değiştirmek için `src/ui/` dosyalarını düzenleyin.

## API

Kontrol paneli bir REST API tarafından desteklenmektedir:

| Uç Nokta | Yöntem | Açıklama |
|----------|--------|----------|
| `/api/scan` | GET | Tüm özelleştirmeleri tarar, kapsamları + öğeleri + sayıları döndürür |
| `/api/move` | POST | Bir öğeyi farklı bir kapsama taşır (kategori/ad belirsizliğini destekler) |
| `/api/delete` | POST | Bir öğeyi kalıcı olarak siler |
| `/api/restore` | POST | Silinen bir dosyayı geri yükler (geri alma için) |
| `/api/restore-mcp` | POST | Silinen bir MCP sunucu girdisini geri yükler |
| `/api/destinations` | GET | Bir öğe için geçerli taşıma hedeflerini getirir |
| `/api/file-content` | GET | Detay paneli için dosya içeriğini okur |

## Lisans

MIT

## @mcpware'den Diğer Projeler

| Proje | Ne yapar | Kurulum |
|-------|----------|---------|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 Instagram Graph API aracı — gönderiler, yorumlar, DM'ler, hikayeler, analizler | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Herhangi bir web sayfasında üzerine gelince etiketler — AI öğelere isme göre başvurur | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | MCP aracılığıyla tarayıcı oturumlarını GIF veya video olarak kaydedin | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | AI logo tasarımı → SVG → tam marka kiti dışa aktarma | `npx @mcpware/logoloom` |

## Yazar

[ithiria894](https://github.com/ithiria894) — Claude Code ekosistemi için araçlar geliştiriyor.
