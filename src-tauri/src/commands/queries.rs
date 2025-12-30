use tauri::State;
use rusqlite::params;
use crate::db::DbConnection;
use serde::{Serialize, Deserialize};
use crate::db::models::{ProblemDetail, AttemptView};

#[derive(Debug, Serialize, Deserialize)]
pub struct SubjectItem {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MaterialItem {
    pub name_en: String,
    pub name_ru: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProblemItem {
    pub title: String,
    pub generated_id: String,
}

#[tauri::command]
pub fn get_subjects(db: State<DbConnection>) -> Result<Vec<SubjectItem>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT DISTINCT name FROM Subjects ORDER BY name"
    ).map_err(|e| e.to_string())?;
    
    let items = stmt.query_map([], |row| {
        Ok(SubjectItem {
            name: row.get(0)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(items)
}

#[tauri::command]
pub fn get_materials_for_subject(
    db: State<DbConnection>,
    subject_name: String,
) -> Result<Vec<MaterialItem>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT DISTINCT m.name_en, m.name_ru 
         FROM Materials m
         JOIN SubjectMaterials sm ON m.id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         WHERE s.name = ?1
         ORDER BY m.name_en"
    ).map_err(|e| e.to_string())?;
    
    let items = stmt.query_map(params![subject_name], |row| {
        Ok(MaterialItem {
            name_en: row.get(0)?,
            name_ru: row.get(1)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(items)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProblemSummary {
    pub id: i64,  // ADD THIS if missing
    pub generated_id: String,
    pub title: String,
}

#[tauri::command]
pub fn get_problems_for_material(
    db: State<DbConnection>,
    material_name: String,
) -> Result<Vec<ProblemSummary>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT p.id, p.generated_id, p.title  /* ADD p.id here */
         FROM Problems p
         JOIN Materials m ON p.material_id = m.id
         WHERE m.name_en = ?1
         ORDER BY p.id DESC"
    ).map_err(|e| e.to_string())?;
    
    let problems = stmt.query_map(params![material_name], |row| {
        Ok(ProblemSummary {
            id: row.get(0)?,  // ADD THIS
            generated_id: row.get(1)?,
            title: row.get(2)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(problems)
}

#[tauri::command]
pub fn get_recent_problems(
    db: State<DbConnection>,
    limit: i32,
) -> Result<Vec<ProblemDetail>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Get recent problems
    let mut stmt = conn.prepare(
        "SELECT DISTINCT p.id, p.generated_id, p.title, p.description, p.is_solved,
                m.name_en, s.name
         FROM Problems p
         JOIN Materials m ON p.material_id = m.id
         JOIN SubjectMaterials sm ON m.id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         JOIN Batches b ON b.problem_id = p.id
         JOIN Attempts a ON a.batch_id = b.id
         ORDER BY a.timestamp DESC
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;
    
    let problem_ids: Vec<i64> = stmt.query_map(params![limit], |row| {
        row.get(0)
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    // For each problem, get full details with attempts
    let mut problems = Vec::new();
    for problem_id in problem_ids {
        if let Ok(problem) = get_problem_detail_by_id(&conn, problem_id) {
            problems.push(problem);
        }
    }
    
    Ok(problems)
}

#[tauri::command]
pub fn get_problem_by_id(
    db: State<DbConnection>,
    problem_id: i64,
) -> Result<ProblemDetail, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Get problem basic info
    let mut stmt = conn.prepare(
        "SELECT p.id, p.generated_id, p.title, p.description, p.is_solved,
                p.image_filename, m.name_en, s.name
         FROM Problems p
         JOIN Materials m ON p.material_id = m.id
         JOIN SubjectMaterials sm ON m.id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         WHERE p.id = ?1"
    ).map_err(|e| e.to_string())?;
    
    let problem = stmt.query_row(params![problem_id], |row| {
        Ok(ProblemDetail {
            id: row.get(0)?,
            generated_id: row.get(1)?,
            title: row.get(2)?,
            description: row.get(3)?,
            is_solved: row.get(4)?,
            image_filename: row.get(5)?,
            material_name: row.get(6)?,
            subject_name: row.get(7)?,
            attempts: vec![],
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(problem)
}

// Helper function
fn get_problem_detail_by_id(
    conn: &rusqlite::Connection,
    problem_id: i64,
) -> Result<ProblemDetail, String> {
    // Get problem info
    let (generated_id, title, description, image_filename, is_solved, material_name, subject_name): 
    (String, String, Option<String>, Option<String>, bool, String, String) = conn.query_row(
        "SELECT p.generated_id, p.title, p.description, p.image_filename, p.is_solved,
        m.name_en, s.name
         FROM Problems p
         JOIN Materials m ON p.material_id = m.id
         JOIN SubjectMaterials sm ON m.id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         WHERE p.id = ?1
         LIMIT 1",
        params![problem_id],
        |row| Ok((
    row.get(0)?,  // generated_id
    row.get(1)?,  // title
    row.get(2)?,  // description
    row.get(3)?,  // image_filename - ADD THIS
    row.get(4)?,  // is_solved
    row.get(5)?,  // material_name
    row.get(6)?,  // subject_name
))
    ).map_err(|e| e.to_string())?;
    
    // Get all attempts
    let mut stmt = conn.prepare(
        "SELECT a.id, a.attempt_number, b.batch_number, a.successful,
                a.time_spent_minutes, a.difficulty_rating, a.status_tag,
                a.errors, a.resolution, a.commentary, a.timestamp
         FROM Attempts a
         JOIN Batches b ON a.batch_id = b.id
         WHERE b.problem_id = ?1
         ORDER BY a.attempt_number ASC"
    ).map_err(|e| e.to_string())?;
    
    let attempts = stmt.query_map(params![problem_id], |row| {
        Ok(AttemptView {
            id: row.get(0)?,
            attempt_number: row.get(1)?,
            batch_number: row.get(2)?,
            successful: row.get(3)?,
            time_spent_minutes: row.get(4)?,
            difficulty_rating: row.get(5)?,
            status_tag: row.get(6)?,
            errors: row.get(7)?,
            resolution: row.get(8)?,
            commentary: row.get(9)?,
            timestamp: row.get(10)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(ProblemDetail {
    id: problem_id,
    generated_id,
    title,
    description,
    image_filename,  // ADD THIS
    is_solved,
    material_name,
    subject_name,
    attempts,
})
}
