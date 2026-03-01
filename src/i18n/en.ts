import type { TranslationKey } from "./ko";

export const en: Record<TranslationKey, string> = {
  // === Onboarding ===
  "onboarding.welcome.title": "CC Desktop",
  "onboarding.welcome.subtitle": "Use Claude Code without the terminal",
  "onboarding.welcome.desc": "Coding, file editing, and project management through conversation — no development experience required.",
  "onboarding.welcome.start": "Get Started",
  "onboarding.welcome.langLabel": "Language / 언어",

  "onboarding.claudeCode.title": "Install Claude Code",
  "onboarding.claudeCode.desc": "CC Desktop works through Claude Code.",
  "onboarding.claudeCode.checking": "Checking Claude Code...",
  "onboarding.claudeCode.installed": "Claude Code installed",
  "onboarding.claudeCode.notInstalled": "Claude Code is not installed.",
  "onboarding.claudeCode.autoInstall": "Auto Install",
  "onboarding.claudeCode.manualHint": "Manual install:",
  "onboarding.claudeCode.installing": "Installing...",
  "onboarding.claudeCode.installFailed": "Installation failed",
  "onboarding.claudeCode.installError": "Installation failed.",
  "onboarding.claudeCode.retry": "Retry",
  "onboarding.claudeCode.manualGuide": "Manual install guide",
  "onboarding.claudeCode.next": "Next",

  "onboarding.login.title": "Claude Account Login",
  "onboarding.login.desc": "CC Desktop will automatically open your browser to sign in on first use.",
  "onboarding.login.step1": "Sending your first message will open the browser",
  "onboarding.login.step2": "Sign in with your Claude account",
  "onboarding.login.step3": "After signing in, return to CC Desktop",
  "onboarding.login.note": "Note:",
  "onboarding.login.noteText": "A Claude Pro, Max, or Team subscription is required.",
  "onboarding.login.checkSubscription": "Check subscription",
  "onboarding.login.next": "Next",

  "onboarding.project.title": "Choose a Project",
  "onboarding.project.desc": "Open an existing project folder, or create a new one.",
  "onboarding.project.openFolder": "Open existing folder",
  "onboarding.project.openFolderDesc": "Select an existing project folder",
  "onboarding.project.createNew": "Create new project",
  "onboarding.project.createNewDesc": "Create a new empty project",
  "onboarding.project.namePlaceholder": "Project name (e.g. my-app)",
  "onboarding.project.cancel": "Cancel",
  "onboarding.project.create": "Create",
  "onboarding.project.dialogTitle": "Select project folder",

  "onboarding.skip": "Skip",
  "onboarding.back": "Back",

  // === Header ===
  "header.noProject": "No project open",
  "header.status.idle": "Ready",
  "header.status.starting": "Starting...",
  "header.status.running": "Working...",
  "header.status.waiting_permission": "Waiting",
  "header.status.error": "Error",
  "header.status.stopped": "Stopped",
  "header.autoApprove.on": "Auto",
  "header.autoApprove.off": "Ask",
  "header.autoApprove.onTitle": "Auto-approve ON: Claude works freely without asking permission",
  "header.autoApprove.offTitle": "Auto-approve OFF: Claude asks before each action",
  "header.switch": "Switch",
  "header.open": "Open",
  "header.settings": "Settings",

  // === Chat ===
  "chat.welcome.withProject.title": "What do you want to build?",
  "chat.welcome.withProject.subtitle": "Type a message below, or try a command:",
  "chat.welcome.withProject.noSkills": "No skills found in this project. Type a message and Claude will help you directly.",
  "chat.welcome.withProject.getSkills": "Browse skill templates",
  "chat.welcome.noProject.title": "Welcome to CC Desktop",
  "chat.welcome.noProject.subtitle": "Start something new, or continue where you left off.",
  "chat.welcome.noProject.createNew": "Start a new project",
  "chat.welcome.noProject.createNewDesc": "Create a folder and start building from scratch",
  "chat.welcome.noProject.openExisting": "Open existing folder",
  "chat.welcome.noProject.openExistingDesc": "I already have a project folder",
  "chat.welcome.noProject.createLabel": "What are you building?",
  "chat.welcome.noProject.createPlaceholder": 'e.g. "My Portfolio Website"',
  "chat.welcome.noProject.createHint": "A folder will be created at ~/Documents/CC-Projects/",
  "chat.welcome.noProject.cancel": "Cancel",
  "chat.welcome.noProject.createAndStart": "Create & Start",
  "chat.welcome.noProject.recent": "Recent",

  // === Chat Input ===
  "chatInput.placeholder.working": "Claude is working...",
  "chatInput.placeholder.noProject": "Open a project to start",
  "chatInput.placeholder.ready": 'Type a message or "/" for commands...',
  "chatInput.send": "Send",
  "chatInput.stop": "Stop",
  "chatInput.hint.working": "Claude is working... press Stop to interrupt",
  "chatInput.hint.ready": "Enter to send, Shift+Enter for new line, / for commands",
  "chatInput.clearChat": "Clear chat",

  // === Message ===
  "message.retry": "Retry",
  "message.copy": "Copy",
  "message.copied": "Copied!",
  "message.thinking": "Claude is thinking...",
  "message.thinkingElapsed": "Working for {seconds}s...",
  "message.thinkingLong": "This is taking a moment. It might be a complex task.",
  "message.toolWaiting": "Waiting for approval...",

  // === Activity ===
  "activity.working": "Claude is working...",
  "activity.responding": "Claude is responding...",
  "activity.error": "Something went wrong. Try again.",
  "activity.stopped": "Stopped.",
  "activity.ready": "Ready",
  "activity.stop": "Stop",

  // === Settings ===
  "settings.title": "Settings",
  "settings.appearance": "Appearance",
  "settings.theme": "Theme",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.language": "Language",
  "settings.language.ko": "한국어",
  "settings.language.en": "English",
  "settings.about": "About",
  "settings.aboutDesc": "Desktop GUI for Claude Code",
  "settings.data": "Data",
  "settings.clearData": "Clear All Data",
  "settings.clearConfirm": "Clear all chat history and recent projects?",
  "settings.replayOnboarding": "Replay Onboarding",

  // === Team Panel ===
  "team.title": "Team",
  "team.agents": "Agents",
  "team.skills": "Skills",

  // === Project Bar ===
  "projectBar.noTeam": "No team",
  "projectBar.team": "{agents} agents, {skills} skills",

  // === Permission ===
  "permission.title": "Permission Required",
  "permission.command": "Command",
  "permission.file": "File",
  "permission.deny": "Deny",
  "permission.approve": "Approve",

  // === Loading ===
  "loading.starting": "Starting CC Desktop...",
};
