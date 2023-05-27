import { OpenAiMessage } from "@/types/OpenAiMessage"
import axios from "axios"

export async function countTokens(text: string) {
  const result = await axios.post<{ tokens: number }>("/api/token", { text })
  return result.data.tokens
}

export async function checkApiKey(
  apiKey: string,
) {
  const result = await axios.post<{ valid: boolean }>("/api/checkApiKey", { apiKey, })
  return result.data.valid
}

export async function getChatCompletion(
  apiKey: string,
  messages: OpenAiMessage[],
) {
  const result = await axios.post<{ answer: string, tokens: number }>("/api/chatCompletion", { messages, apiKey, })
  return result.data
}
