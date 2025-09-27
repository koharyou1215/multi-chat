import { CustomPrompt } from "@/types";

export interface OptimizationOptions {
  mode: "clarity" | "efficiency" | "task-specific" | "multilingual";
  targetModel?: string;
  maxTokens?: number;
  language?: string;
}

export interface OptimizationResult {
  optimizedContent: string;
  originalContent: string;
  improvements: string[];
  tokenReduction?: number;
}

export class PromptOptimizer {
  private apiKey?: string;
  private baseUrl: string = "https://openrouter.ai/api/v1";
  private targetModel?: string;

  constructor(apiKey?: string, targetModel?: string) {
    this.apiKey = apiKey;
    this.targetModel = targetModel;
  }

  /**
   * Optimize a prompt template using API only.
   * No local fallbacks, no template generation.
   */
  async optimizeTemplateWithSample(
    template: string,
    sampleInput: string,
    options: OptimizationOptions = { mode: "clarity" }
  ): Promise<OptimizationResult> {
    const originalContent = template;

    if (!this.apiKey) {
      throw new Error('APIキーが設定されていません。最適化機能を使用するにはAPIキーを設定してください。');
    }

    if (!this.targetModel) {
      throw new Error('モデルが指定されていません。');
    }

    try {
      const systemPrompt = this.getSystemPrompt(options);

      // API instruction to preserve {input} placeholder
      const userPrompt = `
      You are an expert prompt engineer. Optimize the following prompt template
      and convert it into a reusable, role-based structure.

      Rules:
      - Preserve the literal substring {input} (including braces) exactly as written.
      - Do not remove, rename, or modify {input}.
      - Ensure {input} appears in the final optimized template where user text should be inserted.
      - Respond ONLY in the JSON format below.

      Optimization goals:
      - Separate roles clearly (system / user / assistant).
      - Improve clarity, conciseness, and reusability.
      - Ensure the format is directly usable for one-off execution AND library storage.
      - Add metadata (variables, notes, tags).

      Return format:
      {
        "prompt": {
          "system": "...",
          "user": "... with {input} ...",
          "assistant": "..."
        },
        "variables": ["{input}"],
        "notes": "summary of optimizations",
        "tags": ["role-based", "optimized"]
      }

      TEMPLATE (with sample input shown in place of {input}):
      ${template.replace(/\{input\}/g, sampleInput || "")}
      `;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://localhost",
          "X-Title": "MultiChat AI Prompt Optimizer",
        },
          body: JSON.stringify({
          model: this.targetModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: options.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error (${response.status}): ${response.statusText} - ${errText}`);
      }

      const data = await response.json();
      let optimizedContent: string = data.choices[0].message.content;

      // If model returned text that accidentally contains the sample input instead of {input}, try to restore
      if (sampleInput && !optimizedContent.includes('{input}') && optimizedContent.includes(sampleInput)) {
        optimizedContent = optimizedContent.replace(sampleInput, '{input}');
      }

      // Ensure {input} exists in final content; if not, append a note
      if (!optimizedContent.includes('{input}')) {
        optimizedContent = `${optimizedContent}\n\n{input}`;
      }

      return {
        optimizedContent,
        originalContent: template,
        improvements: this.analyzeImprovements(originalContent, optimizedContent),
        tokenReduction: this.calculateTokenReduction(originalContent, optimizedContent),
      };
    } catch (error) {
      console.error('Template optimization error:', error);
      throw new Error(`最適化に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * Optimize a prompt using API only.
   * No local fallbacks, no template generation.
   */
  async optimizePrompt(
    prompt: CustomPrompt,
    options: OptimizationOptions = { mode: "clarity" }
  ): Promise<OptimizationResult> {
    const originalContent = prompt.content;

    if (!this.apiKey) {
      throw new Error('APIキーが設定されていません。最適化機能を使用するにはAPIキーを設定してください。');
    }

    if (!this.targetModel) {
      throw new Error('モデルが指定されていません。');
    }

    try {
      // API-based optimization only
      const systemPrompt = this.getSystemPrompt(options);
      const userPrompt = this.getUserPrompt(originalContent, options);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer":
            typeof window !== "undefined"
              ? window.location.origin
              : "https://localhost",
          "X-Title": "MultiChat AI Prompt Optimizer",
        },
        body: JSON.stringify({
          model: this.targetModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: options.maxTokens || 1000,
        }),
      });

      if (!response.ok) {
        let errorMessage = `API error (${response.status}): ${response.statusText}`;

        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }

          // Handle specific error cases
          if (response.status === 401) {
            throw new Error(
              "Authentication failed. Please check your API key in settings."
            );
          } else if (response.status === 429) {
            throw new Error(
              "API quota exceeded. Please wait and try again later."
            );
          } else if (
            response.status === 400 &&
            errorData.includes("not a valid model")
          ) {
            throw new Error("Invalid model specified for optimization.");
          }
        } catch (parseError) {
          if (
            parseError instanceof Error &&
            parseError.message.includes("Authentication")
          ) {
            throw parseError;
          }
          // If it's not our custom error, continue with the original error message
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      const optimizedContent = data.choices[0].message.content;

      return {
        optimizedContent,
        originalContent,
        improvements: this.analyzeImprovements(
          originalContent,
          optimizedContent
        ),
        tokenReduction: this.calculateTokenReduction(
          originalContent,
          optimizedContent
        ),
      };
    } catch (error) {
      console.error("Optimization error:", error);
      throw new Error(`最適化に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * Get system prompt based on optimization mode
   */
  private getSystemPrompt(options: OptimizationOptions): string {
    const prompts: Record<OptimizationOptions["mode"], string> = {
      clarity: `You are an expert prompt engineer. Your task is to optimize prompts for maximum clarity and effectiveness.
Focus on:
- Clear and specific instructions
- Well-structured format
- Removing ambiguity
- Adding necessary context`,

      efficiency: `You are an expert prompt engineer specializing in token efficiency.
Optimize prompts to:
- Reduce token count by 30-50%
- Maintain all essential information
- Use concise language
- Remove redundancy`,

      "task-specific": `You are an expert prompt engineer. Analyze the task type and optimize the prompt accordingly:
- For coding tasks: Add technical specifications
- For writing tasks: Include tone and style guidelines
- For analysis tasks: Specify output format
- For creative tasks: Add inspiration elements`,

      multilingual: `You are an expert multilingual prompt engineer.
Optimize prompts for:
- Cross-language clarity
- Cultural sensitivity
- Universal understanding
- Proper translation context`,
    };

    return prompts[options.mode];
  }

  /**
   * Get user prompt for optimization request
   */
  private getUserPrompt(content: string, options: OptimizationOptions): string {
    let prompt = `Please optimize the following prompt:\n\n${content}\n\n`;

    if (options.targetModel) {
      prompt += `Target model: ${options.targetModel}\n`;
    }

    if (options.language) {
      prompt += `Target language: ${options.language}\n`;
    }

    prompt += "Provide only the optimized prompt without any explanation.";

    return prompt;
  }

  /**
   * Analyze improvements made
   */
  private analyzeImprovements(original: string, optimized: string): string[] {
    const improvements: string[] = [];

    if (optimized.includes("##") && !original.includes("##")) {
      improvements.push("構造化されたセクションを追加");
    }

    if (optimized.split("\n").length > original.split("\n").length) {
      improvements.push("読みやすさのための改行を追加");
    }

    if (optimized.includes("1.") || optimized.includes("-")) {
      improvements.push("箇条書きでの整理");
    }

    if (optimized.length < original.length * 0.8) {
      improvements.push("冗長な表現を削除");
    }

    if (optimized.includes("期待される出力")) {
      improvements.push("明確な期待値を設定");
    }

    return improvements.length > 0 ? improvements : ["プロンプトを最適化"];
  }

  /**
   * Calculate token reduction
   */
  private calculateTokenReduction(original: string, optimized: string): number {
    // Rough estimation: 1 token ≈ 4 characters in English, 2 characters in Japanese
    const originalTokens = Math.ceil(original.length / 2);
    const optimizedTokens = Math.ceil(optimized.length / 2);
    const reduction = originalTokens - optimizedTokens;
    const percentage = Math.round((reduction / originalTokens) * 100);
    return percentage;
  }

  /**
   * Batch optimize multiple prompts
   */
  async optimizeMultiple(
    prompts: CustomPrompt[],
    options: OptimizationOptions
  ): Promise<Map<string, OptimizationResult>> {
    const results = new Map<string, OptimizationResult>();

    for (const prompt of prompts) {
      try {
        const result = await this.optimizePrompt(prompt, options);
        results.set(prompt.id, result);
      } catch (error) {
        console.error(`Failed to optimize prompt ${prompt.id}:`, error);
      }
    }

    return results;
  }
}