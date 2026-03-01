# CC Desktop — Positioning Analysis & Development Plan

## 1. Competitive Landscape

### 1.1 Direct Competitors (Claude Code GUI Wrappers)

| Product | Stack | Stars | License | Key Features | Weakness |
|---------|-------|-------|---------|-------------|----------|
| **Opcode** (fka Claudia) | Tauri + React | 20K+ | AGPL-3.0 | Multi-model, file explorer, terminal, extensions | Generic AI IDE — no orchestration awareness |
| **Cline** | VS Code ext | 58K+ | Apache-2.0 | In-editor, auto-approve, multi-model | Locked into VS Code — not standalone |
| **Claude Code Desktop** | Electron? | N/A | Anthropic | Live preview, code review, CI tracking | Anthropic's own — we can't compete head-on |

### 1.2 Indirect Competitors (AI Coding Tools)

| Product | Category | Pricing | Key Differentiator |
|---------|----------|---------|-------------------|
| **Cursor** | AI IDE | $20/mo | Full IDE with AI built in, $9B valuation |
| **Windsurf** | AI IDE | $15/mo | Cascade (multi-step agent), memory |
| **Continue.dev** | IDE ext | Free/OSS | Multi-model, extensible |
| **Aider** | CLI tool | Free/OSS | Git-native, terminal-based |
| **Copilot Workspace** | GitHub | $10/mo | Issue → spec → plan → code pipeline |
| **Replit Agent** | Cloud IDE | $25/mo | Full deploy from chat |

### 1.3 Adjacent Products

| Product | Relationship | Notes |
|---------|-------------|-------|
| **claude.ai** | Anthropic's web chat | Artifacts, Projects, built-in code — but no local file access |
| **Claude Cowork** | Anthropic's desktop | For non-devs (Jan 2026) — computer use, not code |
| **Claude Code CLI** | Our foundation | Terminal-based, powerful but intimidating |

## 2. Positioning Analysis

### 2.1 Where We CANNOT Win

- **IDE replacement** — Cursor/Windsurf have years of head start, massive funding
- **Generic AI chat** — claude.ai already does this better
- **Multi-model support** — Opcode/Cline/Continue already support GPT/Gemini/etc
- **VS Code integration** — Cline/Continue own this space
- **Raw feature count** — Opcode has extensions, terminal, multi-tab, etc

### 2.2 Where We CAN Win

**CC Desktop's unique position: The only Claude Code GUI that understands orchestration.**

Every competitor treats Claude as a single-model chat. None of them understand:
- Agent teams (`.claude/agents/`)
- Skills (`.claude/skills/`)
- Hooks (`.claude/hooks/`)
- Multi-agent orchestration patterns
- Template-based team deployment

This is our moat. Nobody else does this.

### 2.3 Unique Value Proposition

```
CC Desktop = Claude Code + Team Orchestration GUI + Template Marketplace

"Your AI dev team, managed for you."
```

**For non-technical users**: Type in your language → CC Desktop routes to the right agent → results come back formatted
**For developers**: One-click team setup → pre-built agent teams from claudetemplate.com → visual orchestration
**For teams**: Shared configurations → consistent workflows → no "did you set up your agents?" problems

## 3. Differentiation Matrix

| Feature | claude.ai | Opcode | Cline | CC Desktop |
|---------|-----------|--------|-------|------------|
| Local file access | No | Yes | Yes | Yes |
| Agent team awareness | No | No | No | **Yes** |
| Skill auto-discovery | No | No | No | **Yes** |
| Template marketplace | No | No | No | **Yes** |
| One-click team setup | No | No | No | **Planned** |
| Smart routing (intent → agent) | No | No | No | **Planned** |
| Work visualization | No | No | No | **Planned** |
| Auto-architecture management | No | No | No | **Planned** |
| Cross-platform | Web | Yes | VS Code | Yes |
| Multi-model | No | Yes | Yes | No (Claude only) |
| No terminal needed | Yes | Yes | VS Code | Yes |

## 4. Target Users

### Primary: Template Buyers (claudetemplate.com customers)
- Bought a template → don't know how to set it up
- CC Desktop auto-deploys templates and provides visual access to agents/skills
- **Conversion path**: claudetemplate.com → buy template → download CC Desktop → import template → start working

### Secondary: Developers Who Don't Want Terminal
- Know coding but prefer GUI
- Want Claude Code power without `claude -p` and YAML editing
- **Conversion path**: hear about Claude Code → scared of terminal → find CC Desktop → start using

### Tertiary: Non-Technical Project Managers / Founders
- Have a project idea → want to build it with AI
- Don't know Git, terminal, or code structure
- **Conversion path**: "build my app with AI" search → CC Desktop → create project → type requirements in chat

## 5. Development Roadmap

### Phase 1: Foundation Polish (Current → v0.2)
**Goal**: Ship what we have in a stable, polished state

| Priority | Feature | Status | Effort |
|----------|---------|--------|--------|
| P0 | Stop/interrupt running process | TODO | Small |
| P0 | Markdown rendering in chat bubbles | TODO | Medium |
| P0 | Code syntax highlighting in responses | TODO | Medium |
| P0 | Clean up unused components (19 dirs → ~6 active) | TODO | Small |
| P1 | Error recovery (retry, reconnect) | TODO | Small |
| P1 | Chat history persistence (localStorage) | TODO | Medium |
| P1 | Settings panel (theme, font size, API key) | TODO | Medium |

### Phase 2: Orchestration Awareness (v0.3) ← CORE DIFFERENTIATOR
**Goal**: CC Desktop understands and manages Claude Code teams

| Priority | Feature | Description | Effort |
|----------|---------|-------------|--------|
| P0 | Agent/Skill panel | Show discovered agents & skills with descriptions | Medium |
| P0 | Slash command palette | Type `/` → see available skills → click to run | Medium |
| P0 | Agent activity indicator | "PM is planning..." "Developer is coding..." | Medium |
| P1 | Smart routing | Analyze user message → auto-select best agent | Large |
| P1 | Template import wizard | Drag ZIP → extract to .claude/ → ready to use | Medium |
| P2 | One-click team setup | "Set up a dev team for this project" → installs template | Large |

### Phase 3: Visual Intelligence (v0.4)
**Goal**: Show users what Claude Code is actually doing

| Priority | Feature | Description | Effort |
|----------|---------|-------------|--------|
| P0 | File change preview | Show which files were created/modified/deleted | Medium |
| P0 | Diff viewer | Before/after view of code changes | Large |
| P1 | Work timeline | Visual log of all agent actions | Medium |
| P1 | Git integration | Commit messages, branch status, push from UI | Medium |
| P2 | Live preview | Iframe preview for web projects (like Claude Code Desktop) | Large |

### Phase 4: Marketplace Integration (v0.5)
**Goal**: Tight loop between CC Desktop and claudetemplate.com

| Priority | Feature | Description | Effort |
|----------|---------|-------------|--------|
| P0 | Template browser | Browse claudetemplate.com catalog from within the app | Large |
| P0 | One-click install | Buy → download → install → ready, all in-app | Large |
| P1 | Template recommendations | "Your React project would benefit from UX Review Team" | Medium |
| P1 | Team status dashboard | "Your team: 4 agents, 5 skills — all active" | Small |
| P2 | Custom template builder | Create your own agent teams from UI | Large |

### Phase 5: Collaboration & Polish (v1.0)
**Goal**: Production-ready release

| Priority | Feature | Description | Effort |
|----------|---------|-------------|--------|
| P0 | Auto-updater | Tauri updater plugin | Medium |
| P0 | Installer packages | .dmg (macOS), .msi (Win), .AppImage (Linux) | Medium |
| P1 | Onboarding tour | First-time user walkthrough | Medium |
| P1 | i18n | Korean + English at minimum | Medium |
| P2 | Project templates | "Start a Next.js project" → scaffold + team setup | Large |

## 6. Critical Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| GitHub stars | 1K in 3 months | GitHub API |
| Daily active users | 100 in 3 months | Opt-in analytics |
| Template attach rate | 40% of CC Desktop users buy a template | LS + analytics |
| Retention (7-day) | 30%+ | Analytics |
| Time to first prompt | < 60 seconds from launch | User testing |

## 7. Competitive Strategy Summary

### vs Opcode
- They're a generic AI IDE. We're a Claude Code orchestration tool.
- They support multiple models — we go deep on Claude Code's unique features (agents, skills, hooks).
- Their AGPL license limits commercial use. We're more flexible.
- **Our pitch**: "Opcode is ChatGPT in a window. CC Desktop is your AI dev team."

### vs Cline
- They're a VS Code extension. We're standalone.
- They require VS Code knowledge. We require nothing.
- **Our pitch**: "Cline is for developers who live in VS Code. CC Desktop is for everyone."

### vs claude.ai
- They can't access local files. We can.
- They don't have agents/skills/hooks. We orchestrate them.
- **Our pitch**: "claude.ai is a chatbot. CC Desktop is a project partner."

### vs Cursor/Windsurf
- They're full IDEs ($20/mo+). We're a focused tool (free).
- They replace your editor. We enhance Claude Code.
- **Our pitch**: "Cursor replaces your IDE. CC Desktop supercharges your workflow."

## 8. Non-Goals (What We Will NOT Build)

- Multi-model support (GPT, Gemini, etc) — we are Claude-only by design
- Full IDE features (code editor, debugger, extensions) — use your own IDE
- Cloud hosting / deployment — use Vercel/Netlify/etc
- Code generation without Claude Code — we are a GUI, not an AI engine
- Mobile app — desktop only
