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
          {
            name: name === "resumir" ? "Detalhado" : "Detailed",
            value: "detalhado",
          }
        )
    )
    .addStringOption((option) =>
      option
        .setName("idioma")
        .setDescription(
          name === "resumir" ? "Idioma do resumo" : "Summary language"
        )
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
          { name: "R$ Real → ₩ Won", value: "brl_to_krw" }
        )
    )
    .addNumberOption((option) =>
      option
        .setName("valor")
        .setDescription("Valor a ser convertido")
        .setRequired(true)
    );

const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Verifica o tempo de resposta do bot.");

const commandsCommand = new SlashCommandBuilder()
  .setName("commands")
  .setDescription("Lista todos os comandos disponíveis do bot.");

const commands = [
  baseCommand("resumir", "Resume as últimas mensagens enviadas no canal."),
  baseCommand("summarize", "Summarizes the last messages sent in the channel."),
  converterCommand("converter", "Converte valores entre Wons (₩) e Reais (R$)."),
  converterCommand("convert", "Converts values between Wons (₩) and Reais (R$)."),
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
