import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("resumir")
    .setDescription("Resume as últimas mensagens enviadas no canal.")
    .addStringOption(option => 
      option.setName("tipo")
        .setDescription("Escolha o tipo de resumo")
        .setRequired(false)
        .addChoices(
          { name: "Curto", value: "curto" },
          { name: "Médio", value: "medio" },
          { name: "Detalhado", value: "detalhado" }
        )
    )
].map(cmd => cmd.toJSON());

const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log("🔧 Registrando comandos...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!), // PEGANDO do .env agora!
      { body: commands }
    );
    console.log("✅ Comandos registrados com sucesso.");
  } catch (error) {
    console.error("❌ Falha ao registrar comandos:", error);
  }
})();
