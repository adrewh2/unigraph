/**
 * SceneGraphController handles modifications to the scene graph based on commands
 * received from various sources including the LLM Studio service.
 */

export interface SceneGraphCommand {
  action: string;
  target?: string;
  parameters?: Record<string, any>;
}

export interface CommandDefinition {
  name: string;
  description: string;
  examples: string[];
  keywords: string[];
}

export class SceneGraphController {
  // Command registry for easy extension
  private commandRegistry: CommandDefinition[] = [
    {
      name: "addNode",
      description: "Add a new node to the scene graph",
      examples: [
        "Add node of type TextBox",
        "Add node with type Image at position (100, 200)",
      ],
      keywords: ["add node", "create node", "new node"],
    },
    {
      name: "removeNode",
      description: "Remove a node from the scene graph",
      examples: ["Remove node TextBox1", "Delete node with ID Image3"],
      keywords: ["remove node", "delete node", "eliminate node"],
    },
    {
      name: "connectNodes",
      description: "Connect two nodes in the scene graph",
      examples: ["Connect nodes from A to B", "Link node TextBox1 to Image2"],
      keywords: ["connect nodes", "link nodes", "join nodes"],
    },
    // New commands can be added here
  ];

  /**
   * Get all available commands with their descriptions
   */
  getAvailableCommands(): CommandDefinition[] {
    return this.commandRegistry;
  }

  /**
   * Get a formatted string of available commands for the LLM context
   */
  getCommandsDescription(): string {
    return this.commandRegistry
      .map(
        (cmd) =>
          `Command: ${cmd.name}\nDescription: ${cmd.description}\nExamples: ${cmd.examples.join(", ")}`
      )
      .join("\n\n");
  }

  /**
   * Register a new command
   * @param command The command definition to add
   */
  registerCommand(command: CommandDefinition): void {
    this.commandRegistry.push(command);
  }

  /**
   * Check if a message contains any known graph command keywords
   */
  containsCommandKeywords(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.commandRegistry.some((cmd) =>
      cmd.keywords.some((keyword) => lowerMessage.includes(keyword))
    );
  }

  /**
   * Parse a command string into a structured SceneGraphCommand
   */
  parseCommand(commandString: string): SceneGraphCommand {
    // Simple parsing logic - this could be enhanced with NLP or more sophisticated parsing
    const lowerCommand = commandString.toLowerCase();

    if (this.matchesCommand("addNode", lowerCommand)) {
      return {
        action: "addNode",
        parameters: {
          type: this.extractNodeType(commandString),
          position: this.extractPosition(commandString),
        },
      };
    }

    if (this.matchesCommand("removeNode", lowerCommand)) {
      return {
        action: "removeNode",
        target: this.extractNodeId(commandString),
      };
    }

    if (this.matchesCommand("connectNodes", lowerCommand)) {
      return {
        action: "connectNodes",
        parameters: {
          source: this.extractSourceNode(commandString),
          target: this.extractTargetNode(commandString),
        },
      };
    }

    // Default fallback
    return {
      action: "unknown",
      parameters: {
        originalCommand: commandString,
      },
    };
  }

  /**
   * Check if a message matches a command by its keywords
   */
  private matchesCommand(commandName: string, message: string): boolean {
    const command = this.commandRegistry.find(
      (cmd) => cmd.name === commandName
    );
    if (!command) return false;

    return command.keywords.some((keyword) => message.includes(keyword));
  }

  /**
   * Execute a graph command based on a natural language input
   */
  async executeCommand(commandString: string): Promise<string> {
    try {
      const parsedCommand = this.parseCommand(commandString);

      switch (parsedCommand.action) {
        case "addNode":
          return this.addNode(parsedCommand.parameters);
        case "removeNode":
          return this.removeNode(parsedCommand.target!);
        case "connectNodes":
          return this.connectNodes(
            parsedCommand.parameters!.source,
            parsedCommand.parameters!.target
          );
        default:
          return `Unrecognized graph command. Available commands:\n${this.getCommandsDescription()}`;
      }
    } catch (error) {
      console.error("Error executing graph command:", error);
      return `Failed to execute graph command: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Helper methods for command parsing
  private extractNodeType(command: string): string {
    // Simple extraction - could be improved with regex or NLP
    const typeMatch = command.match(/type ["']?([a-zA-Z0-9]+)["']?/i);
    return typeMatch ? typeMatch[1] : "default";
  }

  private extractPosition(command: string): { x: number; y: number } {
    // Extract position information with simple pattern matching
    const posMatch = command.match(
      /position ?\((-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/i
    );
    return posMatch
      ? { x: parseFloat(posMatch[1]), y: parseFloat(posMatch[2]) }
      : { x: 0, y: 0 };
  }

  private extractNodeId(command: string): string {
    const idMatch = command.match(/node ["']?([a-zA-Z0-9_-]+)["']?/i);
    return idMatch ? idMatch[1] : "";
  }

  private extractSourceNode(command: string): string {
    const sourceMatch = command.match(/from ["']?([a-zA-Z0-9_-]+)["']?/i);
    return sourceMatch ? sourceMatch[1] : "";
  }

  private extractTargetNode(command: string): string {
    const targetMatch = command.match(/to ["']?([a-zA-Z0-9_-]+)["']?/i);
    return targetMatch ? targetMatch[1] : "";
  }

  // Graph modification methods
  private addNode(params: any): string {
    // Here you would actually modify your scene graph
    console.log(
      `Adding node of type ${params.type} at position (${params.position.x}, ${params.position.y})`
    );
    return `Added new ${params.type} node to the graph at position (${params.position.x}, ${params.position.y})`;
  }

  private removeNode(nodeId: string): string {
    console.log(`Removing node with ID ${nodeId}`);
    return `Removed node ${nodeId} from the graph`;
  }

  private connectNodes(sourceId: string, targetId: string): string {
    console.log(`Connecting node ${sourceId} to ${targetId}`);
    return `Connected node ${sourceId} to node ${targetId}`;
  }
}

// Export a singleton instance
export const sceneGraphController = new SceneGraphController();
