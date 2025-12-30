use tauri::State;
use rusqlite::params;
use chrono::{ Utc, Duration};
use crate::db::{DbConnection, models::*};
use crate::utils::generate_problem_id;
use std::collections::HashSet;


#[tauri::command]
pub async fn log_attempt(
    db: State<'_, DbConnection>,
    subject_name: String,
    material_name_en: String,
    material_name_ru: Option<String>,
    problem_title: String,
    problem_description: Option<String>,
    problem_image_filename: Option<String>,
    attempt_data: AttemptInput,
    is_fresh_start: bool,
) -> Result<LogAttemptResponse, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    


    // Validate inputs
if subject_name.trim().is_empty() {
    return Err("Subject name cannot be empty".to_string());
}
if material_name_en.trim().is_empty() {
    return Err("Material name cannot be empty".to_string());
}
if problem_title.trim().is_empty() {
    return Err("Problem title cannot be empty".to_string());
}


// 1. Find or create Subject
let subject_id: i64 = conn.query_row(
    "INSERT INTO Subjects (name) VALUES (?1) 
     ON CONFLICT(name) DO UPDATE SET name=name 
     RETURNING id",
    params![&subject_name],
    |row| row.get(0)
).map_err(|e| e.to_string())?;

    
    // 2. Find or create Material
    let material_id: i64 = conn.query_row(
        "INSERT INTO Materials (name_en, name_ru) VALUES (?1, ?2) 
         ON CONFLICT(name_en) DO UPDATE SET name_en=name_en 
         RETURNING id",
        params![&material_name_en, &material_name_ru],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    // 3. Link Subject <-> Material
    conn.execute(
        "INSERT OR IGNORE INTO SubjectMaterials (subject_id, material_id) VALUES (?1, ?2)",
        params![subject_id, material_id],
    ).map_err(|e| e.to_string())?;
    
    // 4. Find or create Problem
    let problem_result: Result<(i64, String), _> = conn.query_row(
        "SELECT id, generated_id FROM Problems WHERE material_id = ?1 AND title = ?2",
        params![material_id, &problem_title],
        |row| Ok((row.get(0)?, row.get(1)?))
    );
    
    let (problem_id, generated_id) = match problem_result {
        Ok(result) => result,
        Err(_) => {
            // Problem doesn't exist - create it
            let generated_id = generate_problem_id(&conn, &subject_name)?;
            
            let content_type = if problem_image_filename.is_some() {
                if problem_description.is_some() { "both" } else { "image" }
            } else {
                "text"
            };
            
            conn.execute(
                "INSERT INTO Problems (generated_id, material_id, title, description, image_filename, content_type) 
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    &generated_id,
                    material_id,
                    &problem_title,
                    &problem_description,
                    &problem_image_filename,
                    content_type
                ],
            ).map_err(|e| e.to_string())?;
            
            let problem_id = conn.last_insert_rowid();
            (problem_id, generated_id)
        }
    };
    
    // 5. Find or create Batch
    let batch_result: Result<(i64, i32), _> = conn.query_row(
        "SELECT id, batch_number FROM Batches 
         WHERE problem_id = ?1 AND ended_at IS NULL 
         ORDER BY batch_number DESC LIMIT 1",
        params![problem_id],
        |row| Ok((row.get(0)?, row.get(1)?))
    );
    
    let (batch_id, batch_number, batch_closed) = match batch_result {
        Ok((existing_batch_id, existing_batch_num)) => {
            // Check if we need to close this batch
            let last_attempt_time: Option<String> = conn.query_row(
                "SELECT timestamp FROM Attempts WHERE batch_id = ?1 ORDER BY id DESC LIMIT 1",
                params![existing_batch_id],
                |row| row.get(0)
            ).ok();
            
            let should_start_new_batch = if is_fresh_start {
                true
            } else if let Some(last_time) = &last_attempt_time {
                // Check if more than 2 hours have passed
                calculate_hours_diff(last_time)? > 2.0
            } else {
                false
            };
            
            if should_start_new_batch {
                // Close previous batch (2 hours after last attempt)
                if let Some(last_time) = last_attempt_time {
                    let close_time = add_hours(&last_time, 2.0)?;
                    conn.execute(
                        "UPDATE Batches SET ended_at = ?1 WHERE id = ?2",
                        params![close_time, existing_batch_id],
                    ).map_err(|e| e.to_string())?;
                }
                
                // Create new batch
                let new_batch_num = existing_batch_num + 1;
                conn.execute(
                    "INSERT INTO Batches (problem_id, batch_number, started_at, is_fresh_start) 
                     VALUES (?1, ?2, datetime('now'), ?3)",
                    params![problem_id, new_batch_num, is_fresh_start],
                ).map_err(|e| e.to_string())?;
                
                let new_batch_id = conn.last_insert_rowid();
                (new_batch_id, new_batch_num, true)
            } else {
                (existing_batch_id, existing_batch_num, false)
            }
        }
        Err(_) => {
            // No open batch - create first batch
            conn.execute(
                "INSERT INTO Batches (problem_id, batch_number, started_at, is_fresh_start) 
                 VALUES (?1, 1, datetime('now'), ?2)",
                params![problem_id, is_fresh_start],
            ).map_err(|e| e.to_string())?;
            
            let new_batch_id = conn.last_insert_rowid();
            (new_batch_id, 1, false)
        }
    };
    
    // 6. Calculate attempt number (total for this problem)
    let attempt_number: i32 = conn.query_row(
        "SELECT COUNT(*) FROM Attempts a 
         JOIN Batches b ON a.batch_id = b.id 
         WHERE b.problem_id = ?1",
        params![problem_id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    let attempt_number = attempt_number + 1;
    
    // 7. Insert Attempt
    conn.execute(
        "INSERT INTO Attempts 
         (batch_id, attempt_number, successful, time_spent_minutes, difficulty_rating, 
          errors, resolution, commentary, status_tag) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            batch_id,
            attempt_number,
            attempt_data.successful,
            attempt_data.time_spent_minutes,
            attempt_data.difficulty_rating,
            attempt_data.errors,
            attempt_data.resolution,
            attempt_data.commentary,
            attempt_data.status_tag,
        ],
    ).map_err(|e| e.to_string())?;
    
    let attempt_id = conn.last_insert_rowid();
    
    // 8. Link resources
let unique_resources: HashSet<_> = attempt_data.resources.into_iter().collect();

for resource_name in unique_resources {
    if resource_name.is_empty() {
        continue; // Skip empty resource names
    }
    
    let resource_id: i64 = conn.query_row(
        "INSERT INTO Resources (name, type) VALUES (?1, 'other') 
         ON CONFLICT(name) DO UPDATE SET name=name 
         RETURNING id",
        params![&resource_name],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    // Use INSERT OR IGNORE to handle duplicates gracefully
    conn.execute(
        "INSERT OR IGNORE INTO AttemptResources (attempt_id, resource_id) VALUES (?1, ?2)",
        params![attempt_id, resource_id],
    ).map_err(|e| e.to_string())?;
}
    
    // 9. Check mastery status (5 consecutive successes resets on failure)
check_and_mark_solved(&conn, problem_id, attempt_data.successful)?;
    
    println!("✅ Logged attempt #{} for problem {} (Batch {})", attempt_number, generated_id, batch_number);
    
    Ok(LogAttemptResponse {
        attempt_id,
        problem_id,
        generated_id,
        batch_number,
        attempt_number,
        batch_closed,
    })
}

// Helper: Check mastery and update solved status
fn check_and_mark_solved(
    conn: &rusqlite::Connection,
    problem_id: i64,
    was_successful: bool,
) -> Result<(), String> {
    if was_successful {
        // Get last 5 attempts across ALL batches for this problem
        let last_5: Vec<bool> = conn.prepare(
            "SELECT a.successful FROM Attempts a
             JOIN Batches b ON a.batch_id = b.id
             WHERE b.problem_id = ?1
             ORDER BY a.id DESC
             LIMIT 5"
        )
        .map_err(|e| e.to_string())?
        .query_map(params![problem_id], |row| row.get(0))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<bool>, _>>()
        .map_err(|e| e.to_string())?;
        
        // Mark as solved if last 5 are all successful
        if last_5.len() >= 5 && last_5.iter().all(|&s| s) {
            conn.execute(
                "UPDATE Problems SET is_solved = 1 WHERE id = ?1",
                params![problem_id],
            ).map_err(|e| e.to_string())?;
            println!("🎉 Problem marked as SOLVED (5 consecutive successes)!");
        }
    } else {
        // Failed attempt - reset solved status
        conn.execute(
            "UPDATE Problems SET is_solved = 0 WHERE id = ?1",
            params![problem_id],
        ).map_err(|e| e.to_string())?;
        println!("❌ Solved status reset due to failed attempt");
    }
    
    Ok(())
}

// Time calculation helpers - SQLite format compatible
fn calculate_hours_diff(sqlite_time: &str) -> Result<f64, String> {
    // SQLite format: "2025-12-30 19:16:00"
    // Parse as naive datetime then treat as UTC
    let past = chrono::NaiveDateTime::parse_from_str(sqlite_time, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| format!("Time parse error: {}", e))?;
    
    let now = Utc::now().naive_utc();
    let diff = now.signed_duration_since(past);
    
    Ok(diff.num_seconds() as f64 / 3600.0)
}

fn add_hours(sqlite_time: &str, hours: f64) -> Result<String, String> {
    let dt = chrono::NaiveDateTime::parse_from_str(sqlite_time, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| format!("Time parse error: {}", e))?;
    
    let new_dt = dt + Duration::seconds((hours * 3600.0) as i64);
    
    Ok(new_dt.format("%Y-%m-%d %H:%M:%S").to_string())
}

