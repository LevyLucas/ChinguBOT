import {
  Client,
  TextChannel,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fetchLatestInstagramPost } from "./instagramScraper";
import dotenv from "dotenv";

dotenv.config();

const INSTAGRAM_CHANNEL_ID = process.env.INSTAGRAM_CHANNEL_ID!;
const LAST_POST_FILE = path.join(__dirname, "lastInstagramPost.json");

function saveLastPost(link: string) {
  fs.writeFileSync(LAST_POST_FILE, JSON.stringify({ link }, null, 2));
}

function loadLastPost(): string | null {
  try {
    if (!fs.existsSync(LAST_POST_FILE)) return null;
    const data = fs.readFileSync(LAST_POST_FILE, "utf-8");
    return JSON.parse(data).link;
  } catch {
    return null;
  }
}

async function fetchLatestInstagramPostData() {
  return await fetchLatestInstagramPost("nana.oii");
}

export async function startInstagramTracker(client: Client) {
  console.log("📸 Instagram tracker iniciado");

  const check = async () => {
    try {
      const latest = await fetchLatestInstagramPostData();
      if (!latest) return;

      const lastStored = loadLastPost();
      if (latest.link === lastStored) return;

      const channel = client.channels.cache.get(INSTAGRAM_CHANNEL_ID);
      if (!channel || !channel.isTextBased()) return;

      const caption = latest.caption || "";
      const hashtags = caption.match(/#\w+/g)?.join(" ") || "";
      const textOnly = caption.replace(/#\w+/g, "").trim();

      const embed = new EmbedBuilder()
        .setAuthor({
          name: "nana.oii",
        })
        .setTitle("🆕 Nova postagem no Instagram!")
        .setURL(latest.link)
        .setDescription(
          `${textOnly} \n${hashtags ? `\n${hashtags}` : ""}`
        )
        .setColor(0xe1306c)
        .setImage(latest.imageUrl || null)
        .setTimestamp(new Date());

      const button = new ButtonBuilder()
        .setLabel("Ver no Instagram")
        .setStyle(ButtonStyle.Link)
        .setURL(latest.link);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

      await (channel as TextChannel).send({
        content: `📢 @everyone nova postagem no Instagram!`,
        embeds: [embed],
        components: [row],
      });

      saveLastPost(latest.link);
      console.log("✅ Nova postagem notificada.");
    } catch (err) {
      console.error("❌ Erro ao checar Instagram:", err);
    }
  };

  await check();
  setInterval(check, 5 * 60 * 1000);
}
