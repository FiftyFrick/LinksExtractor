const puppeteer = require("puppeteer-core");
const fs = require("fs");
const clipboard = require("clipboardy").default;

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Pasá una URL");
    process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    let allLinks = new Set();

    try {
        console.log("🌐 Cargando...");
        await page.goto(URL, { waitUntil: "networkidle2" });

        await page.waitForSelector("li.se");

        const servers = await page.$$("li.se");

        console.log(`🎬 Servidores encontrados: ${servers.length}`);

        // 🔁 recorrer todos los servidores
        for (let i = 0; i < servers.length; i++) {

            console.log(`\n👉 Probando servidor ${i + 1}`);

            try {
                const server = (await page.$$("li.se"))[i];

                await server.click();

                // esperar que cambie data-dwn
                await page.waitForFunction(() => {
                    const el = document.querySelector("[data-dwn]");
                    return el && el.getAttribute("data-dwn");
                }, { timeout: 10000 });

                await sleep(800); // pequeño delay

                const links = await page.evaluate(() => {
                    const el = document.querySelector("[data-dwn]");
                    if (!el) return [];

                    let raw = el.getAttribute("data-dwn");

                    raw = raw
                        .replace(/&quot;/g, '"')
                        .replace(/\\\//g, '/');

                    try {
                        return JSON.parse(raw);
                    } catch {
                        return [];
                    }
                });

                links.forEach(l => allLinks.add(l));

            } catch (err) {
                console.log(`⚠️ Error en servidor ${i + 1}`);
            }

            await sleep(1000); // evita bloqueos
        }

        const finalLinks = [...allLinks];

        console.log("\n📥 LINKS FINALES:\n");

        finalLinks.forEach((l, i) => {
            console.log(`[${i + 1}] ${l}`);
        });

        console.log(`\n📊 Total únicos: ${finalLinks.length}`);

        // 📄 guardar

        const output = finalLinks.join("\n");

        fs.writeFileSync("links.txt", output);

        // 📋 copiar
        await clipboard.write(output);

        console.log("\n💾 Guardado en links.txt");
        console.log("📋 Copiado al portapapeles");

    } catch (err) {
        console.error("❌ Error general:", err.message);
    } finally {
        await browser.close();
    }
})();