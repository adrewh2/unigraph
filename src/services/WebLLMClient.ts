// WebLLMClient.ts

import {
  ChatCompletion,
  CompletionCreateParams,
  MLCEngine,
} from "@mlc-ai/web-llm";
import { ChatMessage } from "../store/chatHistoryStore";

export interface WebLLMClientConfig {
  model: string;
  initProgressCallback?: (report: { progress: number }) => void;
}

export class WebLLMClient {
  private engine: MLCEngine | null = null;
  private model: string;
  private initProgressCallback?: (report: { progress: number }) => void;

  public getModel(): string {
    return this.model;
  }

  constructor(config: WebLLMClientConfig) {
    this.model = config.model;
    this.initProgressCallback = config.initProgressCallback;
  }

  public async load(): Promise<void> {
    if (this.engine) return; // already loaded
    this.engine = new MLCEngine({
      initProgressCallback: (report) =>
        this.initProgressCallback?.({ progress: report.progress }),
    });
    await this.engine.reload(this.model);
  }

  public async reload(): Promise<void> {
    if (!this.engine) throw new Error("Engine not initialized");
    await this.engine.reload(this.model);
  }

  public isLoaded(): boolean {
    return this.engine !== null;
  }

  public async chatCompletion(
    messages: ChatMessage[],
    params?: Omit<CompletionCreateParams, "messages">
  ): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");

    const reply = (await this.engine.chat.completions.create({
      messages,
      stream: false,
      ...params,
    })) as ChatCompletion;

    return reply.choices[0]?.message?.content ?? "";
  }

  public async streamChatCompletion(messages: ChatMessage[]): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");

    // Chunks is an AsyncGenerator object
    const chunks = await this.engine.chat.completions.create({
      messages,
      temperature: 1,
      stream: true, // <-- Enable streaming
      stream_options: { include_usage: true },
    });

    let reply = "";
    for await (const chunk of chunks) {
      reply += chunk.choices[0]?.delta.content || "";
      console.log(reply);
      if (chunk.usage) {
        console.log(chunk.usage); // only last chunk has usage
      }
    }

    const fullReply = await this.engine.getMessage();
    return fullReply;
  }

  public async getMessage(): Promise<string> {
    if (!this.engine) throw new Error("Engine not loaded");
    return await this.engine.getMessage();
  }
}
