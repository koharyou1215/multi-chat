import { PromptVariable } from '@/types'

/**
 * Parse variables from prompt content
 * Example: "Hello {{name}}, you are {{age}} years old" -> ['name', 'age']
 */
export function parseVariables(content: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const matches = content.matchAll(regex)
  const variables = new Set<string>()

  for (const match of matches) {
    variables.add(match[1].trim())
  }

  return Array.from(variables)
}

/**
 * Replace variables in prompt content with actual values
 */
export function replaceVariables(
  content: string,
  values: Record<string, any>
): string {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
    const trimmedVar = variable.trim()
    return values[trimmedVar] !== undefined ? String(values[trimmedVar]) : match
  })
}

/**
 * Validate if all required variables have values
 */
export function validateVariables(
  variables: PromptVariable[],
  values: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing: string[] = []

  for (const variable of variables) {
    if (variable.required && !values[variable.name]) {
      missing.push(variable.name)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Generate default values for variables
 */
export function getDefaultValues(variables: PromptVariable[]): Record<string, any> {
  const defaults: Record<string, any> = {}

  for (const variable of variables) {
    if (variable.defaultValue !== undefined) {
      defaults[variable.name] = variable.defaultValue
    } else {
      // Set sensible defaults based on type
      switch (variable.type) {
        case 'text':
          defaults[variable.name] = ''
          break
        case 'number':
          defaults[variable.name] = 0
          break
        case 'boolean':
          defaults[variable.name] = false
          break
        case 'select':
          defaults[variable.name] = variable.options?.[0] || ''
          break
        case 'date':
          defaults[variable.name] = new Date().toISOString().split('T')[0]
          break
      }
    }
  }

  return defaults
}

/**
 * Extract variables from content and create PromptVariable objects
 */
export function extractVariableDefinitions(content: string): PromptVariable[] {
  const variableNames = parseVariables(content)

  return variableNames.map(name => ({
    name,
    type: 'text' as const,
    required: false,
    placeholder: `Enter value for ${name}`
  }))
}