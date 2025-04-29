import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

export async function summarizeMessages(messages: string, tipo: string): Promise<string> {
  const promptType =
    tipo === "medio" ? "Resuma em 2 a 3 parágrafos." :
    tipo === "detalhado" ? "Resuma detalhadamente em vários parágrafos." :
    "Resuma em 1 parágrafo curto.";

  const fullPrompt = `${promptType}\n\n${messages}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { role: "system", content: "Você é um assistente que resume conversas do Discord de forma clara e objetiva." },
          { role: "user", content: fullPrompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro da API OpenRouter:", error);
      return "❌ Erro ao acessar a API de resumo. Contacte o DEV para mais informações.";
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err: any) {
    console.error("Erro inesperado ao resumir:", err);
    return "❌ Erro inesperado ao tentar gerar o resumo.";
  }
}
