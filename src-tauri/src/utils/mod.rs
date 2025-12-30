use rusqlite::{Connection, params};

pub fn generate_problem_id(
    conn: &Connection,
    subject_name: &str,
) -> Result<String, String> {
    // Get subject prefix (up to 4 letters, uppercase)
    let subject_prefix: String = subject_name
        .chars()
        .filter(|c| c.is_alphabetic())
        .take(4)
        .collect::<String>()
        .to_uppercase();
    
    // If no letters, use "PROB" as default
    let subject_prefix = if subject_prefix.is_empty() {
        "PROB".to_string()
    } else {
        subject_prefix
    };
    
    // Find next available ID by checking what exists
    // Loop until we find a unique ID
    for attempt in 1..9999 {
        let candidate_id = format!("{}_{:03}", subject_prefix, attempt);
        
        // Check if this ID already exists
        let exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM Problems WHERE generated_id = ?1)",
            params![&candidate_id],
            |row| row.get(0)
        ).map_err(|e| e.to_string())?;
        
        if !exists {
            return Ok(candidate_id);
        }
    }
    
    // Fallback: use timestamp if we somehow run out of numbers
    let fallback_id = format!("{}_{}", subject_prefix, chrono::Utc::now().timestamp());
    Ok(fallback_id)
}
