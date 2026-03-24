# Claude Code Organizer

[![npm version](https://img.shields.io/npm/v/@mcpware/claude-code-organizer)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![npm downloads](https://img.shields.io/npm/dt/@mcpware/claude-code-organizer?label=downloads)](https://www.npmjs.com/package/@mcpware/claude-code-organizer)
[![GitHub stars](https://img.shields.io/github/stars/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mcpware/claude-code-organizer)](https://github.com/mcpware/claude-code-organizer/network/members)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Bahasa Indonesia](README.id.md) | [Italiano](README.it.md) | Português | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md)

**Organize todas as suas memórias, skills, servidores MCP e hooks do Claude Code — visualize pela hierarquia de escopos, mova entre escopos com arrastar e soltar.**

![Claude Code Organizer Demo](docs/demo.gif)

## O Problema

O Claude Code cria memórias, skills e configurações MCP silenciosamente toda vez que você trabalha — e as despeja no escopo que corresponde ao seu diretório atual. Uma preferência que você queria em todo lugar? Presa em um único projeto. Uma skill de deploy que pertence a um repositório específico? Vazou para o global, contaminando todos os outros projetos.

**Isso não é apenas bagunça — prejudica o desempenho da sua IA.** A cada sessão, o Claude carrega todas as configurações do escopo atual mais tudo herdado dos escopos pai na sua janela de contexto. Itens no escopo errado = tokens desperdiçados, contexto poluído e menor precisão. Uma skill de pipeline Python no global é carregada na sua sessão de frontend React. Entradas MCP duplicadas inicializam o mesmo servidor duas vezes. Memórias desatualizadas contradizem suas instruções atuais.

### "Só peça pro Claude corrigir"

Você poderia pedir ao Claude Code para gerenciar suas próprias configurações. Mas vai ficar indo e voltando — `ls` em um diretório de cada vez, `cat` em cada arquivo, tentando montar o quadro geral a partir de fragmentos de texto. **Não existe nenhum comando que mostre a árvore inteira** entre todos os escopos, todos os itens, toda a herança de uma vez.

### A solução: um dashboard visual

```bash
npx @mcpware/claude-code-organizer
```

Um comando. Veja tudo que o Claude armazenou — organizado por hierarquia de escopos. **Arraste itens entre escopos.** Delete memórias desatualizadas. Encontre duplicatas. Assuma o controle do que realmente influencia o comportamento do Claude.

### Exemplo: Project → Global

Você disse ao Claude "Prefiro TypeScript + ESM" dentro de um projeto, mas essa preferência se aplica em qualquer lugar. Abra o dashboard, arraste essa memória de Project para Global. **Pronto. Um arraste.**

### Exemplo: Global → Project

Uma skill de deploy no global só faz sentido para um repositório. Arraste-a para o escopo daquele Project — os outros projetos não vão mais enxergá-la.

### Exemplo: Deletar memórias desatualizadas

O Claude cria memórias automaticamente a partir de coisas que você disse por acaso, ou coisas que ele *achou* que você queria lembrar. Uma semana depois elas são irrelevantes, mas ainda são carregadas em toda sessão. Navegue, leia, delete. **Você controla o que o Claude acha que sabe sobre você.**

---

## Funcionalidades

- **Hierarquia por escopo** — Veja todos os itens organizados como Global > Workspace > Project, com indicadores de herança
- **Arrastar e soltar** — Mova memórias entre escopos, skills entre global e por repositório, servidores MCP entre configurações
- **Confirmação de movimentação** — Cada movimentação exibe um modal de confirmação antes de tocar em qualquer arquivo
- **Segurança por tipo** — Memórias só podem ser movidas para pastas de memória, skills para pastas de skill, MCP para configurações MCP
- **Busca e filtro** — Pesquise instantaneamente em todos os itens, filtre por categoria (Memory, Skills, MCP, Config, Hooks, Plugins, Plans)
- **Painel de detalhes** — Clique em qualquer item para ver metadados completos, descrição, caminho do arquivo e abrir no VS Code
- **Varredura completa por projeto** — Cada escopo mostra todos os tipos de itens: memórias, skills, servidores MCP, configurações, hooks e planos
- **Movimentação real de arquivos** — Realmente move arquivos em `~/.claude/`, não é apenas um visualizador
- **45 testes E2E** — Suite de testes Playwright com verificação real do sistema de arquivos após cada operação

## Por Que um Dashboard Visual?

O Claude Code já consegue listar e mover arquivos via CLI — mas você fica jogando 20 perguntas com suas próprias configurações. O dashboard oferece **visibilidade total em um único olhar:**

| O que você precisa | Pedir pro Claude | Dashboard Visual |
|---|:-----------:|:----------------:|
| **Ver tudo de uma vez** em todos os escopos | `ls` em um diretório por vez, tente montar | Árvore de escopos, uma olhada |
| **O que está carregado no meu projeto atual?** | Executar vários comandos, torcer para não ter perdido nada | Abrir projeto → ver cadeia de herança completa |
| **Mover itens entre escopos** | Encontrar caminhos codificados, `mv` manualmente | Arrastar e soltar com confirmação |
| **Ler conteúdo de configuração** | `cat` em cada arquivo um a um | Clicar → painel lateral |
| **Encontrar duplicatas / itens desatualizados** | `grep` em diretórios crípticos | Busca + filtro por categoria |
| **Limpar memórias não utilizadas** | Descobrir quais arquivos deletar | Navegar, ler, deletar no lugar |

## Início Rápido

### Opção 1: npx (sem instalação)

```bash
npx @mcpware/claude-code-organizer
```

### Opção 2: Instalação global

```bash
npm install -g @mcpware/claude-code-organizer
claude-code-organizer
```

### Opção 3: Pedir pro Claude

Cole isso no Claude Code:

> Execute `npx @mcpware/claude-code-organizer` — é um dashboard para gerenciar as configurações do Claude Code. Me diga a URL quando estiver pronto.

Abre um dashboard em `http://localhost:3847`. Funciona com seu diretório `~/.claude/` real.

## O Que Ele Gerencia

| Tipo | Visualizar | Mover | Escaneado em | Por que bloqueado? |
|------|:----:|:----:|:----------:|-------------|
| Memories (feedback, user, project, reference) | Sim | Sim | Global + Project | — |
| Skills | Sim | Sim | Global + Project | — |
| MCP Servers | Sim | Sim | Global + Project | — |
| Config (CLAUDE.md, settings.json) | Sim | Bloqueado | Global + Project | Configurações do sistema — mover pode quebrar a configuração |
| Hooks | Sim | Bloqueado | Global + Project | Depende do contexto de settings — falhas silenciosas se movidos |
| Plans | Sim | Sim | Global + Project | — |
| Plugins | Sim | Bloqueado | Apenas Global | Cache gerenciado pelo Claude Code |

## Hierarquia de Escopos

```
Global                       <- aplica em todo lugar
  Company (workspace)        <- aplica a todos os subprojetos
    CompanyRepo1             <- específico do projeto
    CompanyRepo2             <- específico do projeto
  SideProjects (project)     <- projeto independente
  Documents (project)        <- projeto independente
```

Escopos filhos herdam as memórias, skills e servidores MCP do escopo pai.

## Como Funciona

1. **Varre** `~/.claude/` — descobre todos os projetos, memórias, skills, servidores MCP, hooks, plugins, planos
2. **Resolve a hierarquia de escopos** — determina as relações pai-filho a partir dos caminhos do sistema de arquivos
3. **Renderiza o dashboard** — cabeçalhos de escopo > barras de categoria > linhas de item, com recuo adequado
4. **Gerencia movimentações** — quando você arrasta ou clica em "Mover para...", realmente move os arquivos no disco com verificações de segurança

## Comparação

Analisamos todas as ferramentas de configuração do Claude Code que encontramos. Nenhuma oferecia hierarquia visual de escopos + movimentação cross-scope com arrastar e soltar em um dashboard independente.

| O que eu precisava | App desktop (600+⭐) | Extensão VS Code | App web full-stack | **Claude Code Organizer** |
|---------|:---:|:---:|:---:|:---:|
| Árvore de hierarquia de escopos | Não | Sim | Parcial | **Sim** |
| Movimentação com arrastar e soltar | Não | Não | Não | **Sim** |
| Movimentação cross-scope | Não | Um clique | Não | **Sim** |
| Deletar itens desatualizados | Não | Não | Não | **Sim** |
| Ferramentas MCP | Não | Não | Sim | **Sim** |
| Zero dependências | Não (Tauri) | Não (VS Code) | Não (React+Rust+SQLite) | **Sim** |
| Independente (sem IDE) | Sim | Não | Sim | **Sim** |

## Suporte de Plataformas

| Plataforma | Status |
|----------|:------:|
| Ubuntu / Linux | Suportado |
| macOS (Intel + Apple Silicon) | Suportado (testado pela comunidade no Sequoia M3) |
| Windows | Ainda não |
| WSL | Deve funcionar (não testado) |

## Estrutura do Projeto

```
src/
  scanner.mjs       # Varre ~/.claude/ — dados puros, sem efeitos colaterais
  mover.mjs         # Move arquivos entre escopos — verificações de segurança + rollback
  server.mjs        # Servidor HTTP — apenas rotas, sem lógica
  ui/
    index.html       # Estrutura HTML
    style.css        # Todo o estilo (edite livremente, não vai quebrar a lógica)
    app.js           # Renderização frontend + SortableJS + interações
bin/
  cli.mjs            # Ponto de entrada
```

Frontend e backend são completamente separados. Edite os arquivos em `src/ui/` para mudar a aparência sem tocar em nenhuma lógica.

## API

O dashboard é sustentado por uma REST API:

| Endpoint | Método | Descrição |
|----------|--------|-------------|
| `/api/scan` | GET | Varre todas as customizações, retorna escopos + itens + contagens |
| `/api/move` | POST | Move um item para um escopo diferente (suporta desambiguação por categoria/nome) |
| `/api/delete` | POST | Deleta um item permanentemente |
| `/api/restore` | POST | Restaura um arquivo deletado (para desfazer) |
| `/api/restore-mcp` | POST | Restaura uma entrada de servidor MCP deletada |
| `/api/destinations` | GET | Obtém destinos válidos de movimentação para um item |
| `/api/file-content` | GET | Lê o conteúdo do arquivo para o painel de detalhes |

## Licença

MIT

## Mais de @mcpware

| Projeto | O que faz | Instalação |
|---------|---|---|
| **[Instagram MCP](https://github.com/mcpware/instagram-mcp)** | 23 ferramentas da Instagram Graph API — posts, comentários, DMs, stories, analytics | `npx @mcpware/instagram-mcp` |
| **[UI Annotator](https://github.com/mcpware/ui-annotator-mcp)** | Rótulos ao passar o mouse em qualquer página web — IA referencia elementos pelo nome | `npx @mcpware/ui-annotator` |
| **[Pagecast](https://github.com/mcpware/pagecast)** | Grava sessões do navegador como GIF ou vídeo via MCP | `npx @mcpware/pagecast` |
| **[LogoLoom](https://github.com/mcpware/logoloom)** | Design de logo com IA → SVG → exportação de kit de marca completo | `npx @mcpware/logoloom` |

## Autor

[ithiria894](https://github.com/ithiria894) — Construindo ferramentas para o ecossistema Claude Code.
