use rusqlite::Connection;
use std::sync::Mutex;

pub mod schema;
pub mod models;

pub struct DbConnection(pub Mutex<Connection>);

pub fn init_database(app_handle: &tauri::AppHandle) -> Result<DbConnection, String> {
    let app_dir = app_handle.path_resolver()
        .app_data_dir()
        .ok_or("Failed to get app data dir")?;
    
    std::fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
    
    let db_path = app_dir.join("mastery.db");
    println!("📂 Database path: {:?}", db_path);
    
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    
    // Enable foreign keys
    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| e.to_string())?;
    
    // Initialize schema
    schema::initialize_database(&conn).map_err(|e| e.to_string())?;
    
    Ok(DbConnection(Mutex::new(conn)))
}
