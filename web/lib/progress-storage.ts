/**
 * Progress Storage Utilities for Unified Workflow
 * Handles saving and loading workflow progress to/from progress.json
 */

import type { UnifiedWorkflowState } from '@/types/unified-workflow'
import { promises as fs } from 'fs'
import path from 'path'

export interface WorkflowProgress {
  version: string
  projectName: string
  projectType: string
  projectPath?: string
  prdPath?: string
  prdMethod?: string
  currentStep: number
  completedSteps: number[]
  workflowData: Record<number, any>
  workflowPrompts: Record<number, string>
  timestamp: string
  lastModified: string
}

const PROGRESS_VERSION = '1.0.0'

/**
 * Save workflow progress to progress.json in project directory
 */
export async function saveProgress(
  projectPath: string,
  state: Partial<UnifiedWorkflowState>
): Promise<{ success: boolean; error?: string; filePath?: string }> {
  try {
    const progress: WorkflowProgress = {
      version: PROGRESS_VERSION,
      projectName: state.projectName || '',
      projectType: state.projectType || 'fullstack',
      projectPath: state.projectPath,
      prdPath: state.prdPath,
      prdMethod: state.prdMethod,
      currentStep: state.currentStep || 1,
      completedSteps: state.completedSteps || [],
      workflowData: state.workflowData || {},
      workflowPrompts: state.workflowPrompts || {},
      timestamp: state.timestamp || new Date().toISOString(),
      lastModified: new Date().toISOString()
    }

    const progressDir = path.join(projectPath, 'docs')
    const progressPath = path.join(progressDir, 'progress.json')

    // Ensure docs directory exists
    await fs.mkdir(progressDir, { recursive: true })

    // Write progress file
    await fs.writeFile(progressPath, JSON.stringify(progress, null, 2), 'utf-8')

    return { success: true, filePath: progressPath }
  } catch (error) {
    console.error('Failed to save progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Load workflow progress from progress.json in project directory
 */
export async function loadProgress(
  projectPath: string
): Promise<{ success: boolean; data?: WorkflowProgress; error?: string }> {
  try {
    const progressPath = path.join(projectPath, 'docs', 'progress.json')

    // Check if file exists
    try {
      await fs.access(progressPath)
    } catch {
      return { success: false, error: 'Progress file not found' }
    }

    // Read and parse progress file
    const content = await fs.readFile(progressPath, 'utf-8')
    const progress: WorkflowProgress = JSON.parse(content)

    // Validate version compatibility
    if (progress.version !== PROGRESS_VERSION) {
      return {
        success: false,
        error: `Version mismatch: expected ${PROGRESS_VERSION}, got ${progress.version}`
      }
    }

    return { success: true, data: progress }
  } catch (error) {
    console.error('Failed to load progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Check if progress file exists for a project
 */
export async function hasProgress(projectPath: string): Promise<boolean> {
  try {
    const progressPath = path.join(projectPath, 'docs', 'progress.json')
    await fs.access(progressPath)
    return true
  } catch {
    return false
  }
}

/**
 * Delete progress file
 */
export async function deleteProgress(
  projectPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const progressPath = path.join(projectPath, 'docs', 'progress.json')
    await fs.unlink(progressPath)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Client-side: Save progress via API
 */
export async function saveProgressClient(
  projectPath: string,
  state: Partial<UnifiedWorkflowState>
): Promise<{ success: boolean; error?: string; filePath?: string }> {
  try {
    const response = await fetch('/api/unified-workflow/save-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath, state })
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to save progress (client):', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Client-side: Load progress via API
 */
export async function loadProgressClient(
  projectPath: string
): Promise<{ success: boolean; data?: WorkflowProgress; error?: string }> {
  try {
    const response = await fetch('/api/unified-workflow/load-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message }
    }

    return await response.json()
  } catch (error) {
    console.error('Failed to load progress (client):', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Client-side: Check if progress exists via API
 */
export async function hasProgressClient(projectPath: string): Promise<boolean> {
  try {
    const response = await fetch('/api/unified-workflow/has-progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath })
    })

    if (!response.ok) {
      return false
    }

    const result = await response.json()
    return result.exists
  } catch {
    return false
  }
}
