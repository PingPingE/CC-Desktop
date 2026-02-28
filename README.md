# CC Desktop

A desktop application that brings Claude Code to everyone — no terminal required.

CC Desktop wraps [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with a friendly chat UI, so you can use powerful AI-driven development workflows without ever opening a terminal or IDE.

**Built with:** [Tauri](https://tauri.app/) (Rust) + React + TypeScript

**Templates from:** [claudetemplate.com](https://claudetemplate.com) (CC-Marketplace)

---

## Why CC Desktop?

Claude Code is incredibly powerful — it can plan features, write code, review for security issues, refactor, run tests, and manage git — all through natural language. But it runs in a terminal, which means:

- Non-technical team members can't use it
- Setting up templates requires ZIP extraction and directory management
- There's no visual feedback on what's happening
- Permission approvals happen in raw text

**CC Desktop solves all of this** by putting a visual interface on top of Claude Code.

| Without CC Desktop | With CC Desktop |
|---|---|
| Open terminal | Open app |
| `npm install -g @anthropic-ai/claude-code` | One-time setup wizard |
| `cd ~/projects/my-app` | Click "Open Project" |
| `claude` | Already connected |
| Type `/plan-feature add login` | Type or click `/plan-feature` |
| Read raw text output | See formatted Markdown with syntax highlighting |
| `y/n` permission prompts | Visual approve/deny dialog |
| `git status` + `git diff` in another terminal | Built-in file tree with change indicators |
| Switch between terminal tabs | Everything in one window |

---

## Features

### 1. Chat Interface

The main interaction with Claude Code, reimagined as a chat UI.

```
┌─────────────────────────────────────────────────────────┐
│  CC Desktop                              ● Ready        │
├──────────┬──────────────────────────────────┬───────────┤
│          │                                  │           │
│  Projects│   assistant                      │  Agents   │
│  --------│   I'll plan the login feature.   │  -------  │
│  > my-app│   Here are the tasks:            │  PM       │
│    blog  │                                  │  dev      │
│          │   1. Create auth middleware      │  tester   │
│  Agents  │   2. Build login page            │  ux       │
│  --------│   3. Add session management      │           │
│  pm      │   4. Write tests                 │  Skills   │
│  dev     │                                  │  -------  │
│  tester  │                                  │  /plan    │
│          │   ┌──────────────────────────┐   │  /impl    │
│ Templates│   │ Type or "/" for commands │   │  /review  │
│  --------│   └──────────────────────────┘   │  /refactor│
│  Browse  │                                  │           │
│          │  Enter to send · Shift+Enter ↵   │           │
├──────────┴──────────────────────────────────┴───────────┤
│  Terminal: npm run build ✓ passed                       │
└─────────────────────────────────────────────────────────┘
```

- **Markdown rendering** — headings, bold, lists, tables, links
- **Syntax highlighted code blocks** — with language detection
- **Streaming responses** — see Claude's response as it's generated
- **Agent badges** — see which agent (PM, developer, tester) is responding

### 2. Slash Command Palette

Type `/` to see all available commands from your installed template.

| Command | What it does |
|---------|-------------|
| `/plan-feature <description>` | Break a feature into prioritized tasks |
| `/implement <description>` | Quick code implementation |
| `/code-review <target>` | Security + quality audit |
| `/refactor <target>` | Improve code structure without changing behavior |
| `/auto-fix` | Automatically fix build/lint/type errors |
| `/ship` | Full pre-ship verification (build + lint + types + tests) |
| `/analyze-business <focus>` | Pricing and revenue analysis |
| `/marketing <type>` | Generate marketing content |

Commands are **auto-discovered** from `.claude/skills/` in your project — install different templates to get different commands.

### 3. Permission Management

When Claude Code needs to run a command, edit a file, or access the network, you get a **visual dialog** instead of a terminal prompt.

```
┌─────────────────────────────────────┐
│  ⚠ Permission Required             │
│                                     │
│  Tool: bash                         │
│  Command: npm run test              │
│                                     │
│  Claude wants to run this command   │
│  in your project directory.         │
│                                     │
│        [ Deny ]    [ Approve ]      │
└─────────────────────────────────────┘
```

- See exactly what Claude wants to do before approving
- File edits show the diff before you approve
- Bash commands show the full command
- Never accidentally approve something you didn't mean to

### 4. File Tree

Real-time view of your project structure, updated live as Claude creates and modifies files.

- See new files appear as Claude creates them
- Modified files are highlighted
- Navigate your project without switching to Finder/Explorer
- Read-only in MVP (full editor planned for v2)

### 5. Terminal Output

Build results, test output, and command output appear in the bottom panel.

- See `npm run build` results without opening a terminal
- Test results formatted and color-coded
- Lint errors linked to file locations
- Collapsible so it doesn't take up space when not needed

### 6. Template Management

Browse, purchase, and install CC-Marketplace templates without leaving the app.

**Browse:** See all available templates with descriptions, agent counts, and pricing.

**Install:** Download a template ZIP, then drag it into the app or use "Install Template" to extract it into your project's `.claude/` directory.

**Discover:** After installing a template, the app automatically discovers all agents and skills and makes them available in the sidebar and command palette.

### 7. Project Management

- **Open any folder** as a project
- **Recent projects** list for quick switching
- **Auto-detect** installed templates and Claude Code configuration
- **Multiple projects** — switch between projects without restarting

### 8. Onboarding

First-time users see a step-by-step setup guide:

1. **Install Claude Code** — with the exact command to run
2. **Set up API key** — link to Anthropic console
3. **Get a template** — link to claudetemplate.com
4. **Open a project** — start working

No technical knowledge required. Each step has clear instructions and a "Check Again" button to verify completion.

---

## Development Workflows Replicated

CC Desktop replicates every workflow you'd use in a terminal with Claude Code:

### Feature Development

| Step | Terminal | CC Desktop |
|------|----------|-----------|
| Plan | `claude` → `/plan-feature add user login` | Type `/plan-feature add user login` |
| Implement | `claude` → `/implement login page with OAuth` | Type `/implement login page with OAuth` |
| Review | `claude` → `/code-review src/auth/` | Type `/code-review src/auth/` |
| Fix issues | `claude` → `/auto-fix` | Type `/auto-fix` |
| Ship | `claude` → `/ship` | Type `/ship` |

### Code Review Workflow

| Step | Terminal | CC Desktop |
|------|----------|-----------|
| Start review | Type command in terminal | Type in chat |
| See results | Raw text output | Formatted Markdown with severity badges |
| Approve fixes | `y/n` prompts | Visual approve/deny dialogs |
| See file changes | `git diff` in another tab | File tree with change indicators |

### Template Installation

| Step | Terminal | CC Desktop |
|------|----------|-----------|
| Browse | Open browser → claudetemplate.com | Click "Templates" in sidebar |
| Purchase | Checkout on Lemonsqueezy | Same (opens in browser) |
| Download | Download ZIP from email | Same |
| Install | `unzip template.zip -d .claude/` | Drag ZIP into app, or click "Install Template" |
| Verify | `ls .claude/agents/` | Agents appear in sidebar automatically |
| Use | `claude` → `/plan-feature ...` | Type `/plan-feature ...` |

### Git Workflow

| Step | Terminal | CC Desktop |
|------|----------|-----------|
| See changes | `git status` + `git diff` | File tree shows modified files |
| Commit | Claude runs `git commit` (you approve) | Same, with visual permission dialog |
| Push | Claude runs `git push` (you approve) | Same, with visual permission dialog |
| Create PR | Claude runs `gh pr create` (you approve) | Same, with visual permission dialog |

### Debugging

| Step | Terminal | CC Desktop |
|------|----------|-----------|
| Describe bug | Type in terminal | Type in chat |
| See investigation | Raw text | Formatted steps with file references |
| Approve file reads | `y/n` for each file | Visual dialog |
| See fix | Raw diff | Formatted diff with syntax highlighting |
| Run tests | `npm test` output in terminal | Test results in Terminal panel |

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                 CC Desktop                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │           React Frontend               │  │
│  │                                        │  │
│  │  Sidebar │ ChatPanel │ FileTree        │  │
│  │  Input   │ Messages  │ Terminal        │  │
│  │  Commands│ Permissions│ Settings       │  │
│  └──────────────┬─────────────────────────┘  │
│                 │ Tauri IPC                  │
│  ┌──────────────┴─────────────────────────┐  │
│  │           Rust Backend                 │  │
│  │                                        │  │
│  │  • Claude Code process manager         │  │
│  │    - Spawn `claude` CLI                │  │
│  │    - Stream stdout/stderr              │  │
│  │    - Send stdin (user messages)        │  │
│  │    - Handle process lifecycle          │  │
│  │                                        │  │
│  │  • File system watcher                 │  │
│  │    - Watch project directory           │  │
│  │    - Emit change events to frontend    │  │
│  │                                        │  │
│  │  • Template manager                    │  │
│  │    - Extract ZIP to .claude/           │  │
│  │    - Discover agents and skills        │  │
│  │                                        │  │
│  │  • Settings persistence               │  │
│  │    - Theme, font size, recent projects │  │
│  └────────────────────────────────────────┘  │
│                 │                             │
└─────────────────┼────────────────────────────┘
                  │
                  ▼
          Claude Code CLI
        (user's local install)
                  │
                  ▼
          Anthropic API
        (user's own API key)
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Tauri (not Electron) | 10-20x smaller bundle (~10MB vs ~200MB) |
| **Claude Code integration** | Spawn CLI as child process | Respects CC's permission model, always up-to-date |
| **Template source** | claudetemplate.com (CC-Marketplace) | Single source of truth for templates |
| **API keys** | User's own key | No server costs, no middleman, user controls their data |
| **Platform** | macOS first | Primary developer platform, Windows/Linux follow |

### Project Structure

```
CC-Desktop/
├── src-tauri/                   # Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   └── lib.rs               # Commands, state, process management
│   ├── capabilities/
│   │   └── default.json         # Tauri permission capabilities
│   ├── Cargo.toml               # Rust dependencies
│   └── tauri.conf.json          # App configuration
│
├── src/                         # React frontend
│   ├── components/
│   │   ├── chat/                # Chat UI
│   │   │   ├── ChatPanel.tsx    # Main chat view
│   │   │   ├── ChatInput.tsx    # Input with slash command palette
│   │   │   └── MessageBubble.tsx# Message rendering
│   │   ├── sidebar/             # Left sidebar
│   │   │   └── Sidebar.tsx      # Projects, agents, templates, settings
│   │   ├── file-tree/           # File explorer
│   │   │   └── FileTreePanel.tsx# Project file tree
│   │   ├── terminal/            # Terminal output
│   │   │   └── TerminalPanel.tsx# Build/test output
│   │   ├── permissions/         # Permission dialogs
│   │   │   └── PermissionDialog.tsx
│   │   └── settings/            # Settings & onboarding
│   │       └── OnboardingScreen.tsx
│   ├── hooks/                   # React hooks
│   ├── lib/                     # Utilities
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # All type definitions
│   ├── styles/
│   │   └── globals.css          # Global styles + theme variables
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ — [Download](https://nodejs.org/)
- **Rust** — [Install](https://rustup.rs/)
- **Claude Code** — `npm install -g @anthropic-ai/claude-code`
- **Anthropic API key** or Claude Pro/Max subscription

### Development

```bash
# Clone the repo
git clone https://github.com/PingPingE/CC-Desktop.git
cd CC-Desktop

# Install dependencies
npm install

# Run in development mode (opens the app with hot reload)
npm run tauri dev

# Build for production
npm run tauri build
```

### Install a Template

1. Go to [claudetemplate.com](https://claudetemplate.com)
2. Get a template (Free or paid)
3. Download the ZIP
4. In CC Desktop, click "Install Template" and select the ZIP
5. The app extracts it to your project's `.claude/` directory
6. Agents and slash commands appear automatically

---

## Roadmap

### v0.1 (Current) — Foundation
- [x] Project scaffolding (Tauri + React + TypeScript)
- [x] Type definitions for all UI concepts
- [x] Component stubs for all panels
- [x] Rust backend with file system and skill discovery
- [ ] Claude Code CLI process spawning and streaming
- [ ] Full chat UI with Markdown rendering
- [ ] Slash command palette with auto-discovery
- [ ] Permission dialog integration
- [ ] File tree with real-time updates

### v0.2 — Core Experience
- [ ] Template ZIP installer
- [ ] Git status indicators
- [ ] Terminal output panel
- [ ] Dark/light theme with system detection
- [ ] Recent projects persistence
- [ ] Agent activity visualization

### v0.3 — Polish
- [ ] macOS code signing and notarization
- [ ] Auto-update mechanism
- [ ] Keyboard shortcuts
- [ ] Search in chat history
- [ ] Export conversation

### v1.0 — Public Release
- [ ] Windows support
- [ ] Linux support
- [ ] In-app template browser with purchase flow
- [ ] Built-in file editor (basic)
- [ ] Plugin system for custom panels

---

## Related Projects

- **[CC-Marketplace](https://github.com/PingPingE/CC-Marketplace)** — Template marketplace website ([claudetemplate.com](https://claudetemplate.com))
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — The CLI tool that powers everything

---

## License

MIT

---

## Contributing

CC Desktop is open source. Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Open a PR

For questions or feedback, open an issue on GitHub.
