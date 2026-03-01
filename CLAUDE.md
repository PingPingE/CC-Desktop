# CC Desktop

Desktop GUI for Claude Code — wraps the CLI with orchestration awareness.

## Quick Reference

| What | Where |
|------|-------|
| **Stack** | Tauri v2 (Rust 1.93.1) + React 19 + TypeScript + Vite 6 |
| **Backend** | `src-tauri/src/lib.rs` — all Rust commands |
| **Frontend** | `src/` — React components, styles, types |
| **Styles** | `src/styles/globals.css` — single CSS file (no Tailwind) |
| **Types** | `src/types/index.ts` |
| **Icons** | `src-tauri/icons/` — all platform sizes |
| **Docs** | `docs/POSITIONING.md` — competitive analysis & roadmap |
| **Companion** | [claudetemplate.com](https://claudetemplate.com) (CC-Marketplace) |

## Commands

```bash
source ~/.cargo/env   # Ensure Rust in PATH
npm install           # Install frontend deps
npx tauri dev         # Dev mode (port 1420)
npx tauri build       # Build distributable
```

## Development Workflow: Research → Plan → Develop → Feedback → Improve

Every non-trivial change MUST follow this loop:

### 1. Research (before writing any code)
- Analyze the current state of the feature area
- Check how competitors handle it (Opcode, Cline, Cursor)
- Read relevant docs (Tauri, Claude Code, React)
- Document findings before proceeding

### 2. Plan (before writing any code)
- Define exactly what will change and why
- List affected files
- Consider edge cases and cross-platform implications
- Get user approval on the approach

### 3. Develop (implementation)
- Implement the agreed plan
- Follow the architecture patterns below
- Test on dev server after each change

### 4. Feedback (after each change)
- Launch `npx tauri dev` and verify visually
- Test the happy path AND error cases
- Check cross-platform implications (even if only building on macOS)

### 5. Improve (iterate minimum 5 times)
- Each change gets at least 5 improvement passes
- Fix issues found in feedback
- Polish UI, error messages, edge cases
- Only move on when the feature is solid

## Architecture

### Rust Backend (`src-tauri/src/lib.rs`)
- `AppState` — holds current project dir in `Mutex<Option<String>>`
- All commands are `#[tauri::command]` functions
- Cross-platform: use `cfg(target_os)` for OS-specific code
- PATH resolution: login shell on Unix, system PATH on Windows
- CLI spawning: `env_clear()` + safe vars only (strip CLAUDECODE vars)

### React Frontend (`src/`)
- Active components: `chat/`, `header/`, `project/`, `activity/`
- Unused (to be cleaned): `agents/`, `git/`, `memory/`, `tasks/`, `templates/`, `terminal/`, `team/`, `remote/`, `sidebar/`
- Event system: Tauri `listen()` for `claude-output` and `claude-done`

### Key Patterns
- Project selection → `set_project_dir` → `analyze_project` → show ProjectBar
- Chat message → `run_claude_prompt` → stream via events → display in chat
- Recent projects in localStorage (max 5)
- WelcomeScreen handles: no project, existing project, new project creation

## Gotchas

- Tauri GUI apps don't inherit terminal PATH → resolve from login shell
- CLAUDECODE env var causes nested session error → strip before spawning
- Dev server port 1420 persists → `lsof -ti:1420 | xargs kill -9` before relaunch
- macOS title bar drag: `-webkit-app-region: drag` on header
- Windows paths: normalize `\` to `/` for frontend display
- Cross-platform is mandatory — every file change must consider Mac/Win/Linux

## Code Style

- TypeScript strict — no `any`
- CSS in globals.css — no CSS modules, no Tailwind
- Rust: standard formatting, meaningful error messages
- Component files: one component per file, named export
