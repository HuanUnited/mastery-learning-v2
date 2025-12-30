export interface Subject {
  id?: number
  name: string
  description?: string
  commentary?: string
}

export interface Material {
  id?: number
  name_en: string
  name_ru?: string
  commentary?: string
}

export interface Problem {
  id?: number
  generated_id: string
  material_id: number
  title: string
  content_type: 'text' | 'image' | 'both'
  description?: string
  image_filename?: string
  is_solved: boolean
}

export type StatusTag = 'stuck' | 'breakthrough' | 'review' | 'first_attempt' | 'debugging'

export interface AttemptInput {
  successful: boolean
  timeSpentMinutes?: number
  difficultyRating?: number
  errors?: string
  resolution?: string
  commentary?: string
  statusTag?: StatusTag
  resources: string[]
}

export interface LogAttemptResponse {
  attempt_id: number
  problem_id: number
  generated_id: string
  batch_number: number
  attempt_number: number
  batch_closed: boolean
}

export interface AttemptView {
  id: number
  attempt_number: number
  batch_number: number
  successful: boolean
  time_spent_minutes?: number
  difficulty_rating?: number
  status_tag?: string
  errors?: string
  resolution?: string
  commentary?: string
  timestamp: string
  resources?: Array<{ name: string }>
}

export interface ProblemDetail {
  id: number
  generated_id: string
  title: string
  description?: string
  image_filename?: string  // ADD THIS
  is_solved: boolean
  material_name: string
  subject_name: string
  attempts: AttemptView[]
}

export interface MaterialStats {
  material_id: number
  material_name: string
  subject_name: string
  total_problems: number
  solved_problems: number
  total_attempts: number
  successful_attempts: number
  total_time_minutes: number
  avg_attempts_per_problem: number
  success_rate: number
}

export interface BatchStats {
  batch_id: number
  batch_number: number
  problem_id: number
  problem_title: string
  started_at: string
  ended_at?: string
  is_fresh_start: boolean
  total_attempts: number
  successful_attempts: number
  success_rate: number
  total_time_minutes: number
  avg_difficulty: number
}

export interface VocabularyEntry {
  id: number
  word_ru: string
  translation_en: string
  material_name?: string
  example_sentence?: string
  first_seen: string
  last_reviewed?: string
  review_count: number
}

export interface DrillAttempt {
  id: number
  material_name: string
  attempt_number: number
  status: 'learning' | 'practicing' | 'mastered'
  commentary?: string
  errors_ru?: string
  resolution_ru?: string
  timestamp: string
}
