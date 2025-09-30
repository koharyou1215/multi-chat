// Command registry for managing available commands

import type { Command } from '@/types'

export class CommandRegistry {
  private commands: Map<string, Command> = new Map()

  constructor() {
    this.registerDefaultCommands()
  }

  private registerDefaultCommands() {
    // System commands
    this.register({
      id: 'clear',
      trigger: 'clear',
      description: 'Clear all messages',
      category: 'system',
      action: async () => {
        // Will be connected to store action
        // Clearing messages...
      }
    })

    this.register({
      id: 'reset',
      trigger: 'reset',
      description: 'Reset chat to initial state',
      category: 'system',
      action: async () => {
        // Resetting chat...
      }
    })

    this.register({
      id: 'help',
      trigger: 'help',
      description: 'Show available commands',
      category: 'system',
      action: async () => {
        // Showing help...
      }
    })

    // Prompt commands
    this.register({
      id: 'save',
      trigger: 'save',
      description: 'Save current prompt',
      category: 'prompt',
      action: async (args?: string[]) => {
        const title = args?.join(' ') || ''
        // Saving prompt as: ${title}
      }
    })

    this.register({
      id: 'load',
      trigger: 'load',
      description: 'Load a saved prompt',
      category: 'prompt',
      action: async (args?: string[]) => {
        const promptId = args?.[0] || ''
        // Loading prompt: ${promptId}
      }
    })

    this.register({
      id: 'prompts',
      trigger: 'prompts',
      description: 'Show prompt library',
      category: 'prompt',
      action: async () => {
        // Opening prompt library...
      }
    })

    // Utility commands
    this.register({
      id: 'theme',
      trigger: 'theme',
      description: 'Toggle theme (light/dark/system)',
      category: 'utility',
      action: async (args?: string[]) => {
        const theme = args?.[0] || 'toggle'
        // Setting theme: ${theme}
      }
    })

    this.register({
      id: 'panels',
      trigger: 'panels',
      description: 'Set number of panels (1-6)',
      category: 'utility',
      action: async (args?: string[]) => {
        const count = parseInt(args?.[0] || '2') || 2
        // Setting panels: ${count}
      }
    })

    this.register({
      id: 'model',
      trigger: 'model',
      description: 'Change AI model for selected panel',
      category: 'utility',
      action: async (args?: string[]) => {
        const modelId = args?.join(' ') || ''
        // Setting model: ${modelId}
      }
    })

    this.register({
      id: 'export',
      trigger: 'export',
      description: 'Export chat history',
      category: 'utility',
      action: async () => {
        // Exporting chat...
      }
    })
  }

  register(command: Command): void {
    this.commands.set(command.trigger, command)
  }

  unregister(trigger: string): void {
    this.commands.delete(trigger)
  }

  get(trigger: string): Command | undefined {
    return this.commands.get(trigger)
  }

  getAll(): Command[] {
    return Array.from(this.commands.values())
  }

  getByCategory(category: string): Command[] {
    return this.getAll().filter(cmd => cmd.category === category)
  }

  getTriggers(): string[] {
    return Array.from(this.commands.keys())
  }

  execute(trigger: string, args: string[] = []): Promise<void> {
    const command = this.get(trigger)
    if (!command) {
      throw new Error(`Command not found: /${trigger}`)
    }
    return command.action(args)
  }
}

export const commandRegistry = new CommandRegistry()