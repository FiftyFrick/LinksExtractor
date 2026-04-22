const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const tmp = require("tmp");

// URL a analizar
const URL = process.argv[2];

if (!URL) {
    console.log("❌ Tenés que pasar una URL");
    console.log('Ejemplo: node extractor.js "https://pagina.com"');
    process.exit(1);
}
// Función principal
async function extractLinks() {
    let tempFile = null;

    try {
        console.log("🔎 Conectando a la URL...");

        // 1. Descargar contenido HTML (en memoria)
        const response = await axios.get(URL, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const html = response.data;

        // 2. Crear archivo temporal SOLO para procesamiento
        tempFile = tmp.fileSync({ postfix: ".html" });
        fs.writeFileSync(tempFile.name, html);

        console.log(`📂 Archivo temporal creado: ${tempFile.name}`);

        // 3. Cargar HTML con Cheerio (tipo jQuery)
        const $ = cheerio.load(html);

        let links = new Set();

        // 4. Extraer enlaces <a href="">
        $("a").each((i, el) => {
            const href = $(el).attr("href");
            if (href && href.startsWith("http")) {
                links.add(href);
            }
        });

        // 5. Extraer fuentes de video/audio
        $("source").each((i, el) => {
            const src = $(el).attr("src");
            if (src && src.startsWith("http")) {
                links.add(src);
            }
        });

        // 6. Extraer desde scripts (muchas páginas esconden links ahí)
        $("script").each((i, el) => {
            const scriptContent = $(el).html();
            if (scriptContent) {
                const matches = scriptContent.match(/https?:\/\/[^\s"'<>]+/g);
                if (matches) {
                    matches.forEach(link => links.add(link));
                }
            }
        });

        // 7. Filtrar posibles links útiles
        const filteredLinks = [...links];


        // 8. Mostrar resultados formateados
        console.log("\n📥 Links encontrados:\n");

        filteredLinks.forEach((link, index) => {
            console.log(`[${index + 1}] ${link}`);
        });

        if (filteredLinks.length === 0) {
            console.log("⚠️ No se encontraron links directos. Probablemente carga dinámica.");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        // 9. ELIMINAR archivo temporal
        if (tempFile) {
            try {
                fs.unlinkSync(tempFile.name);
                console.log("\n🧹 Archivo temporal eliminado correctamente.");
            } catch (err) {
                console.error("⚠️ Error al eliminar temporal:", err.message);
            }
        }
    }
}

// Ejecutar
extractLinks();