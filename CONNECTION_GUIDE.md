# Guía de Conexión y Requisitos: GoToCloud-Full

Esta guía detalla los pasos necesarios para conectar el frontend de React con el backend de FastAPI, asegurando que las nuevas APIs de administración, chat y memoria funcionen correctamente.

## 📋 Requisitos del Sistema

### Backend (FastAPI)
- **Python 3.10+**
- **Redis Server**: Esencial para la persistencia de memoria y sesiones.
- **PostgreSQL**: Para almacenamiento persistente de incidentes, conversaciones y métricas.
- **Variables de Entorno (.env)**:
  ```env
  POSTGRES_URL=postgresql://usuario:password@localhost:5432/gotocloud
  REDIS_URL=redis://localhost:6379
  ADMIN_EMAIL=admin@gotocloud.ai
  ADMIN_PASSWORD=gotocloud2024
  ADMIN_JWT_SECRET=tu_secreto_super_seguro
  GEMINI_API_KEY=tu_api_key_de_google
  ```

### Frontend (React + Vite)
- **Node.js 18+**
- **Variables de Entorno (.env)**:
  ```env
  VITE_API_URL=http://localhost:8000
  ```

---

## 🚀 Paso a Paso: Conectando las APIs

### 1. Autenticación Administrativa (Login)

El sistema usa OAuth2 con Password Flow. El frontend debe enviar las credenciales como `form-data`.

- **Endpoint**: `POST /api/admin/login`
- **Frontend (`adminApi.js`)**:
  ```javascript
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const res = await fetch(`${API_BASE_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  ```
- **Resultado**: Recibirás un `access_token`. Guárdalo en `localStorage` como `auth_token`.

### 2. Panel de Control (Dashboard)

Para obtener métricas, debes incluir el token JWT en las cabeceras.

- **Endpoint**: `GET /api/admin/dashboard/metrics?hours=24`
- **Cabecera Requerida**: `Authorization: Bearer {tu_token}`
- **Frontend (`adminApi.js`)**:
  ```javascript
  const res = await fetch(`${API_BASE_URL}/admin/dashboard/metrics`, {
    headers: { 
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}` 
    },
  });
  ```

### 3. Sistema de Chat con Memoria (Persistencia)

Hemos implementado un sistema de memoria basado en el número de teléfono para que la IA "recuerde" conversaciones previas entre canales.

- **Guardar Mensaje**: `POST /api/chat/message`
  ```json
  {
    "phone_number": "+15551234567",
    "message": "Hola, necesito ayuda con mi factura",
    "channel": "web"
  }
  ```
- **Recuperar Contexto**: `GET /api/chat/context?phone_number=+15551234567&channel=web`
  - Esto devuelve el historial completo normalizado desde Redis.

### 4. Agente de Inteligencia (Query)

Permite hacer preguntas complejas sobre los datos acumulados.

- **Endpoint**: `POST /api/admin/intelligence/query`
- **Payload**: `{"query": "¿Cuál es la tendencia de incidentes en Azure?"}`

---

## 🛠 Verificación de Conexión

Para asegurarte de que todo está bien conectado, sigue este flujo:

1. **Backend**: Ejecuta `uvicorn app.main:app --reload` y verifica que el log no muestre errores de conexión a Redis o Postgres.
2. **Frontend**: Ejecuta `npm run dev`.
3. **Prueba de Fuego**:
   - Ve a la página de `/login`.
   - Ingresa `admin@gotocloud.ai` / `gotocloud2024`.
   - Si entras al Dashboard y ves gráficos (o datos de carga), la conexión **JWT** y **Admin API** es exitosa.
   - Abre el chat y envía un mensaje. Verifica en la pestaña `Network` del navegador que el POST a `/chat/message` devuelve 200 OK.

---

## 📝 Notas Técnicas

- **Normalización**: El backend limpia los teléfonos automáticamente (ej: `+1 (555) 123` -> `+1555123`). Úsalo consistentemente en el frontend.
- **CORS**: El backend está configurado con `allow_origins=["*"]`, lo que facilita el desarrollo local.
- **Expiración**: El token JWT dura 8 horas. Si recibes un error 401, el frontend redirigirá automáticamente al login.
