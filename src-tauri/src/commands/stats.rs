use tauri::State;
use rusqlite::params;
use crate::db::DbConnection;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct MaterialStats {
    pub material_id: i64,
    pub material_name: String,
    pub subject_name: String,
    pub total_problems: i32,
    pub solved_problems: i32,
    pub total_attempts: i32,
    pub successful_attempts: i32,
    pub total_time_minutes: f64,
    pub avg_attempts_per_problem: f64,
    pub success_rate: f64,
}

#[tauri::command]
pub fn get_all_material_stats(
    db: State<DbConnection>,
) -> Result<Vec<MaterialStats>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT 
            m.id,
            m.name_en,
            s.name,
            COUNT(DISTINCT p.id) as total_problems,
            SUM(CASE WHEN p.is_solved THEN 1 ELSE 0 END) as solved_problems,
            COUNT(a.id) as total_attempts,
            SUM(CASE WHEN a.successful THEN 1 ELSE 0 END) as successful_attempts,
            COALESCE(SUM(a.time_spent_minutes), 0) as total_time
         FROM Materials m
         JOIN SubjectMaterials sm ON m.id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         LEFT JOIN Problems p ON p.material_id = m.id
         LEFT JOIN Batches b ON b.problem_id = p.id
         LEFT JOIN Attempts a ON a.batch_id = b.id
         GROUP BY m.id, m.name_en, s.name
         HAVING total_problems > 0
         ORDER BY total_attempts DESC"
    ).map_err(|e| e.to_string())?;
    
    let stats = stmt.query_map([], |row| {
        let total_problems: i32 = row.get(3)?;
        let total_attempts: i32 = row.get(5)?;
        let successful_attempts: i32 = row.get(6)?;
        
        let avg_attempts = if total_problems > 0 {
            total_attempts as f64 / total_problems as f64
        } else {
            0.0
        };
        
        let success_rate = if total_attempts > 0 {
            (successful_attempts as f64 / total_attempts as f64) * 100.0
        } else {
            0.0
        };
        
        Ok(MaterialStats {
            material_id: row.get(0)?,
            material_name: row.get(1)?,
            subject_name: row.get(2)?,
            total_problems: row.get(3)?,
            solved_problems: row.get(4)?,
            total_attempts: row.get(5)?,
            successful_attempts: row.get(6)?,
            total_time_minutes: row.get(7)?,
            avg_attempts_per_problem: avg_attempts,
            success_rate,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(stats)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchStats {
    pub batch_id: i64,
    pub batch_number: i32,
    pub problem_id: i64,
    pub problem_title: String,
    pub started_at: String,
    pub ended_at: Option<String>,
    pub is_fresh_start: bool,
    pub total_attempts: i32,
    pub successful_attempts: i32,
    pub success_rate: f64,
    pub total_time_minutes: f64,
    pub avg_difficulty: f64,
}

#[tauri::command]
pub fn get_problem_batch_stats(
    db: State<DbConnection>,
    problem_id: i64,
) -> Result<Vec<BatchStats>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT 
            b.id,
            b.batch_number,
            b.problem_id,
            p.title,
            b.started_at,
            b.ended_at,
            b.is_fresh_start,
            COUNT(a.id) as total_attempts,
            SUM(CASE WHEN a.successful THEN 1 ELSE 0 END) as successful_attempts,
            COALESCE(SUM(a.time_spent_minutes), 0) as total_time,
            COALESCE(AVG(a.difficulty_rating), 0) as avg_difficulty
         FROM Batches b
         JOIN Problems p ON b.problem_id = p.id
         LEFT JOIN Attempts a ON a.batch_id = b.id
         WHERE b.problem_id = ?1
         GROUP BY b.id
         ORDER BY b.batch_number ASC"
    ).map_err(|e| e.to_string())?;
    
    let stats = stmt.query_map(params![problem_id], |row| {
        let total: i32 = row.get(7)?;
        let successful: i32 = row.get(8)?;
        let success_rate = if total > 0 {
            (successful as f64 / total as f64) * 100.0
        } else {
            0.0
        };
        
        Ok(BatchStats {
            batch_id: row.get(0)?,
            batch_number: row.get(1)?,
            problem_id: row.get(2)?,
            problem_title: row.get(3)?,
            started_at: row.get(4)?,
            ended_at: row.get(5)?,
            is_fresh_start: row.get(6)?,
            total_attempts: row.get(7)?,
            successful_attempts: row.get(8)?,
            success_rate,
            total_time_minutes: row.get(9)?,
            avg_difficulty: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(stats)
}

