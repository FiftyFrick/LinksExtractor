const axios = require("axios");
const cheerio = require("cheerio");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    process.exit(1);
}

(async () => {
    console.log("🚀 Iniciando...\n");

    try {
        const response = await axios.get(URL, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        const html = response.data;

        // ✅ ACÁ recién existe $
        const $ = cheerio.load(html);

        // =========================================
        // 🎬 ESTA ES LA PARTE QUE QUERÍAS (CORRECTA)
        // =========================================
        let downloads = [];

// 🔎 DEBUG: ver si encuentra el UL
const ul = $("ul.uldwn");

console.log("🔍 UL encontrado:", ul.length);

if (ul.length === 0) {
    console.log("❌ No se encontró ul.uldwn");
} else {
    ul.find("li").each((i, el) => {

        // ❌ saltar cabecera
        if ($(el).hasClass("t")) return;

        const spans = $(el).find("span");

        const servidor = spans.eq(0).text().trim();
        const formato = spans.eq(1).text().trim();
        const calidad = spans.eq(2).text().trim();
        const idioma = spans.eq(3).text().trim();

        const link = $(el).find("a").attr("href");

        // 🔎 DEBUG
        console.log("DEBUG ITEM:", { servidor, link });

        if (link && link.startsWith("http")) {
            downloads.push({
                servidor,
                formato,
                calidad,
                idioma,
                link
            });
        }
    });
}

        console.log("\n📥 DESCARGAS ENCONTRADAS:\n");

        downloads.forEach((d, i) => {
            console.log(`[${i + 1}] ${d.servidor} | ${d.calidad} | ${d.idioma}`);
            console.log(`👉 ${d.link}\n`);
        });

        console.log(`📊 Total: ${downloads.length}`);
	console.log(html.length);
	require("fs").writeFileSync("debug.html", html);

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
})();