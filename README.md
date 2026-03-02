# CC Desktop

A desktop GUI wrapper for [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI.
Instead of running `claude` in a terminal, you get a chat UI that does the same thing.

> **Note:** Claude Code CLI must be installed first. CC Desktop is a wrapper, not a replacement.

**Stack:** [Tauri v2](https://tauri.app/) (Rust) + React 19 + TypeScript + Tailwind CSS v4 + Vite 6

---

## Install

### 1. Install Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
```

Make sure `claude` works in your terminal first. Your existing API key, settings, and projects carry over automatically.

### 2. Build CC Desktop

```bash
git clone https://github.com/PingPingE/CC-Desktop.git
cd CC-Desktop
npm install
npx tauri dev          # Development mode (localhost:1420)
npx tauri build        # Production build
```

> Requires [Rust toolchain](https://rustup.rs/).

### 3. Usage

1. Launch CC Desktop
2. Select a project folder
3. Type in the chat — Claude Code responds with formatted Markdown
4. Type `/` to browse available slash commands from your project

---

## What's Working

- **Chat UI** — Markdown rendering, syntax highlighting, streaming responses
- **Slash commands** — Auto-discovered from `.claude/skills/`, command palette
- **Agent/skill panel** — Parses and displays `.claude/agents/` and `.claude/skills/` YAML
- **Permission management** — Visual approve/deny dialog for tool execution, auto-approve toggle
- **Project management** — Folder selection, recent projects (up to 5), auto-analysis
- **i18n** — Korean / English
- **Onboarding** — First-run setup flow

## Not Yet Implemented

- File tree with live change indicators
- Terminal output panel
- Remote session connection
- Template installer UI
- Windows / Linux testing
- Code signing and auto-update

---

## Architecture

```
CC Desktop
├── src-tauri/          # Rust backend
│   └── src/lib.rs      # CLI process management, filesystem, Tauri commands
├── src/                # React frontend
│   ├── components/     # UI components
│   ├── stores/         # State management
│   ├── lib/            # Utilities
│   └── styles/         # Tailwind CSS + custom properties
└── Claude Code CLI     # Does the actual AI work
```

The Rust backend spawns the `claude` CLI process and streams stdout/stderr to the frontend.

---

## Related

- [CC-Marketplace](https://github.com/PingPingE/CC-Marketplace) — Claude Code template marketplace ([claudetemplate.com](https://claudetemplate.com))
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) — The CLI tool that CC Desktop wraps

## Contributing

Fork → feature branch → PR

## License

MIT
