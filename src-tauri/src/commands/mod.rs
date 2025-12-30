use tauri::State;
use crate::db::DbConnection;

pub mod attempts;
pub mod queries;
pub mod images;
pub mod attempts_crud;
pub mod stats;
pub mod russian;

#[tauri::command]
pub fn test_database(db: State<DbConnection>) -> Result<String, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Test query - count subjects
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM Subjects",
        [],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    Ok(format!("Database connected! {} subjects found.", count))
}
