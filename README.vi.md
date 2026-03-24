# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Bahasa Indonesia](README.id.md) | [Italiano](README.it.md) | [Português](README.pt-BR.md) | [Türkçe](README.tr.md) | Tiếng Việt | [ไทย](README.th.md)

**Tổ chức toàn bộ bộ nhớ, kỹ năng, MCP server và hook của Claude Code — xem theo cấu trúc phân cấp phạm vi, di chuyển giữa các phạm vi bằng kéo và thả.**

![Claude Code Organizer Demo](docs/demo.gif)

## Vấn đề

Claude Code âm thầm tạo ra bộ nhớ, kỹ năng và cấu hình MCP mỗi khi bạn làm việc — và lưu chúng vào bất kỳ phạm vi nào khớp với thư mục hiện tại của bạn. Một tùy chọn bạn muốn áp dụng ở mọi nơi? Lại bị kẹt trong một dự án duy nhất. Một kỹ năng triển khai chỉ thuộc về một repo? Lại bị rò rỉ vào global, làm ô nhiễm tất cả các dự án khác.

**Đây không chỉ là vấn đề lộn xộn — nó còn làm giảm hiệu suất AI của bạn.** Mỗi phiên làm việc, Claude tải toàn bộ cấu hình từ phạm vi hiện tại cộng với mọi thứ kế thừa từ các phạm vi cha vào cửa sổ ngữ cảnh. Các mục sai phạm vi = lãng phí token, ngữ cảnh bị ô nhiễm và độ chính xác thấp hơn. Một kỹ năng Python pipeline nằm trong global lại được tải vào phiên làm việc React frontend của bạn. Các mục MCP trùng lặp khởi tạo cùng một server hai lần. Bộ nhớ lỗi thời mâu thuẫn với các hướng dẫn hiện tại của bạn.

### "Chỉ cần nhờ Claude sửa là xong"

Bạn có thể nhờ Claude Code tự quản lý cấu hình của nó. Nhưng bạn sẽ phải đi đi lại lại — `ls` từng thư mục, `cat` từng tệp, cố gắng ghép lại bức tranh toàn cảnh từ các mảnh kết quả văn bản. **Không có lệnh nào hiển thị toàn bộ cây** qua tất cả các phạm vi, tất cả các mục, tất cả sự kế thừa cùng một lúc.

### Giải pháp: một bảng điều khiển trực quan

```bash
npx @mcpware/claude-code-organizer
```

Một lệnh duy nhất. Xem mọi thứ Claude đã lưu — được tổ chức theo cấu trúc phân cấp phạm vi. **Kéo và thả các mục giữa các phạm vi.** Xóa bộ nhớ lỗi thời. Tìm các mục trùng lặp. Kiểm soát những gì thực sự ảnh hưởng đến hành vi của Claude.

### Ví dụ: Project → Global

Bạn đã nói với Claude "Tôi thích TypeScript + ESM" khi đang làm việc trong một dự án, nhưng tùy chọn đó áp dụng ở mọi nơi. Mở bảng điều khiển, kéo bộ nhớ đó từ Project sang Global. **Xong. Chỉ một lần kéo.**

### Ví dụ: Global → Project

Một kỹ năng triển khai nằm trong global chỉ có nghĩa với một repo. Kéo nó vào phạm vi Project đó — các dự án khác sẽ không thấy nó nữa.

### Ví dụ: Xóa bộ nhớ lỗi thời

Claude tự động tạo bộ nhớ từ những điều bạn nói tình cờ, hoặc những thứ nó *nghĩ* bạn muốn ghi nhớ. Một tuần sau chúng đã lỗi thời nhưng vẫn được tải vào mỗi phiên làm việc. Duyệt qua, đọc, xóa. **Bạn kiểm soát những gì Claude nghĩ nó biết về bạn.**

---

## Tính năng

- **Cấu trúc phân cấp theo phạm vi** — Xem tất cả các mục được tổ chức theo dạng Global > Workspace > Project, với các chỉ báo kế thừa
- **Kéo và thả** — Di chuyển bộ nhớ giữa các phạm vi, kỹ năng giữa global và từng repo, MCP server giữa các cấu hình
- **Xác nhận di chuyển** — Mỗi lần di chuyển hiển thị modal xác nhận trước khi thay đổi bất kỳ tệp nào
- **An toàn theo loại** — Bộ nhớ chỉ có thể di chuyển đến thư mục bộ nhớ, kỹ năng đến thư mục kỹ năng, MCP đến cấu hình MCP
- **Tìm kiếm và lọc** — Tìm kiếm ngay lập tức qua tất cả các mục, lọc theo danh mục (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Bảng chi tiết** — Nhấp vào bất kỳ mục nào để xem đầy đủ metadata, mô tả, đường dẫn tệp và mở trong VS Code
- **Quét toàn bộ từng dự án** — Mỗi phạm vi hiển thị tất cả loại mục: bộ nhớ, kỹ năng, MCP server, cấu hình, hook và kế hoạch
- **Di chuyển tệp thực sự** — Thực sự di chuyển tệp trong `~/.claude/`, không chỉ là công cụ xem
- **45 bài kiểm tra E2E** — Bộ kiểm tra Playwright với xác minh filesystem thực sau mỗi thao tác

## Tại sao cần bảng điều khiển trực quan?

Claude Code đã có thể liệt kê và di chuyển tệp qua CLI — nhưng bạn sẽ mắc kẹt với việc hỏi đi hỏi lại về cấu hình của chính mình. Bảng điều khiển cho bạn **khả năng nhìn tổng thể chỉ trong một cái nhìn:**

| Những gì bạn cần | Nhờ Claude | Bảng điều khiển trực quan |
|---------------|:-----------:|:----------------:|
| **Xem tất cả cùng lúc** qua tất cả các phạm vi | `ls` từng thư mục một, ghép lại | Cây phạm vi, một cái nhìn |
| **Phạm vi hiện tại của tôi có gì?** | Chạy nhiều lệnh, hy vọng bạn lấy đủ | Mở project → xem toàn bộ chuỗi kế thừa |
| **Di chuyển mục giữa các phạm vi** | Tìm đường dẫn mã hóa, `mv` thủ công | Kéo thả với xác nhận |
| **Đọc nội dung cấu hình** | `cat` từng tệp một | Nhấp → bảng bên |
| **Tìm trùng lặp / mục lỗi thời** | `grep` qua các thư mục phức tạp | Tìm kiếm + lọc theo danh mục |
| **Dọn dẹp bộ nhớ không dùng** | Tìm ra tệp nào cần xóa | Duyệt, đọc, xóa tại chỗ |

## Bắt đầu nhanh

### Tùy chọn 1: npx (không cần cài đặt)

```bash
npx @mcpware/claude-code-organizer
```

### Tùy chọn 2: Cài đặt toàn cục

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Tùy chọn 3: Nhờ Claude

Dán nội dung này vào Claude Code:

> Chạy `npx @mcpware/claude-code-organizer` — đây là bảng điều khiển để quản lý cài đặt Claude Code. Cho tôi biết URL khi nó sẵn sàng.

Mở bảng điều khiển tại `http://localhost:3847`. Hoạt động với thư mục `~/.claude/` thực của bạn.

## Những gì nó quản lý

| Loại | Xem | Di chuyển | Quét tại | Tại sao bị khóa? |
|------|:----:|:----:|:----------:|-------------|
| Memories (feedback, user, project, reference) | Có | Có | Global + Project | — |
| Skills | Có | Có | Global + Project | — |
| MCP Servers | Có | Có | Global + Project | — |
| Config (CLAUDE.md, settings.json) | Có | Khóa | Global + Project | Cài đặt hệ thống — di chuyển có thể làm hỏng cấu hình |
| Hooks | Có | Khóa | Global + Project | Phụ thuộc vào ngữ cảnh settings — lỗi im lặng nếu di chuyển |
| Plans | Có | Có | Global + Project | — |
| Plugins | Có | Khóa | Chỉ Global | Bộ nhớ cache do Claude Code quản lý |

## Cấu trúc phân cấp phạm vi

```
Global                       <- áp dụng ở mọi nơi
  Company (workspace)        <- áp dụng cho tất cả dự án con
    CompanyRepo1             <- dành riêng cho dự án
    CompanyRepo2             <- dành riêng cho dự án
  SideProjects (project)     <- dự án độc lập
  Documents (project)        <- dự án độc lập
```

Các phạm vi con kế thừa bộ nhớ, kỹ năng và MCP server từ phạm vi cha.

## Cách hoạt động

1. **Quét** `~/.claude/` — phát hiện tất cả dự án, bộ nhớ, kỹ năng, MCP server, hook, plugin, kế hoạch
2. **Phân giải cấu trúc phân cấp phạm vi** — xác định quan hệ cha-con từ đường dẫn filesystem
3. **Hiển thị bảng điều khiển** — tiêu đề phạm vi > thanh danh mục > hàng mục, với thụt lề phù hợp
4. **Xử lý di chuyển** — khi bạn kéo hoặc nhấp "Move to...", thực sự di chuyển tệp trên đĩa với các kiểm tra an toàn

## So sánh

Chúng tôi đã xem xét mọi công cụ cấu hình Claude Code có thể tìm thấy. Không có công cụ nào cung cấp cấu trúc phân cấp phạm vi trực quan + di chuyển kéo thả xuyên phạm vi trong một bảng điều khiển độc lập.

| Những gì tôi cần | Desktop app (600+⭐) | VS Code extension | Full-stack web app | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Cây phân cấp phạm vi | Không | Có | Một phần | **Có** |
| Di chuyển kéo thả | Không | Không | Không | **Có** |
| Di chuyển xuyên phạm vi | Không | Một nhấp | Không | **Có** |
| Xóa mục lỗi thời | Không | Không | Không | **Có** |
| Công cụ MCP | Không | Không | Có | **Có** |
| Không phụ thuộc | Không (Tauri) | Không (VS Code) | Không (React+Rust+SQLite) | **Có** |
| Độc lập (không cần IDE) | Có | Không | Có | **Có** |

## Hỗ trợ nền tảng

| Nền tảng | Trạng thái |
|----------|:------:|
| Ubuntu / Linux | Được hỗ trợ |
| macOS (Intel + Apple Silicon) | Được hỗ trợ (cộng đồng kiểm tra trên Sequoia M3) |
| Windows | Chưa hỗ trợ |
| WSL | Có thể hoạt động (chưa kiểm tra) |

## Cấu trúc dự án

```
src/
  scanner.mjs       # Quét ~/.claude/ — dữ liệu thuần túy, không có tác dụng phụ
  mover.mjs         # Di chuyển tệp giữa các phạm vi — kiểm tra an toàn + rollback
  server.mjs        # HTTP server — chỉ định tuyến, không có logic
  ui/
    index.html       # Cấu trúc HTML
    style.css        # Toàn bộ kiểu dáng (chỉnh sửa thoải mái, sẽ không làm hỏng logic)
    app.js           # Hiển thị frontend + SortableJS + tương tác
bin/
  cli.mjs            # Điểm vào
```

Frontend và backend được tách biệt hoàn toàn. Chỉnh sửa các tệp trong `src/ui/` để thay đổi giao diện mà không cần động đến bất kỳ logic nào.

## API

Bảng điều khiển được hỗ trợ bởi một REST API:

| Endpoint | Method | Mô tả |
|----------|--------|-------------|
| `/api/scan` | GET | Quét tất cả tùy chỉnh, trả về phạm vi + mục + số lượng |
| `/api/move` | POST | Di chuyển một mục sang phạm vi khác (hỗ trợ phân biệt danh mục/tên) |
| `/api/delete` | POST | Xóa vĩnh viễn một mục |
| `/api/restore` | POST | Khôi phục tệp đã xóa (để hoàn tác) |
| `/api/restore-mcp` | POST | Khôi phục mục MCP server đã xóa |
| `/api/destinations` | GET | Lấy các đích di chuyển hợp lệ cho một mục |
| `/api/file-content` | GET | Đọc nội dung tệp cho bảng chi tiết |

## Giấy phép

MIT

## Thêm từ @mcpware

| Dự án | Chức năng | Cài đặt |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 công cụ Instagram Graph API — bài đăng, bình luận, DM, story, phân tích | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Nhãn hover trên bất kỳ trang web nào — AI tham chiếu các phần tử theo tên | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | Ghi lại phiên trình duyệt dưới dạng GIF hoặc video qua MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | Thiết kế logo bằng AI → SVG → xuất bộ thương hiệu đầy đủ | `npx @mcpware/logoloom` |

## Tác giả

[ithiria894](https://github.com/ithiria894) — Xây dựng công cụ cho hệ sinh thái Claude Code.
