const puppeteer = require("puppeteer-core");
const fs = require("fs");
const clipboard = require("clipboardy").default;

const INPUT = process.argv[2];

if (!INPUT) {
    console.log("❌ Pasá un archivo .txt con URLs");
    process.exit(1);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {

    // 📥 leer lista de URLs
    const urls = fs.readFileSync(INPUT, "utf-8")
        .split("\n")
        .map(u => u.trim())
        .filter(Boolean);

    if (urls.length === 0) {
        console.log("❌ Archivo vacío");
        process.exit(1);
    }

    console.log(`📚 Total de capítulos: ${urls.length}\n`);

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    let globalLinks = new Set();

    try {

        // 🔁 recorrer capítulos
        for (let i = 0; i < urls.length; i++) {

            const url = urls[i];

            console.log(`\n🌐 [${i + 1}/${urls.length}] ${url}`);

            try {
                await page.goto(url, { waitUntil: "networkidle2" });

                await page.waitForSelector("li.se", { timeout: 10000 });

                const servers = await page.$$("li.se");

                console.log(`🎬 Servidores: ${servers.length}`);

                // 🔁 recorrer servidores
                for (let j = 0; j < servers.length; j++) {

                    console.log(`   ↪️ Servidor ${j + 1}`);

                    try {
                        const server = (await page.$$("li.se"))[j];

                        await server.click();

                        await page.waitForFunction(() => {
                            const el = document.querySelector("[data-dwn]");
                            return el && el.getAttribute("data-dwn");
                        }, { timeout: 10000 });

                        await sleep(800);

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

                        links.forEach(l => globalLinks.add(l));

                    } catch {
                        console.log("   ⚠️ Error en servidor");
                    }

                    await sleep(1000);
                }

            } catch {
                console.log("⚠️ Error en capítulo");
            }

            // ⏳ delay entre capítulos (IMPORTANTE)
            await sleep(3000);
        }

        const finalLinks = [...globalLinks];

        console.log("\n📥 LINKS TOTALES:\n");

        finalLinks.forEach((l, i) => {
            console.log(`[${i + 1}] ${l}`);
        });

        console.log(`\n📊 Total únicos: ${finalLinks.length}`);

        // 📄 guardar archivo
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