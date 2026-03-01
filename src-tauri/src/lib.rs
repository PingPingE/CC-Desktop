use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};

#[cfg(not(target_os = "windows"))]
extern crate libc;

/// Represents a message in the chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub agent: Option<String>,
    pub timestamp: u64,
}

/// Project state managed by the app
pub struct AppState {
    pub project_dir: Mutex<Option<String>>,
    pub child_pid: Mutex<Option<u32>>,
}

// =============================================================================
// Cross-platform helpers
// =============================================================================

/// Get the user's home directory (works on macOS, Linux, Windows)
fn home_dir() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("USERPROFILE").ok().map(PathBuf::from)
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME").ok().map(PathBuf::from)
    }
}

/// Resolve the full PATH including user shell paths.
/// GUI apps on macOS/Linux don't inherit terminal PATH.
/// Windows generally does inherit PATH from the system.
fn resolve_full_path() -> String {
    #[cfg(target_os = "windows")]
    {
        // Windows GUI apps inherit system PATH — just use it + common npm paths
        let current = std::env::var("PATH").unwrap_or_default();
        if let Some(home) = home_dir() {
            let appdata = std::env::var("APPDATA").unwrap_or_default();
            format!(
                "{};{};{}",
                home.join("AppData\\Roaming\\npm").display(),
                appdata,
                current
            )
        } else {
            current
        }
    }
    #[cfg(target_os = "macos")]
    {
        // macOS: load from login shell (zsh default since Catalina)
        for shell in ["/bin/zsh", "/bin/bash"] {
            if let Ok(output) = std::process::Command::new(shell)
                .args(["-l", "-c", "echo $PATH"])
                .output()
            {
                if output.status.success() {
                    let shell_path = String::from_utf8_lossy(&output.stdout).trim().to_string();
                    if !shell_path.is_empty() {
                        return shell_path;
                    }
                }
            }
        }
        // Fallback
        let current = std::env::var("PATH").unwrap_or_default();
        if let Some(home) = home_dir() {
            format!(
                "{}:{}:{}:/usr/local/bin:/opt/homebrew/bin:{}",
                home.join(".local/bin").display(),
                home.join(".cargo/bin").display(),
                home.join(".nvm/versions/node").display(), // nvm common path
                current
            )
        } else {
            current
        }
    }
    #[cfg(target_os = "linux")]
    {
        // Linux: load from login shell (bash default on most distros)
        for shell in ["/bin/bash", "/bin/zsh", "/bin/sh"] {
            if Path::new(shell).exists() {
                if let Ok(output) = std::process::Command::new(shell)
                    .args(["-l", "-c", "echo $PATH"])
                    .output()
                {
                    if output.status.success() {
                        let shell_path =
                            String::from_utf8_lossy(&output.stdout).trim().to_string();
                        if !shell_path.is_empty() {
                            return shell_path;
                        }
                    }
                }
            }
        }
        // Fallback
        let current = std::env::var("PATH").unwrap_or_default();
        if let Some(home) = home_dir() {
            format!(
                "{}:{}:/usr/local/bin:{}",
                home.join(".local/bin").display(),
                home.join(".cargo/bin").display(),
                current
            )
        } else {
            current
        }
    }
}

/// Find the claude binary path (cross-platform)
fn find_claude_binary() -> Option<String> {
    let full_path = resolve_full_path();

    #[cfg(target_os = "windows")]
    let separator = ';';
    #[cfg(not(target_os = "windows"))]
    let separator = ':';

    // Binary names to search for
    #[cfg(target_os = "windows")]
    let candidates = ["claude.exe", "claude.cmd", "claude.ps1", "claude"];
    #[cfg(not(target_os = "windows"))]
    let candidates = ["claude"];

    for dir in full_path.split(separator) {
        let dir_path = Path::new(dir);
        for bin_name in &candidates {
            let candidate = dir_path.join(bin_name);
            if candidate.exists() {
                return Some(candidate.to_string_lossy().to_string());
            }
        }
    }
    None
}

/// Get the default projects base directory
fn projects_base_dir() -> Result<PathBuf, String> {
    let home = home_dir().ok_or("Cannot find home directory")?;
    Ok(home.join("Documents").join("CC-Projects"))
}

// =============================================================================
// Tauri commands
// =============================================================================

/// Check if Claude Code CLI is available
#[tauri::command]
fn check_claude_code() -> Result<bool, String> {
    Ok(find_claude_binary().is_some())
}

/// Get the current project directory
#[tauri::command]
fn get_project_dir(state: State<AppState>) -> Option<String> {
    state.project_dir.lock().unwrap().clone()
}

/// Set the current project directory
#[tauri::command]
fn set_project_dir(state: State<AppState>, path: String) -> Result<(), String> {
    let metadata = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    if !metadata.is_dir() {
        return Err("Path is not a directory".to_string());
    }
    *state.project_dir.lock().unwrap() = Some(path);
    Ok(())
}

/// Create a new project directory
#[tauri::command]
fn create_project(state: State<AppState>, name: String) -> Result<String, String> {
    let base = projects_base_dir()?;
    std::fs::create_dir_all(&base).map_err(|e| e.to_string())?;

    // Sanitize name: lowercase, replace spaces with hyphens, remove special chars
    let slug: String = name
        .to_lowercase()
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' {
                c
            } else if c == ' ' {
                '-'
            } else {
                '_'
            }
        })
        .collect();
    let slug = if slug.is_empty() {
        "my-project".to_string()
    } else {
        slug
    };

    let project_path = base.join(&slug);

    // If already exists, append a number
    let final_path = if project_path.exists() {
        let mut i = 2;
        loop {
            let candidate = base.join(format!("{}-{}", slug, i));
            if !candidate.exists() {
                break candidate;
            }
            i += 1;
        }
    } else {
        project_path
    };

    std::fs::create_dir_all(&final_path).map_err(|e| e.to_string())?;
    let path_str = final_path.to_string_lossy().to_string();
    *state.project_dir.lock().unwrap() = Some(path_str.clone());
    Ok(path_str)
}

/// List files in the project directory
/// Analyze project: detect language, framework, team status
#[derive(Clone, Serialize)]
struct ProjectAnalysis {
    languages: Vec<String>,
    framework: Option<String>,
    has_claude_config: bool,
    agent_count: usize,
    skill_count: usize,
    agents: Vec<String>,
    skills: Vec<String>,
    has_git: bool,
    suggestion: Option<String>,
}

#[tauri::command]
fn analyze_project(state: State<AppState>) -> Result<ProjectAnalysis, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let root = Path::new(&dir);
    let mut languages = Vec::new();
    let mut framework = None;

    // Detect languages and frameworks by config files
    if root.join("package.json").exists() {
        languages.push("JavaScript/TypeScript".to_string());
        // Try to detect framework from package.json
        if let Ok(content) = std::fs::read_to_string(root.join("package.json")) {
            if content.contains("\"next\"") { framework = Some("Next.js".to_string()); }
            else if content.contains("\"react\"") { framework = Some("React".to_string()); }
            else if content.contains("\"vue\"") { framework = Some("Vue".to_string()); }
            else if content.contains("\"svelte\"") { framework = Some("Svelte".to_string()); }
            else if content.contains("\"express\"") { framework = Some("Express".to_string()); }
            else if content.contains("\"nuxt\"") { framework = Some("Nuxt".to_string()); }
            else if content.contains("\"angular\"") { framework = Some("Angular".to_string()); }
        }
    }
    if root.join("Cargo.toml").exists() { languages.push("Rust".to_string()); }
    if root.join("requirements.txt").exists() || root.join("pyproject.toml").exists() || root.join("setup.py").exists() {
        languages.push("Python".to_string());
        if let Ok(content) = std::fs::read_to_string(root.join("requirements.txt").as_path())
            .or_else(|_| std::fs::read_to_string(root.join("pyproject.toml").as_path()))
        {
            if content.contains("django") { framework = Some("Django".to_string()); }
            else if content.contains("flask") { framework = Some("Flask".to_string()); }
            else if content.contains("fastapi") { framework = Some("FastAPI".to_string()); }
        }
    }
    if root.join("go.mod").exists() { languages.push("Go".to_string()); }
    if root.join("pom.xml").exists() || root.join("build.gradle").exists() {
        languages.push("Java".to_string());
        if root.join("pom.xml").exists() {
            if let Ok(c) = std::fs::read_to_string(root.join("pom.xml")) {
                if c.contains("spring") { framework = Some("Spring".to_string()); }
            }
        }
    }
    if root.join("Gemfile").exists() { languages.push("Ruby".to_string()); }
    if root.join("Package.swift").exists() { languages.push("Swift".to_string()); }

    if languages.is_empty() { languages.push("Unknown".to_string()); }

    // Check .claude/ config
    let claude_dir = root.join(".claude");
    let has_claude_config = claude_dir.exists();
    let agents_dir = claude_dir.join("agents");
    let skills_dir = claude_dir.join("skills");

    let mut agents = Vec::new();
    let mut skills = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&agents_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                agents.push(name.trim_end_matches(".md").to_string());
            }
        }
    }
    if let Ok(entries) = std::fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                skills.push(name.trim_end_matches(".md").to_string());
            }
        }
    }

    let has_git = root.join(".git").exists();

    // Generate suggestion
    let suggestion = if !has_claude_config {
        let fw = framework.as_deref().unwrap_or(&languages[0]);
        Some(format!("This looks like a {} project. Set up a dev team to get the most out of Claude Code.", fw))
    } else if agents.is_empty() && skills.is_empty() {
        Some("Claude Code config found but no agents or skills. Add a team to boost productivity.".to_string())
    } else {
        None
    };

    Ok(ProjectAnalysis {
        languages,
        framework,
        has_claude_config,
        agent_count: agents.len(),
        skill_count: skills.len(),
        agents,
        skills,
        has_git,
        suggestion,
    })
}

/// List files in the project directory
#[tauri::command]
fn list_project_files(state: State<AppState>) -> Result<Vec<String>, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let mut files = Vec::new();
    collect_files(Path::new(&dir), Path::new(&dir), &mut files, 0, 3)?;
    Ok(files)
}

fn collect_files(
    base: &Path,
    dir: &Path,
    files: &mut Vec<String>,
    depth: usize,
    max_depth: usize,
) -> Result<(), String> {
    if depth > max_depth {
        return Ok(());
    }

    let entries = std::fs::read_dir(dir).map_err(|e| e.to_string())?;
    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        // Skip heavy/internal dirs on all platforms
        if name == ".git" || name == "node_modules" || name == "target" || name == ".next" || name == "dist" {
            continue;
        }

        // Always use forward slashes for the frontend (even on Windows)
        let relative = path
            .strip_prefix(base)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string()
            .replace('\\', "/");
        files.push(relative);

        if path.is_dir() {
            collect_files(base, &path, files, depth + 1, max_depth)?;
        }
    }
    Ok(())
}

/// Discover skills from .claude/skills/
#[tauri::command]
fn discover_skills(state: State<AppState>) -> Result<Vec<String>, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let skills_dir = Path::new(&dir).join(".claude").join("skills");
    let mut skills = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                skills.push(name.trim_end_matches(".md").to_string());
            }
        }
    }

    Ok(skills)
}

/// Discover agents from .claude/agents/
#[tauri::command]
fn discover_agents(state: State<AppState>) -> Result<Vec<String>, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let agents_dir = Path::new(&dir).join(".claude").join("agents");
    let mut agents = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&agents_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                agents.push(name.trim_end_matches(".md").to_string());
            }
        }
    }

    Ok(agents)
}

// =============================================================================
// Claude Code detection, installation, and auth
// =============================================================================

/// Status of Claude Code CLI installation
#[derive(Clone, Serialize)]
struct ClaudeInstallStatus {
    installed: bool,
    version: Option<String>,
    path: Option<String>,
}

/// Check Claude Code installation status with version info
#[tauri::command]
async fn check_claude_installed() -> Result<ClaudeInstallStatus, String> {
    let bin_path = find_claude_binary();

    match bin_path {
        Some(path) => {
            // Try to get version
            let full_path = resolve_full_path();
            let version = tokio::process::Command::new(&path)
                .arg("--version")
                .env("PATH", &full_path)
                .output()
                .await
                .ok()
                .and_then(|output| {
                    if output.status.success() {
                        let v = String::from_utf8_lossy(&output.stdout).trim().to_string();
                        if v.is_empty() { None } else { Some(v) }
                    } else {
                        None
                    }
                });

            Ok(ClaudeInstallStatus {
                installed: true,
                version,
                path: Some(path),
            })
        }
        None => Ok(ClaudeInstallStatus {
            installed: false,
            version: None,
            path: None,
        }),
    }
}

/// Install event for streaming progress to frontend
#[derive(Clone, Serialize)]
struct InstallProgressEvent {
    line: String,
    stage: String,
}

/// Install Claude Code using the official native installer
#[tauri::command]
async fn install_claude_code(app: AppHandle) -> Result<(), String> {
    app.emit(
        "install-progress",
        InstallProgressEvent {
            line: "Starting Claude Code installation...".to_string(),
            stage: "downloading".to_string(),
        },
    )
    .map_err(|e| e.to_string())?;

    #[cfg(not(target_os = "windows"))]
    let mut child = {
        tokio::process::Command::new("sh")
            .args(["-c", "curl -fsSL https://claude.ai/install.sh | sh"])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start installer: {}", e))?
    };

    #[cfg(target_os = "windows")]
    let mut child = {
        tokio::process::Command::new("powershell")
            .args([
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                "irm https://claude.ai/install.ps1 | iex",
            ])
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to start installer: {}", e))?
    };

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let app_clone = app.clone();
    let stderr_handle = tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        let mut stderr_output = String::new();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let _ = app_clone.emit(
                "install-progress",
                InstallProgressEvent {
                    line: line.clone(),
                    stage: "installing".to_string(),
                },
            );
            stderr_output.push_str(&line);
            stderr_output.push('\n');
        }
        stderr_output
    });

    let mut stdout_reader = BufReader::new(stdout).lines();
    while let Ok(Some(line)) = stdout_reader.next_line().await {
        let _ = app.emit(
            "install-progress",
            InstallProgressEvent {
                line: line.clone(),
                stage: "installing".to_string(),
            },
        );
    }

    let status = child.wait().await.map_err(|e| e.to_string())?;
    let stderr_output = stderr_handle.await.unwrap_or_default();

    if !status.success() {
        let err_msg = if stderr_output.trim().is_empty() {
            "Installation failed. Please try manual installation.".to_string()
        } else {
            stderr_output.trim().to_string()
        };
        return Err(err_msg);
    }

    // Verify installation
    let check = check_claude_installed().await?;
    if !check.installed {
        return Err(
            "Installation completed but Claude Code was not found. You may need to restart the app."
                .to_string(),
        );
    }

    app.emit(
        "install-progress",
        InstallProgressEvent {
            line: format!(
                "Claude Code installed successfully! ({})",
                check.version.unwrap_or_else(|| "unknown version".to_string())
            ),
            stage: "done".to_string(),
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Auth status for Claude Code
#[derive(Clone, Serialize)]
struct ClaudeAuthStatus {
    authenticated: bool,
}

/// Check if Claude Code is authenticated
#[tauri::command]
async fn check_claude_auth() -> Result<ClaudeAuthStatus, String> {
    let bin_path = find_claude_binary().ok_or("Claude Code is not installed")?;
    let full_path = resolve_full_path();

    // Run "claude --version" — if it returns successfully, the binary works.
    // Auth is checked on first actual prompt; we just verify the binary runs.
    let output = tokio::process::Command::new(&bin_path)
        .arg("--version")
        .env("PATH", &full_path)
        .output()
        .await
        .map_err(|e| format!("Failed to run Claude Code: {}", e))?;

    Ok(ClaudeAuthStatus {
        authenticated: output.status.success(),
    })
}

// =============================================================================
// Claude Code CLI integration
// =============================================================================

#[derive(Clone, Serialize)]
struct ClaudeOutputEvent {
    line: String,
}

#[derive(Clone, Serialize)]
struct ClaudeDoneEvent {
    success: bool,
    full_output: String,
}

/// Run a prompt through Claude Code CLI in print mode.
/// Streams output via Tauri events.
#[tauri::command]
async fn run_claude_prompt(
    app: AppHandle,
    state: State<'_, AppState>,
    prompt: String,
    auto_approve: Option<bool>,
) -> Result<(), String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    // Resolve claude binary (GUI apps may not inherit shell PATH)
    let claude_bin = find_claude_binary()
        .ok_or("Claude Code를 찾을 수 없습니다. 설정에서 다시 설치해주세요.")?;

    let full_path = resolve_full_path();

    // Build a clean environment — remove Claude Code internal vars
    // to avoid "nested session" errors when dev server runs inside CC
    let mut env_vars: std::collections::HashMap<String, String> = std::env::vars().collect();
    env_vars.remove("CLAUDECODE");
    env_vars.remove("CLAUDE_CODE_SESSION");
    env_vars.remove("CLAUDE_CODE_ENTRY_POINT");
    env_vars.remove("CLAUDE_CODE_PACKAGE_DIR");
    env_vars.insert("PATH".to_string(), full_path);

    // Build args
    let mut args = vec!["-p".to_string(), prompt.clone()];
    if auto_approve.unwrap_or(false) {
        args.push("--dangerously-skip-permissions".to_string());
    }

    // Spawn claude in print mode with clean environment
    let mut child = tokio::process::Command::new(&claude_bin)
        .args(&args)
        .current_dir(&dir)
        .env_clear()
        .envs(&env_vars)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start Claude Code: {}", e))?;

    // Track child PID for stop_claude
    if let Some(pid) = child.id() {
        *state.child_pid.lock().unwrap() = Some(pid);
    }

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut full_output = String::new();

    // Collect stderr in background
    let stderr_handle = tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        let mut stderr_output = String::new();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            stderr_output.push_str(&line);
            stderr_output.push('\n');
        }
        stderr_output
    });

    // Stream stdout line by line
    while let Ok(Some(line)) = stdout_reader.next_line().await {
        full_output.push_str(&line);
        full_output.push('\n');
        app.emit("claude-output", ClaudeOutputEvent { line: line.clone() })
            .map_err(|e| e.to_string())?;
    }

    let status = child.wait().await.map_err(|e| e.to_string())?;
    let stderr_output = stderr_handle.await.unwrap_or_default();

    // Clear PID tracking
    *state.child_pid.lock().unwrap() = None;

    // If claude failed and stdout is empty, use stderr as error message
    let final_output = if !status.success() && full_output.trim().is_empty() {
        let err_msg = stderr_output.trim();
        if !err_msg.is_empty() {
            err_msg.to_string()
        } else {
            "Claude Code exited with an error.".to_string()
        }
    } else {
        full_output.trim().to_string()
    };

    app.emit(
        "claude-done",
        ClaudeDoneEvent {
            success: status.success(),
            full_output: final_output,
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Stop a running Claude process
#[tauri::command]
async fn stop_claude(app: AppHandle, state: State<'_, AppState>) -> Result<(), String> {
    let pid = state.child_pid.lock().unwrap().take();
    if let Some(pid) = pid {
        #[cfg(not(target_os = "windows"))]
        {
            // Send SIGTERM to the process group
            unsafe {
                libc::kill(-(pid as i32), libc::SIGTERM);
            }
        }
        #[cfg(target_os = "windows")]
        {
            // On Windows, use taskkill to kill the process tree
            let _ = std::process::Command::new("taskkill")
                .args(["/PID", &pid.to_string(), "/T", "/F"])
                .output();
        }
        app.emit(
            "claude-done",
            ClaudeDoneEvent {
                success: false,
                full_output: "Stopped by user.".to_string(),
            },
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("No running process to stop".to_string())
    }
}

// =============================================================================
// App entry
// =============================================================================

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            project_dir: Mutex::new(None),
            child_pid: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            check_claude_code,
            check_claude_installed,
            install_claude_code,
            check_claude_auth,
            get_project_dir,
            set_project_dir,
            create_project,
            analyze_project,
            list_project_files,
            discover_skills,
            discover_agents,
            run_claude_prompt,
            stop_claude,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
