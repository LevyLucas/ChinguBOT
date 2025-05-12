import puppeteer from "puppeteer";

export async function fetchLatestInstagramPost(username: string) {
  const profileUrl = `https://www.instagram.com/${username}/`;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--window-size=1920x1080",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(profileUrl, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("article a", { timeout: 15000 });

    const postLinks = await page.$$eval("article a", (anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).href)
    );

    const targetPost = postLinks[3];
    if (!targetPost) throw new Error("Postagem recente não encontrada.");

    await page.goto(targetPost, { waitUntil: "networkidle2", timeout: 60000 });
    await page.waitForSelector("article", { timeout: 15000 });

    const postData = await page.evaluate(() => {
      const metaImage = document.querySelector('meta[property="og:image"]')?.getAttribute("content");

      // Busca a legenda da postagem no <h1> dentro do primeiro <li> da ul
      const ul = document.querySelector("article ul");
      const firstLi = ul?.querySelector("li");
      const h1 = firstLi?.querySelector("h1");

      // Converte <br> em \n
      let caption = "";
      if (h1) {
        const clone = h1.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("br").forEach((br) => {
          br.replaceWith("\n");
        });
        caption = clone.textContent?.trim() || "";
      }

      return {
        link: window.location.href,
        caption,
        imageUrl: metaImage || null,
      };
    });

    return postData;
  } catch (err) {
    console.error("❌ Erro no scraper:", err);
    return null;
  } finally {
    await browser.close();
  }
}
