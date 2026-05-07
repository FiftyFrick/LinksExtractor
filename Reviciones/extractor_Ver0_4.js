const axios = require("axios");
const cheerio = require("cheerio");

// 📥 URL desde argumentos
const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    console.log('Ejemplo: node extractor.js "https://pagina.com"');
    process.exit(1);
}

// 💤 Delay para evitar bloqueos
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 🔎 Extraer TODOS los links posibles del HTML
function extractAll(html) {
    const $ = cheerio.load(html);
    let links = new Set();

    // 🔹 href y src básicos
    $("a, iframe, source").each((i, el) => {
        const attr = $(el).attr("href") || $(el).attr("src");
        if (attr && attr.startsWith("http")) {
            links.add(attr);
        }
    });

    // 🔹 data-* atributos
    $("[data-video], [data-src], [data-href]").each((i, el) => {
        const attrs = el.attribs;
        for (let key in attrs) {
            if (attrs[key] && attrs[key].startsWith("http")) {
                links.add(attrs[key]);
            }
        }
    });

    // 🔹 scripts (regex mejorado)
    $("script").each((i, el) => {
        const content = $(el).html();
        if (content) {
            const matches = content.match(/https?:\/\/[^\s"'<>\\]+/g);
            if (matches) matches.forEach(l => links.add(l));
        }
    });

    return [...links];
}

// 🔁 Scraping multi-etapa (NO usar "process" como nombre)
async function crawl(url, level = 1, visited = new Set()) {
    if (visited.has(url) || level > 3) return [];

    visited.add(url);

    console.log(`\n🌐 [Nivel ${level}] ${url}`);

    try {
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept-Language": "es-ES,es;q=0.9"
            },
            timeout: 10000
        });

        const links = extractAll(res.data);

        let results = [...links]; // 🔥 guardamos TODO

        for (let link of links) {
            // 🔍 decidir qué links explorar más profundo
            if (
                link.includes("embed") ||
                link.includes("player") ||
                link.includes("stream") ||
                link.includes("video") ||
                link.includes("watch") ||
                link.includes("api") ||
                link.includes("load")
            ) {
                console.log(`↪️ Profundizando: ${link}`);

                await sleep(800); // evita bloqueos

                const deeper = await crawl(link, level + 1, visited);
                results = results.concat(deeper);
            }
        }

        return results;

    } catch (err) {
        console.log(`⚠️ Error en ${url}`);
        return [];
    }
}

// 🚀 EJECUCIÓN PRINCIPAL
(async () => {
    console.log("🚀 Scraping híbrido iniciado...\n");

    const allLinks = await crawl(URL);

    const unique = [...new Set(allLinks)];

    console.log("\n📥 TODOS LOS LINKS ENCONTRADOS:\n");

    unique.forEach((link, i) => {
        console.log(`[${i + 1}] ${link}`);
    });

    console.log(`\n📊 Total: ${unique.length} links`);

    // 🎯 FILTRADO ÚTIL (opcional)
    const utiles = unique.filter(l =>
        l.includes(".m3u8") ||
        l.includes(".mp4") ||
        l.includes("mega") ||
        l.includes("stream") ||
        l.includes("video")
    );

    console.log("\n🎯 POSIBLES LINKS ÚTILES:\n");

    utiles.forEach((link, i) => {
        console.log(`[${i + 1}] ${link}`);
    });

    if (utiles.length === 0) {
        console.log("⚠️ No se detectaron links directos útiles.");
    }
})();