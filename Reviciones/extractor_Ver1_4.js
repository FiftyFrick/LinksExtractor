const axios = require("axios");
const cheerio = require("cheerio");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    process.exit(1);
}

(async () => {
    try {
        console.log("🌐 Cargando página...");

        const res = await axios.get(URL, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const html = res.data;
        const $ = cheerio.load(html);

        // 🔥 Buscar el botón con data-dwn
        const btn = $(".dwn.se");

        if (!btn.length) {
            console.log("❌ No se encontró el bloque de descargas");
	    console.log(html.includes("data-dwn"));  // verifica SI el boton es dinamico es False| si NO es dinamico es true
            return;
        }

        let raw = btn.attr("data-dwn");

        // 🔧 limpiar formato
        raw = raw.replace(/&quot;/g, '"').replace(/\\\//g, '/');

        let links = [];

        try {
            links = JSON.parse(raw);
        } catch (e) {
            console.log("❌ Error parseando JSON");
            return;
        }

        console.log("\n📥 LINKS DE DESCARGA:\n");

        links.forEach((link, i) => {
            console.log(`[${i + 1}] ${link}`);
        });

        console.log(`\n📊 Total: ${links.length}`);

    } catch (err) {
        console.error("❌ Error:", err.message);
    }
})();
