# Privacy Policy

**Cross-Code Organizer (CCO)** runs on your local machine. Your harness files are not uploaded to CCO or collected as telemetry.

## Data Collection

**None.** CCO has no analytics service, user database, advertising tracker, or usage telemetry.

## What It Accesses

- Reads selected config and customization files for supported harnesses, including `~/.claude/`, `~/.codex/`, `~/.config/opencode/`, and discovered project directories
- Writes only when you use an editing, move, delete, restore, export, backup, or harness-control action
- Runs an HTTP server bound to `127.0.0.1` (default port 3847) and rejects non-local browser requests

## Third-Party Services

- The dashboard loads **marked** from jsDelivr for Markdown rendering and fonts from Google Fonts.
- CCO checks the npm registry for available package updates.
- An MCP security audit connects to the MCP servers already configured in the selected harness so it can inspect their tool definitions.
- Backup Center can copy harness files to a Git remote you configure. Scheduled backups repeat that sync at the selected interval until you disable the schedule.
- No analytics, tracking, or telemetry of any kind.

## Summary

CCO does not upload the contents of your harness files. Network access is limited to the resources and user-triggered checks described above.

---

Last updated: 2026-09-11
