import { Client, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

dotenv.config();

const YOUTUBE_FEED_URL = process.env.YOUTUBE_FEED_URL!;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID!;
const LAST_VIDEO_FILE = path.join(__dirname, "lastYoutubeVideo.json");

let lastVideoId: string | null = null;

function loadLastVideo() {
  if (fs.existsSync(LAST_VIDEO_FILE)) {
    try {
      const data = fs.readFileSync(LAST_VIDEO_FILE, "utf-8");
      lastVideoId = JSON.parse(data).id;
    } catch (err) {
      console.error("Erro ao carregar lastYoutubeVideo.json:", err);
    }
  }
}

function saveLastVideo(id: string) {
  fs.writeFileSync(LAST_VIDEO_FILE, JSON.stringify({ id }, null, 2));
  lastVideoId = id;
}

async function fetchLatestYoutubeVideo(): Promise<{ id: string; title: string; url: string } | null> {
  try {
    const { data } = await axios.get(YOUTUBE_FEED_URL);
    const parser = new XMLParser();
    const feed = parser.parse(data);

    const latest = feed.feed?.entry?.[0];
    if (!latest) return null;

    return {
      id: latest["yt:videoId"],
      title: latest.title,
      url: latest.link?.["@_href"] || `https://www.youtube.com/watch?v=${latest["yt:videoId"]}`,
    };
  } catch (err) {
    console.error("Erro ao buscar feed do YouTube:", err);
    return null;
  }
}

export async function startYoutubeTracker(client: Client) {
  loadLastVideo();
  console.log("📺 YouTube tracker iniciado");

  const check = async () => {
    const video = await fetchLatestYoutubeVideo();
    if (!video || video.id === lastVideoId) return;

    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    await (channel as TextChannel).send(
      `🆕 @everyone Novo vídeo no canal **Cortes da Nana**: **${video.title}**\n${video.url}`
    );

    console.log("✅ Notificação de vídeo enviada.");
    saveLastVideo(video.id);
  };

  await check();
  setInterval(check, 10 * 60 * 1000); // Verifica a cada 10 minutos
}
