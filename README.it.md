# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Bahasa Indonesia](README.id.md) | Italiano | [Português](README.pt-BR.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md)

**Organizza tutte le memorie, le skill, i server MCP e gli hook di Claude Code — visualizzali per gerarchia di scope, spostali tra gli scope tramite drag-and-drop.**

![Claude Code Organizer Demo](docs/demo.gif)

## Il Problema

Claude Code crea silenziosamente memorie, skill e configurazioni MCP ogni volta che lavori — e le deposita nello scope che corrisponde alla directory corrente. Una preferenza che volevi ovunque? Intrappolata in un singolo progetto. Una skill di deploy che appartiene a un solo repo? Finita nel global, contaminando tutti gli altri progetti.

**Non è solo disordine — danneggia le prestazioni della tua AI.** Ad ogni sessione, Claude carica tutte le configurazioni dello scope corrente più tutto ciò che eredita dagli scope genitori nella tua finestra di contesto. Elementi nello scope sbagliato = token sprecati, contesto inquinato e accuratezza ridotta. Una skill per pipeline Python nel global viene caricata anche nella tua sessione React frontend. Voci MCP duplicate inizializzano lo stesso server due volte. Memorie obsolete contraddicono le istruzioni attuali.

### "Chiedi a Claude di sistemarlo"

Potresti chiedere a Claude Code di gestire la propria configurazione. Ma ti ritroveresti a fare avanti e indietro — `ls` in una directory, `cat` ogni file, cercando di ricostruire il quadro completo da frammenti di output testuale. **Non esiste nessun comando che mostri l'intero albero** attraverso tutti gli scope, tutti gli elementi, tutta l'ereditarietà in una volta sola.

### La soluzione: una dashboard visiva

```bash
npx @mcpware/claude-code-organizer
```

Un solo comando. Vedi tutto ciò che Claude ha memorizzato — organizzato per gerarchia di scope. **Trascina gli elementi tra gli scope.** Elimina le memorie obsolete. Trova i duplicati. Prendi il controllo di ciò che influenza realmente il comportamento di Claude.

### Esempio: Project → Global

Hai detto a Claude "preferisco TypeScript + ESM" mentre eri in un progetto, ma quella preferenza vale ovunque. Apri la dashboard, trascina quella memoria da Project a Global. **Fatto. Un solo drag.**

### Esempio: Global → Project

Una skill di deploy nel global ha senso solo per un repo. Trascinala nello scope di quel Project — gli altri progetti non la vedranno più.

### Esempio: Eliminare memorie obsolete

Claude crea automaticamente memorie da cose che hai detto casualmente, o da cose che *pensava* tu volessi ricordare. Una settimana dopo sono irrilevanti ma vengono ancora caricate in ogni sessione. Sfoglia, leggi, elimina. **Tu controlli cosa Claude pensa di sapere su di te.**

---

## Funzionalità

- **Gerarchia scope-aware** — Visualizza tutti gli elementi organizzati come Global > Workspace > Project, con indicatori di ereditarietà
- **Drag-and-drop** — Sposta le memorie tra gli scope, le skill tra global e per-repo, i server MCP tra le configurazioni
- **Conferma spostamento** — Ogni spostamento mostra un modal di conferma prima di modificare qualsiasi file
- **Sicurezza per tipo** — Le memorie possono spostarsi solo nelle cartelle memorie, le skill nelle cartelle skill, gli MCP nelle configurazioni MCP
- **Ricerca e filtro** — Cerca istantaneamente tra tutti gli elementi, filtra per categoria (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Pannello dettagli** — Clicca su qualsiasi elemento per vedere i metadati completi, la descrizione, il percorso del file e aprirlo in VS Code
- **Scansione completa per progetto** — Ogni scope mostra tutti i tipi di elementi: memorie, skill, server MCP, configurazioni, hook e piani
- **Spostamento reale dei file** — Sposta fisicamente i file in `~/.claude/`, non è solo un visualizzatore
- **45 test E2E** — Suite di test Playwright con verifica del filesystem reale dopo ogni operazione

## Perché una Dashboard Visiva?

Claude Code può già elencare e spostare file via CLI — ma ti ritrovi a fare 20 domande alla tua stessa configurazione. La dashboard ti offre **visibilità completa in un solo colpo d'occhio:**

| Di cosa hai bisogno | Chiedi a Claude | Dashboard Visiva |
|---------------------|:-----------:|:----------------:|
| **Vedere tutto in una volta** attraverso tutti gli scope | `ls` una directory alla volta, ricostruisci il quadro | Albero degli scope, un colpo d'occhio |
| **Cosa è caricato nel mio progetto corrente?** | Esegui più comandi, sperando di averli presi tutti | Apri il progetto → vedi la catena di ereditarietà completa |
| **Spostare elementi tra scope** | Trova i percorsi codificati, `mv` manualmente | Drag-and-drop con conferma |
| **Leggere il contenuto della configurazione** | `cat` ogni file uno per uno | Clic → pannello laterale |
| **Trovare duplicati / elementi obsoleti** | `grep` tra directory criptiche | Ricerca + filtro per categoria |
| **Ripulire le memorie inutilizzate** | Capire quali file eliminare | Sfoglia, leggi, elimina in-place |

## Avvio Rapido

### Opzione 1: npx (nessuna installazione richiesta)

```bash
npx @mcpware/claude-code-organizer
```

### Opzione 2: Installazione globale

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Opzione 3: Chiedi a Claude

Incolla questo in Claude Code:

> Esegui `npx @mcpware/claude-code-organizer` — è una dashboard per gestire le impostazioni di Claude Code. Dimmi l'URL quando è pronto.

Apre una dashboard su `http://localhost:3847`. Funziona con la tua directory `~/.claude/` reale.

## Cosa Gestisce

| Tipo | Visualizza | Sposta | Scansionato su | Perché bloccato? |
|------|:----:|:----:|:----------:|-------------|
| Memorie (feedback, user, project, reference) | Sì | Sì | Global + Project | — |
| Skills | Sì | Sì | Global + Project | — |
| Server MCP | Sì | Sì | Global + Project | — |
| Config (CLAUDE.md, settings.json) | Sì | Bloccato | Global + Project | Impostazioni di sistema — lo spostamento potrebbe rompere la configurazione |
| Hooks | Sì | Bloccato | Global + Project | Dipende dal contesto delle impostazioni — errori silenziosi se spostati |
| Plans | Sì | Sì | Global + Project | — |
| Plugins | Sì | Bloccato | Solo Global | Cache gestita da Claude Code |

## Gerarchia degli Scope

```
Global                       <- si applica ovunque
  Company (workspace)        <- si applica a tutti i sotto-progetti
    CompanyRepo1             <- specifico del progetto
    CompanyRepo2             <- specifico del progetto
  SideProjects (project)     <- progetto indipendente
  Documents (project)        <- progetto indipendente
```

Gli scope figlio ereditano le memorie, le skill e i server MCP dello scope genitore.

## Come Funziona

1. **Scansiona** `~/.claude/` — scopre tutti i progetti, memorie, skill, server MCP, hook, plugin, piani
2. **Risolve la gerarchia degli scope** — determina le relazioni genitore-figlio dai percorsi del filesystem
3. **Renderizza la dashboard** — intestazioni scope > barre categoria > righe elementi, con indentazione appropriata
4. **Gestisce gli spostamenti** — quando trascini o clicchi su "Sposta in...", sposta fisicamente i file su disco con controlli di sicurezza

## Confronto

Abbiamo esaminato ogni strumento di configurazione per Claude Code che siamo riusciti a trovare. Nessuno offriva gerarchia visiva degli scope + spostamenti cross-scope tramite drag-and-drop in una dashboard standalone.

| Di cosa avevo bisogno | App desktop (600+⭐) | Estensione VS Code | Web app full-stack | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Albero gerarchia scope | No | Sì | Parziale | **Sì** |
| Spostamenti drag-and-drop | No | No | No | **Sì** |
| Spostamenti cross-scope | No | Un clic | No | **Sì** |
| Eliminazione elementi obsoleti | No | No | No | **Sì** |
| Strumenti MCP | No | No | Sì | **Sì** |
| Zero dipendenze | No (Tauri) | No (VS Code) | No (React+Rust+SQLite) | **Sì** |
| Standalone (senza IDE) | Sì | No | Sì | **Sì** |

## Supporto Piattaforme

| Piattaforma | Stato |
|----------|:------:|
| Ubuntu / Linux | Supportato |
| macOS (Intel + Apple Silicon) | Supportato (testato dalla community su Sequoia M3) |
| Windows | Non ancora |
| WSL | Dovrebbe funzionare (non testato) |

## Struttura del Progetto

```
src/
  scanner.mjs       # Scansiona ~/.claude/ — dati puri, nessun effetto collaterale
  mover.mjs         # Sposta file tra scope — controlli di sicurezza + rollback
  server.mjs        # Server HTTP — solo route, nessuna logica
  ui/
    index.html       # Struttura HTML
    style.css        # Tutto lo stile (modifica liberamente, non romperà la logica)
    app.js           # Rendering frontend + SortableJS + interazioni
bin/
  cli.mjs            # Punto di ingresso
```

Frontend e backend sono completamente separati. Modifica i file in `src/ui/` per cambiare l'aspetto senza toccare nessuna logica.

## API

La dashboard è supportata da una REST API:

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/scan` | GET | Scansiona tutte le personalizzazioni, restituisce scope + elementi + conteggi |
| `/api/move` | POST | Sposta un elemento in uno scope diverso (supporta disambiguazione categoria/nome) |
| `/api/delete` | POST | Elimina permanentemente un elemento |
| `/api/restore` | POST | Ripristina un file eliminato (per annullare) |
| `/api/restore-mcp` | POST | Ripristina un server MCP eliminato |
| `/api/destinations` | GET | Ottieni destinazioni di spostamento valide per un elemento |
| `/api/file-content` | GET | Leggi il contenuto del file per il pannello dettagli |

## Licenza

MIT

## Altro da @mcpware

| Progetto | Cosa fa | Installazione |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 strumenti Instagram Graph API — post, commenti, DM, storie, analytics | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Etichette al passaggio del mouse su qualsiasi pagina web — l'AI fa riferimento agli elementi per nome | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | Registra sessioni browser come GIF o video via MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | Design logo AI → SVG → esportazione kit brand completo | `npx @mcpware/logoloom` |
## Autore

[ithiria894](https://github.com/ithiria894) — Costruisco strumenti per l'ecosistema Claude Code.
