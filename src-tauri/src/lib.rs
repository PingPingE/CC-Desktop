use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};

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

#[derive(Clone, Serialize)]
struct ClaudeErrorEvent {
    message: String,
}

/// Run a prompt through Claude Code CLI in print mode.
/// Streams output via Tauri events.
#[tauri::command]
async fn run_claude_prompt(
    app: AppHandle,
    state: State<'_, AppState>,
    prompt: String,
) -> Result<(), String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    // Resolve claude binary (GUI apps may not inherit shell PATH)
    let claude_bin = find_claude_binary()
        .ok_or("Claude Code not found. Please install it: npm install -g @anthropic-ai/claude-code")?;

    let full_path = resolve_full_path();

    // Spawn claude in print mode
    let mut child = tokio::process::Command::new(&claude_bin)
        .args(["-p", &prompt])
        .current_dir(&dir)
        .env("PATH", &full_path)
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start Claude Code: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut full_output = String::new();

    // Read stderr in background
    let app_clone = app.clone();
    let stderr_handle = tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            let _ = app_clone.emit("claude-error", ClaudeErrorEvent { message: line });
        }
    });

    // Stream stdout line by line
    while let Ok(Some(line)) = stdout_reader.next_line().await {
        full_output.push_str(&line);
        full_output.push('\n');
        app.emit("claude-output", ClaudeOutputEvent { line: line.clone() })
            .map_err(|e| e.to_string())?;
    }

    let status = child.wait().await.map_err(|e| e.to_string())?;
    let _ = stderr_handle.await;

    app.emit(
        "claude-done",
        ClaudeDoneEvent {
            success: status.success(),
            full_output: full_output.trim().to_string(),
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Stop a running Claude process
#[tauri::command]
async fn stop_claude(_app: AppHandle) -> Result<(), String> {
    // TODO: Track child PID and kill it
    Ok(())
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
        })
        .invoke_handler(tauri::generate_handler![
            check_claude_code,
            get_project_dir,
            set_project_dir,
            create_project,
            list_project_files,
            discover_skills,
            discover_agents,
            run_claude_prompt,
            stop_claude,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
