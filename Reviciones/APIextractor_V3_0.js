const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
app.use(express.json()); // para POST JSON

// 🔧 CONFIG
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// 🧠 SCRAPER
async function scrape(url) {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: true,
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    // esperar que aparezca el botón/estructura
    await page.waitForFunction(() => {
        const el = document.querySelector("[data-dwn]");
        return el && el.getAttribute("data-dwn");
    }, { timeout: 15000 });

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

    await browser.close();

    return links;
}

//////////////////////////////////////////////////////
// 🔹 GET (simple)
//////////////////////////////////////////////////////

app.get("/extract", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "Falta URL" });
    }

    try {
        const links = await scrape(url);
        res.json({ links });
    } catch (err) {
        res.status(500).json({ error: "Error al extraer" });
    }
});

//////////////////////////////////////////////////////
// 🔹 POST (1 URL)
//////////////////////////////////////////////////////

app.post("/extract", async (req, res) => {
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: "Falta URL" });
    }

    try {
        const links = await scrape(url);
        res.json({ links });
    } catch (err) {
        res.status(500).json({ error: "Error al extraer" });
    }
});

//////////////////////////////////////////////////////
// 🔹 POST MULTI
//////////////////////////////////////////////////////

app.post("/extract-multi", async (req, res) => {
    const urls = req.body.urls;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: "Faltan URLs" });
    }

    let results = [];

    for (let url of urls) {
        try {
            const links = await scrape(url);
            results.push({ url, links });
        } catch {
            results.push({ url, links: [], error: true });
        }
    }

    res.json(results);
});

//////////////////////////////////////////////////////
// 🚀 START
//////////////////////////////////////////////////////

app.listen(3000, () => {
    console.log("🚀 API corriendo en http://localhost:3000");
});