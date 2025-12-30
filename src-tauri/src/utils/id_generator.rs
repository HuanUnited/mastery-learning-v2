use rusqlite::{Connection, params};

pub fn generate_problem_id(
    conn: &Connection,
    subject_name: &str,
    material_id: i64,
) -> Result<String, String> {
    // 1. Get subject prefix (use all available letters, uppercase)
    let subject_prefix: String = subject_name
        .chars()
        .filter(|c| c.is_alphabetic())
        .take(4)
        .collect::<String>()
        .to_uppercase();
    
    // 2. Count existing problems in this subject
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM Problems p
         JOIN SubjectMaterials sm ON p.material_id = sm.material_id
         JOIN Subjects s ON sm.subject_id = s.id
         WHERE s.name = ?1",
        params![subject_name],
        |row| row.get(0)
    ).map_err(|e| e.to_string())?;
    
    // 3. Generate ID: SUBJ_NNN (next sequential number)
    let next_number = count + 1;
    let generated_id = format!("{}_{:03}", subject_prefix, next_number);
    
    Ok(generated_id)
}
