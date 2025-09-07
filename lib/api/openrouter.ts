import { ChatMessage } from "@/types";

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
      model,
      messages: openRouterMessages,
      temperature: 0.7,
      max_tokens: 4000,
      stream: false,
    };

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
      const errorData = await response.text();
      throw new Error(
        `OpenRouter API error (${response.status}): ${errorData}`
      );
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter API");
    }

    return data.choices[0].message.content;
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
