import { invoke } from '@tauri-apps/api/tauri'
import type {
  AttemptInput,
  LogAttemptResponse,
  ProblemDetail,
  MaterialStats,
  BatchStats,
  VocabularyEntry,
  DrillAttempt,
} from './types'


export interface LogAttemptParams {
  subjectName: string
  materialNameEn: string
  materialNameRu?: string
  problemTitle: string
  problemDescription?: string
  problemImageFilename?: string
  attemptData: AttemptInput
  isFreshStart: boolean
}

export const api = {
  testDatabase: async () => {
    return await invoke<string>('test_database')
  },

  logAttempt: async (params: LogAttemptParams) => {
    return await invoke<LogAttemptResponse>('log_attempt', {
      subjectName: params.subjectName,
      materialNameEn: params.materialNameEn,
      materialNameRu: params.materialNameRu,
      problemTitle: params.problemTitle,
      problemDescription: params.problemDescription,
      problemImageFilename: params.problemImageFilename,
      attemptData: params.attemptData,
      isFreshStart: params.isFreshStart,
    })
  },

  getSubjects: async () => {
    return await invoke<Array<{ name: string }>>('get_subjects')
  },

  getMaterialsForSubject: async (subjectName: string) => {
    return await invoke<Array<{ name_en: string; name_ru?: string }>>('get_materials_for_subject', { subjectName })
  },

  getProblemsForMaterial: async (materialName: string) => {
    return await invoke<Array<{ id: number; title: string; generated_id: string }>>(
      'get_problems_for_material',
      { materialName }
    )
  },

  getRecentProblems: async (limit: number = 20) => {
    return await invoke<ProblemDetail[]>('get_recent_problems', { limit })
  },


  getProblemById: async (problemId: number) => {
    return await invoke<ProblemDetail>('get_problem_by_id', { problemId })
  },

  updateAttempt: async (attemptId: number, attemptData: AttemptInput) => {
    return await invoke<void>('update_attempt', { attemptId, attemptData })
  },  // <-- COMMA HERE

  deleteAttempt: async (attemptId: number) => {
    return await invoke<void>('delete_attempt', { attemptId })
  },  // <-- COMMA HERE

  updateProblem: async (problemId: number, title: string, description?: string) => {
    return await invoke<void>('update_problem', { problemId, title, description })
  },  // <-- COMMA HERE

  getProblemImagePath: async (filename: string) => {
    return await invoke<string>('get_problem_image_path', { filename })
  },  // <-- COMMA HERE (optional for last item but good practice)

  getAllMaterialStats: async () => {
    return await invoke<MaterialStats[]>('get_all_material_stats')
  },

  getProblemBatchStats: async (problemId: number) => {
    return await invoke<BatchStats[]>('get_problem_batch_stats', { problemId })
  },

  // Russian Drilling
  addVocabulary: async (wordRu: string, translationEn: string, materialName?: string, exampleSentence?: string) => {
    return await invoke<number>('add_vocabulary', {
      wordRu,
      translationEn,
      materialName,
      exampleSentence
    })
  },

  getAllVocabulary: async () => {
    return await invoke<VocabularyEntry[]>('get_all_vocabulary')
  },

  searchVocabulary: async (searchTerm: string) => {
    return await invoke<VocabularyEntry[]>('search_vocabulary', { searchTerm })
  },

  logDrillAttempt: async (
    materialName: string,
    status: string,
    errorsRu?: string,
    resolutionRu?: string,
    commentary?: string,
    vocabularyWords: string[] = []
  ) => {
    return await invoke<number>('log_drill_attempt', {
      materialName,
      status,
      errorsRu,
      resolutionRu,
      commentary,
      vocabularyWords,
    })
  },

  getDrillHistory: async (limit: number = 20) => {
    return await invoke<DrillAttempt[]>('get_drill_history', { limit })
  },

  getProblemByGeneratedId: async (generatedId: string) => {
    return await invoke<ProblemDetail>('get_problem_by_generated_id', { generatedId })
  },


}

