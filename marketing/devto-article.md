---
title: "Claude Code Secretly Hoards 140+ Config Files Behind Your Back. Here's How to Take Control."
published: false
tags: [mcp, ai, opensource, showdev]
canonical_url: https://github.com/mcpware/claude-code-organizer
cover_image: https://raw.githubusercontent.com/mcpware/claude-code-organizer/main/marketing/cover-image.png
series: "MCP Tools I Built"
---

I've been using Claude Code for a week. Yesterday I peeked inside `~/.claude/` and found **140 items** — memories, skills, MCP server configs, hooks — scattered across folders with names like `-home-user-projects-my-app/`.

I didn't create most of them. **Claude did.** Every time I said "remember this" or installed a tool, Claude silently dumped files into whatever scope matched my current directory. A preference I wanted everywhere? Trapped in one project scope. A deploy skill that belongs to one repo? Leaked into global, contaminating every other project.

The best part: I found **three identical MCP server entries** across different scopes because I'd added the same server while `cd`'d into different directories. Claude happily duplicated it each time without telling me.

## Why This Actually Hurts Your AI's Performance

This isn't just messy — it's a technical problem. Every time Claude Code starts a session, it loads all memories, skills, and MCP configs from the current scope **plus everything it inherits from parent scopes**. That's your context window.

A skill meant for a Python data pipeline project sitting in global scope? It gets loaded into every single session — including your React frontend work. Duplicate MCP server entries? Claude initializes the same server twice. Memories from 6 months ago about a project you archived? Still there, still eating tokens, still potentially contradicting your current instructions.

**Scope contamination directly degrades LLM accuracy.** Irrelevant memories and skills in the context window mean Claude has more noise to sort through, more tokens wasted on things that don't apply, and more chances to follow outdated or wrong-scope instructions. Your context window is finite and expensive — every byte wasted on misplaced config is a byte not spent on your actual work.

Want to fix it manually? Dig through encoded-path directories, figure out which `-home-user-Documents/` maps to which project, `cat` each file to see what's inside, and `mv` them to the right place. For 140 items. No thanks.

## "Just Ask Claude to Fix It"

Sure, you can ask Claude Code to manage its own config. But try it. You'll say "show me all my memories across every scope" and Claude will run `ls` on one directory. Then you say "no, ALL scopes." It lists another. You go back and forth, `cat`-ing files one by one, trying to piece together the full picture from fragments of text output.

**There's no command that shows you the entire tree** — every active scope, every sub-project, every memory and skill and MCP config, all at once, in a hierarchy you can actually read. You're stuck playing 20 questions with your own config.

I needed a dashboard. So I built one.

## One Command, Full Visibility

```bash
npx @mcpware/claude-code-organizer
```

Opens a web dashboard at `http://localhost:3847`. Scans your real `~/.claude/` directory. Shows everything Claude Code has stored — organized by scope hierarchy.

![Claude Code Organizer Demo](https://raw.githubusercontent.com/mcpware/claude-code-organizer/main/docs/demo.gif)

## What You Actually See

Claude Code has three scope levels that inherit top-down:

```
Global              ← applies everywhere
  Workspace         ← applies to all sub-projects in a folder
    Project         ← this repo only
```

The dashboard renders this as an interactive tree. Open any project and you immediately see **exactly what Claude loads into context when you work in that directory** — its own memories, skills, and MCP configs, plus everything inherited from parent scopes. You can finally answer: "What is actually influencing Claude's behavior right now in this project?"

Open Global → 4 memories, 25 skills, 6 MCP servers that apply everywhere. Open a workspace → its own items plus what it inherits from Global. Open a project → the full inheritance chain, top to bottom. **One glance to see 140 items across every scope** — not 15 rounds of `cat` and `ls`.

## But It's Not Just a Viewer

This is the part I care about most.

**Drag-and-drop between scopes.** Memory trapped in a project that should be global? Drag it up to Global. Skill leaking everywhere that belongs to one repo? Drag it down to that project. Confirmation modal pops up before any file moves.

### Example: Project → Global

You told Claude "I prefer TypeScript + ESM" while inside a project. That preference applies everywhere — but Claude saved it to the project scope. Switch projects, and Claude has no idea. Open the dashboard, drag that memory from Project to Global. **Done. One drag. No file paths, no `mv` commands.**

### Example: Global → Project

A deploy skill sitting in global scope only makes sense for one repo. Drag it into that project's scope. Other projects won't see it anymore. **No more scope contamination.**

### Example: Delete Stale Memories

Claude auto-creates memories all the time — sometimes from things you said casually, sometimes from things it *thought* you wanted remembered. A week later that memory is irrelevant or outright wrong, but it's still there, still loaded into every session, still nudging Claude's behavior in ways you can't see.

Open the dashboard, browse your memories, read the ones you don't recognize, and delete the ones that don't belong. **You're finally in control of what Claude thinks it knows about you.**

### Example: Find Duplicates

Spot the three identical MCP server entries you didn't know existed across different scopes. Delete the extras. **Clean.**

## Under the Hood

Three modules, ~800 lines, zero dependencies:

1. **Scanner** — walks `~/.claude/` recursively, discovers projects by encoded-path directories. Parses frontmatter from memory files, reads `settings.json` for MCP servers, resolves scope inheritance. Pure data, no side effects.

2. **Mover** — cross-scope file moves with safety checks. Validates types match (memories can only go to memory folders, skills to skill folders). Creates target directories. Moves actual files on disk.

3. **Server** — 4 REST endpoints. Frontend is vanilla HTML/CSS/JS with SortableJS for drag-and-drop. No React, no build step, no bundler.

It also ships as an **MCP server** — add it to your `settings.json` and Claude can use `scan_inventory`, `move_item`, `delete_item`, `list_destinations` tools to manage its own config programmatically:

```json
{
  "mcpServers": {
    "claude-code-organizer": {
      "command": "npx",
      "args": ["-y", "@mcpware/claude-code-organizer", "--mcp"]
    }
  }
}
```

## "Surely Someone Already Built This?"

That's what I thought. I spent a whole evening searching before writing a single line of code. Here's what I found:

The most popular one is a **desktop app** with 600+ stars — great for config profiles and MCP management, but **no scope hierarchy at all**. You can't see which items are global vs project-specific, can't move things between scopes. Different problem.

There's a **VS Code extension** with a tree view and one-click moves — actually the closest to what I wanted. But it **only works inside VS Code**. I wanted something standalone I could open in a browser regardless of my editor.

Another one is a **full-stack web app** with AI advisor, timeline, backup, even a skill marketplace. Most features of any option. But no scope tree, no drag-and-drop, and it requires React + Rust + SQLite. Way heavier than what I needed.

A few others focus on session transcripts or usage analytics — useful, but **no scope management at all**.

None of them gave me what I actually wanted: **see the full scope tree, understand what's inherited where, and drag things between scopes.** So I built it.

| What I needed | Desktop app | VS Code ext | Full-stack app | **CCO** |
|---------|:---:|:---:|:---:|:---:|
| Scope hierarchy tree | No | Yes | Partial | **Yes** |
| Drag-and-drop moves | No | No | No | **Yes** |
| Cross-scope moves | No | One-click | No | **Yes** |
| MCP tools | No | No | Yes | **Yes** |
| Zero dependencies | No | No | No | **Yes** |
| Standalone (no IDE) | Yes | No | Yes | **Yes** |

## What's Next

This is v0.3 — it works, but there's more I want to build:

- **Inline editing** — click a memory or skill and edit its content directly in the dashboard, no more opening files in a text editor
- **Export & backup** — export your entire config as a portable bundle, restore it on another machine, or share your setup with teammates
- **UI polish** — the dashboard does its job but it's not winning design awards yet. Better layout, dark mode, smoother animations
- **Config profiles** — save and switch between different config sets (e.g., "work" vs "personal" vs "minimal")

If you have ideas for what would make this more useful, [open an issue](https://github.com/mcpware/claude-code-organizer/issues) — I read every one.

## Try It

```bash
npx @mcpware/claude-code-organizer
```

Zero config. Zero dependencies. Works on Linux and macOS. Reads your real `~/.claude/` directory.

{% github mcpware/claude-code-organizer %}

## About Me

Fair warning: I'm a CS dropout who's been using Claude Code for exactly one week. I didn't spend a week building this — I spent a week using CC, noticed this problem on day 6, and built the dashboard in a day. So yes, this is early. It's v0.3. It works, but it's rough around the edges.

Here's what I can promise: I read every issue, every comment, every piece of feedback. And I ship fast — if you report something, there's a decent chance it's fixed within a couple hours. I literally have not slept properly since I discovered Claude Code. My ADHD found its forever home and I'm not even mad about it.

This is my first open source project and I can't do it alone. The codebase is ~800 lines of vanilla JS — no frameworks, no build step, very readable. If you've ever wanted to contribute to an open source project but felt intimidated by massive codebases, this might be a good place to start.

**Here's how you can help make this better:**

- ⭐ **[Star it on GitHub](https://github.com/mcpware/claude-code-organizer)** — this is the single biggest thing you can do. Stars = visibility = more people find it = more contributors. It takes 1 second
- 🍴 **[Fork it](https://github.com/mcpware/claude-code-organizer/fork)** — grab the code, build a feature, send a PR. Dark mode? Better search? A feature I haven't thought of? I'll review it same day
- 🐛 **[Open an issue](https://github.com/mcpware/claude-code-organizer/issues)** — found a bug? Have a feature idea? Something feels off? Tell me. I'm building the roadmap based on what users actually want
- 💬 **Comment below** — tell me about your scope horror stories, what features you'd want, or just say hi

I built this because I needed it. If you've been manually `cat`-ing through `~/.claude/` directories too, maybe you needed it as well. Let's build it together.

---

## FAQ

### Can Claude Code manage its own config?

Technically yes — you can ask Claude to list files, read them, and move them. But there's no single command that shows everything across all scopes. You'll spend 10 minutes going back and forth, `cat`-ing files one by one, trying to understand the full picture. The dashboard shows it all in one glance.

### What is scope contamination in Claude Code?

When memories, skills, or MCP configs end up in the wrong scope — usually because Claude saved them based on your working directory, not based on where they should logically live. Items in the wrong scope get loaded into sessions where they don't belong, wasting tokens and potentially giving Claude contradictory instructions.

### How do I move a memory to a different scope?

Without this tool: find the file in `~/.claude/projects/{encoded-path}/memory/`, figure out the target scope's encoded path, manually `mv` the file, update `MEMORY.md`. With this tool: drag it. One drag.

---

Thanks for reading. Now go clean up your scopes.
