const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const https = require("https");

const BASE_URL =
  "https://tambvrini-luxury-4.preview.emergentagent.com";

const SAVE_ROOT = path.join(
  __dirname,
  "../frontend/public/products"
);

if (!fs.existsSync(SAVE_ROOT)) {
  fs.mkdirSync(SAVE_ROOT, { recursive: true });
}

async function downloadImage(url, filepath) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(filepath);

    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", () => resolve());
  });
}

(async () => {
  console.log("🚀 Launching browser...");

  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(BASE_URL, {
    waitUntil: "networkidle",
  });

  console.log("✅ Website loaded");

  await page.waitForTimeout(4000);

  const productLinks = await page.$$eval(
    "a[href*='/producto/']",
    (links) => [...new Set(links.map((l) => l.href))]
  );

  console.log(`🧠 Found ${productLinks.length} products`);

  for (const link of productLinks) {
    console.log("➡️ Opening:", link);

    await page.goto(link, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);

    const slug = link.split("/producto/")[1];

    const productDir = path.join(SAVE_ROOT, slug);
    fs.mkdirSync(productDir, { recursive: true });

    const images = await page.$$eval("img", (imgs) =>
      imgs
        .map((img) => img.src)
        .filter((src) => src.includes("emergentagent"))
    );

    let index = 1;

    for (const img of images) {
      const filename = path.join(productDir, `${index}.jpg`);
      console.log("⬇️ Downloading", img);
      await downloadImage(img, filename);
      index++;
    }
  }

  console.log("✅ ALL PRODUCTS CLONED");
})();