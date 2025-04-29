import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const baseCommand = (name: string, description: string) =>
  new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption(option =>
      option.setName("tipo")
        .setDescription(name === "resumir" ? "Tipo de resumo" : "Summary type")
        .setRequired(false)
        .addChoices(
          { name: name === "resumir" ? "Curto" : "Short", value: "curto" },
          { name: name === "resumir" ? "Médio" : "Medium", value: "medio" },
          { name: name === "resumir" ? "Detalhado" : "Detailed", value: "detalhado" }
        )
    )
    .addStringOption(option =>
      option.setName("idioma")
        .setDescription(name === "resumir" ? "Idioma do resumo" : "Summary language")
        .setRequired(false)
        .addChoices(
          { name: "Português (Brasil)", value: "pt" },
          { name: "Inglês", value: "en" },
          { name: "Coreano", value: "ko" }
        )
    );

const commands = [
  baseCommand("resumir", "Resume as últimas mensagens enviadas no canal."),
  baseCommand("summarize", "Summarizes the last messages sent in the channel.")
].map(cmd => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log("🔧 Registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands }
    );
    console.log("✅ Comandos registrados com sucesso.");
  } catch (error) {
    console.error("❌ Falha ao registrar comandos:", error);
  }
})();
