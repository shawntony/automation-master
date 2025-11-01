'use client'

import { Plus, X } from 'lucide-react'
import { useState } from 'react'

interface DynamicArrayInputProps {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  maxItems?: number
  minItems?: number
}

export function DynamicArrayInput({
  values,
  onChange,
  placeholder = '항목 입력',
  maxItems = 10,
  minItems = 1
}: DynamicArrayInputProps) {
  const [currentValue, setCurrentValue] = useState('')

  const handleAdd = () => {
    if (currentValue.trim() && values.length < maxItems) {
      onChange([...values, currentValue.trim()])
      setCurrentValue('')
    }
  }

  const handleRemove = (index: number) => {
    if (values.length > minItems) {
      onChange(values.filter((_, i) => i !== index))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing Items */}
      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((value, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </span>
              <span className="flex-1 text-sm text-gray-900">{value}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={values.length <= minItems}
                className="p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="제거"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Item */}
      {values.length < maxItems && (
        <div className="flex gap-2">
          <input
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!currentValue.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            추가
          </button>
        </div>
      )}

      {/* Counter */}
      <p className="text-xs text-gray-500">
        {values.length} / {maxItems} 항목
        {minItems > 0 && ` (최소 ${minItems}개 필요)`}
      </p>
    </div>
  )
}
