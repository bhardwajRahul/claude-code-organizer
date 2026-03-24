# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | Bahasa Indonesia | [Italiano](README.it.md) | [Português](README.pt-BR.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md)

**Atur semua memori, skill, MCP server, dan hook Claude Code Anda — lihat berdasarkan hierarki scope, pindahkan antar scope dengan drag-and-drop.**

![Claude Code Organizer Demo](docs/demo.gif)

## Masalahnya

Claude Code diam-diam membuat memori, skill, dan konfigurasi MCP setiap kali Anda bekerja — dan membuangnya ke scope mana pun yang sesuai dengan direktori Anda saat ini. Preferensi yang Anda inginkan di mana-mana? Terjebak di satu proyek. Skill deploy yang hanya cocok untuk satu repo? Bocor ke global, mencemari semua proyek lainnya.

**Ini bukan sekadar berantakan — ini merusak performa AI Anda.** Setiap sesi, Claude memuat semua konfigurasi dari scope saat ini ditambah semua yang diwarisi dari scope induk ke dalam context window Anda. Item di scope yang salah = token terbuang, konteks tercemar, dan akurasi yang lebih rendah. Skill Python pipeline yang ada di global ikut dimuat ke sesi frontend React Anda. Entri MCP duplikat menginisialisasi server yang sama dua kali. Memori lama bertentangan dengan instruksi Anda saat ini.

### "Minta saja Claude untuk memperbaikinya"

Anda bisa meminta Claude Code untuk mengelola konfigurasinya sendiri. Tapi Anda akan bolak-balik — `ls` satu direktori, `cat` setiap file, mencoba menyusun gambaran utuh dari potongan-potongan output teks. **Tidak ada perintah yang menampilkan seluruh pohon** di semua scope, semua item, semua pewarisan sekaligus.

### Solusinya: dashboard visual

```bash
npx @mcpware/claude-code-organizer
```

Satu perintah. Lihat semua yang disimpan Claude — terorganisir berdasarkan hierarki scope. **Seret item antar scope.** Hapus memori yang sudah usang. Temukan duplikat. Kendalikan apa yang sebenarnya mempengaruhi perilaku Claude.

### Contoh: Project → Global

Anda memberitahu Claude "Saya lebih suka TypeScript + ESM" saat berada di dalam sebuah proyek, tapi preferensi itu berlaku di mana-mana. Buka dashboard, seret memori tersebut dari Project ke Global. **Selesai. Satu seret.**

### Contoh: Global → Project

Skill deploy yang ada di global hanya masuk akal untuk satu repo. Seret ke scope Project tersebut — proyek lain tidak akan melihatnya lagi.

### Contoh: Hapus memori yang sudah usang

Claude secara otomatis membuat memori dari hal-hal yang Anda katakan secara kasual, atau hal-hal yang *menurut Claude* ingin Anda ingat. Seminggu kemudian memori itu sudah tidak relevan tapi masih dimuat ke setiap sesi. Jelajahi, baca, hapus. **Anda yang mengontrol apa yang Claude pikir diketahuinya tentang Anda.**

---

## Fitur

- **Hierarki berbasis scope** — Lihat semua item terorganisir sebagai Global > Workspace > Project, dengan indikator pewarisan
- **Drag-and-drop** — Pindahkan memori antar scope, skill antara global dan per-repo, MCP server antar konfigurasi
- **Konfirmasi pemindahan** — Setiap pemindahan menampilkan modal konfirmasi sebelum menyentuh file apa pun
- **Keamanan tipe yang sama** — Memori hanya bisa dipindah ke folder memori, skill ke folder skill, MCP ke konfigurasi MCP
- **Pencarian & filter** — Cari secara instan di semua item, filter berdasarkan kategori (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Panel detail** — Klik item apa pun untuk melihat metadata lengkap, deskripsi, path file, dan buka di VS Code
- **Pemindaian per-proyek lengkap** — Setiap scope menampilkan semua jenis item: memori, skill, MCP server, konfigurasi, hook, dan rencana
- **Pemindahan file nyata** — Benar-benar memindahkan file di `~/.claude/`, bukan sekadar penampil
- **45 uji E2E** — Suite pengujian Playwright dengan verifikasi filesystem nyata setelah setiap operasi

## Mengapa Dashboard Visual?

Claude Code sudah bisa mencantumkan dan memindahkan file melalui CLI — tapi Anda terjebak bermain tebak-tebakan dengan konfigurasi Anda sendiri. Dashboard memberikan **visibilitas penuh dalam sekali pandang:**

| Yang Anda butuhkan | Tanya Claude | Dashboard Visual |
|---|:-----------:|:----------------:|
| **Lihat semuanya sekaligus** di semua scope | `ls` satu direktori sekaligus, susun sendiri | Pohon scope, sekali pandang |
| **Apa yang dimuat di proyek saya saat ini?** | Jalankan banyak perintah, berharap mendapat semuanya | Buka proyek → lihat rantai pewarisan lengkap |
| **Pindahkan item antar scope** | Temukan path yang ter-encode, `mv` secara manual | Drag-and-drop dengan konfirmasi |
| **Baca isi konfigurasi** | `cat` setiap file satu per satu | Klik → panel samping |
| **Temukan duplikat / item usang** | `grep` di direktori yang membingungkan | Cari + filter berdasarkan kategori |
| **Bersihkan memori yang tidak terpakai** | Cari tahu file mana yang harus dihapus | Jelajahi, baca, hapus di tempat |

## Mulai Cepat

### Opsi 1: npx (tidak perlu instalasi)

```bash
npx @mcpware/claude-code-organizer
```

### Opsi 2: Instalasi global

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Opsi 3: Minta Claude

Tempelkan ini ke Claude Code:

> Jalankan `npx @mcpware/claude-code-organizer` — ini adalah dashboard untuk mengelola pengaturan Claude Code. Beritahu saya URL-nya ketika sudah siap.

Membuka dashboard di `http://localhost:3847`. Bekerja dengan direktori `~/.claude/` Anda yang sebenarnya.

## Yang Dikelolanya

| Tipe | Lihat | Pindah | Dipindai di | Mengapa dikunci? |
|------|:----:|:----:|:----------:|-------------|
| Memori (feedback, user, project, reference) | Ya | Ya | Global + Project | — |
| Skills | Ya | Ya | Global + Project | — |
| MCP Servers | Ya | Ya | Global + Project | — |
| Config (CLAUDE.md, settings.json) | Ya | Dikunci | Global + Project | Pengaturan sistem — pemindahan bisa merusak konfigurasi |
| Hooks | Ya | Dikunci | Global + Project | Bergantung pada konteks pengaturan — kegagalan diam-diam jika dipindah |
| Plans | Ya | Ya | Global + Project | — |
| Plugins | Ya | Dikunci | Global saja | Cache yang dikelola Claude Code |

## Hierarki Scope

```
Global                       <- berlaku di mana-mana
  Company (workspace)        <- berlaku untuk semua sub-proyek
    CompanyRepo1             <- spesifik proyek
    CompanyRepo2             <- spesifik proyek
  SideProjects (project)     <- proyek independen
  Documents (project)        <- proyek independen
```

Scope anak mewarisi memori, skill, dan MCP server dari scope induk.

## Cara Kerjanya

1. **Memindai** `~/.claude/` — menemukan semua proyek, memori, skill, MCP server, hook, plugin, rencana
2. **Menyelesaikan hierarki scope** — menentukan hubungan induk-anak dari path filesystem
3. **Merender dashboard** — header scope > bar kategori > baris item, dengan indentasi yang tepat
4. **Menangani pemindahan** — ketika Anda menyeret atau mengklik "Move to...", benar-benar memindahkan file di disk dengan pemeriksaan keamanan

## Perbandingan

Kami melihat setiap alat konfigurasi Claude Code yang bisa kami temukan. Tidak ada yang menawarkan hierarki scope visual + pemindahan lintas-scope drag-and-drop dalam satu dashboard mandiri.

| Yang saya butuhkan | Desktop app (600+⭐) | VS Code extension | Full-stack web app | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Pohon hierarki scope | Tidak | Ya | Sebagian | **Ya** |
| Pemindahan drag-and-drop | Tidak | Tidak | Tidak | **Ya** |
| Pemindahan lintas-scope | Tidak | Satu klik | Tidak | **Ya** |
| Hapus item usang | Tidak | Tidak | Tidak | **Ya** |
| Alat MCP | Tidak | Tidak | Ya | **Ya** |
| Zero dependencies | Tidak (Tauri) | Tidak (VS Code) | Tidak (React+Rust+SQLite) | **Ya** |
| Mandiri (tanpa IDE) | Ya | Tidak | Ya | **Ya** |

## Dukungan Platform

| Platform | Status |
|----------|:------:|
| Ubuntu / Linux | Didukung |
| macOS (Intel + Apple Silicon) | Didukung (diuji komunitas di Sequoia M3) |
| Windows | Belum tersedia |
| WSL | Seharusnya berjalan (belum diuji) |

## Struktur Proyek

```
src/
  scanner.mjs       # Memindai ~/.claude/ — data murni, tanpa efek samping
  mover.mjs         # Memindahkan file antar scope — pemeriksaan keamanan + rollback
  server.mjs        # HTTP server — hanya route, tanpa logika
  ui/
    index.html       # Struktur HTML
    style.css        # Semua styling (edit bebas, tidak merusak logika)
    app.js           # Rendering frontend + SortableJS + interaksi
bin/
  cli.mjs            # Entry point
```

Frontend dan backend sepenuhnya terpisah. Edit file `src/ui/` untuk mengubah tampilan tanpa menyentuh logika apa pun.

## API

Dashboard didukung oleh REST API:

| Endpoint | Metode | Deskripsi |
|----------|--------|-------------|
| `/api/scan` | GET | Pindai semua kustomisasi, mengembalikan scope + item + jumlah |
| `/api/move` | POST | Pindahkan item ke scope yang berbeda (mendukung disambiguasi kategori/nama) |
| `/api/delete` | POST | Hapus item secara permanen |
| `/api/restore` | POST | Pulihkan file yang dihapus (untuk undo) |
| `/api/restore-mcp` | POST | Pulihkan entri MCP server yang dihapus |
| `/api/destinations` | GET | Dapatkan tujuan pemindahan yang valid untuk sebuah item |
| `/api/file-content` | GET | Baca isi file untuk panel detail |

## Lisensi

MIT

## Lainnya dari @mcpware

| Proyek | Fungsinya | Instalasi |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 alat Instagram Graph API — posting, komentar, DM, stories, analitik | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Label hover di halaman web mana pun — AI merujuk elemen berdasarkan nama | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | Rekam sesi browser sebagai GIF atau video melalui MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | Desain logo AI → SVG → ekspor kit merek lengkap | `npx @mcpware/logoloom` |

## Penulis

[ithiria894](https://github.com/ithiria894) — Membangun alat untuk ekosistem Claude Code.
