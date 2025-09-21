'use client'

import { useState, useEffect } from 'react'
import { PromptVariable } from '@/types'
import { getDefaultValues, validateVariables } from '@/lib/utils/prompt-variables'
import { cn } from '@/lib/utils'

interface VariableInputFormProps {
  variables: PromptVariable[]
  onSubmit: (values: Record<string, any>) => void
  onCancel?: () => void
  className?: string
}

export function VariableInputForm({
  variables,
  onSubmit,
  onCancel,
  className
}: VariableInputFormProps) {
  const [values, setValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Initialize with default values
    setValues(getDefaultValues(variables))
  }, [variables])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateVariables(variables, values)
    if (!validation.valid) {
      setErrors(validation.missing)
      return
    }

    setErrors([])
    onSubmit(values)
  }

  const handleChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    setErrors(prev => prev.filter(e => e !== name))
  }

  const renderInput = (variable: PromptVariable) => {
    const hasError = errors.includes(variable.name)

    switch (variable.type) {
      case 'text':
        return (
          <input
            type="text"
            value={values[variable.name] || ''}
            onChange={e => handleChange(variable.name, e.target.value)}
            placeholder={variable.placeholder}
            className={cn(
              'w-full px-3 py-2 border rounded-md bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              hasError && 'border-destructive'
            )}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={values[variable.name] || 0}
            onChange={e => handleChange(variable.name, Number(e.target.value))}
            placeholder={variable.placeholder}
            className={cn(
              'w-full px-3 py-2 border rounded-md bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              hasError && 'border-destructive'
            )}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={values[variable.name] || false}
              onChange={e => handleChange(variable.name, e.target.checked)}
              className="w-4 h-4 text-primary rounded focus:ring-primary"
            />
            <span className="text-sm">{variable.placeholder || 'Enabled'}</span>
          </label>
        )

      case 'select':
        return (
          <select
            value={values[variable.name] || ''}
            onChange={e => handleChange(variable.name, e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-md bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              hasError && 'border-destructive'
            )}
          >
            {variable.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            type="date"
            value={values[variable.name] || ''}
            onChange={e => handleChange(variable.name, e.target.value)}
            className={cn(
              'w-full px-3 py-2 border rounded-md bg-background',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              hasError && 'border-destructive'
            )}
          />
        )

      default:
        return null
    }
  }

  if (variables.length === 0) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-foreground">
        Fill in prompt variables
      </h3>

      {variables.map(variable => (
        <div key={variable.name}>
          <label className="block mb-1">
            <span className="text-sm font-medium text-foreground">
              {variable.name}
              {variable.required && <span className="text-destructive ml-1">*</span>}
            </span>
            {variable.description && (
              <span className="block text-xs text-muted-foreground mt-1">
                {variable.description}
              </span>
            )}
          </label>
          {renderInput(variable)}
          {errors.includes(variable.name) && (
            <p className="text-xs text-destructive mt-1">
              This field is required
            </p>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <button
          type="submit"
          className={cn(
            'px-4 py-2 rounded-md font-medium',
            'bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors'
          )}
        >
          Apply
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'px-4 py-2 rounded-md font-medium',
              'border border-border',
              'hover:bg-muted transition-colors'
            )}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}