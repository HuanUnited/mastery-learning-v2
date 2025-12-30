import { api } from './api'

export async function exportAllData() {
  try {
    const [problems, materialStats, vocabulary, drillHistory] = await Promise.all([
      api.getRecentProblems(1000),
      api.getAllMaterialStats(),
      api.getAllVocabulary(),
      api.getDrillHistory(1000),
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      problems,
      materialStats,
      vocabulary,
      drillHistory,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mastery-learning-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Export failed:', error)
    return false
  }
}
