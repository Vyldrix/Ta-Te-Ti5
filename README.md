# Ta-Te-Ti 5x5: La Batalla de 4 en Línea.

## 🎯 Descripción del Proyecto

Este proyecto es una **API sencilla en Node.js** diseñada para el juego de Ta-Te-Ti (Tic-Tac-Toe) en un tablero de **5x5**. Su función principal es recibir el estado actual del tablero y devolver un movimiento aleatorio válido para el siguiente turno.

### 🆕 Novedades de la Versión 5x5

A diferencia del Ta-Te-Ti clásico, este juego utiliza una matriz más grande y tiene una nueva condición de victoria:
* **Tamaño del Tablero:** $5 \times 5$ (25 casillas).
* **Condición de Victoria:** Se gana al conseguir **4 fichas en línea** (horizontal, vertical o diagonal).

### 🌐 Demo en Vivo

Puedes ver una demostración del proyecto desplegado en Vercel:
[ta-te-ti5.vercel.app](https://ta-te-ti5.vercel.app)

## 💻 Tecnologías Utilizadas

* **Lenguaje:** JavaScript
* **Plataforma:** Node.js (v18 o superior)
* **Pruebas:** Jest
* **Despliegue:** Vercel

## ⚙️ Instalación Local

### Requisitos Previos

* [Node.js](https://nodejs.org/) (versión 18 o superior).

### Pasos

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/Vyldrix/Ta-Te-Ti5.git](https://github.com/Vyldrix/Ta-Te-Ti5.git)
    cd Ta-Te-Ti5
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Opcional: Ejecuta la batería de pruebas para el bot:
    ```bash
    npm test
    ```
4.  Levanta el servidor local:
    ```bash
    npm start
    ```

## 🚀 Uso de la API

Una vez que el servidor esté en funcionamiento (local o desplegado), puedes consumir el *endpoint* para obtener un movimiento aleatorio.

* **Método:** `GET`
* **Ruta:** `/move`
* **Parámetro de consulta:** `board`

### 📋 Especificación del Parámetro `board`

La consulta requiere el parámetro `board`, que debe ser una cadena de **25 caracteres** (5x5) representando el estado actual del tablero, de izquierda a derecha y de arriba abajo.

* `X`: Casilla ocupada por el jugador X.
* `O`: Casilla ocupada por el jugador O.
* `-`: Casilla vacía.

**Ejemplo de solicitud (Tablero de 25 caracteres):**
/move?board=X------------------------
*(Representa un tablero 5x5 con solo la primera casilla ocupada por 'X').*

## 📦 Despliegue Continuo en Vercel

El proyecto utiliza **GitHub Actions** para implementar un flujo de **Despliegue Continuo** en Vercel, definido en el archivo `.github/workflows/deploy-vercel.yml`. Cada *push* a la rama `main` dispara el flujo que instala dependencias, corre las pruebas y despliega la aplicación.

### Configuración Inicial (Única vez)

Para que el despliegue funcione automáticamente, debes configurar las credenciales de Vercel en tu repositorio de GitHub.

1.  **Instala y vincula Vercel localmente:**
    ```bash
    npm install --global vercel
    vercel login
    vercel link
    ```
    El comando `vercel link` crea el archivo `.vercel/project.json` con tu `orgId` y `projectId`.

2.  **Crea un Token de Acceso en Vercel:**
    Genera un token permanente (ej: `vercel tokens create tateti-ci`) o desde la configuración de tu cuenta en el dashboard de Vercel. **Guarda el valor, solo se muestra una vez.**

3.  **Configura Secretos en GitHub:**
    En tu repositorio de GitHub, navega a **Settings > Secrets and variables > Actions** y añade los siguientes secretos:
    * `VERCEL_TOKEN`: El token generado.
    * `VERCEL_ORG_ID`: El valor de `orgId` de `.vercel/project.json`.
    * `VERCEL_PROJECT_ID`: El valor de `projectId` de `.vercel/project.json`.

## 🛠️ Scripts Útiles

| Script | Descripción |
| :--- | :--- |
| `npm start` | Inicia el servidor Node.js. |
| `npm test` | Ejecuta la batería de pruebas utilizando Jest. |.
