const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

//////////////////////////////////////////////////////
// 🔹 AUTO-INSTALADOR DE DEPENDENCIAS
//////////////////////////////////////////////////////

if (!fs.existsSync("node_modules")) {
    console.log("📦 Instalando dependencias...");

    // crear package.json si no existe
    if (!fs.existsSync("package.json")) {
        execSync("npm init -y", { stdio: "inherit" });
    }

    execSync("npm install express puppeteer-core cors", { stdio: "inherit" });

    console.log("✅ Dependencias instaladas\n");
} else {
    console.log("✔ Dependencias ya instaladas\n");
}

//////////////////////////////////////////////////////
// 🔹 CREAR INDEX.HTML SI NO EXISTE
//////////////////////////////////////////////////////

const indexPath = path.join(__dirname, "index.html");

if (!fs.existsSync(indexPath)) {
    console.log("🧱 Creando index.html...");

    fs.writeFileSync(indexPath, `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Extractor Links</title>
<style>
body { font-family: Arial; background: #111; color: #eee; padding: 20px; }
textarea { width: 100%; height: 120px; }
button { padding: 10px; margin: 5px; }
#status { font-weight: bold; margin-bottom: 10px; }
.ok { color: #4caf50; }
.error { color: #f44336; }
.loading { color: #ff9800; }
</style>
</head>
<body>

<div id="status">🟡 Probando conexión...</div>

<h1>🎬 Extractor de Links</h1>

<textarea id="urls"></textarea>

<button onclick="extract()">Extraer</button>

<div id="output"></div>

<script>
const API = "http://localhost:3000";

async function extract() {
    const urls = document.getElementById("urls").value.split("\\n");
    const res = await fetch(API + "/extract-multi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls })
    });

    const data = await res.json();
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}

async function checkAPI() {
    const status = document.getElementById("status");

    try {
        const res = await fetch(API + "/ping");

        if (res.ok) {
            status.innerText = "🟢 Conectado";
            status.className = "ok";
        } else throw new Error();

    } catch {
        status.innerText = "🔴 Desconectado";
        status.className = "error";
    }
}

checkAPI();
setInterval(checkAPI, 5000);
</script>

</body>
</html>`);

    console.log("✅ index.html creado\n");
} else {
    console.log("✔ index.html ya existe\n");
}


// REVISAR SI LA CARPETA Watch Folder ESTA CREADA O NO 
const CONFIG = {
    watchFolder: "C:\\JDownloader\\watch\\"
};

function ensureWatchFolder() {
    const folder = CONFIG.watchFolder;

    try {
        if (!fs.existsSync(folder)) {
            console.log("📁 Creando Watch Folder...");
            fs.mkdirSync(folder, { recursive: true });
        }

        // test de escritura
        const testFile = path.join(folder, "test.tmp");
        fs.writeFileSync(testFile, "test");
        fs.unlinkSync(testFile);

        console.log("✅ Watch Folder lista:", folder);

    } catch (err) {
        console.error("❌ Problema con Watch Folder:", err.message);
        console.log("⚠️ Revisá permisos o ruta de JDownloader");
    }
}

ensureWatchFolder();
//////////////////////////////////////////////////////
// 🔹 RECIÉN ACÁ CARGAMOS DEPENDENCIAS
//////////////////////////////////////////////////////

const express = require("express");
const puppeteer = require("puppeteer-core");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const WATCH_FOLDER = "C:\\JDownloader\\watch\\";

if (!fs.existsSync(WATCH_FOLDER)) {
    fs.mkdirSync(WATCH_FOLDER, { recursive: true });
}

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

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function formatJD(url, links) {
    const ultimo = url.split("/").pop();
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

async function scrape(url) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle2" });

    await page.waitForFunction(() => {
        const el = document.querySelector("[data-dwn]");
        return el && el.getAttribute("data-dwn");
    });

    const links = await page.evaluate(() => {
        const el = document.querySelector("[data-dwn]");
        if (!el) return [];

        let raw = el.getAttribute("data-dwn");

        raw = raw.replace(/&quot;/g, '"').replace(/\\\//g, '/');

        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    });

    await page.close();
    return links;
}

function save(nombre, contenido) {
    const safe = nombre.replace(/[<>:"/\\\\|?*]+/g, "");
    const file = path.join(WATCH_FOLDER, safe + ".crawljob");
    fs.writeFileSync(file, contenido);
    return file;
}

app.get("/ping", (req, res) => res.json({ ok: true }));

app.post("/extract-multi", async (req, res) => {
    const urls = req.body.urls || [];
    let results = [];

    for (let url of urls) {
        try {
            const links = await scrape(url);
            const { nombre, contenido } = formatJD(url, links);
            const file = save(nombre, contenido);

            results.push({ url, nombre, total: links.length, file });

            await sleep(1500);
        } catch (err) {
            results.push({ url, error: err.message });
        }
    }

    res.json(results);
});

app.listen(3000, () => {
    console.log("🚀 API corriendo en http://localhost:3000");
});