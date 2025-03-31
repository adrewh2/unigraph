import { WebLLMClient } from "./WebLLMClient";

export const webllmClient = new WebLLMClient({
  model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  initProgressCallback: (progress) =>
    console.log("Loading progress:", progress),
});

export async function main() {
  await webllmClient.load();

  console.log("Model loaded:", webllmClient.getModel(), "sending message");

  // Simple completion
  const reply = await webllmClient.chatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me a story about a cat." },
  ]);

  console.log("Full Reply:", reply);

  // Streaming completion
  const reply2 = await webllmClient.streamChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Give me a joke." },
  ]);

  console.log(reply2);
}

main();
