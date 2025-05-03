import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const baseCommand = (name: string, description: string) =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName("tipo")
        .setDescription(name === "resumir" ? "Tipo de resumo" : "Summary type")
        .setRequired(false)
        .addChoices(
          { name: name === "resumir" ? "Curto" : "Short", value: "curto" },
          { name: name === "resumir" ? "Médio" : "Medium", value: "medio" },
          { name: name === "resumir" ? "Detalhado" : "Detailed", value: "detalhado" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("idioma")
        .setDescription(name === "resumir" ? "Idioma do resumo" : "Summary language")
        .setRequired(false)
        .addChoices(
          { name: "Português (Brasil)", value: "pt" },
          { name: "Inglês", value: "en" },
          { name: "Coreano", value: "ko" }
        )
    );

const converterCommand = (name: string, description: string) =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName("direcao")
        .setDescription("Direção da conversão")
        .setRequired(true)
        .addChoices(
          { name: "₩ Won → R$ Real", value: "krw_to_brl" },
          { name: "₩ Won → $ Dólar", value: "krw_to_usd" },
          { name: "R$ Real → ₩ Won", value: "brl_to_krw" },
          { name: "R$ Real → $ Dólar", value: "brl_to_usd" },
          { name: "$ Dólar → ₩ Won", value: "usd_to_krw" },
          { name: "$ Dólar → R$ Real", value: "usd_to_brl" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("valor")
        .setDescription("Valor a ser convertido")
        .setRequired(true)
    );

const timeCommand = (name: string, description: string) =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(description);

const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Verifica o tempo de resposta do bot.");

const commandsCommand = new SlashCommandBuilder()
  .setName("commands")
  .setDescription("Lista todos os comandos disponíveis do bot.");

const commands = [
  baseCommand("resumir", "Resume as últimas mensagens enviadas no canal."),
  baseCommand("summarize", "Summarizes the last messages sent in the channel."),
  converterCommand("converter", "Converte valores entre Wons (₩), Reais (R$) e Dólares ($)."),
  converterCommand("convert", "Converts values between Wons (₩), Reais (R$) and Dollars ($)."),
  timeCommand("horas", "Mostra o horário atual na Coreia do Sul e no Brasil."),
  timeCommand("time", "Shows the current time in Korea and Brazil."),
  pingCommand,
  commandsCommand,
].map((cmd) => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log("🔧 Registrando comandos...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });
    console.log("✅ Comandos registrados com sucesso.");
  } catch (error) {
    console.error("❌ Falha ao registrar comandos:", error);
  }
})();
