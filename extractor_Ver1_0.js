const puppeteer = require("puppeteer-core");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Pasá una URL");
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    try {
        console.log("🌐 Cargando...");
        await page.goto(URL, { waitUntil: "networkidle2" });

        // 1️⃣ esperar servidores
        await page.waitForSelector("li.se");

        console.log("🎬 Seleccionando servidor...");

        const servers = await page.$$("li.se");

        // 2️⃣ clickear el primero
        await servers[0].click();

        // 3️⃣ esperar que aparezca data-dwn
        await page.waitForFunction(() => {
            const el = document.querySelector("[data-dwn]");
            return el && el.getAttribute("data-dwn");
        });

        console.log("🔍 Extrayendo links...");

        const links = await page.evaluate(() => {
            const el = document.querySelector("[data-dwn]");
            if (!el) return [];

            let raw = el.getAttribute("data-dwn");

            raw = raw.replace(/&quot;/g, '"').replace(/\\\//g, '/');

            return JSON.parse(raw);
        });

        console.log("\n📥 LINKS:\n");

        links.forEach((l, i) => {
            console.log(`[${i + 1}] ${l}`);
        });

        console.log(`\n📊 Total: ${links.length}`);


const fs = require("fs");
const clipboard = require("clipboardy").default;

const output = links.join("\n");

// guardar archivo
fs.writeFileSync("links.txt", output);

// copiar al portapapeles
await clipboard.write(output);

console.log("\n💾 Guardado en links.txt");
console.log("📋 Copiado al portapapeles");

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await browser.close();
    }
})();
