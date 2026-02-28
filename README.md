# CC Desktop

A desktop application that brings Claude Code to everyone — no terminal required.

CC Desktop wraps [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with a friendly chat UI, so you can use powerful AI-driven development workflows without ever opening a terminal or IDE.

**For everyone** — works with any Claude Code project. No templates required. (Templates from [claudetemplate.com](https://claudetemplate.com) are optional power-ups.)

**Built with:** [Tauri](https://tauri.app/) (Rust) + React + TypeScript

---

## Getting Started

### 1. Install Prerequisites

```bash
# Install Claude Code (if you haven't already)
npm install -g @anthropic-ai/claude-code

# That's it. CC Desktop handles everything else.
```

> CC Desktop is a visual wrapper around Claude Code. If Claude Code works in your terminal, it works in CC Desktop. Your existing API key, settings, and projects carry over automatically.

### 2. Install CC Desktop

```bash
# Clone and build from source
git clone https://github.com/PingPingE/CC-Desktop.git
cd CC-Desktop
npm install
npm run tauri dev      # Development mode
npm run tauri build    # Build .dmg for macOS
```

### 3. Open a Project and Start

1. Launch CC Desktop
2. Click **"Open Project Folder"** — pick any folder
3. Start typing in the chat — Claude Code responds with formatted Markdown
4. Type `/` to see available slash commands (auto-discovered from your project)

**Already have templates installed?** CC Desktop auto-discovers agents and skills from `.claude/` in your project.

**Don't have templates?** No problem — CC Desktop works with plain Claude Code too. Templates just add pre-built agent teams.

---

## Why CC Desktop?

Claude Code is incredibly powerful — it can plan features, write code, review for security issues, refactor, run tests, and manage git — all through natural language. But it runs in a terminal, which means:

- Non-technical team members can't use it
- Setting up templates requires ZIP extraction and directory management
- There's no visual feedback on what's happening
- Permission approvals happen in raw text

**CC Desktop solves all of this.**

| Without CC Desktop | With CC Desktop |
|---|---|
| Open terminal | Open app |
| `cd ~/projects/my-app` | Click "Open Project" |
| `claude` | Already connected |
| Type `/plan-feature add login` | Type or click `/plan-feature` |
| Read raw text output | Formatted Markdown with syntax highlighting |
| `y/n` permission prompts | Visual approve/deny dialog (or auto-approve) |
| `git diff` in another terminal tab | File tree with change indicators |
| Can't see which agent is working | Agent Activity tab shows the full team |

---

## Features

### 1. Chat Interface

The main interaction with Claude Code, reimagined as a chat UI.

```
┌─────────────────────────────────────────────────────────┐
│  CC Desktop                              ● Ready        │
├──────────┬──────────────────────────────────┬───────────┤
│          │                                  │           │
│  Projects│   assistant                      │  Team     │
│  --------│   I'll plan the login feature.   │  -------  │
│  > my-app│   Here are the tasks:            │  PM       │
│    blog  │                                  │  dev      │
│          │   1. Create auth middleware      │  tester   │
│  Team    │   2. Build login page            │  ux       │
│  --------│   3. Add session management      │           │
│  PM      │   4. Write tests                 │  Skills   │
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

Type `/` to see all available commands, auto-discovered from your project.

| Command | What it does |
|---------|-------------|
| `/plan-feature <description>` | Break a feature into prioritized tasks |
| `/implement <description>` | Quick code implementation |
| `/code-review <target>` | Security + quality audit |
| `/refactor <target>` | Improve code structure without changing behavior |
| `/auto-fix` | Automatically fix build/lint/type errors |
| `/ship` | Full pre-ship verification (build + lint + types + tests) |

Commands come from `.claude/skills/` in your project. Install different templates to get different commands, or create your own.

### 3. Permission Management & Auto-Approve Mode

When Claude Code needs to run a command or edit a file, you get a **visual dialog**:

```
┌─────────────────────────────────────┐
│  Permission Required                │
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

#### Auto-Approve Mode

Don't want to click "Approve" every time? Toggle **Auto-Approve Mode** in Settings.

| Mode | What happens | Best for |
|------|-------------|----------|
| **Ask Every Time** (default) | You approve each action individually | Learning, reviewing unfamiliar code |
| **Auto-Approve Safe Actions** | File reads and searches run automatically, edits/commands ask | Daily development |
| **Auto-Approve Everything** | All actions run without asking | Trusted projects, fast iteration |

> "Auto-Approve Everything" is the equivalent of Claude Code's `--dangerously-skip-permissions` flag. Use it when you trust the project and want maximum speed. You can always switch back.

### 4. Team View

See your full agent team at a glance — who's on the team, what each agent does, and which model powers them.

```
┌─────────────────────────────────────┐
│  Team Composition                   │
├─────────────────────────────────────┤
│                                     │
│  product-manager          opus      │
│  Plans features, breaks into tasks  │
│                                     │
│  draft-developer          sonnet    │
│  Fast implementation, first pass    │
│                                     │
│  advanced-developer       opus      │
│  Security review, code hardening    │
│                                     │
│  tester                   sonnet    │
│  Test planning and QA               │
│                                     │
│  ux-designer              sonnet    │
│  UX review and accessibility        │
│                                     │
│  Skills: 5 available                │
│  /plan-feature /implement           │
│  /code-review /refactor /ship       │
│                                     │
└─────────────────────────────────────┘
```

- See all agents with their roles, models, and descriptions
- See all available skills (slash commands)
- Parsed directly from `.claude/agents/` and `.claude/skills/` YAML frontmatter
- Works with any template or custom agent setup
- Shows "No team configured" if using plain Claude Code (still works fine without agents)

### 5. Remote Control

Control Claude Code sessions on remote machines from your desktop.

| Use case | How it works |
|----------|-------------|
| **Server development** | Connect to a cloud VM running Claude Code |
| **Team collaboration** | Share a session link with teammates |
| **Mobile monitoring** | Check progress from your phone (future) |

- Connect via SSH tunnel or direct URL
- See the same chat UI as local sessions
- Full permission control — approve/deny from your desktop
- Session persistence — reconnect without losing context

### 6. File Tree

Real-time view of your project structure, updated live as Claude creates and modifies files.

- See new files appear as Claude creates them
- Modified files are highlighted
- Navigate your project without switching to Finder/Explorer
- Read-only in MVP (full editor planned for v2)

### 7. Terminal Output

Build results, test output, and command output appear in the bottom panel.

- See `npm run build` results without opening a terminal
- Test results formatted and color-coded
- Lint errors linked to file locations
- Collapsible so it doesn't take up space when not needed

### 8. Template Management (Optional)

Browse, purchase, and install CC-Marketplace templates — or use your own.

**CC Desktop works without any templates.** Templates are optional add-ons that give you pre-built agent teams:

- **Browse** — See available templates from [claudetemplate.com](https://claudetemplate.com)
- **Install** — Drag a template ZIP into the app, or click "Install Template"
- **Discover** — After installing, agents and skills appear in the Team tab automatically

### 9. Project Management

- **Open any folder** as a project
- **Recent projects** list for quick switching
- **Auto-detect** installed templates and Claude Code configuration
- **Multiple projects** — switch between projects without restarting

---

## Who Is This For?

CC Desktop is for **everyone who uses Claude Code** — or wants to.

| User | Why CC Desktop |
|------|---------------|
| **Non-technical users** | Use Claude Code without learning terminal commands |
| **Developers** | Faster workflow with visual permission dialogs and file tree |
| **Team leads** | See team composition, share sessions via remote control |
| **Template users** | Auto-discover agents/skills, easy template installation |
| **Plain Claude Code users** | Better UI, same power — no templates needed |

---

## Development Workflows

CC Desktop replicates every workflow you'd use in a terminal:

### Feature Development

```
You:     /plan-feature add user login with OAuth
         ↓
PM:      Creates 5 tasks with priorities and dependencies
         ↓
You:     /implement task 1: create auth middleware
         ↓
Dev:     Writes code, creates files (visible in File Tree)
         ↓
You:     /code-review src/auth/
         ↓
Reviewer: Finds 2 security issues, suggests fixes
         ↓
You:     /ship
         ↓
Tester:  Runs build + lint + types + tests → all green
```

### Template Installation

| Step | CC Desktop |
|------|-----------|
| Browse | Click "Templates" in sidebar |
| Purchase | Opens checkout in browser |
| Install | Drag ZIP into app → auto-extracts to `.claude/` |
| Verify | Agents appear in Team tab |
| Use | Type `/plan-feature ...` |

---

## Architecture

```
┌──────────────────────────────────────────────┐
│                 CC Desktop                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │           React Frontend               │  │
│  │                                        │  │
│  │  Sidebar │ ChatPanel │ TeamView        │  │
│  │  Input   │ Messages  │ FileTree        │  │
│  │  Commands│ Permissions│ Terminal       │  │
│  │  Settings│ AutoApprove│ Remote         │  │
│  └──────────────┬─────────────────────────┘  │
│                 │ Tauri IPC                  │
│  ┌──────────────┴─────────────────────────┐  │
│  │           Rust Backend                 │  │
│  │                                        │  │
│  │  • Claude Code process manager         │  │
│  │    - Spawn local `claude` CLI          │  │
│  │    - Connect to remote sessions        │  │
│  │    - Stream stdout/stderr              │  │
│  │    - Auto-approve mode                 │  │
│  │                                        │  │
│  │  • File system watcher                 │  │
│  │  • Template ZIP extractor              │  │
│  │  • Agent/skill frontmatter parser      │  │
│  │  • Settings persistence               │  │
│  └────────────────────────────────────────┘  │
│                 │                             │
└─────────────────┼────────────────────────────┘
                  │
          Claude Code CLI
        (user's local install — already has API key configured)
```

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
│   │   ├── chat/                # Chat UI + slash command palette
│   │   ├── sidebar/             # Projects, team, templates, settings
│   │   ├── file-tree/           # Project file tree
│   │   ├── terminal/            # Build/test output
│   │   ├── permissions/         # Permission dialogs + auto-approve
│   │   ├── team/                # Team composition view
│   │   ├── remote/              # Remote session management
│   │   └── settings/            # Settings + onboarding
│   ├── hooks/                   # React hooks
│   ├── lib/                     # Utilities
│   ├── types/                   # TypeScript types
│   ├── styles/                  # CSS with theme variables
│   ├── App.tsx                  # Root component
│   └── main.tsx                 # Entry point
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Roadmap

### v0.1 — Foundation (Current)
- [x] Project scaffolding (Tauri + React + TypeScript)
- [x] Type definitions for all UI concepts
- [x] Component stubs for all panels
- [x] Rust backend with file system and skill discovery
- [ ] Claude Code CLI process spawning and streaming
- [ ] Full chat UI with Markdown rendering
- [ ] Slash command palette with auto-discovery
- [ ] Permission dialog + auto-approve toggle
- [ ] File tree with real-time updates
- [ ] Team composition view

### v0.2 — Core Experience
- [ ] Template ZIP installer (drag-and-drop)
- [ ] Git status indicators in file tree
- [ ] Terminal output panel
- [ ] Agent frontmatter parser (model, description, tools)
- [ ] Dark/light theme with system detection
- [ ] Recent projects persistence

### v0.3 — Remote & Polish
- [ ] Remote session connection (SSH tunnel)
- [ ] macOS code signing and notarization
- [ ] Auto-update mechanism
- [ ] Keyboard shortcuts
- [ ] Search in chat history

### v1.0 — Public Release
- [ ] Windows + Linux support
- [ ] In-app template browser
- [ ] Built-in file editor (basic)
- [ ] Session sharing (remote control link)
- [ ] Plugin system

---

## Related Projects

- **[CC-Marketplace](https://github.com/PingPingE/CC-Marketplace)** — Template marketplace website ([claudetemplate.com](https://claudetemplate.com))
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — The CLI tool that CC Desktop wraps

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
