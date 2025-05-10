import { Client, TextChannel } from "discord.js";
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

  const { data } = await axios.post(
    `https://id.twitch.tv/oauth2/token`,
    null,
    {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials"
      }
    }
  );

  accessToken = data.access_token;
  return accessToken!;
}

async function isLive(): Promise<{ live: boolean; url?: string }> {
  const token = await getAccessToken();

  const userRes = await axios.get("https://api.twitch.tv/helix/users", {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`
    },
    params: {
      login: TWITCH_USERNAME
    }
  });

  const userId = userRes.data.data[0]?.id;
  if (!userId) return { live: false };

  const streamRes = await axios.get("https://api.twitch.tv/helix/streams", {
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`
    },
    params: {
      user_id: userId
    }
  });

  const isOnline = streamRes.data.data.length > 0;
  const url = `https://www.twitch.tv/${TWITCH_USERNAME}`;

  return { live: isOnline, url };
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

        await (channel as TextChannel).send(
          `🔴 @everyone A **${TWITCH_USERNAME}** está AO VIVO na Twitch! 👉 ${status.url}`
        );

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
