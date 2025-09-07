import { useState, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { OpenRouterClient } from "@/lib/api/openrouter";
import { ChatMessage, Attachment } from "@/types";
import { generateId } from "@/lib/utils";

export function useOpenRouter() {
  const { openRouterApiKey, addMessage, updatePanel } = useAppStore();
  const [clients] = useState(() => new Map<string, OpenRouterClient>());

  const getClient = useCallback(() => {
    if (!openRouterApiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    let client = clients.get(openRouterApiKey);
    if (!client) {
      client = new OpenRouterClient(openRouterApiKey);
      clients.set(openRouterApiKey, client);
    }
    return client;
  }, [openRouterApiKey, clients]);

  const sendMessage = useCallback(
    async (
      panelId: string,
      modelId: string,
      userMessage: string,
      messages: ChatMessage[],
      customPrompt?: string,
      attachments?: Attachment[]
    ) => {
      try {
        // Add user message
        const userMsg: ChatMessage = {
          id: generateId(),
          content: userMessage,
          role: "user",
          timestamp: new Date(),
          panelId,
          modelId,
          attachments,
        };

        addMessage(panelId, userMsg);
        updatePanel(panelId, { isLoading: true });

        // Get AI response
        const client = getClient();
        const response = await client.generateResponse(
          modelId,
          [...messages, userMsg],
          customPrompt
        );

        // Add AI response
        const aiMsg: ChatMessage = {
          id: generateId(),
          content: response,
          role: "assistant",
          timestamp: new Date(),
          panelId,
          modelId,
        };

        addMessage(panelId, aiMsg);
      } catch (error) {
        console.error("OpenRouter API error:", error);

        // Add error message
        const errorMsg: ChatMessage = {
          id: generateId(),
          content: `エラー: ${
            error instanceof Error
              ? error.message
              : "不明なエラーが発生しました"
          }`,
          role: "assistant",
          timestamp: new Date(),
          panelId,
          modelId,
        };

        addMessage(panelId, errorMsg);
      } finally {
        updatePanel(panelId, { isLoading: false });
      }
    },
    [openRouterApiKey, addMessage, updatePanel, getClient]
  );

  const validateApiKey = useCallback(async (): Promise<boolean> => {
    try {
      const client = getClient();
      return await client.validateApiKey();
    } catch {
      return false;
    }
  }, [getClient]);

  return {
    sendMessage,
    validateApiKey,
    isConfigured: !!openRouterApiKey,
  };
}
