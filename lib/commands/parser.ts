// Command parser for extracting and processing commands

export interface ParsedCommand {
  trigger: string
  args: string[]
  rawInput: string
  isCommand: boolean
}

export class CommandParser {
  private commandPrefix = '/'

  parse(input: string): ParsedCommand {
    const trimmed = input.trim()

    if (!trimmed.startsWith(this.commandPrefix)) {
      return {
        trigger: '',
        args: [],
        rawInput: input,
        isCommand: false
      }
    }

    // Remove the prefix and split by spaces
    const withoutPrefix = trimmed.slice(this.commandPrefix.length)
    const parts = withoutPrefix.split(/\s+/)
    const trigger = parts[0] || ''
    const args = parts.slice(1)

    return {
      trigger,
      args,
      rawInput: input,
      isCommand: true
    }
  }

  // Check if input is starting a command
  isCommandStart(input: string): boolean {
    return input === this.commandPrefix
  }

  // Extract command suggestions based on partial input
  getSuggestions(input: string, availableCommands: string[]): string[] {
    if (!this.isCommandStart(input) && !input.startsWith(this.commandPrefix)) {
      return []
    }

    const searchTerm = input.slice(this.commandPrefix.length).toLowerCase()

    if (!searchTerm) {
      return availableCommands
    }

    return availableCommands.filter(cmd =>
      cmd.toLowerCase().includes(searchTerm)
    )
  }

  // Format command for display
  formatCommand(trigger: string, description?: string): string {
    return `${this.commandPrefix}${trigger}${description ? ` - ${description}` : ''}`
  }
}

export const commandParser = new CommandParser()