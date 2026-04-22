const puppeteer = require("puppeteer-core");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // así ves lo que pasa
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    try {
        console.log("🌐 Cargando...");
        await page.goto(URL, { waitUntil: "networkidle2" });

        await page.waitForSelector("ul.uldwn", { timeout: 15000 });

        const downloads = await page.evaluate(() => {
            let data = [];

            document.querySelectorAll("ul.uldwn > li").forEach(li => {
                // ❌ saltar cabecera
                if (li.classList.contains("t")) return;

                const spans = li.querySelectorAll("span");

                const servidor = spans[0]?.innerText.trim();
                const calidad = spans[2]?.innerText.trim();
                const idioma = spans[3]?.innerText.trim();
                const link = li.querySelector("a")?.href;

                if (link) {
                    data.push({
                        servidor,
                        calidad,
                        idioma,
                        link
                    });
                }
            });

            return data;
        });

        console.log("\n📥 DESCARGAS:\n");

        downloads.forEach((d, i) => {
            console.log(`[${i + 1}] ${d.servidor} | ${d.calidad} | ${d.idioma}`);
            console.log(`👉 ${d.link}\n`);
        });

    } catch (err) {
        console.error("❌ Error:", err.message);
    } finally {
        await browser.close();
    }
})();