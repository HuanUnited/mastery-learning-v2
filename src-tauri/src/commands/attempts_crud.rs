use tauri::State;
use rusqlite::params;
use crate::db::{DbConnection, models::AttemptInput};

#[tauri::command]
pub fn update_attempt(
    db: State<DbConnection>,
    attempt_id: i64,
    attempt_data: AttemptInput,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE Attempts 
         SET successful = ?1, time_spent_minutes = ?2, difficulty_rating = ?3,
             errors = ?4, resolution = ?5, commentary = ?6, status_tag = ?7
         WHERE id = ?8",
        params![
            attempt_data.successful,
            attempt_data.time_spent_minutes,
            attempt_data.difficulty_rating,
            attempt_data.errors,
            attempt_data.resolution,
            attempt_data.commentary,
            attempt_data.status_tag,
            attempt_id,
        ],
    ).map_err(|e| e.to_string())?;
    
    println!("✏️ Updated attempt #{}", attempt_id);
    Ok(())
}

#[tauri::command]
pub fn delete_attempt(
    db: State<DbConnection>,
    attempt_id: i64,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "DELETE FROM Attempts WHERE id = ?1",
        params![attempt_id],
    ).map_err(|e| e.to_string())?;
    
    println!("🗑️ Deleted attempt #{}", attempt_id);
    Ok(())
}

#[tauri::command]
pub fn update_problem(
    db: State<DbConnection>,
    problem_id: i64,
    title: String,
    description: Option<String>,
) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    conn.execute(
        "UPDATE Problems SET title = ?1, description = ?2 WHERE id = ?3",
        params![title, description, problem_id],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}
