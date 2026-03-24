# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | Español | [Bahasa Indonesia](README.id.md) | [Italiano](README.it.md) | [Português](README.pt-BR.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md)

**Organiza todas tus memorias, skills, servidores MCP y hooks de Claude Code — visualiza por jerarquía de scopes, mueve entre scopes con arrastrar y soltar.**

![Claude Code Organizer Demo](docs/demo.gif)

## El Problema

Claude Code crea memorias, skills y configuraciones MCP silenciosamente cada vez que trabajas — y los guarda en el scope que corresponde a tu directorio actual. ¿Una preferencia que querías en todos lados? Atrapada en un solo proyecto. ¿Una skill de despliegue que pertenece a un repositorio? Se filtró al scope global, contaminando todos los demás proyectos.

**Esto no es solo desorden — perjudica el rendimiento de tu IA.** En cada sesión, Claude carga todas las configuraciones del scope actual más todo lo heredado de los scopes padre en tu ventana de contexto. Elementos en el scope equivocado = tokens desperdiciados, contexto contaminado y menor precisión. Una skill de pipeline Python en el scope global se carga en tu sesión de frontend React. Entradas MCP duplicadas inicializan el mismo servidor dos veces. Memorias obsoletas contradicen tus instrucciones actuales.

### "Solo pídele a Claude que lo arregle"

Podrías pedirle a Claude Code que gestione su propia configuración. Pero irás y vendrás — `ls` en un directorio, `cat` en cada archivo, intentando armar el panorama completo a partir de fragmentos de texto. **No existe ningún comando que muestre el árbol completo** de todos los scopes, todos los elementos y toda la herencia de una sola vez.

### La solución: un panel visual

```bash
npx @mcpware/claude-code-organizer
```

Un solo comando. Ve todo lo que Claude tiene almacenado — organizado por jerarquía de scopes. **Arrastra elementos entre scopes.** Elimina memorias obsoletas. Encuentra duplicados. Toma el control de lo que realmente influye en el comportamiento de Claude.

### Ejemplo: Proyecto → Global

Le dijiste a Claude "Prefiero TypeScript + ESM" dentro de un proyecto, pero esa preferencia aplica en todos lados. Abre el panel, arrastra esa memoria de Proyecto a Global. **Listo. Un solo arrastre.**

### Ejemplo: Global → Proyecto

Una skill de despliegue en global solo tiene sentido para un repositorio. Arrástrala al scope de ese Proyecto — los demás proyectos ya no la verán.

### Ejemplo: Eliminar memorias obsoletas

Claude crea memorias automáticamente de cosas que dijiste de pasada, o cosas que *creyó* que querías recordar. Una semana después ya no son relevantes pero siguen cargándose en cada sesión. Navega, lee, elimina. **Tú controlas lo que Claude cree que sabe sobre ti.**

---

## Características

- **Jerarquía por scope** — Ve todos los elementos organizados como Global > Workspace > Proyecto, con indicadores de herencia
- **Arrastrar y soltar** — Mueve memorias entre scopes, skills entre global y por repositorio, servidores MCP entre configuraciones
- **Confirmación de movimiento** — Cada movimiento muestra un modal de confirmación antes de tocar cualquier archivo
- **Seguridad por tipo** — Las memorias solo pueden moverse a carpetas de memoria, las skills a carpetas de skills, MCP a configuraciones MCP
- **Búsqueda y filtro** — Busca instantáneamente en todos los elementos, filtra por categoría (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Panel de detalles** — Haz clic en cualquier elemento para ver metadatos completos, descripción, ruta de archivo y abrirlo en VS Code
- **Escaneo completo por proyecto** — Cada scope muestra todos los tipos de elementos: memorias, skills, servidores MCP, configuraciones, hooks y planes
- **Movimiento real de archivos** — Realmente mueve archivos en `~/.claude/`, no es solo un visor
- **45 pruebas E2E** — Suite de pruebas Playwright con verificación real del sistema de archivos después de cada operación

## ¿Por Qué un Panel Visual?

Claude Code ya puede listar y mover archivos vía CLI — pero quedas atrapado jugando 20 preguntas con tu propia configuración. El panel te da **visibilidad total de un vistazo:**

| Lo que necesitas | Pedirle a Claude | Panel Visual |
|------------------|:----------------:|:------------:|
| **Ver todo a la vez** en todos los scopes | `ls` un directorio a la vez, armar el rompecabezas | Árbol de scopes, un vistazo |
| **¿Qué se carga en mi proyecto actual?** | Ejecutar múltiples comandos, esperando no olvidar nada | Abre el proyecto → ve la cadena de herencia completa |
| **Mover elementos entre scopes** | Encontrar rutas codificadas, `mv` manualmente | Arrastrar y soltar con confirmación |
| **Leer contenido de configuración** | `cat` cada archivo uno por uno | Clic → panel lateral |
| **Encontrar duplicados / elementos obsoletos** | `grep` en directorios crípticos | Búsqueda + filtro por categoría |
| **Limpiar memorias sin uso** | Descubrir qué archivos eliminar | Navegar, leer, eliminar en el lugar |

## Inicio Rápido

### Opción 1: npx (sin instalación)

```bash
npx @mcpware/claude-code-organizer
```

### Opción 2: Instalación global

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Opción 3: Pedirle a Claude

Pega esto en Claude Code:

> Ejecuta `npx @mcpware/claude-code-organizer` — es un panel para gestionar la configuración de Claude Code. Dime la URL cuando esté listo.

Abre un panel en `http://localhost:3847`. Funciona con tu directorio real `~/.claude/`.

## Qué Gestiona

| Tipo | Ver | Mover | Escaneado en | ¿Por qué bloqueado? |
|------|:---:|:-----:|:------------:|---------------------|
| Memorias (feedback, user, project, reference) | Sí | Sí | Global + Proyecto | — |
| Skills | Sí | Sí | Global + Proyecto | — |
| Servidores MCP | Sí | Sí | Global + Proyecto | — |
| Config (CLAUDE.md, settings.json) | Sí | Bloqueado | Global + Proyecto | Configuración del sistema — moverlo puede romper la config |
| Hooks | Sí | Bloqueado | Global + Proyecto | Depende del contexto de settings — fallos silenciosos si se mueven |
| Plans | Sí | Sí | Global + Proyecto | — |
| Plugins | Sí | Bloqueado | Solo Global | Caché gestionado por Claude Code |

## Jerarquía de Scopes

```
Global                       <- aplica en todos lados
  Company (workspace)        <- aplica a todos los sub-proyectos
    CompanyRepo1             <- específico del proyecto
    CompanyRepo2             <- específico del proyecto
  SideProjects (project)     <- proyecto independiente
  Documents (project)        <- proyecto independiente
```

Los scopes hijo heredan las memorias, skills y servidores MCP del scope padre.

## Cómo Funciona

1. **Escanea** `~/.claude/` — descubre todos los proyectos, memorias, skills, servidores MCP, hooks, plugins y planes
2. **Resuelve la jerarquía de scopes** — determina las relaciones padre-hijo a partir de las rutas del sistema de archivos
3. **Renderiza el panel** — encabezados de scope > barras de categoría > filas de elementos, con indentación correcta
4. **Gestiona los movimientos** — cuando arrastras o haces clic en "Move to...", realmente mueve archivos en disco con verificaciones de seguridad

## Comparación

Revisamos todas las herramientas de configuración de Claude Code que pudimos encontrar. Ninguna ofrecía jerarquía visual de scopes + movimientos cross-scope con arrastrar y soltar en un panel independiente.

| Lo que necesitaba | App de escritorio (600+⭐) | Extensión VS Code | App web full-stack | **Claude Code Organizer** |
|-------------------|:-------------------------:|:-----------------:|:------------------:|:-------------------------:|
| Árbol de jerarquía de scopes | No | Sí | Parcial | **Sí** |
| Movimientos con arrastrar y soltar | No | No | No | **Sí** |
| Movimientos cross-scope | No | Un clic | No | **Sí** |
| Eliminar elementos obsoletos | No | No | No | **Sí** |
| Herramientas MCP | No | No | Sí | **Sí** |
| Sin dependencias | No (Tauri) | No (VS Code) | No (React+Rust+SQLite) | **Sí** |
| Independiente (sin IDE) | Sí | No | Sí | **Sí** |

## Compatibilidad de Plataformas

| Plataforma | Estado |
|------------|:------:|
| Ubuntu / Linux | Compatible |
| macOS (Intel + Apple Silicon) | Compatible (probado por la comunidad en Sequoia M3) |
| Windows | Aún no |
| WSL | Debería funcionar (sin probar) |

## Estructura del Proyecto

```
src/
  scanner.mjs       # Escanea ~/.claude/ — datos puros, sin efectos secundarios
  mover.mjs         # Mueve archivos entre scopes — verificaciones de seguridad + rollback
  server.mjs        # Servidor HTTP — solo rutas, sin lógica
  ui/
    index.html       # Estructura HTML
    style.css        # Todo el estilo (edita libremente, no rompe la lógica)
    app.js           # Renderizado frontend + SortableJS + interacciones
bin/
  cli.mjs            # Punto de entrada
```

El frontend y el backend están completamente separados. Edita los archivos `src/ui/` para cambiar la apariencia sin tocar ninguna lógica.

## API

El panel está respaldado por una API REST:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/scan` | GET | Escanea todas las personalizaciones, devuelve scopes + elementos + conteos |
| `/api/move` | POST | Mueve un elemento a un scope diferente (soporta desambiguación por categoría/nombre) |
| `/api/delete` | POST | Elimina un elemento de forma permanente |
| `/api/restore` | POST | Restaura un archivo eliminado (para deshacer) |
| `/api/restore-mcp` | POST | Restaura una entrada de servidor MCP eliminada |
| `/api/destinations` | GET | Obtiene destinos de movimiento válidos para un elemento |
| `/api/file-content` | GET | Lee el contenido del archivo para el panel de detalles |

## Licencia

MIT

## Más de @mcpware

| Proyecto | Qué hace | Instalación |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 herramientas de Instagram Graph API — publicaciones, comentarios, DMs, historias, analíticas | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Etiquetas flotantes en cualquier página web — la IA referencia elementos por nombre | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | Graba sesiones del navegador como GIF o video vía MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | Diseño de logo con IA → SVG → exportación de kit de marca completo | `npx @mcpware/logoloom` |

## Autor

[ithiria894](https://github.com/ithiria894) — Construyendo herramientas para el ecosistema de Claude Code.
