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
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const TWITCH_USERNAME = process.env.TWITCH_USERNAME!;
const TWITCH_CHANNEL_ID = process.env.TWITCH_CHANNEL_ID!;
const LAST_LIVE_FILE = path.join(__dirname, "lastLive.json");

let accessToken: string | null = null;

function saveLastLive(status: boolean) {
  fs.writeFileSync(LAST_LIVE_FILE, JSON.stringify({ live: status }, null, 2));
}

function loadLastLive(): boolean {
  try {
    if (!fs.existsSync(LAST_LIVE_FILE)) return false;
    const data = fs.readFileSync(LAST_LIVE_FILE, "utf-8");
    return JSON.parse(data).live;
  } catch {
    return false;
  }
}

async function getAccessToken(): Promise<string> {
  if (accessToken) return accessToken;

  const { data } = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
    params: {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  });

  accessToken = data.access_token;
  return accessToken!;
}

async function isLive(): Promise<{
  live: boolean;
  url?: string;
  streamData?: any;
  profileImage?: string;
}> {
  const token = await getAccessToken();

  const userRes = await axios.get("https://api.twitch.tv/helix/users", {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    params: {
      login: TWITCH_USERNAME,
    },
  });

  const user = userRes.data.data[0];
  const userId = user?.id;
  const profileImage = user?.profile_image_url;

  if (!userId) return { live: false };

  const streamRes = await axios.get("https://api.twitch.tv/helix/streams", {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
    },
    params: {
      user_id: userId,
    },
  });

  const isOnline = streamRes.data.data.length > 0;
  const streamData = streamRes.data.data[0];

  return {
    live: isOnline,
    url: `https://www.twitch.tv/${TWITCH_USERNAME}`,
    streamData,
    profileImage,
  };
}

export async function startTwitchTracker(client: Client) {
  console.log("🎮 Twitch tracker iniciado");

  const check = async () => {
    try {
      const status = await isLive();
      const wasLive = loadLastLive();

      if (status.live && !wasLive) {
        const channel = client.channels.cache.get(TWITCH_CHANNEL_ID);
        if (!channel || !channel.isTextBased()) return;

        const streamData = status.streamData!;
        const streamTitle = streamData.title;
        const profileImage = status.profileImage;
        const gameName = streamData.game_name || "Desconhecido";
        const viewerCount = streamData.viewer_count?.toString() || "N/A";

        const thumbnailUrl =
          streamData.thumbnail_url
            .replace("{width}", "440")
            .replace("{height}", "248") + `?rand=${Date.now()}`;

        const embed = new EmbedBuilder()
          .setAuthor({ name: `🔴 ${TWITCH_USERNAME} is now live on Twitch!` })
          .setTitle(`${streamTitle}`)
          .setDescription(
            "Clique no botão abaixo para assistir a live agora mesmo."
          )
          .setColor(0x9146ff)
          .setThumbnail(profileImage ?? null)
          .addFields(
            { name: "Category", value: gameName, inline: true },
            { name: "Viewers", value: viewerCount, inline: true }
          )
          .setImage(thumbnailUrl)
          .setURL(status.url!)
          .setTimestamp();

        const button = new ButtonBuilder()
          .setLabel("Watch Stream")
          .setStyle(ButtonStyle.Link)
          .setURL(status.url!);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        await (channel as TextChannel).send({
          content: `📢 @everyone **${TWITCH_USERNAME}** está AO VIVO na Twitch!`,
          embeds: [embed],
          components: [row],
        });

        console.log("✅ Notificação de live enviada.");
        saveLastLive(true);
      } else if (!status.live && wasLive) {
        console.log("📴 Live encerrada.");
        saveLastLive(false);
      }
    } catch (err) {
      console.error("❌ Erro ao checar live da Twitch:", err);
    }
  };

  await check();
  setInterval(check, 5 * 60 * 1000);
}
