import { Client, GatewayIntentBits, Collection, Interaction } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import { addMessage } from "./utils/messageBuffer";
import { startTwitchTracker } from "./socialTrackers/twitch/twitchTracker";
import { startYoutubeTracker } from "./socialTrackers/youtube/youtubeTracker";

interface CustomClient extends Client {
  commands: Collection<string, any>;
}

const client: CustomClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as CustomClient;

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
  const { command } = require(path.join(commandsPath, file));
  if (command?.data && typeof command.execute === "function") {
    const names = [command.data.name, ...(command.aliases || [])];
    for (const name of names) {
      client.commands.set(name, command);
    }
  }
}

client.once("ready", () => {
  console.log(`✅ Logado como ${client.user?.tag}`);
  const statusMessages = [
    "💬 /social to see Nana's social medias",
    "🌐 Useful commands for the community",
    "📺 Notifying lives and videos",
    "🤖 Helping the Community 💓",
    "💡 Type /commands to see all commands",
    "🌟 Type /summarize to summarize content",
    "💱 Type /convert to convert currencies",
    "🕒 Type /time to check the time in Korea",
    "🌦️ Type /weather to check the weather",
  ];

  let index = 0;
  setInterval(() => {
    client.user?.setPresence({
      status: "online",
      activities: [
        {
          name: "🌸 ChinguBOT ativo!",
          type: 4,
          state: statusMessages[index],
        },
      ],
    });
    index = (index + 1) % statusMessages.length;
  }, 5000);
  startTwitchTracker(client);
  startYoutubeTracker(client);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  addMessage(
    message.channelId,
    `${message.author.username}: ${message.content}`
  );
});

client.on("interactionCreate", async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `Erro ao executar o comando /${interaction.commandName}`,
      error
    );
    const errorMsg = interaction.locale?.startsWith("pt")
      ? "❌ Ocorreu um erro ao executar o comando."
      : "❌ An error occurred while executing the command.";
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(errorMsg);
    } else {
      await interaction.reply({ content: errorMsg, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
