import type { AISuggestion } from '@/types/assistant'

/**
 * AI 제안 엔진
 *
 * 분석 결과를 바탕으로 사용자에게 유용한 제안을 자동 생성
 */
export class SuggestionEngine {
  /**
   * 분석 결과 기반 제안 생성
   */
  static generateSuggestions(analysisResult: any): AISuggestion[] {
    if (!analysisResult) return []

    const suggestions: AISuggestion[] = []

    // 문제점 기반 제안
    if (analysisResult.issues && analysisResult.issues.length > 0) {
      analysisResult.issues.forEach((issue: any) => {
        const suggestion = this.createSuggestionFromIssue(issue, analysisResult)
        if (suggestion) {
          suggestions.push(suggestion)
        }
      })
    }

    // 통계 기반 제안
    if (analysisResult.statistics) {
      const statSuggestions = this.createSuggestionsFromStatistics(
        analysisResult.statistics,
        analysisResult.sheets
      )
      suggestions.push(...statSuggestions)
    }

    // 우선순위로 정렬
    suggestions.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    // 중복 제거 (같은 타입의 제안은 하나만)
    const uniqueSuggestions = this.removeDuplicates(suggestions)

    return uniqueSuggestions.slice(0, 5) // 최대 5개
  }

  /**
   * 문제점에서 제안 생성
   */
  private static createSuggestionFromIssue(issue: any, analysisResult: any): AISuggestion | null {
    const { type, sheetName, severity, description } = issue

    const baseId = `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    switch (type) {
      case 'duplicate_rows':
        return {
          id: baseId,
          type: 'remove_duplicates',
          title: '중복된 행 제거',
          description: `${sheetName} 시트에서 ${description}`,
          priority: this.mapSeverityToPriority(severity),
          estimatedImpact: {
            affectedSheets: [sheetName],
            rowsToRemove: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.5) // 행당 30초 가정
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'remove_duplicates',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      case 'empty_rows':
        return {
          id: baseId,
          type: 'remove_empty_rows',
          title: '빈 행 제거',
          description: `${sheetName} 시트에서 ${description}`,
          priority: this.mapSeverityToPriority(severity),
          estimatedImpact: {
            affectedSheets: [sheetName],
            rowsToRemove: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.3)
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'remove_empty_rows',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      case 'empty_columns':
        return {
          id: baseId,
          type: 'remove_empty_columns',
          title: '빈 열 제거',
          description: `${sheetName} 시트에서 ${description}`,
          priority: this.mapSeverityToPriority(severity),
          estimatedImpact: {
            affectedSheets: [sheetName],
            columnsToRemove: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.3)
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'remove_empty_columns',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      case 'invalid_formula':
        return {
          id: baseId,
          type: 'convert_formulas',
          title: '수식을 값으로 변환',
          description: `${sheetName} 시트에서 ${description}`,
          priority: this.mapSeverityToPriority(severity),
          estimatedImpact: {
            affectedSheets: [sheetName],
            cellsToModify: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.1)
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'convert_formulas',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      case 'inconsistent_data':
        return {
          id: baseId,
          type: 'data_validation',
          title: '데이터 검증 규칙 적용',
          description: `${sheetName} 시트에서 ${description}`,
          priority: this.mapSeverityToPriority(severity),
          estimatedImpact: {
            affectedSheets: [sheetName],
            cellsToModify: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.2)
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'data_validation',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      case 'formatting':
        return {
          id: baseId,
          type: 'format_dates',
          title: '날짜 형식 통일',
          description: `${sheetName} 시트에서 ${description}`,
          priority: 'low',
          estimatedImpact: {
            affectedSheets: [sheetName],
            cellsToModify: issue.count || 0,
            timeSaved: Math.ceil((issue.count || 0) * 0.1)
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'format_dates',
              targetSheets: [sheetName]
            }
          },
          createdAt: new Date().toISOString()
        }

      default:
        return null
    }
  }

  /**
   * 통계에서 제안 생성
   */
  private static createSuggestionsFromStatistics(
    statistics: any,
    sheets: any[]
  ): AISuggestion[] {
    const suggestions: AISuggestion[] = []

    // 전체 통계 기반
    if (statistics.emptyRows > 10) {
      suggestions.push({
        id: `suggestion_${Date.now()}_empty_rows`,
        type: 'remove_empty_rows',
        title: '모든 빈 행 일괄 제거',
        description: `전체 ${statistics.emptyRows}개의 빈 행을 한 번에 제거할 수 있습니다`,
        priority: 'high',
        estimatedImpact: {
          affectedSheets: sheets.map(s => s.name),
          rowsToRemove: statistics.emptyRows,
          timeSaved: Math.ceil(statistics.emptyRows * 0.3)
        },
        action: {
          type: 'generate_code',
          params: {
            taskType: 'remove_empty_rows',
            targetSheets: sheets.map(s => s.name)
          }
        },
        createdAt: new Date().toISOString()
      })
    }

    if (statistics.emptyColumns > 5) {
      suggestions.push({
        id: `suggestion_${Date.now()}_empty_cols`,
        type: 'remove_empty_columns',
        title: '모든 빈 열 일괄 제거',
        description: `전체 ${statistics.emptyColumns}개의 빈 열을 한 번에 제거할 수 있습니다`,
        priority: 'medium',
        estimatedImpact: {
          affectedSheets: sheets.map(s => s.name),
          columnsToRemove: statistics.emptyColumns,
          timeSaved: Math.ceil(statistics.emptyColumns * 0.3)
        },
        action: {
          type: 'generate_code',
          params: {
            taskType: 'remove_empty_columns',
            targetSheets: sheets.map(s => s.name)
          }
        },
        createdAt: new Date().toISOString()
      })
    }

    if (statistics.duplicates > 0) {
      suggestions.push({
        id: `suggestion_${Date.now()}_duplicates`,
        type: 'remove_duplicates',
        title: '중복 데이터 정리',
        description: `전체 ${statistics.duplicates}개의 중복 행을 제거할 수 있습니다`,
        priority: 'high',
        estimatedImpact: {
          affectedSheets: sheets.map(s => s.name),
          rowsToRemove: statistics.duplicates,
          timeSaved: Math.ceil(statistics.duplicates * 0.5)
        },
        action: {
          type: 'generate_code',
          params: {
            taskType: 'remove_duplicates',
            targetSheets: sheets.map(s => s.name)
          }
        },
        createdAt: new Date().toISOString()
      })
    }

    return suggestions
  }

  /**
   * 심각도를 우선순위로 변환
   */
  private static mapSeverityToPriority(
    severity: string
  ): 'critical' | 'high' | 'medium' | 'low' {
    const mapping: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low'
    }

    return mapping[severity] || 'medium'
  }

  /**
   * 중복 제거 (같은 타입의 제안은 우선순위가 높은 것만)
   */
  private static removeDuplicates(suggestions: AISuggestion[]): AISuggestion[] {
    const seen = new Map<string, AISuggestion>()

    suggestions.forEach(suggestion => {
      const existing = seen.get(suggestion.type)

      if (!existing) {
        seen.set(suggestion.type, suggestion)
      } else {
        // 우선순위가 더 높거나, 영향 범위가 더 크면 교체
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        const newPriorityScore = priorityOrder[suggestion.priority]
        const existingPriorityScore = priorityOrder[existing.priority]

        if (
          newPriorityScore < existingPriorityScore ||
          (newPriorityScore === existingPriorityScore &&
            suggestion.estimatedImpact.affectedSheets.length >
              existing.estimatedImpact.affectedSheets.length)
        ) {
          seen.set(suggestion.type, suggestion)
        }
      }
    })

    return Array.from(seen.values())
  }

  /**
   * 사용자 의도 기반 제안 생성
   */
  static generateIntentBasedSuggestions(
    userMessage: string,
    analysisResult: any
  ): AISuggestion[] {
    const messageLower = userMessage.toLowerCase()
    const suggestions: AISuggestion[] = []

    // 중복 관련
    if (messageLower.includes('중복') || messageLower.includes('duplicate')) {
      const sheets = analysisResult.sheets || []
      suggestions.push({
        id: `intent_${Date.now()}_duplicates`,
        type: 'remove_duplicates',
        title: '중복 행 제거 코드 생성',
        description: '선택한 시트에서 중복된 데이터를 찾아 제거합니다',
        priority: 'high',
        estimatedImpact: {
          affectedSheets: sheets.map((s: any) => s.name),
          rowsToRemove: 0
        },
        action: {
          type: 'generate_code',
          params: {
            taskType: 'remove_duplicates',
            userRequest: userMessage
          }
        },
        createdAt: new Date().toISOString()
      })
    }

    // 빈 데이터 관련
    if (messageLower.includes('빈') || messageLower.includes('empty')) {
      const sheets = analysisResult.sheets || []

      if (messageLower.includes('행') || messageLower.includes('row')) {
        suggestions.push({
          id: `intent_${Date.now()}_empty_rows`,
          type: 'remove_empty_rows',
          title: '빈 행 제거 코드 생성',
          description: '데이터가 없는 빈 행을 모두 제거합니다',
          priority: 'medium',
          estimatedImpact: {
            affectedSheets: sheets.map((s: any) => s.name),
            rowsToRemove: 0
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'remove_empty_rows',
              userRequest: userMessage
            }
          },
          createdAt: new Date().toISOString()
        })
      }

      if (messageLower.includes('열') || messageLower.includes('column')) {
        suggestions.push({
          id: `intent_${Date.now()}_empty_cols`,
          type: 'remove_empty_columns',
          title: '빈 열 제거 코드 생성',
          description: '데이터가 없는 빈 열을 모두 제거합니다',
          priority: 'medium',
          estimatedImpact: {
            affectedSheets: sheets.map((s: any) => s.name),
            columnsToRemove: 0
          },
          action: {
            type: 'generate_code',
            params: {
              taskType: 'remove_empty_columns',
              userRequest: userMessage
            }
          },
          createdAt: new Date().toISOString()
        })
      }
    }

    // 수식 관련
    if (messageLower.includes('수식') || messageLower.includes('formula')) {
      const sheets = analysisResult.sheets || []
      suggestions.push({
        id: `intent_${Date.now()}_formulas`,
        type: 'convert_formulas',
        title: '수식을 값으로 변환',
        description: '모든 수식을 계산 결과 값으로 변환합니다',
        priority: 'medium',
        estimatedImpact: {
          affectedSheets: sheets.map((s: any) => s.name),
          cellsToModify: 0
        },
        action: {
          type: 'generate_code',
          params: {
            taskType: 'convert_formulas',
            userRequest: userMessage
          }
        },
        createdAt: new Date().toISOString()
      })
    }

    return suggestions
  }

  /**
   * 제안 우선순위 재계산
   */
  static recalculatePriority(
    suggestions: AISuggestion[],
    userPreferences?: Record<string, any>
  ): AISuggestion[] {
    return suggestions.map(suggestion => {
      let newPriority = suggestion.priority

      // 사용자 선호도 반영
      if (userPreferences) {
        if (userPreferences.preferredTypes?.includes(suggestion.type)) {
          newPriority = this.increasePriority(newPriority)
        }
      }

      // 예상 효과 반영
      const impact = suggestion.estimatedImpact
      const totalImpact =
        (impact.rowsToRemove || 0) +
        (impact.columnsToRemove || 0) +
        (impact.cellsToModify || 0) * 0.1

      if (totalImpact > 100) {
        newPriority = this.increasePriority(newPriority)
      }

      return {
        ...suggestion,
        priority: newPriority
      }
    })
  }

  /**
   * 우선순위 높이기
   */
  private static increasePriority(
    priority: 'critical' | 'high' | 'medium' | 'low'
  ): 'critical' | 'high' | 'medium' | 'low' {
    const升级Map: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
      low: 'medium',
      medium: 'high',
      high: 'critical',
      critical: 'critical'
    }

    return upgrade升级Map[priority]
  }
}
