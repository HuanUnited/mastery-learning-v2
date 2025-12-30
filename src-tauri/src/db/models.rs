use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AttemptView {
    pub id: i64,
    pub attempt_number: i32,
    pub batch_number: i32,
    pub successful: bool,
    pub time_spent_minutes: Option<f64>,
    pub difficulty_rating: Option<i32>,
    pub status_tag: Option<String>,
    pub errors: Option<String>,
    pub resolution: Option<String>,
    pub commentary: Option<String>,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProblemDetail {
    pub id: i64,
    pub generated_id: String,
    pub title: String,
    pub description: Option<String>,
    pub image_filename: Option<String>,
    pub is_solved: bool,
    pub material_name: String,
    pub subject_name: String,
    pub attempts: Vec<AttemptView>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AttemptInput {
    pub successful: bool,
    pub time_spent_minutes: Option<f64>,
    pub difficulty_rating: Option<i32>,
    pub errors: Option<String>,
    pub resolution: Option<String>,
    pub commentary: Option<String>,
    pub status_tag: Option<String>,
    pub resources: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogAttemptResponse {
    pub attempt_id: i64,
    pub problem_id: i64,
    pub generated_id: String,
    pub batch_number: i32,
    pub attempt_number: i32,
    pub batch_closed: bool,
}
