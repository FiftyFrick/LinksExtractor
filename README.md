# LinksExtractor
# Auto API Extractor para AnimeFLV.one + jDonloader2 + Wach Folder

Sistema automatizado de extracción de links de descarga para **animeflv.one** utilizando **Node.js**, **Puppeteer** y automatización integrada con **JDownloader2** y su Extencion de **Wach Folder**.

El objetivo principal de este proyecto es automatizar completamente la obtención de enlaces de descarga y enviarlos directamente al sistema *Watch Folder* de JDownloader2 mediante archivos `.crawljob`.

# Rresumiendo en pocas palabras este script automatico te facilita los diferentes links de descargas (mega,1ficher,etc... )que te ofrece animeflv.one y te los guarda en la carpeta de jdonloader para que de manera automatica detecte los links y los capture en su lista de capturador de enlaces.


si te ineresa saber mi motivacion y lo que aprendi intentando optimizar mi tiempo y el por que te dejo una brebe explicacion mas abajo 

---

# Historia del proyecto

Este proyecto comenzó como un simple scraper HTML utilizando:

- Axios
- Cheerio

Axios y Cheerio son herramientas fundamentales en JavaScript/Node.js para el web scraping (extracción de datos web). Axios descarga el contenido HTML de una página web mediante peticiones HTTP, mientras que Cheerio analiza y manipula ese HTML, permitiendo seleccionar y extraer datos específicos con una sintaxis similar a jQuery

Con el tiempo evolucionó hacia un sistema híbrido debido a que animeflv.one utiliza contenido dinámico generado mediante JavaScript.

Durante el desarrollo se implementaron distintas técnicas:

- scraping estático
- parsing HTML
- extracción desde scripts
- crawling multi-etapa
- automatización de navegador
- detección de eventos
- interacción automática con el DOM
- APIs REST
- integración con JDownloader2

La versión actual representa la evolución completa del proyecto.

---

# 🎯 Objetivo del proyecto

Automatizar el flujo completo:

```text
AnimeFLV.one
   ↓
Extracción automática
   ↓
Procesamiento de links
   ↓
Generación .crawljob
   ↓
JDownloader2
```

El usuario simplemente pega URLs de episodios y el sistema se encarga del resto.

---

# ⚙️ Tecnologías utilizadas

## Lenguaje principal

- Node.js

---

# 📦 Dependencias

## Backend/API

### express
Servidor API REST.

```bash
npm install express
```

---

## Automatización Web

### puppeteer-core
Control automatizado de Google Chrome.

```bash
npm install puppeteer-core
```

---

## CORS

### cors
Permite conexiones entre frontend y backend.

```bash
npm install cors
```

---

## 📂 Sistema de archivos

### fs
Manejo de archivos `.crawljob`.

### path
Gestión de rutas del sistema.

### child_process
Auto instalación de dependencias.

---

# 🧱 Arquitectura del proyecto

El sistema está dividido en varios módulos funcionales.

---

# 1. Auto instalador

El proyecto verifica automáticamente:

- existencia de `node_modules`
- existencia de `package.json`
- dependencias necesarias

Si no existen:
- crea configuración base
- instala paquetes automáticamente

```text
Inicio
   ↓
Verificar dependencias
   ↓
Instalar automáticamente
```

---

# 2. Frontend automático

Si `index.html` no existe:

- el sistema lo genera automáticamente
- crea interfaz web funcional
- incluye:
  - textarea de URLs
  - botón de extracción
  - estado de conexión API

---

# 3. Watch Folder Manager

El sistema verifica automáticamente:

```text
C:\JDownloader\watch\
```

Funciones:
- crear carpeta si no existe
- validar permisos
- testear escritura

---

# 4. API REST

La aplicación crea un servidor Express.

## Endpoints disponibles

---

## GET `/ping`

Verifica si la API está funcionando.

### Respuesta

```json
{
  "ok": true
}
```

---

## POST `/extract-multi`

Procesa múltiples URLs.

### Request

```json
{
  "urls": [
    "https://animeflv.one/ver/...",
    "https://animeflv.one/ver/..."
  ]
}
```

---

# 5. Motor de scraping

El núcleo del sistema utiliza:

- Puppeteer
- Chrome real
- Renderizado JavaScript

---

#  Funcionamiento interno

## Flujo completo

```text
Usuario
   ↓
Frontend
   ↓
API Express
   ↓
Puppeteer abre Chrome
   ↓
Carga animeflv.one
   ↓
Espera render dinámico
   ↓
Busca atributo data-dwn
   ↓
Extrae JSON oculto
   ↓
Obtiene links reales
   ↓
Genera archivo .crawljob
   ↓
Watch Folder JDownloader
   ↓
JDownloader importa automáticamente
```

---

# 6. Extracción `data-dwn`

AnimeFLV genera los links reales dinámicamente dentro de:

```html
data-dwn="[...]"
```

El sistema:

- detecta el atributo
- limpia caracteres escapados
- parsea JSON
- obtiene enlaces finales

---

# 7. Generador `.crawljob`

El sistema convierte automáticamente los links en formato compatible con JDownloader2.

Ejemplo:

```txt
#Package: Nombre Anime - Cap XX

https://link1.com
https://link2.com
https://link3.com
```

---

# 8. Integración con JDownloader2

Los archivos `.crawljob` son enviados automáticamente a:

```text
C:\JDownloader\watch\
```

JDownloader2 detecta los archivos automáticamente e importa los enlaces.

---



---


# 🖥️ Requisitos

- Node.js v18+
- Google Chrome instalado
- JDownloader2
- Windows


---


# 🔧 Configuración

## Ruta de Chrome

```js
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
```

---

## Ruta Watch Folder

```js
const WATCH_FOLDER = "C:\\JDownloader\\watch\\";
```

---

# 📥 Instalación

## 1. Clonar repositorio

```bash
git clone 

```

---

## 2. Ejecutar proyecto

```bash
node AUTO-APIextractor_V3_4.js
```

El sistema instalará dependencias automáticamente.

---


---


# 🌐 Acceso

Frontend:

```text
http://localhost/index.html
```

API:

```text
http://localhost:3000
```

---

---



# Características principales

✅ Scraping dinámico  
✅ Automatización completa  
✅ Integración con JDownloader2  
✅ API REST  
✅ Frontend automático  
✅ Auto instalación de dependencias  
✅ Extracción JSON dinámica  
✅ Generación `.crawljob`  
✅ Procesamiento múltiple  
✅ Arquitectura modular  

---

# Técnicas utilizadas

- Web Scraping
- DOM Parsing
- Browser Automation
- Reverse Engineering Web
- JSON Extraction
- Dynamic Rendering
- REST APIs
- File Automation
- Watch Folder Integration

---

# Conclucion.

Aunque el sistema fue diseñado específicamente para:

```text
animeflv.one
```

La arquitectura permite adaptarlo fácilmente a otros sitios modificando:

- selectores DOM
- atributos dinámicos
- lógica de extracción

---

# Problematicas

- Dependencia de la estructura actual de animeflv.one
- Cambios en el DOM pueden romper el scraper
- Algunos servidores externos pueden bloquear automatización
- Puppeteer consume más recursos que scraping tradicional

---

# Posibles mejoras que Podria abordar en algun momento... (aunque asi como esta cumple con lo que necesito)

- Integración directa con API MyJDownloader
- Docker
- Proxy Rotation
- Headless Stealth
- Descarga automática
- Dashboard avanzado
- Soporte multi-sitio
- Sistema de colas

---

# Con este Proyecto aprendi lo sigiente:

**Este proyecto me permitió experimentar con:**

- **scraping estático vs dinámico** 

   (Antes no sabia lo que era un scraping y el parsing HTML )

- **automatización real de navegador** 

   (esto me parecio muy divertido y peligros si se mira con malicia hay que tener mucho cuidado con el Puppeteer)

- **APIs REST** 

   (la verdad es la 1ra vez que implemento la utilizacion de una API)

- **ingeniería inversa web** 

   (basicamente f12 de chrome para visualizar donde estan los datos que necesito)

- **integración con software externo** 

   (La exencion de wach folder de jdonloader me ayudo con esto y su escaneo de la carpeta donde se guardan los links)

- **procesamiento automatizado de descargas** 

   ( con esto me refiero a que intente darle a jdonloader todos los link en un unico Package aunque sin usar directamente la API de MyJdonloader el paquete de links se interpreta como quiere, ya que el programa predeterminadamente tiende a priorizar el nombre del archivo y no el nombre del paquete)

---

## 📄 Licencia

Proyecto desarrollado con fines educativos y de automatización personal.

No me hago responsable de la mala Utilizacion de este script y o su modificacion 
