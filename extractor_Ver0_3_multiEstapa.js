const axios = require("axios");
const cheerio = require("cheerio");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    process.exit(1);
}

// 🔎 Extrae links de cualquier HTML
function extractFromHTML(html) {
    const $ = cheerio.load(html);
    let links = new Set();

    $("a, iframe, source").each((i, el) => {
        const attr = $(el).attr("href") || $(el).attr("src");
        if (attr && attr.startsWith("http")) {
            links.add(attr);
        }
    });

    $("script").each((i, el) => {
        const content = $(el).html();
        if (content) {
            const matches = content.match(/https?:\/\/[^\s"'<>\\]+/g);
            if (matches) matches.forEach(l => links.add(l));
        }
    });

    return [...links];
}

// 🔁 Procesar múltiples niveles
async function processURL(url, level = 1, visited = new Set()) {
    if (visited.has(url) || level > 3) return [];
    visited.add(url);

    console.log(`\n🌐 [Nivel ${level}] Analizando: ${url}`);

    try {
        const res = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });

        const links = extractFromHTML(res.data);

        let results = [];

        for (let link of links) {
            // 🎯 FILTRO: posibles servidores interesantes
            if (
                link.includes("mega") ||
                link.includes("stream") ||
                link.includes("file") ||
                link.includes("video") ||
                link.includes("embed")
            ) {
                console.log(`🔗 Encontrado: ${link}`);
                results.push(link);

                // 🔁 IR A SIGUIENTE NIVEL
                const deeper = await processURL(link, level + 1, visited);
                results = results.concat(deeper);
            }
        }

        return results;

    } catch (err) {
        console.log(`⚠️ Error en ${url}`);
        return [];
    }
}

// 🚀 Ejecutar
(async () => {
    console.log("🚀 Iniciando scraping multi-etapa...\n");

    const results = await processURL(URL);

    const unique = [...new Set(results)];

    console.log("\n📥 RESULTADO FINAL:\n");

    unique.forEach((link, i) => {
        console.log(`[${i + 1}] ${link}`);
    });

    if (unique.length === 0) {
        console.log("❌ No se encontraron links finales.");
    }
})();