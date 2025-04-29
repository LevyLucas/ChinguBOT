import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

export async function summarizeMessages(messages: string, tipo: string, lang: string): Promise<string> {
  const promptType = getPromptType(lang, tipo);
  const languageInstruction = getLanguageInstruction(lang);

  const fullPrompt = `
${languageInstruction}
${promptType}

Mensagens:
${messages}
`.trim();

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        messages: [
          { role: "system", content: getSystemPrompt(lang) },
          { role: "user", content: fullPrompt }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro da API OpenRouter:", error);
      return getErrorText(lang);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (err: any) {
    console.error("Erro inesperado ao resumir:", err);
    return getErrorText(lang);
  }
}

function getPromptType(lang: string, tipo: string) {
  if (lang === "pt") {
    return tipo === "medio"
      ? "Resuma a conversa em 2 a 3 parágrafos."
      : tipo === "detalhado"
      ? "Resuma a conversa detalhadamente usando vários parágrafos."
      : "Resuma a conversa em 1 parágrafo curto.";
  }
  if (lang === "ko") {
    return tipo === "medio"
      ? "대화를 2~3개의 단락으로 요약하세요."
      : tipo === "detalhado"
      ? "여러 단락으로 자세히 대화를 요약하세요."
      : "짧은 한 단락으로 대화를 요약하세요.";
  }
  return tipo === "medio"
    ? "Summarize the conversation in 2 to 3 paragraphs."
    : tipo === "detalhado"
    ? "Summarize the conversation in detail using multiple paragraphs."
    : "Summarize the conversation in 1 short paragraph.";
}

function getLanguageInstruction(lang: string) {
  if (lang === "pt") return "⚠️ Escreva o resumo **em português**.";
  if (lang === "ko") return "⚠️ 요약을 **한국어**로 작성하세요.";
  return "⚠️ Write the summary **in English**.";
}

function getSystemPrompt(lang: string) {
  if (lang === "pt") return "Você é um assistente que resume conversas do Discord de forma clara e objetiva em português.";
  if (lang === "ko") return "당신은 Discord 대화를 명확하고 간결하게 **한국어로** 요약하는 도우미입니다.";
  return "You are an assistant that summarizes Discord conversations clearly and concisely in English.";
}

function getErrorText(lang: string) {
  if (lang === "pt") return "❌ Erro ao tentar acessar a API de resumo.";
  if (lang === "ko") return "❌ 요약 API에 접근하는 동안 오류가 발생했습니다.";
  return "❌ Error accessing the summary API.";
}
