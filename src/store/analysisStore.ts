import { create } from 'zustand'

export interface AnalysisRecord {
  id: string
  datasetId: string
  datasetName: string
  analysisType: string
  date: string
  status: 'completed' | 'failed' | 'running'
  parameters: Record<string, any>
  results: Record<string, any>
}

interface AnalysisState {
  history: AnalysisRecord[]
  addAnalysis: (analysis: AnalysisRecord) => void
  removeAnalysis: (id: string) => void
  clearHistory: () => void
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  history: [],
  
  addAnalysis: (analysis) => set((state) => ({
    history: [analysis, ...state.history]
  })),
  
  removeAnalysis: (id) => set((state) => ({
    history: state.history.filter(a => a.id !== id)
  })),
  
  clearHistory: () => set({ history: [] })
}))
