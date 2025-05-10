import { Client, TextChannel, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import puppeteer from "puppeteer";

dotenv.config();

const INSTAGRAM_URL = "https://www.instagram.com/nana.oii/";
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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(INSTAGRAM_URL, {
      waitUntil: "networkidle2",
      timeout: 30000,
    });

    await page.waitForSelector("article a", { timeout: 10000 });

    const postUrls = await page.$$eval("article a", (elements) => {
      return elements.map((el) => (el as HTMLAnchorElement).href);
    });

    const unique = [...new Set(postUrls)];
    const candidate = unique[3] || unique[0];

    return candidate ?? null;
  } catch (error) {
    console.error("Erro ao usar Puppeteer no Instagram:", error);
    return null;
  } finally {
    await browser.close();
  }
}

function cleanInstagramUrl(url: string): string {
  const match = url.match(/(\/(reel|p)\/[\w-]+\/)/);
  return match ? `https://www.instagram.com${match[1]}` : url;
}

async function checkInstagram(client: Client) {
  const latest = await fetchLatestInstagramPost();
  if (!latest || latest === lastPost) return;

  const channel = client.channels.cache.get(CHANNEL_ID);
  if (!channel || !channel.isTextBased()) return;

  const cleanedUrl = cleanInstagramUrl(latest);

  await (channel as TextChannel).send(
    `📢 @everyone **@nana.oii** fez uma nova instagram!\n
     ${cleanedUrl}`
  );

  console.log("✅ Notificação enviada com sucesso!");
  saveLastPost(latest);
}

export async function startInstagramTracker(client: Client) {
  loadLastPost();
  console.log("📸 Instagram tracker iniciado");

  await checkInstagram(client);
  setInterval(() => checkInstagram(client), CHECK_INTERVAL);
}
