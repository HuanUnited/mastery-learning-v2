pub const INIT_SQL: &str = r#"
-- Subjects & Materials
CREATE TABLE IF NOT EXISTS Subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    commentary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS Materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT UNIQUE NOT NULL,
    name_ru TEXT,
    commentary TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS SubjectMaterials (
    subject_id INTEGER NOT NULL,
    material_id INTEGER NOT NULL,
    PRIMARY KEY (subject_id, material_id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE
);

-- Problems & Attempts
CREATE TABLE IF NOT EXISTS Problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    generated_id TEXT UNIQUE NOT NULL,
    material_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content_type TEXT CHECK(content_type IN ('text', 'image', 'both')) DEFAULT 'text',
    description TEXT,
    image_filename TEXT,
    is_solved BOOLEAN DEFAULT FALSE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE,
    UNIQUE(material_id, title)
);

CREATE TABLE IF NOT EXISTS Batches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    problem_id INTEGER NOT NULL,
    batch_number INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    ended_at TEXT,
    is_fresh_start BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (problem_id) REFERENCES Problems(id) ON DELETE CASCADE,
    UNIQUE(problem_id, batch_number)
);

CREATE TABLE IF NOT EXISTS Attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    successful BOOLEAN NOT NULL DEFAULT FALSE,
    time_spent_minutes REAL,
    difficulty_rating INTEGER CHECK(difficulty_rating BETWEEN 1 AND 5),
    errors TEXT,
    resolution TEXT,
    commentary TEXT,
    status_tag TEXT CHECK(status_tag IN ('stuck', 'breakthrough', 'review', 'first_attempt', 'debugging')),
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (batch_id) REFERENCES Batches(id) ON DELETE CASCADE
);

-- Resources
CREATE TABLE IF NOT EXISTS Resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    type TEXT CHECK(type IN ('ai', 'book', 'video', 'web', 'human', 'other')),
    url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS AttemptResources (
    attempt_id INTEGER NOT NULL,
    resource_id INTEGER NOT NULL,
    notes TEXT,
    PRIMARY KEY (attempt_id, resource_id),
    FOREIGN KEY (attempt_id) REFERENCES Attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES Resources(id) ON DELETE CASCADE
);

-- Russian Drilling
CREATE TABLE IF NOT EXISTS RussianDrillAttempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    attempt_number INTEGER NOT NULL,
    status TEXT CHECK(status IN ('learning', 'practicing', 'mastered')),
    commentary TEXT,
    errors_ru TEXT,
    resolution_ru TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS RussianVocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word_ru TEXT UNIQUE NOT NULL,
    translation_en TEXT NOT NULL,
    material_id INTEGER,
    example_sentence TEXT,
    first_seen TEXT NOT NULL DEFAULT (datetime('now')),
    last_reviewed TEXT,
    review_count INTEGER DEFAULT 0,
    FOREIGN KEY (material_id) REFERENCES Materials(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS DrillVocabulary (
    drill_id INTEGER NOT NULL,
    vocabulary_id INTEGER NOT NULL,
    PRIMARY KEY (drill_id, vocabulary_id),
    FOREIGN KEY (drill_id) REFERENCES RussianDrillAttempts(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES RussianVocabulary(id) ON DELETE CASCADE
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_problems_material ON Problems(material_id);
CREATE INDEX IF NOT EXISTS idx_problems_solved ON Problems(is_solved);
CREATE INDEX IF NOT EXISTS idx_batches_problem ON Batches(problem_id);
CREATE INDEX IF NOT EXISTS idx_batches_open ON Batches(ended_at) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attempts_batch ON Attempts(batch_id);
CREATE INDEX IF NOT EXISTS idx_attempts_timestamp ON Attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_attempts_successful ON Attempts(successful);
CREATE INDEX IF NOT EXISTS idx_drill_material ON RussianDrillAttempts(material_id);
CREATE INDEX IF NOT EXISTS idx_drill_timestamp ON RussianDrillAttempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_vocab_material ON RussianVocabulary(material_id);
CREATE INDEX IF NOT EXISTS idx_vocab_reviewed ON RussianVocabulary(last_reviewed);
"#;

pub fn initialize_database(conn: &rusqlite::Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(INIT_SQL)?;
    println!("✅ Database schema initialized");
    Ok(())
}
