import { ChatMessage } from "../store/chatHistoryStore";
import { addNotification } from "../store/notificationStore";
import { sceneGraphController } from "./sceneGraphController";

const API_URL = "http://localhost:1234/v1/chat/completions";

export interface LLMStudioOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}

// Interface for SceneGraph commands
export interface SceneGraphCommand {
  action: string;
  parameters?: Record<string, any>;
}

/**
 * Generate a system prompt with scene graph command information
 */
function getSystemPromptWithCommands(): string {
  const basePrompt =
    "You are a helpful assistant that can understand and suggest graph modification commands.";
  return `${basePrompt}\n\n${getCommandsContextForLLM()}`;
}

/**
 * Get the command context string for the LLM
 */
function getCommandsContextForLLM(): string {
  return (
    `AVAILABLE GRAPH COMMANDS:\n${sceneGraphController.getCommandsDescription()}\n\n` +
    "When the user asks to modify the graph, you can directly use these commands with the proper API syntax in your response. " +
    "Commands must start with '/graph' followed by the command name and parameters. " +
    "For example: '/graph addNode type=Button label=Submit position=(100,200)'\n\n" +
    "You can include multiple commands in a single response, one per line, and they will all be executed in sequence. " +
    "Your commands will be automatically processed and executed on the graph."
  );
}

/**
 * Call the local LLM Studio API
 * @param messages Array of chat messages
 * @param options Additional parameters like temperature
 * @returns The generated response
 */
export async function callLLMStudioAPI(
  messages: ChatMessage[],
  options: LLMStudioOptions = {}
): Promise<string> {
  try {
    // Validate messages
    if (!messages || messages.length === 0) {
      throw new Error("'messages' field is required and cannot be empty");
    }

    // Check if the last message contains graph modification commands
    const lastMessage = messages[messages.length - 1];

    // Process last message if it contains commands, regardless of role
    if (sceneGraphController.containsCommandKeywords(lastMessage.content)) {
      console.log("Detected command(s) in message:", lastMessage.content);
      // Process all commands in the message
      const commandResult = await sceneGraphController.processMultipleCommands(
        lastMessage.content
      );
      return commandResult;
    }

    console.log("last message was ", lastMessage);

    // Format messages for the API - ensure role and content are present
    const formattedMessages = messages.map(({ role, content }) => ({
      role: role || "user", // Default to user if role is missing
      content: content || "", // Default to empty string if content is missing
    }));

    // Enhanced system prompt that encourages the LLM to generate graph commands
    if (!formattedMessages.some((msg) => msg.role === "system")) {
      formattedMessages.unshift({
        role: "system",
        content: getEnhancedSystemPrompt(),
      });
    } else {
      // Update existing system message with command information
      const systemMsgIndex = formattedMessages.findIndex(
        (msg) => msg.role === "system"
      );
      if (systemMsgIndex >= 0) {
        // Append command info if it's not already there
        if (
          !formattedMessages[systemMsgIndex].content.includes(
            "AVAILABLE GRAPH COMMANDS"
          )
        ) {
          formattedMessages[systemMsgIndex].content +=
            "\n\n" + getCommandsContextForLLM();
        }
      }
    }

    console.log("Formatted Messages:", formattedMessages);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 1,
        max_tokens: options.max_tokens || 2048,
        stream: false,
      }),
    });

    // Log the request for debugging
    console.log("API Request:", {
      url: API_URL,
      messageCount: formattedMessages.length,
      temperature: options.temperature || 0.7,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM Studio API error: ${error}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices?.[0]?.message?.content || "";

    // Check if LLM response contains graph commands and process them if present
    if (sceneGraphController.containsCommandKeywords(generatedResponse)) {
      console.log("LLM generated graph command(s):", generatedResponse);

      // Process all commands in the response
      const commandResults =
        await sceneGraphController.processMultipleCommands(generatedResponse);

      // If the response is just a single command, only return the result
      if (
        generatedResponse.trim().startsWith("/graph") &&
        !generatedResponse.includes("\n")
      ) {
        return commandResults;
      }

      // Otherwise, include both response and results
      return `${generatedResponse}\n\n---\nCommand Results:\n${commandResults}`;
    }

    return generatedResponse;
  } catch (error) {
    console.error("Error calling LLM Studio API:", error);
    addNotification({
      message: `API error: ${error instanceof Error ? error.message : String(error)}`,
      type: "error",
      duration: 5000,
    });
    throw error;
  }
}

/**
 * Generate an enhanced system prompt that encourages the LLM to generate graph commands
 */
function getEnhancedSystemPrompt(): string {
  const basePrompt =
    "You are a helpful assistant that can understand and generate graph modification commands. " +
    "When appropriate, you can directly create or modify graph elements by using the API commands below. " +
    "You can issue multiple commands in sequence to build more complex structures. " +
    "The commands follow a strict format starting with '/graph' followed by the command name and parameters.";

  return `${basePrompt}\n\n${getCommandsContextForLLM()}`;
}

/**
 * Check if the LLM Studio API is available
 * @returns True if the API is available, false otherwise
 */
export async function checkLLMStudioAvailability(): Promise<boolean> {
  try {
    // Make sure we're sending a valid request with required fields
    const testRequest = {
      messages: [
        {
          role: "system",
          content: getSystemPromptWithCommands(),
        },
        {
          role: "user",
          content: "Hello",
        },
      ],
      max_tokens: 1, // Minimal request just to check availability
      temperature: 0.7, // Include temperature to make the request more complete
    };

    console.log("Testing API availability with:", testRequest);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("API availability check failed:", errorText);
    }

    return response.ok;
  } catch (error) {
    console.warn("API availability check error:", error);
    return false;
  }
}
