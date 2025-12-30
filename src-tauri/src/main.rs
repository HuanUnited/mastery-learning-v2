// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;
mod utils;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let db = db::init_database(&app.handle())?;
            app.manage(db);
            println!("✅ App setup complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
    commands::test_database,
    commands::attempts::log_attempt,
    commands::attempts_crud::update_attempt,
    commands::attempts_crud::delete_attempt,
    commands::attempts_crud::update_problem,
    commands::queries::get_subjects,
    commands::queries::get_materials_for_subject,
    commands::queries::get_problems_for_material,
    commands::queries::get_recent_problems,
    commands::queries::get_problem_by_id,
    commands::images::save_problem_image,
    commands::images::get_problem_image_path,
    commands::images::update_problem_image,
    commands::stats::get_all_material_stats,
    commands::stats::get_problem_batch_stats,
    commands::russian::add_vocabulary,  // ADD THESE
commands::russian::get_all_vocabulary,
commands::russian::search_vocabulary,
commands::russian::log_drill_attempt,
commands::russian::get_drill_history,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
