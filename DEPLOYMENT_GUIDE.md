# Guía Maestra: Despliegue en la Nube y Configuración de APIs

Esta guía te llevará paso a paso desde la obtención de tus llaves (Keys) hasta tener el proyecto funcionando en internet (fuera de tu computadora local).

---

## 🔑 1. Obtención de Credenciales (API Keys)

### Google AI Studio (Gemini)
Para que el chat "piense" y responda:
1. Ve a [Google AI Studio](https://aistudio.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en el botón **"Get API key"** en la barra lateral izquierda.
4. Haz clic en **"Create API key in new project"**.
5. **Copia la llave**: Se verá algo como `AIzaSy...`. Guárdala, la necesitaremos como `GEMINI_API_KEY`.

### Supabase (Base de Datos PostgreSQL)
Para guardar tus incidentes y usuarios:
1. Ve a [Supabase](https://supabase.com/) e inicia sesión.
2. Crea un **"New Project"**. Ponle un nombre (ej: `gotocloud-db`) y una contraseña segura.
3. Una vez creado (tarda un minuto), ve a **Project Settings** (el icono de engranaje) -> **Database**.
4. Busca la sección **"Connection String"**, selecciona el modo **"URI"**.
5. Copia esa dirección. Se verá así: `postgresql://postgres.[ID]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:5432/postgres`.
   - *Nota: Reemplaza `[PASSWORD]` con la contraseña que pusiste al crear el proyecto.*
6. **SQL Editor**: Ve al icono de "SQL Editor" en Supabase, pega el contenido del archivo `supabase_schema.sql` de tu proyecto y dale a **Run**. Esto creará las tablas necesarias.

### Upstash (Redis en la Nube)
Para la memoria del chat (necesaria para que no se olvide de los mensajes anteriores):
1. Ve a [Upstash](https://upstash.com/).
2. Crea una base de datos **Redis** gratuita.
3. En la pestaña "Details", busca **"UPSTASH_REDIS_REST_URL"** y **"UPSTASH_REDIS_REST_TOKEN"** o simplemente la **"Redis Connect String"** (ej: `redis://default:token@dominio.upstash.io:6379`).
4. Copia esa dirección para `REDIS_URL`.

---

## 🌍 2. Despliegue del Backend (Servidor)

Usaremos **Render** (es gratuito y soporta Docker):

1. Crea una cuenta en [Render](https://render.com/).
2. Haz clic en **"New"** -> **"Web Service"**.
3. Conecta tu repositorio de GitHub (donde subiste el código).
4. Render detectará el `Dockerfile` automáticamente.
5. **Variables de Entorno**: Ve a la pestaña "Environment" y agrega:
   - `POSTGRES_URL`: La URI de Supabase que copiaste.
   - `REDIS_URL`: La URL de Upstash.
   - `GEMINI_API_KEY`: Tu llave de Google AI.
   - `ADMIN_EMAIL`: `admin@gotocloud.ai` (o el que quieras).
   - `ADMIN_PASSWORD`: Una contraseña para tu panel.
   - `ADMIN_JWT_SECRET`: Escribe cualquier frase larga y aleatoria.
6. Dale a **"Deploy"**. Al terminar, te dará una URL (ej: `https://gotocloud-backend.onrender.com`). **Cópiala**.

---

## 💻 3. Despliegue del Frontend (Interfaz)

Usaremos **Vercel** (ideal para React/Vite):

1. Ve a [Vercel](https://vercel.com/) e inicia sesión.
2. Haz clic en **"Add New"** -> **"Project"**.
3. Importa tu repositorio.
4. En **Environment Variables**, agrega:
   - `VITE_API_URL`: Pega la URL que te dio Render (ej: `https://gotocloud-backend.onrender.com`).
5. Haz clic en **"Deploy"**.
6. ¡Listo! Vercel te dará la URL pública de tu aplicación.

---

## 🔄 4. Resumen de Conexión Final

| Variable | Origen | Uso |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google AI Studio | Cerebro de la IA |
| `POSTGRES_URL` | Supabase | Datos persistentes |
| `REDIS_URL` | Upstash | Memoria de corto plazo |
| `VITE_API_URL` | Render (Backend URL) | Conexión Front -> Back |

---

## 🛠 Solución de Problemas Comunes

1. **Error de CORS**: Si el frontend no puede hablar con el backend, asegúrate de que en el backend (`main.py`) el middleware de CORS permita el origen de tu URL de Vercel.
2. **Tablas no encontradas**: Asegúrate de haber ejecutado el SQL de `supabase_schema.sql` en el editor de Supabase.
3. **Redis Connection Error**: Verifica que la URL de Upstash comience con `redis://` o `rediss://` (con doble 's' si usa SSL).
