import json
import ssl
from typing import Any, Optional
from uuid import UUID
from datetime import datetime

import redis
from redis.exceptions import ConnectionError as RedisConnectionError


class JSONEncoder(json.JSONEncoder):
    """Custom JSON encoder que maneja UUID y datetime."""
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


class RedisService:
    """Servicio centralizado para interactuar con Redis con soporte para JSON y manejo de errores."""
    
    def __init__(self, redis_url: str):
        """
        Inicializa la conexión a Redis.
        
        Args:
            redis_url: URL de conexión a Redis (ej: redis://localhost:6379)
        """
        self.redis_url = redis_url
        self._client: Optional[redis.Redis] = None
    
    def _get_client(self) -> redis.Redis:
        """Obtiene o crea el cliente Redis con lazy loading."""
        if self._client is None:
            try:
                self._client = redis.from_url(
                    self.redis_url,
                    decode_responses=False,
                    health_check_interval=30,
                )
                # Verificar conexión
                self._client.ping()
            except Exception as e:
                raise RedisConnectionError(f"No se pudo conectar a Redis: {e}")
        return self._client
    
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """
        Guarda un valor string en Redis.
        
        Args:
            key: Clave
            value: Valor string
            ex: TTL en segundos (opcional)
        
        Returns:
            True si se guardó exitosamente
        """
        try:
            client = self._get_client()
            if isinstance(value, str):
                value = value.encode('utf-8')
            client.set(key, value, ex=ex)
            return True
        except Exception as e:
            print(f"Error guardando en Redis: {e}")
            return False
    
    def get(self, key: str) -> Optional[str]:
        """
        Obtiene un valor string de Redis.
        
        Args:
            key: Clave
        
        Returns:
            Valor string o None si no existe
        """
        try:
            client = self._get_client()
            result = client.get(key)
            if result is None:
                return None
            if isinstance(result, bytes):
                result = result.decode('utf-8')
            return result
        except Exception as e:
            print(f"Error leyendo de Redis: {e}")
            return None
    
    def set_json(self, key: str, value: dict, ttl_seconds: Optional[int] = None) -> bool:
        """
        Guarda un diccionario como JSON en Redis.
        
        Args:
            key: Clave
            value: Diccionario a guardar
            ttl_seconds: TTL en segundos (opcional)
        
        Returns:
            True si se guardó exitosamente
        """
        try:
            client = self._get_client()
            json_str = json.dumps(value, cls=JSONEncoder, ensure_ascii=False)
            client.set(key, json_str.encode('utf-8'), ex=ttl_seconds)
            return True
        except Exception as e:
            print(f"Error guardando JSON en Redis: {e}")
            return False
    
    def get_json(self, key: str) -> Optional[dict]:
        """
        Obtiene un diccionario JSON de Redis.
        
        Args:
            key: Clave
        
        Returns:
            Diccionario o None si no existe
        """
        try:
            client = self._get_client()
            result = client.get(key)
            if result is None:
                return None
            if isinstance(result, bytes):
                result = result.decode('utf-8')
            return json.loads(result)
        except Exception as e:
            print(f"Error leyendo JSON de Redis: {e}")
            return None
    
    def delete(self, key: str) -> bool:
        """
        Elimina una clave de Redis.
        
        Args:
            key: Clave
        
        Returns:
            True si se eliminó exitosamente
        """
        try:
            client = self._get_client()
            client.delete(key)
            return True
        except Exception as e:
            print(f"Error eliminando de Redis: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """
        Verifica si una clave existe en Redis.
        
        Args:
            key: Clave
        
        Returns:
            True si existe
        """
        try:
            client = self._get_client()
            return client.exists(key) > 0
        except Exception as e:
            print(f"Error verificando existencia en Redis: {e}")
            return False
    
    def append_to_list(self, key: str, value: dict, max_items: int = 100, ttl_seconds: Optional[int] = None) -> bool:
        """
        Agrega un item a una lista JSON en Redis, manteniendo un máximo de items.
        
        Args:
            key: Clave
            value: Diccionario a agregar
            max_items: Máximo de items a mantener
            ttl_seconds: TTL en segundos (opcional)
        
        Returns:
            True si se agregó exitosamente
        """
        try:
            client = self._get_client()
            
            # Obtener lista actual
            current = self.get_json(key) or {"items": []}
            
            if "items" not in current:
                current["items"] = []
            
            # Agregar nuevo item
            current["items"].append(value)
            
            # Mantener máximo de items
            if len(current["items"]) > max_items:
                current["items"] = current["items"][-max_items:]
            
            # Guardar actualizado
            self.set_json(key, current, ttl_seconds=ttl_seconds)
            return True
        except Exception as e:
            print(f"Error agregando a lista en Redis: {e}")
            return False
    
    def health_check(self) -> bool:
        """
        Verifica la salud de la conexión a Redis.
        
        Returns:
            True si Redis está disponible
        """
        try:
            client = self._get_client()
            client.ping()
            return True
        except Exception as e:
            print(f"Health check fallido: {e}")
            return False
