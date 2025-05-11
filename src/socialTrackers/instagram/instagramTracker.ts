import { Client, TextChannel } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const INSTAGRAM_USERNAME = process.env.INSTAGRAM_USERNAME!;
const INSTAGRAM_URL = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}`;
const CHECK_INTERVAL = 15 * 60 * 1000;
const CHANNEL_ID = process.env.INSTAGRAM_CHANNEL_ID!;
const LAST_POST_FILE = path.join(__dirname, "lastPost.json");

let lastPost: string | null = null;

function loadLastPost() {
  if (fs.existsSync(LAST_POST_FILE)) {
    try {
      const data = fs.readFileSync(LAST_POST_FILE, "utf-8");
      lastPost = JSON.parse(data).url;
    } catch (err) {
      console.error("Erro ao carregar lastPost.json:", err);
    }
  }
}

function saveLastPost(url: string) {
  fs.writeFileSync(LAST_POST_FILE, JSON.stringify({ url }, null, 2));
  lastPost = url;
}

async function fetchLatestInstagramPost(): Promise<string | null> {
  try {
    const { data } = await axios.get(INSTAGRAM_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 155.0.0.37.107",
        "X-IG-App-ID": "936619743392459",
      },
    });

    const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges;
    if (!edges || edges.length < 4) return null;

    const shortcode = edges[3].node.shortcode;
    const url = `https://www.instagram.com/p/${shortcode}/`;

    return url;
  } catch (error: any) {
    console.error("❌ Erro ao buscar post via API:", error.message || error);
    return null;
  }
}

async function checkInstagram(client: Client) {
  const latest = await fetchLatestInstagramPost();
  if (!latest || latest === lastPost) return;

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  await (channel as TextChannel).send(
    `📢 @everyone **@${INSTAGRAM_USERNAME}** fez uma nova postagem no Instagram!\n${latest}`
  );

  console.log("✅ Notificação de Instagram enviada com sucesso!");
  saveLastPost(latest);
}

export async function startInstagramTracker(client: Client) {
  loadLastPost();
  console.log("📸 Instagram tracker iniciado");

  await checkInstagram(client);
  setInterval(() => checkInstagram(client), CHECK_INTERVAL);
}
