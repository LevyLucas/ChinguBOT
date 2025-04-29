import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifica o tempo de resposta do bot."),
  aliases: [],

  async execute(interaction: ChatInputCommandInteraction) {
    const start = Date.now();
    await interaction.reply(getLocalizedReply(interaction.locale, "pong"));
    const end = Date.now();
    const ms = end - start;

    await interaction.editReply(getLocalizedReply(interaction.locale, "latency", ms));
  }
};

function getLocalizedReply(locale: string, key: "pong" | "latency", ms?: number): string {
  const lang = locale.startsWith("pt") ? "pt" : locale.startsWith("ko") ? "ko" : "en";

  const messages: Record<string, Record<string, string>> = {
    pt: {
      pong: "🏓 Pong!",
      latency: `🏓 Pong! Meu tempo de resposta é de **${ms}ms**.`
    },
    en: {
      pong: "🏓 Pong!",
      latency: `🏓 Pong! My response time is **${ms}ms**.`
    },
    ko: {
      pong: "🏓 퐁!",
      latency: `🏓 퐁! 응답 시간은 **${ms}ms** 입니다.`
    }
  };

  return messages[lang][key];
}
