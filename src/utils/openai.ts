import { OpenAiMessage } from "@/types/OpenAiMessage"
import { Configuration, OpenAIApi } from "openai"

function createClient (key: string) {
  const conf = new Configuration({ apiKey: key })
  return new OpenAIApi(conf)
}


export async function getEmbedding(key: string, text: string) {
  const client = createClient(key)
  const result = await client.createEmbedding({ model: "text-embedding-ada-002", input: text })
  return result.data.data[0].embedding
}

export async function getChatCompletion(key: string, messages: OpenAiMessage[]) {
  const client = createClient(key)
  const result = await client.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
  })
  return result.data.choices[0].message?.content
}