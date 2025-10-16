export interface StepProgress {
  stepId: number
  status: 'pending' | 'in_progress' | 'completed'
  startedAt: string | null
  completedAt: string | null
  checklist: Record<number, { checked: boolean; checkedAt: string | null }>
  notes: Array<{ content: string; createdAt: string }>
}

export interface Progress {
  projectName: string
  createdAt: string
  updatedAt: string
  currentStep: number
  steps: StepProgress[]
  envConfig: any | null
}

export const getProgress = async (): Promise<Progress> => {
  // In a real implementation, this would fetch from the file system
  // For now, return mock data
  return {
    projectName: "My Project",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStep: 1,
    steps: Array.from({ length: 10 }, (_, i) => ({
      stepId: i + 1,
      status: 'pending' as const,
      startedAt: null,
      completedAt: null,
      checklist: {},
      notes: []
    })),
    envConfig: null
  }
}

export const updateProgress = async (progress: Progress): Promise<void> => {
  // In a real implementation, this would write to the file system
  console.log('Updating progress:', progress)
}
