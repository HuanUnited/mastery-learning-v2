use tauri::State;
use std::fs;
// use std::path::PathBuf;
use crate::db::DbConnection;

#[tauri::command]
pub async fn save_problem_image(
    app_handle: tauri::AppHandle,
    problem_id: String,
    image_data: Vec<u8>,
    extension: String,
) -> Result<String, String> {
    let app_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data dir")?;
    
    let images_dir = app_dir.join("problem_images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;
    
    let filename = format!("{}_{}.{}", problem_id, chrono::Utc::now().timestamp(), extension);
    let file_path = images_dir.join(&filename);
    
    fs::write(&file_path, image_data).map_err(|e| e.to_string())?;
    
    println!("📷 Saved image: {}", filename);
    Ok(filename)
}

#[tauri::command]
pub async fn get_problem_image_path(
    app_handle: tauri::AppHandle,
    filename: String,
) -> Result<String, String> {
    let app_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data dir")?;
    
    let file_path = app_dir.join("problem_images").join(filename);
    
    if file_path.exists() {
        // Convert to asset protocol URL for Tauri
        Ok(file_path.to_string_lossy().to_string())
    } else {
        Err("Image not found".to_string())
    }
}

#[tauri::command]
pub async fn update_problem_image(
    db: State<'_, DbConnection>,
    problem_id: i64,
    image_filename: Option<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE Problems SET image_filename = ?1, 
         content_type = CASE 
            WHEN ?1 IS NULL THEN 'text'
            WHEN description IS NOT NULL AND description != '' THEN 'both'
            ELSE 'image'
         END
         WHERE id = ?2",
        rusqlite::params![image_filename, problem_id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}
