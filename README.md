# LinksExtractor
script automatico que extrae links de descargas de la pagina https://vww.animeflv.one/

🧠 Web Scraper Toolkit (Node.js + Puppeteer)

Herramienta modular para extracción de enlaces desde páginas web, tanto estáticas como dinámicas, incluyendo scraping multi-etapa, interacción con DOM y automatización con navegador real.

🚀 Descripción

Este proyecto nace como una evolución progresiva de distintos enfoques de scraping, pasando por:

extracción básica de HTML
parsing con Cheerio
detección de enlaces ocultos
crawling recursivo
scraping dinámico con Puppeteer
automatización de interacción (clicks, botones)
exposición como API REST

El objetivo es detectar, extraer y procesar links de descarga, incluso cuando están ocultos o generados dinámicamente.

🧩 Arquitectura del proyecto

El proyecto está dividido en múltiples scripts según complejidad:

🔹 1. Scraping estático (Axios + Cheerio)
Descarga HTML directamente
Parsea contenido tipo jQuery
Extrae:
<a href>
<source src>
<iframe src>
data-* attributes
URLs dentro de <script>

📌 Limitación: no funciona con contenido dinámico (JS)

🔹 2. Scraping avanzado (regex + heurísticas)
Búsqueda de URLs dentro de scripts
Filtrado por patrones:
video
stream
embed
file
Eliminación de duplicados (Set)

🔹 3. Crawling multi-nivel
Navegación recursiva entre links
Profundidad configurable (ej: 3 niveles)
Control de URLs visitadas (anti-loop)
Descubrimiento progresivo de contenido oculto

🔹 4. Scraping dinámico (Puppeteer)
Usa navegador real (Chrome)
Ejecuta JavaScript de la página
Permite:
esperar elementos (waitForSelector)
interactuar con el DOM
hacer clicks automáticos
extraer contenido dinámico (data-dwn)

🔹 5. Automatización de interacción
Click automático en:
botones de descarga
servidores (li.se)
Espera de cambios dinámicos en el DOM
Extracción posterior de links reales

🔹 6. Monitoreo de eventos
Inyección de listener de clicks en el navegador
Captura de:
elemento clickeado
texto
clases
href
Logging en archivo (clicks.txt)

🔹 7. API REST (Express)
Endpoint GET / POST /extract
Endpoint /extract-multi
Procesamiento backend con Puppeteer
Respuesta en JSON

⚙️ Tecnologías utilizadas
Node.js
axios → requests HTTP
cheerio → parsing HTML
puppeteer-core → automatización de navegador
express → API REST
fs / fs-extra → manejo de archivos
tmp → archivos temporales
clipboardy → copia al portapapeles

📦 Instalación
npm install axios cheerio puppeteer-core express fs-extra tmp clipboardy

🖥️ Configuración

⚠️ Puppeteer requiere especificar el path de Chrome:

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

📡 Uso

▶️ Scraping básico
node extractor.js "https://pagina.com"

▶️ Scraping dinámico
node puppeteerExtractor.js "https://pagina.com"

▶️ API REST
node server.js

Endpoints:

GET
/extract?url=https://pagina.com

POST
{
  "url": "https://pagina.com"
}

POST MULTI
{
  "urls": ["url1", "url2"]
}

🧠 Técnicas implementadas
Parsing DOM estático
Scraping híbrido (estático + dinámico)
Reverse engineering de atributos (data-dwn)
Crawling recursivo controlado
Detección de contenido embebido
Automatización de UI
Interceptación de eventos del navegador
Deduplicación de datos
Heurísticas de filtrado

⚠️ Limitaciones
Algunas webs usan:
protección anti-bots
tokens temporales
captchas
Puppeteer puede ser detectado en sitios avanzados
Scraping dinámico consume más recursos

🔮 Posibles mejoras
Soporte para proxies
Rotación de user-agent
Integración con JDownloader
Headless stealth (evasión de detección)
UI web para control del scraper
Paralelización de crawling
📌 Objetivo del proyecto

Crear una herramienta flexible capaz de adaptarse a distintos escenarios de scraping, desde páginas simples hasta sistemas con contenido dinámico y protegido.
