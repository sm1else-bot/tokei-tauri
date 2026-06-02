#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn load_life_data() -> &'static str {
    include_str!("../../data/life-expectancy.json")
}

#[tauri::command]
fn window_minimize(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|error| error.to_string())
}

#[tauri::command]
fn window_maximize(window: tauri::Window) -> Result<bool, String> {
    if window.is_maximized().map_err(|error| error.to_string())? {
        window.unmaximize().map_err(|error| error.to_string())?;
    } else {
        window.maximize().map_err(|error| error.to_string())?;
    }

    window.is_maximized().map_err(|error| error.to_string())
}

#[tauri::command]
fn window_close(window: tauri::Window) -> Result<(), String> {
    window.close().map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_life_data,
            window_minimize,
            window_maximize,
            window_close
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tokei");
}
