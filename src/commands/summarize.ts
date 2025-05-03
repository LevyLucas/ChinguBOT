import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getBuffer, clearBuffer } from "../utils/messageBuffer";
import { summarizeMessages } from "../services/openai";

export const command = {
  data: new SlashCommandBuilder()
    .setName("resumir")
    .setDescription("Resume as últimas mensagens enviadas no canal.")
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription("Tipo de resumo")
        .setRequired(false)
        .addChoices(
          { name: "Curto", value: "curto" },
          { name: "Médio", value: "medio" },
          { name: "Detalhado", value: "detalhado" }
        )
    )
    .addStringOption(option =>
      option.setName("idioma")
        .setDescription("Escolha o idioma do resumo")
        .setRequired(false)
        .addChoices(
          { name: "Português (Brasil)", value: "pt" },
          { name: "Inglês", value: "en" },
          { name: "Coreano", value: "ko" }
        )
    ),
  aliases: ["summarize"],

  async execute(interaction: ChatInputCommandInteraction) {
    const tipo = interaction.options.getString("tipo") || "curto";
    const idioma = interaction.options.getString("idioma") || "pt";
    const buffer = getBuffer(interaction.channelId);
  
    if (!buffer || buffer.length === 0) {
      return interaction.reply(getLocalizedText(idioma, "noData"));
    }
  
    await interaction.deferReply();
  
    try {
      const summary = await summarizeMessages(buffer.join("\n"), tipo, idioma);
      clearBuffer(interaction.channelId);
      return interaction.editReply(`${getLocalizedText(idioma, "summary", tipo)}\n${summary}`);
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      return interaction.editReply(getLocalizedText(idioma, "error"));
    }
  }
};

function getLocalizedText(lang: string, key: "noData" | "error" | "summary", tipo?: string) {
  const translations: Record<string, Record<string, string>> = {
    pt: {
      noData: "❌ Não há mensagens recentes suficientes para resumir.",
      error: "❌ Erro ao gerar o resumo. Verifique a API.",
      summary: `📋 **Resumo (${tipo})**:`
    },
    en: {
      noData: "❌ There are not enough recent messages to summarize.",
      error: "❌ Error generating summary. Please check the API.",
      summary: `📋 **Summary (${tipo})**:`
    },
    ko: {
      noData: "❌ 최근 메시지가 부족하여 요약할 수 없습니다.",
      error: "❌ 요약을 생성하는 중 오류가 발생했습니다. API를 확인하세요.",
      summary: `📋 **요약 (${tipo})**:`
    }
  };

  return translations[lang]?.[key] || translations.en[key];
}
