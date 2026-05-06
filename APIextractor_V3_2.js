const express = require("express");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const cors = require("cors");

const app = express();

// 👇 habilitar CORS
app.use(cors());

app.use(express.json());

// 🔧 CONFIG
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WATCH_FOLDER = "C:\\JDownloader\\watch\\"; // 👈 CAMBIÁ SI QUERÉS

// 🧠 BROWSER GLOBAL (mejor rendimiento)
let browser;

async function getBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            executablePath: CHROME_PATH,
            headless: true,
            args: ["--no-sandbox"]
        });
    }
    return browser;
}

// 🧠 FORMATO JDOWNLOADER
function formatJD(url, links) {
    const ultimo = url.split("/").pop(); // one-piece-1056
    const partes = ultimo.split("-");

    const capitulo = partes.pop();
    const nombreAnime = partes.join(" ")
        .replace(/\b\w/g, l => l.toUpperCase());

    const nombre = `${nombreAnime} - Cap ${capitulo}`;

    return {
        nombre,
        contenido: [
            `#Package: ${nombre}`,
            "",
            ...links,
            ""
        ].join("\n")
    };
}

// 🧠 SCRAPER
async function scrape(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

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

    await page.close();

    return links;
}

// 💾 GUARDAR EN WATCH FOLDER
function saveToWatchFolder(nombre, contenido) {
    const safeName = nombre.replace(/[<>:"/\\|?*]+/g, "");
    const filePath = path.join(WATCH_FOLDER, `${safeName}.crawljob`);

    fs.writeFileSync(filePath, contenido);

    return filePath;
}

//////////////////////////////////////////////////////
// 🔹 GET → scrape + guardar
//////////////////////////////////////////////////////

app.get("/extract", async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "Falta URL" });
    }

    try {
        const links = await scrape(url);

        if (!links.length) {
            return res.status(404).json({ error: "No se encontraron links" });
        }

        const { nombre, contenido } = formatJD(url, links);

        const filePath = saveToWatchFolder(nombre, contenido);

        res.json({
            ok: true,
            nombre,
            file: filePath,
            total: links.length
        });

    } catch (err) {
        res.status(500).json({ error: "Error al extraer" });
    }
});

//////////////////////////////////////////////////////
// 🔹 POST MULTI → varios capítulos
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

            if (!links.length) {
                results.push({ url, error: "Sin links" });
                continue;
            }

            const { nombre, contenido } = formatJD(url, links);
            const filePath = saveToWatchFolder(nombre, contenido);

            results.push({
                url,
                nombre,
                file: filePath,
                total: links.length
            });

        } catch {
            results.push({ url, error: true });
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