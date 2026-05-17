"""
Memory Store - Gestiona la memoria de conversaciones ancladas al teléfono normalizado.
"""
import json
import re
from typing import Optional
from datetime import datetime

from app.services.redis_service import RedisService


PHONE_PATTERN = re.compile(r'\D+')


def normalize_phone(phone: str) -> str:
    """
    Normaliza un número de teléfono removiendo caracteres especiales.
    Ejemplo: "+1 (555) 123-4567" -> "+15551234567"
    """
    if not phone:
        return ""
    digits = PHONE_PATTERN.sub("", phone.strip())
    if not digits:
        return ""
    return f"+{digits}" if not digits.startswith("+") else f"+{digits}"


def build_memory_key(channel: str, phone: str) -> str:
    """Construye la clave de Redis para la memoria del contexto."""
    normalized = normalize_phone(phone)
    if not normalized:
        return ""
    return f"memory:{channel}:{normalized}"


class MemoryStore:
    """
    Servicio de memoria de conversaciones anclado al teléfono normalizado.
    Lee y escribe con la misma clave para garantizar persistencia.
    """

    def __init__(self, redis_service: RedisService):
        self.redis = redis_service
        self.default_ttl = 86400  # 24 horas

    def save_context(
        self,
        channel: str,
        phone_number: str,
        context: dict,
        ttl: int = None,
    ) -> bool:
        """
        Guarda el contexto de conversación en Redis.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
            context: Diccionario con datos de contexto
            ttl: Time-to-live en segundos
        
        Returns:
            True si se guardó exitosamente
        """
        key = build_memory_key(channel, phone_number)
        if not key:
            return False
        
        ttl = ttl or self.default_ttl
        
        # Agregar timestamp de creación si no existe
        if "created_at" not in context:
            context["created_at"] = datetime.utcnow().isoformat()
        
        context["last_updated"] = datetime.utcnow().isoformat()
        
        return self.redis.set_json(key, context, ttl_seconds=ttl)

    def get_context(self, channel: str, phone_number: str) -> Optional[dict]:
        """
        Obtiene el contexto de conversación de Redis.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
        
        Returns:
            Diccionario con contexto o None si no existe
        """
        key = build_memory_key(channel, phone_number)
        if not key:
            return None
        
        return self.redis.get_json(key)

    def append_message(
        self,
        channel: str,
        phone_number: str,
        role: str,
        message: str,
        ttl: int = None,
    ) -> Optional[dict]:
        """
        Agrega un mensaje al historial de conversación.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
            role: Rol del mensaje (user, assistant, system)
            message: Contenido del mensaje
            ttl: Time-to-live en segundos
        
        Returns:
            Contexto actualizado o None si falla
        """
        context = self.get_context(channel, phone_number) or {
            "messages": [],
            "channel": channel,
            "phone": normalize_phone(phone_number),
        }
        
        if "messages" not in context:
            context["messages"] = []
        
        # Agregar nuevo mensaje
        context["messages"].append({
            "role": role,
            "content": message,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Mantener solo los últimos 50 mensajes
        if len(context["messages"]) > 50:
            context["messages"] = context["messages"][-50:]
        
        ttl = ttl or self.default_ttl
        if self.save_context(channel, phone_number, context, ttl):
            return context
        return None

    def get_messages(
        self,
        channel: str,
        phone_number: str,
        limit: int = 10,
    ) -> list:
        """
        Obtiene los últimos mensajes de conversación.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
            limit: Cantidad de mensajes a retornar
        
        Returns:
            Lista de mensajes
        """
        context = self.get_context(channel, phone_number)
        if not context:
            return []
        
        messages = context.get("messages", [])
        return messages[-limit:] if limit else messages

    def clear_context(self, channel: str, phone_number: str) -> bool:
        """
        Limpia el contexto de conversación.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
        
        Returns:
            True si se limpió exitosamente
        """
        key = build_memory_key(channel, phone_number)
        if not key:
            return False
        
        return self.redis.delete(key)

    def update_context_field(
        self,
        channel: str,
        phone_number: str,
        field: str,
        value,
        ttl: int = None,
    ) -> Optional[dict]:
        """
        Actualiza un campo específico del contexto.
        
        Args:
            channel: Canal (telegram, web, etc)
            phone_number: Número de teléfono del usuario
            field: Nombre del campo a actualizar
            value: Nuevo valor del campo
            ttl: Time-to-live en segundos
        
        Returns:
            Contexto actualizado o None si falla
        """
        context = self.get_context(channel, phone_number) or {}
        context[field] = value
        ttl = ttl or self.default_ttl
        if self.save_context(channel, phone_number, context, ttl):
            return context
        return None
