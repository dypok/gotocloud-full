# INTEGRACIÓN COMPLETA - BACKEND + FRONTEND

## ✅ LO QUE ESTÁ ARREGLADO

### Backend (Python/FastAPI):

1. **`redis_service.py`** ✓
   - `set_json()` / `get_json()` para persistencia JSON
   - Manejo de errores y conexión lazy
   - Soporta TTL en segundos
   - Codificación UTF-8 correcta

2. **`memory_store.py`** ✓ (NUEVO)
   - `normalize_phone()` - normaliza teléfonos a formato "+CC..." 
   - `build_memory_key()` - clave única por channel + phone normalizado
   - `append_message()` - agrega mensajes al historial
   - `get_context()` - recupera contexto completo
   - `save_context()` / `clear_context()` / `update_context_field()`
   - Todo anclado al teléfono normalizado - MISMA KEY para leer y escribir

3. **`dependencies.py`** ✓
   - `get_memory_store()` - Dependency injection del MemoryStore
   - Usa `get_redis_service()`
   - Disponible en todos los routers

4. **`chat.py`** ✓ (RENOVADO)
   - `@router.post("/message")` - Guarda mensaje con phone + channel
   - `@router.get("/context")` - Obtiene contexto por phone + channel  
   - `@router.post("/context")` - Guarda contexto directo
   - `@router.get("/messages")` - Obtiene últimos N mensajes
   - `@router.delete("/context")` - Limpia contexto
   - Todas las rutas validan teléfono y usan normalización

5. **`admin.py`** ✓
   - `@router.post("/login")` - OAuth2PasswordRequestForm (form-data)
   - `@router.get("/dashboard/metrics")` - Con autenticación JWT
   - `@router.post("/intelligence/query")` - Con autenticación JWT
   - Retorna: `access_token`, `name`, `role`, `expires_in`

6. **`main.py`** ✓
   - Registra admin_router en `/admin`
   - CORS habilitado para "*"

### Frontend (React):

1. **`Login.jsx`** ✓
   - Envía `username` + `password` como `application/x-www-form-urlencoded`
   - URL: `http://127.0.0.1:8000/api/admin/login`
   - Guarda: `auth_token`, `user_name`, `user_role`
   - Botón "Atrás" para regresar a inicio
   - Mensajes de error localizados (es/pt/en)

2. **`adminApi.js`** ✓
   - `authService.login(email, password)` - login form-data
   - `authService.verifyToken()` - verifica token JWT
   - `dashboardService.getMetrics(hours)` - obtiene métricas con auth
   - Manejo de errores 401 → logout automático
   - Headers: `Authorization: Bearer {token}`

---

## 🔌 FLUJO DE INTEGRACIÓN

### Login:
```
1. Frontend envía POST /admin/login (form-data)
   → username: email, password: password
   
2. Backend verifica credenciales contra ADMIN_USERS
   
3. Retorna:
   {
     "access_token": "eyJhbGc...",
     "token_type": "bearer",
     "name": "GoToCloud Admin",
     "role": "admin",
     "expires_in": 28800
   }
   
4. Frontend guarda auth_token en localStorage
   
5. Frontend navega a /dashboard
```

### Dashboard + Memory:
```
1. Frontend obtiene métricas:
   GET /admin/dashboard/metrics?hours=24
   Headers: Authorization: Bearer {token}
   
2. Para chat con memoria por teléfono:
   POST /chat/message
   {
     "phone_number": "+1 (555) 123-4567",
     "message": "Hola",
     "channel": "web"
   }
   
3. Backend normaliza: "+15551234567"
   
4. Redis key: "memory:web:+15551234567"
   
5. Retrieve contexto:
   GET /chat/context?phone_number=...&channel=web
   → Retorna contexto con todos los mensajes
```

### Memory Persistencia:
```
Redis Keys Pattern:
  memory:{channel}:{normalized_phone}
  
Ejemplos:
  memory:web:+15551234567
  memory:telegram:+5491123456789
  memory:whatsapp:+34666777888

Contenido (JSON):
  {
    "phone": "+15551234567",
    "channel": "web",
    "messages": [
      {
        "role": "user",
        "content": "Hola",
        "timestamp": "2026-05-17T10:30:45.123456"
      },
      ...
    ],
    "created_at": "2026-05-17T10:25:00.000000",
    "last_updated": "2026-05-17T10:35:10.000000"
  }
  
TTL: 24 horas (86400 segundos) por defecto
```

---

## ⚙️ CONFIGURACIÓN REQUERIDA

### .env (Backend):
```
POSTGRES_URL=postgresql://...
REDIS_URL=redis://localhost:6379
ADMIN_EMAIL=admin@gotocloud.ai
ADMIN_PASSWORD=gotocloud2024
ADMIN_NAME=GoToCloud Admin
ADMIN_JWT_SECRET=gotocloud-change-me-in-prod-secret-2024
```

### Vite Config (Frontend):
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

---

## 🧪 TESTING

### Login Test:
```bash
curl -X POST http://127.0.0.1:8000/api/admin/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gotocloud.ai&password=gotocloud2024"
```

### Memory Test:
```bash
# Guardar mensaje
curl -X POST http://127.0.0.1:8000/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+1 (555) 123-4567",
    "message": "Hola!",
    "channel": "web"
  }'

# Obtener contexto  
curl http://127.0.0.1:8000/api/chat/context \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+1 (555) 123-4567", "channel": "web"}'
```

### Dashboard Test (con auth):
```bash
TOKEN="<access_token_from_login>"

curl http://127.0.0.1:8000/api/admin/dashboard/metrics \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 NOTAS IMPORTANTES

1. **Normalización de teléfono**: Siempre removemos caracteres especiales
   - Input: "+1 (555) 123-4567"
   - Output: "+15551234567"
   - Key en Redis: "memory:web:+15551234567"

2. **Lectura/Escritura misma KEY**: 
   - Garantiza que siempre leemos lo que acabamos de escribir
   - Contexto persistente entre llamadas

3. **CORS**: El backend permite todos los orígenes
   - Producción: Restricts orígenes específicos

4. **JWT**: Token de 8 horas (28800 segundos)
   - Verificar en cada request a /admin/*
   - Frontend debe renovar o hacer logout

5. **Imports**: Todos los archivos están conectados
   - `memory_store.py` importa `redis_service.py`
   - `dependencies.py` importa ambos
   - `chat.py` usa `MemoryStore` via dependency injection
   - `admin.py` es independiente pero usa `get_db`

---

## ❌ PROBLEMAS RESUELTOS

1. ✓ Redis corruption - Recreado `redis_service.py`
2. ✓ Phone normalization - Nuevo `memory_store.py`
3. ✓ Form-data login - Frontend ahora usa URLSearchParams
4. ✓ Memory key mismatch - Misma función normalize_phone en read/write
5. ✓ Missing MemoryStore - Nuevo servicio con full API
6. ✓ Missing dependency injection - Agregado en `dependencies.py`

---

## 🚀 PRÓXIMOS PASOS

1. **Testear login** en frontend con credenciales por defecto
2. **Testear memory store** con POST /chat/message
3. **Conectar dashboard** a GET /admin/dashboard/metrics
4. **Verificar CORS** y errores en Network tab
5. **Implementar retry logic** para reconexión a Redis
6. **Agregar logs** en Memory read/write para debug
