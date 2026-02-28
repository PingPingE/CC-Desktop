use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, State};
use tokio::io::{AsyncBufReadExt, BufReader};

/// Represents a message in the chat
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,     // "user" | "assistant" | "system"
    pub content: String,
    pub agent: Option<String>, // which agent is responding
    pub timestamp: u64,
}

/// Project state managed by the app
pub struct AppState {
    pub project_dir: Mutex<Option<String>>,
    pub claude_code_installed: Mutex<bool>,
}

/// Resolve the full PATH including user shell paths.
/// macOS GUI apps don't inherit terminal PATH, so we load it from the login shell.
fn resolve_full_path() -> String {
    // Try to get PATH from login shell
    if let Ok(output) = std::process::Command::new("/bin/zsh")
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
    // Fallback: current PATH + common locations
    let current = std::env::var("PATH").unwrap_or_default();
    let home = std::env::var("HOME").unwrap_or_default();
    format!(
        "{}/.local/bin:{}/.cargo/bin:/usr/local/bin:/opt/homebrew/bin:{}",
        home, home, current
    )
}

/// Find the claude binary path
fn find_claude_binary() -> Option<String> {
    let full_path = resolve_full_path();
    for dir in full_path.split(':') {
        let candidate = format!("{}/claude", dir);
        if std::path::Path::new(&candidate).exists() {
            return Some(candidate);
        }
    }
    None
}

/// Check if Claude Code CLI is available on PATH
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

/// Create a new project directory under ~/Documents/CC-Projects/
#[tauri::command]
fn create_project(state: State<AppState>, name: String) -> Result<String, String> {
    let home = std::env::var("HOME").map_err(|_| "Cannot find home directory".to_string())?;
    let base = format!("{}/Documents/CC-Projects", home);

    // Ensure base directory exists
    std::fs::create_dir_all(&base).map_err(|e| e.to_string())?;

    // Sanitize name: lowercase, replace spaces with hyphens, remove special chars
    let slug: String = name
        .to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' { c } else if c == ' ' { '-' } else { '_' })
        .collect();
    let slug = if slug.is_empty() { "my-project".to_string() } else { slug };

    let project_path = format!("{}/{}", base, slug);

    // If already exists, append a number
    let final_path = if std::path::Path::new(&project_path).exists() {
        let mut i = 2;
        loop {
            let candidate = format!("{}-{}", project_path, i);
            if !std::path::Path::new(&candidate).exists() {
                break candidate;
            }
            i += 1;
        }
    } else {
        project_path
    };

    std::fs::create_dir_all(&final_path).map_err(|e| e.to_string())?;
    *state.project_dir.lock().unwrap() = Some(final_path.clone());
    Ok(final_path)
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
    collect_files(&dir, &dir, &mut files, 0, 3)?; // max depth 3 for initial tree
    Ok(files)
}

fn collect_files(
    base: &str,
    dir: &str,
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

        // Skip heavy/internal dirs only — show hidden files like .claude/, .gitignore, .env
        if name == ".git" || name == "node_modules" || name == "target" || name == ".next" || name == "dist" {
            continue;
        }

        let relative = path
            .strip_prefix(base)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string();
        files.push(relative);

        if path.is_dir() {
            collect_files(base, path.to_str().unwrap_or(""), files, depth + 1, max_depth)?;
        }
    }
    Ok(())
}

/// Read .claude/skills/ directory to discover available slash commands
#[tauri::command]
fn discover_skills(state: State<AppState>) -> Result<Vec<String>, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let skills_dir = format!("{}/.claude/skills", dir);
    let mut skills = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                let skill_name = name.trim_end_matches(".md").to_string();
                skills.push(skill_name);
            }
        }
    }

    Ok(skills)
}

/// Read .claude/agents/ directory to discover available agents
#[tauri::command]
fn discover_agents(state: State<AppState>) -> Result<Vec<String>, String> {
    let dir = state
        .project_dir
        .lock()
        .unwrap()
        .clone()
        .ok_or("No project directory set")?;

    let agents_dir = format!("{}/.claude/agents", dir);
    let mut agents = Vec::new();

    if let Ok(entries) = std::fs::read_dir(&agents_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".md") {
                let agent_name = name.trim_end_matches(".md").to_string();
                agents.push(agent_name);
            }
        }
    }

    Ok(agents)
}

/// Event payloads sent from Rust to frontend
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
/// Spawns `claude -p "prompt"` in the project directory and streams output via events.
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

    // Resolve claude binary (macOS GUI apps don't inherit shell PATH)
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
        .map_err(|e| format!("Failed to start Claude Code: {}. Is it installed?", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to capture stderr")?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut full_output = String::new();

    // Read stderr in background
    let app_clone = app.clone();
    let stderr_handle = tokio::spawn(async move {
        let mut stderr_reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = stderr_reader.next_line().await {
            // Emit stderr as error events (usually progress/status info)
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

    // Wait for process to finish
    let status = child.wait().await.map_err(|e| e.to_string())?;

    // Wait for stderr reader to finish
    let _ = stderr_handle.await;

    // Emit done event
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

/// Stop a running Claude process (for future use with cancellation)
#[tauri::command]
async fn stop_claude(_app: AppHandle) -> Result<(), String> {
    // TODO: Track child PID and kill it
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .manage(AppState {
            project_dir: Mutex::new(None),
            claude_code_installed: Mutex::new(false),
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
