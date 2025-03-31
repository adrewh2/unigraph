import { WebLLMClient } from "./WebLLMClient";

const client = new WebLLMClient({
  model: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  initProgressCallback: (progress) =>
    console.log("Loading progress:", progress),
});

export async function main() {
  await client.load();

  console.log("Model loaded:", client.getModel(), "sending message");

  // Simple completion
  const reply = await client.chatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Tell me a story about a cat." },
  ]);

  console.log("Full Reply:", reply);

  // Streaming completion
  const reply2 = await client.streamChatCompletion([
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Give me a joke." },
  ]);

  console.log(reply2);
}

main();
