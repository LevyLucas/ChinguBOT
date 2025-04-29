import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Interaction } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { addMessage, getBuffer } from "./utils/messageBuffer"; // IMPORTA o buffer organizado

// Setup do cliente
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent // obrigatório pra ler mensagens!
  ]
});

// Quando o bot entrar
client.once("ready", () => {
  console.log(`✅ Logado como ${client.user?.tag}`);
});

// Captura todas as mensagens e armazena por canal
client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  addMessage(message.channelId, `${message.author.username}: ${message.content}`);
});

// Quando usarem /resumir
client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "resumir") return;

  const tipo = interaction.options.getString("tipo") || "curto";

  const buffer = getBuffer(interaction.channelId);
  if (!buffer || buffer.length === 0) {
    return interaction.reply("❌ Não há mensagens recentes suficientes para resumir.");
  }

  await interaction.deferReply();
  
  try {
    const { summarizeMessages } = await import("./services/openai");
    const summary = await summarizeMessages(buffer.join("\n"), tipo);
    return interaction.editReply(`📋 **Resumo (${tipo}):**\n${summary}`);
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return interaction.editReply("❌ Erro ao gerar o resumo. Verifique a API.");
  }
});

// Login
client.login(process.env.DISCORD_TOKEN);
