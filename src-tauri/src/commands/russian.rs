use tauri::State;
use rusqlite::params;
use crate::db::DbConnection;
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct VocabularyEntry {
    pub id: i64,
    pub word_ru: String,
    pub translation_en: String,
    pub material_name: Option<String>,
    pub example_sentence: Option<String>,
    pub first_seen: String,
    pub last_reviewed: Option<String>,
    pub review_count: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DrillAttempt {
    pub id: i64,
    pub material_name: String,
    pub attempt_number: i32,
    pub status: String,
    pub commentary: Option<String>,
    pub errors_ru: Option<String>,
    pub resolution_ru: Option<String>,
    pub timestamp: String,
}

#[tauri::command]
pub fn add_vocabulary(
    db: State<DbConnection>,
    word_ru: String,
    translation_en: String,
    material_name: Option<String>,
    example_sentence: Option<String>,
) -> Result<i64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Find material ID if provided
    let material_id: Option<i64> = if let Some(ref mat_name) = material_name {
        conn.query_row(
            "SELECT id FROM Materials WHERE name_en = ?1",
            params![mat_name],
            |row| row.get(0)
        ).ok()
    } else {
        None
    };
    
    conn.execute(
        "INSERT INTO RussianVocabulary (word_ru, translation_en, material_id, example_sentence)
         VALUES (?1, ?2, ?3, ?4)",
        params![word_ru, translation_en, material_id, example_sentence],
    ).map_err(|e| e.to_string())?;
    
    let vocab_id = conn.last_insert_rowid();
    println!("📚 Added vocabulary: {} = {}", word_ru, translation_en);
    
    Ok(vocab_id)
}

#[tauri::command]
pub fn get_all_vocabulary(
    db: State<DbConnection>,
) -> Result<Vec<VocabularyEntry>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT v.id, v.word_ru, v.translation_en, m.name_en, v.example_sentence,
                v.first_seen, v.last_reviewed, v.review_count
         FROM RussianVocabulary v
         LEFT JOIN Materials m ON v.material_id = m.id
         ORDER BY v.last_reviewed DESC, v.first_seen DESC"
    ).map_err(|e| e.to_string())?;
    
    let entries = stmt.query_map([], |row| {
        Ok(VocabularyEntry {
            id: row.get(0)?,
            word_ru: row.get(1)?,
            translation_en: row.get(2)?,
            material_name: row.get(3)?,
            example_sentence: row.get(4)?,
            first_seen: row.get(5)?,
            last_reviewed: row.get(6)?,
            review_count: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(entries)
}

#[tauri::command]
pub fn search_vocabulary(
    db: State<DbConnection>,
    search_term: String,
) -> Result<Vec<VocabularyEntry>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let term = format!("%{}%", search_term);
    
    let mut stmt = conn.prepare(
        "SELECT v.id, v.word_ru, v.translation_en, m.name_en, v.example_sentence,
                v.first_seen, v.last_reviewed, v.review_count
         FROM RussianVocabulary v
         LEFT JOIN Materials m ON v.material_id = m.id
         WHERE v.word_ru LIKE ?1 OR v.translation_en LIKE ?1
         ORDER BY v.word_ru"
    ).map_err(|e| e.to_string())?;
    
    let entries = stmt.query_map(params![term], |row| {
        Ok(VocabularyEntry {
            id: row.get(0)?,
            word_ru: row.get(1)?,
            translation_en: row.get(2)?,
            material_name: row.get(3)?,
            example_sentence: row.get(4)?,
            first_seen: row.get(5)?,
            last_reviewed: row.get(6)?,
            review_count: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(entries)
}

#[tauri::command]
pub fn log_drill_attempt(
    db: State<DbConnection>,
    material_name: String,
    status: String,
    errors_ru: Option<String>,
    resolution_ru: Option<String>,
    commentary: Option<String>,
    vocabulary_words: Vec<String>,
) -> Result<i64, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // Find or create material
    let material_id: i64 = conn.query_row(
        "INSERT INTO Materials (name_en) VALUES (?1)
         ON CONFLICT(name_en) DO UPDATE SET name_en=name_en
         RETURNING id",
        params![&material_name],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    // Count existing drill attempts for this material
    let attempt_number: i32 = conn.query_row(
        "SELECT COUNT(*) + 1 FROM RussianDrillAttempts WHERE material_id = ?1",
        params![material_id],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    // Insert drill attempt
    conn.execute(
        "INSERT INTO RussianDrillAttempts (material_id, attempt_number, status, commentary, errors_ru, resolution_ru)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![material_id, attempt_number, status, commentary, errors_ru, resolution_ru],
    ).map_err(|e| e.to_string())?;
    
    let drill_id = conn.last_insert_rowid();
    
    // Link vocabulary words
    for word in vocabulary_words {
        if let Ok(vocab_id) = conn.query_row::<i64, _, _>(
            "SELECT id FROM RussianVocabulary WHERE word_ru = ?1",
            params![&word],
            |row| row.get(0)
        ) {
            conn.execute(
                "INSERT OR IGNORE INTO DrillVocabulary (drill_id, vocabulary_id) VALUES (?1, ?2)",
                params![drill_id, vocab_id],
            ).map_err(|e| e.to_string())?;
            
            // Update review stats
            conn.execute(
                "UPDATE RussianVocabulary 
                 SET last_reviewed = datetime('now'), review_count = review_count + 1
                 WHERE id = ?1",
                params![vocab_id],
            ).map_err(|e| e.to_string())?;
        }
    }
    
    println!("📝 Logged Russian drill attempt #{}", attempt_number);
    
    Ok(drill_id)
}

#[tauri::command]
pub fn get_drill_history(
    db: State<DbConnection>,
    limit: i32,
) -> Result<Vec<DrillAttempt>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT d.id, m.name_en, d.attempt_number, d.status, d.commentary,
                d.errors_ru, d.resolution_ru, d.timestamp
         FROM RussianDrillAttempts d
         JOIN Materials m ON d.material_id = m.id
         ORDER BY d.timestamp DESC
         LIMIT ?1"
    ).map_err(|e| e.to_string())?;
    
    let drills = stmt.query_map(params![limit], |row| {
        Ok(DrillAttempt {
            id: row.get(0)?,
            material_name: row.get(1)?,
            attempt_number: row.get(2)?,
            status: row.get(3)?,
            commentary: row.get(4)?,
            errors_ru: row.get(5)?,
            resolution_ru: row.get(6)?,
            timestamp: row.get(7)?,
        })
    })
    .map_err(|e| e.to_string())?
    .collect::<Result<Vec<_>, _>>()
    .map_err(|e| e.to_string())?;
    
    Ok(drills)
}
