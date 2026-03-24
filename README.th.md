# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Bahasa Indonesia](README.id.md) | [Italiano](README.it.md) | [Português](README.pt-BR.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | ไทย

**จัดระเบียบ memories, skills, MCP servers และ hooks ทั้งหมดของ Claude Code — ดูตาม scope hierarchy และย้ายระหว่าง scope ด้วย drag-and-drop**

![Claude Code Organizer Demo](docs/demo.gif)

## ปัญหาที่เกิดขึ้น

Claude Code สร้าง memories, skills และ MCP configs อยู่ตลอดเวลาที่คุณทำงาน — แล้วโยนทิ้งไว้ใน scope ที่ตรงกับ directory ปัจจุบัน ค่าที่ตั้งใจจะใช้ทั่วทุกที่? กลับถูกขังอยู่ใน project เดียว deploy skill ที่เป็นของ repo หนึ่ง? หลุดไปอยู่ใน global ปนเปื้อนทุก project อื่น

**นี่ไม่ใช่แค่ความรก — มันทำให้ประสิทธิภาพ AI ของคุณลดลงด้วย** ทุก session Claude จะโหลด config ทั้งหมดจาก scope ปัจจุบันรวมถึงทุกอย่างที่รับมาจาก parent scope เข้า context window ของคุณ item ที่อยู่ผิด scope = token สูญเปล่า, context ปนเปื้อน และความแม่นยำลดลง Python pipeline skill ที่นั่งอยู่ใน global จะถูกโหลดเข้า React frontend session ของคุณ MCP entry ที่ซ้ำกันจะ initialize server เดิมสองครั้ง memories ที่หมดอายุจะขัดแย้งกับคำสั่งปัจจุบันของคุณ

### "แค่ถาม Claude ให้แก้ไขก็พอ"

คุณอาจขอให้ Claude Code จัดการ config ของตัวเองได้ แต่คุณจะต้องโต้ตอบไปมา — `ls` ทีละ directory, `cat` แต่ละไฟล์ พยายามปะติดปะต่อภาพรวมทั้งหมดจากข้อความ output ที่เป็นชิ้น ๆ **ไม่มีคำสั่งใดที่แสดง tree ทั้งหมด** ครอบคลุมทุก scope ทุก item ทุก inheritance พร้อมกันในครั้งเดียว

### วิธีแก้: visual dashboard

```bash
npx @mcpware/claude-code-organizer
```

คำสั่งเดียว ดูทุกอย่างที่ Claude เก็บไว้ — จัดระเบียบตาม scope hierarchy **ลาก item ระหว่าง scope** ลบ memories ที่หมดอายุ ค้นหา item ที่ซ้ำกัน ควบคุมสิ่งที่มีอิทธิพลต่อพฤติกรรมของ Claude ได้จริง

### ตัวอย่าง: Project → Global

คุณบอก Claude ว่า "ฉันชอบ TypeScript + ESM" ขณะอยู่ใน project หนึ่ง แต่ preference นี้ใช้ได้กับทุกที่ เปิด dashboard แล้วลาก memory นั้นจาก Project ไป Global **เสร็จ ลากครั้งเดียว**

### ตัวอย่าง: Global → Project

deploy skill ที่นั่งอยู่ใน global ใช้ได้จริงแค่กับ repo เดียว ลากไปไว้ใน Project scope นั้น — project อื่นจะไม่เห็นมันอีกต่อไป

### ตัวอย่าง: ลบ memories ที่หมดอายุ

Claude สร้าง memories อัตโนมัติจากสิ่งที่คุณพูดแบบสบาย ๆ หรือสิ่งที่มัน *คิดว่า* คุณต้องการให้จำ สัปดาห์ต่อมา memories เหล่านั้นไม่เกี่ยวแล้ว แต่ยังถูกโหลดเข้าทุก session เรียกดู อ่าน ลบ **คุณควบคุมสิ่งที่ Claude คิดว่ารู้เกี่ยวกับคุณได้**

---

## ฟีเจอร์

- **Scope-aware hierarchy** — ดู item ทั้งหมดจัดระเบียบเป็น Global > Workspace > Project พร้อมตัวบ่งชี้ inheritance
- **Drag-and-drop** — ย้าย memories ระหว่าง scope, skills ระหว่าง global และ per-repo, MCP servers ระหว่าง config
- **Move confirmation** — ทุกการย้ายจะแสดง modal ยืนยันก่อนแตะไฟล์ใด ๆ
- **Same-type safety** — Memories ย้ายได้เฉพาะไปยัง memory folder, skills ไปยัง skill folder, MCP ไปยัง MCP config
- **Search & filter** — ค้นหา item ทั้งหมดได้ทันที กรองตามหมวดหมู่ (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Detail panel** — คลิก item ใด ๆ เพื่อดู metadata ฉบับเต็ม, description, file path และเปิดใน VS Code
- **Full per-project scanning** — ทุก scope แสดง item type ทั้งหมด: memories, skills, MCP servers, configs, hooks และ plans
- **Real file moves** — ย้ายไฟล์จริงใน `~/.claude/` ไม่ใช่แค่ viewer
- **45 E2E tests** — Playwright test suite พร้อม filesystem verification จริงหลังทุก operation

## ทำไมต้องเป็น Visual Dashboard?

Claude Code สามารถแสดงและย้ายไฟล์ผ่าน CLI ได้อยู่แล้ว — แต่คุณก็ยังต้องเล่นเกม 20 คำถามกับ config ของตัวเอง dashboard มอบ **visibility เต็มรูปแบบในมุมมองเดียว:**

| สิ่งที่คุณต้องการ | ถาม Claude | Visual Dashboard |
|---------------|:-----------:|:----------------:|
| **ดูทุกอย่างพร้อมกัน** ครอบคลุมทุก scope | `ls` ทีละ directory แล้วปะติดเอง | Scope tree ดูในมุมมองเดียว |
| **อะไรถูกโหลดใน project ปัจจุบัน?** | รันหลายคำสั่ง หวังว่าจะครบ | เปิด project → ดู inheritance chain ทั้งหมด |
| **ย้าย item ระหว่าง scope** | หา encoded path แล้ว `mv` เอง | Drag-and-drop พร้อม confirmation |
| **อ่าน config content** | `cat` แต่ละไฟล์ทีละไฟล์ | คลิก → side panel |
| **หา duplicate / item หมดอายุ** | `grep` ผ่าน directory ที่อ่านยาก | Search + filter ตามหมวดหมู่ |
| **ลบ memories ที่ไม่ได้ใช้** | หาว่าไฟล์ไหนต้องลบ | เรียกดู อ่าน ลบ in-place |

## เริ่มต้นใช้งาน

### ตัวเลือกที่ 1: npx (ไม่ต้อง install)

```bash
npx @mcpware/claude-code-organizer
```

### ตัวเลือกที่ 2: Global install

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### ตัวเลือกที่ 3: ถาม Claude

วางข้อความนี้ใน Claude Code:

> Run `npx @mcpware/claude-code-organizer` — it's a dashboard for managing Claude Code settings. Tell me the URL when it's ready.

เปิด dashboard ที่ `http://localhost:3847` ทำงานกับ directory `~/.claude/` จริงของคุณ

## สิ่งที่จัดการได้

| ประเภท | ดู | ย้าย | สแกนที่ | ทำไมถูกล็อก? |
|------|:----:|:----:|:----------:|-------------|
| Memories (feedback, user, project, reference) | ใช่ | ใช่ | Global + Project | — |
| Skills | ใช่ | ใช่ | Global + Project | — |
| MCP Servers | ใช่ | ใช่ | Global + Project | — |
| Config (CLAUDE.md, settings.json) | ใช่ | ล็อก | Global + Project | System settings — การย้ายอาจทำให้ config เสียหาย |
| Hooks | ใช่ | ล็อก | Global + Project | ขึ้นอยู่กับ settings context — หากย้ายจะเกิด silent failures |
| Plans | ใช่ | ใช่ | Global + Project | — |
| Plugins | ใช่ | ล็อก | Global เท่านั้น | Claude Code managed cache |

## Scope Hierarchy

```
Global                       <- ใช้ได้ทุกที่
  Company (workspace)        <- ใช้กับ sub-project ทั้งหมด
    CompanyRepo1             <- เฉพาะ project นี้
    CompanyRepo2             <- เฉพาะ project นี้
  SideProjects (project)     <- project อิสระ
  Documents (project)        <- project อิสระ
```

Child scope รับ memories, skills และ MCP servers จาก parent scope มาโดยอัตโนมัติ

## วิธีการทำงาน

1. **สแกน** `~/.claude/` — ค้นพบ project, memories, skills, MCP servers, hooks, plugins, plans ทั้งหมด
2. **แก้ไข scope hierarchy** — กำหนดความสัมพันธ์ parent-child จาก filesystem paths
3. **แสดง dashboard** — scope headers > category bars > item rows พร้อม indentation ที่เหมาะสม
4. **จัดการการย้าย** — เมื่อคุณลากหรือคลิก "Move to..." จะย้ายไฟล์บน disk จริงพร้อม safety checks

## การเปรียบเทียบ

เราดูเครื่องมือ Claude Code config ทุกตัวที่หาได้ ไม่มีตัวไหนที่มี visual scope hierarchy + drag-and-drop cross-scope moves ใน standalone dashboard

| สิ่งที่ต้องการ | Desktop app (600+⭐) | VS Code extension | Full-stack web app | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Scope hierarchy tree | ไม่มี | มี | บางส่วน | **มี** |
| Drag-and-drop moves | ไม่มี | ไม่มี | ไม่มี | **มี** |
| Cross-scope moves | ไม่มี | คลิกเดียว | ไม่มี | **มี** |
| ลบ item ที่หมดอายุ | ไม่มี | ไม่มี | ไม่มี | **มี** |
| MCP tools | ไม่มี | ไม่มี | มี | **มี** |
| Zero dependencies | ไม่มี (Tauri) | ไม่มี (VS Code) | ไม่มี (React+Rust+SQLite) | **มี** |
| Standalone (ไม่ต้องมี IDE) | มี | ไม่มี | มี | **มี** |

## รองรับ Platform

| Platform | สถานะ |
|----------|:------:|
| Ubuntu / Linux | รองรับ |
| macOS (Intel + Apple Silicon) | รองรับ (ทดสอบโดยชุมชนบน Sequoia M3) |
| Windows | ยังไม่รองรับ |
| WSL | น่าจะใช้ได้ (ยังไม่ทดสอบ) |

## โครงสร้าง Project

```
src/
  scanner.mjs       # สแกน ~/.claude/ — pure data ไม่มี side effects
  mover.mjs         # ย้ายไฟล์ระหว่าง scope — safety checks + rollback
  server.mjs        # HTTP server — routes เท่านั้น ไม่มี logic
  ui/
    index.html       # HTML structure
    style.css        # styling ทั้งหมด (แก้ได้อิสระ จะไม่กระทบ logic)
    app.js           # Frontend rendering + SortableJS + interactions
bin/
  cli.mjs            # Entry point
```

Frontend และ backend แยกออกจากกันสมบูรณ์ แก้ไขไฟล์ `src/ui/` เพื่อเปลี่ยน look โดยไม่แตะ logic ใด ๆ

## API

dashboard ขับเคลื่อนด้วย REST API:

| Endpoint | Method | คำอธิบาย |
|----------|--------|-------------|
| `/api/scan` | GET | สแกน customizations ทั้งหมด คืนค่า scopes + items + counts |
| `/api/move` | POST | ย้าย item ไปยัง scope อื่น (รองรับ category/name disambiguation) |
| `/api/delete` | POST | ลบ item อย่างถาวร |
| `/api/restore` | POST | กู้คืนไฟล์ที่ลบไป (สำหรับ undo) |
| `/api/restore-mcp` | POST | กู้คืน MCP server entry ที่ลบไป |
| `/api/destinations` | GET | รับ move destination ที่ valid สำหรับ item |
| `/api/file-content` | GET | อ่าน file content สำหรับ detail panel |

## License

MIT

## เพิ่มเติมจาก @mcpware

| Project | ทำอะไร | Install |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | เครื่องมือ Instagram Graph API 23 รายการ — posts, comments, DMs, stories, analytics | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | ป้ายชื่อ hover บนหน้าเว็บใด ๆ — AI อ้างอิง element ตามชื่อ | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | บันทึก browser session เป็น GIF หรือวิดีโอผ่าน MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | ออกแบบโลโก้ด้วย AI → SVG → export brand kit ฉบับเต็ม | `npx @mcpware/logoloom` |

## ผู้พัฒนา

[ithiria894](https://github.com/ithiria894) — สร้างเครื่องมือสำหรับ Claude Code ecosystem
