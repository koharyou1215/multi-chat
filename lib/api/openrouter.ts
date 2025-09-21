import { ChatMessage } from "@/types";
import { validateModelId } from "@/lib/model-validator";

export interface OpenRouterContentPartText {
  type: "text";
  text: string;
}
export interface OpenRouterContentPartImage {
  type: "image_url";
  image_url: { url: string };
}
export type OpenRouterContentPart =
  | OpenRouterContentPartText
  | OpenRouterContentPartImage;

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string | OpenRouterContentPart[];
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    model: string,
    messages: ChatMessage[],
    systemPrompt?: string
  ): Promise<string> {
    // Validate and correct model ID using central validator
    const validatedModel = validateModelId(model);

    const openRouterMessages: OpenRouterMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      openRouterMessages.push({
        role: "system",
        content: systemPrompt,
      });
    }

    // Convert chat messages to OpenRouter format
    messages.forEach((msg) => {
      const hasImageAttachments = (msg.attachments || []).some((a) =>
        a.mimeType?.startsWith("image/")
      );
      if (msg.role === "user" && hasImageAttachments) {
        const parts: OpenRouterContentPart[] = [];
        if (msg.content && msg.content.trim().length > 0) {
          parts.push({ type: "text", text: msg.content });
        }
        for (const att of msg.attachments || []) {
          if (att.mimeType?.startsWith("image/") && att.url) {
            parts.push({ type: "image_url", image_url: { url: att.url } });
          }
        }
        openRouterMessages.push({ role: "user", content: parts });
      } else {
        openRouterMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    const requestBody = {
      model: validatedModel,
      messages: openRouterMessages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "MultiChat AI",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = `OpenRouter API error (${response.status})`;

        try {
          const errorData = await response.text();
          errorMessage += `: ${errorData}`;

          // Handle specific error cases
          if (response.status === 429) {
            throw new Error("API quota exceeded. Please wait and try again later.");
          } else if (response.status === 400 && errorData.includes("not a valid model")) {
            throw new Error(`Invalid model ID: ${validatedModel}. Please check the model configuration.`);
          }
        } catch (parseError) {
          console.warn("Could not parse error response:", parseError);
        }

        throw new Error(errorMessage);
      }

      let data: OpenRouterResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Invalid JSON response from API. The response may be corrupted.");
      }

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response from OpenRouter API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      // Enhanced error logging
      console.error("OpenRouter API Error Details:", {
        model: validatedModel,
        originalModel: model,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString()
      });

      // Re-throw the error for handling by the calling code
      throw error;
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": window.location.origin,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async getAvailableModels(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": window.location.origin,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }

    const data = await response.json();
    return data.data || [];
  }
}
