const puppeteer = require("puppeteer-core");
const fs = require("fs");

const URL = process.argv[2];

if (!URL) {
    console.log("❌ Pasá una URL");
    process.exit(1);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        args: ["--no-sandbox"]
    });

    const page = await browser.newPage();

    // 📝 archivo donde guardamos clicks
    const logFile = "clicks.txt";

    // limpiar archivo al iniciar
    fs.writeFileSync(logFile, "=== LOG DE CLICKS ===\n");

    await page.goto(URL, { waitUntil: "domcontentloaded" });

    // 🔥 INYECTAR LISTENER DE CLICKS EN EL DOM
    await page.evaluate(() => {
        document.addEventListener("click", (e) => {
            const el = e.target;

            const data = {
                tag: el.tagName,
                text: el.innerText?.trim().slice(0, 50),
                class: el.className,
                id: el.id,
                href: el.href || null
            };

            console.log("CLICK_EVENT:" + JSON.stringify(data));
        });
    });

    // 🎧 ESCUCHAR LOS console.log DEL NAVEGADOR
    page.on("console", msg => {
        const text = msg.text();

        if (text.startsWith("CLICK_EVENT:")) {
            const data = text.replace("CLICK_EVENT:", "");

            console.log("🖱️ Click detectado:", data);

            fs.appendFileSync(logFile, data + "\n");
        }
    });

    console.log("👉 Hacé clicks en la página...");
})();