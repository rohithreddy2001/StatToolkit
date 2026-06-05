import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ColumnType = 'numeric' | 'categorical' | 'datetime' | 'text'

export interface ColumnMetadata {
  name: string
  type: ColumnType
  missingCount: number
  uniqueValues: number
}

export interface ActivityLog {
  id: string
  action: string
  details: string
  timestamp: string
  type: 'upload' | 'analysis' | 'ml' | 'visualization' | 'system'
}

export interface Dataset {
  id: string
  name: string
  rows: number
  columns: number
  fileSize: number
  fileType: string
  uploadDate: string
  columnMetadata: ColumnMetadata[]
  previewData: any[] // Array of row objects for preview
  fullData: any[] // Array of all parsed row objects for statistical analysis
}

interface DatasetState {
  datasets: Dataset[]
  currentDatasetId: string | null
  activityLog: ActivityLog[]
  
  addDataset: (dataset: Dataset) => void
  setCurrentDataset: (id: string) => void
  removeDataset: (id: string) => void
  getCurrentDataset: () => Dataset | undefined
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void
}

export const useDatasetStore = create<DatasetState>()(
  persist(
    (set, get) => ({
      datasets: [],
      currentDatasetId: null,
      activityLog: [],

      addDataset: (dataset) => set((state) => {
        const newLog: ActivityLog = {
          id: crypto.randomUUID(),
          action: 'Dataset Uploaded',
          details: `Uploaded ${dataset.name} (${dataset.rows} rows)`,
          timestamp: new Date().toISOString(),
          type: 'upload'
        }
        return { 
          datasets: [...state.datasets, dataset],
          currentDatasetId: dataset.id,
          activityLog: [newLog, ...state.activityLog]
        }
      }),
      
      setCurrentDataset: (id) => set({ currentDatasetId: id }),
      
      removeDataset: (id) => set((state) => ({ 
        datasets: state.datasets.filter(d => d.id !== id),
        currentDatasetId: state.currentDatasetId === id ? null : state.currentDatasetId
      })),

      getCurrentDataset: () => {
        const { datasets, currentDatasetId } = get()
        return datasets.find(d => d.id === currentDatasetId)
      },

      addLog: (log) => set((state) => ({
        activityLog: [{
          ...log,
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }, ...state.activityLog]
      }))
    }),
    {
      name: 'dataset-storage',
    }
  )
)
