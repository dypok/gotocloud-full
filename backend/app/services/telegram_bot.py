import sys
import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# 1. Apuntamos a la raíz del proyecto (backend) para alinear las rutas
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

# 2. Usamos siempre el prefijo 'app.' igual que tus compañeros
from app.rag_pipeline.chat import buscar_contexto, ai_service
from app.models.schemas import ChatLog
from app.core.config import settings
from sqlmodel import Session, create_engine

# Cargar variables del .env de forma segura
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
DB_URL = os.getenv("POSTGRES_URL")  # <-- Lo leemos directo del .env sin pasar por settings

# Conexión a DB para guardar los logs
engine = create_engine(DB_URL)

def calcular_lead_score(mensaje: str) -> int:
    """Calcula la intención de compra basada en palabras clave"""
    mensaje_min = mensaje.lower()
    
    # Palabras de cierre / venta (Lead Caliente)
    keywords_calientes = ["comprar", "precio", "costo", "cotizar", "cotización", "urgente", "contratar", "planes", "pagar"]
    if any(word in mensaje_min for word in keywords_calientes):
        return 90
        
    # Palabras de exploración (Lead Tibio)
    keywords_tibios = ["cómo funciona", "beneficios", "diferencia", "arquitectura", "implementar", "servicios", "solución"]
    if any(word in mensaje_min for word in keywords_tibios):
        return 50
        
    # Saludos / Despedidas (Lead Frío)
    keywords_frios = ["hola", "gracias", "adiós", "buenos días", "ok", "vale"]
    if any(word in mensaje_min for word in keywords_frios):
        return 10
        
    # Por defecto (Curioso general)
    return 20

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Responde cuando el usuario inicia el bot con /start"""
    bienvenida = (
        "🤖 *¡Hola! Soy el asistente virtual de GoToCloud.*\n\n"
        "Estoy aquí para resolver tus dudas sobre nuestros servicios de Cloud, "
        "migración, data y modernización. ¿En qué te puedo ayudar hoy?"
    )
    # ParseMode.MARKDOWN le da formato bonito (negritas)
    await update.message.reply_text(bienvenida, parse_mode='Markdown')

async def responder_mensaje(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Procesa las preguntas usando tu motor RAG y responde en Telegram"""
    pregunta = update.message.text
    chat_id = update.message.chat_id

    # 1. Muestra "Escribiendo..." en Telegram (¡Le da un toque muy pro!)
   # await context.bot.send_chat_action(chat_id=chat_id, action='typing')

    try:
        # 2. Buscar contexto en PostgreSQL (tu RAG)
        contexto = buscar_contexto(pregunta)

        # 3. Armar los mensajes para Gemini
        mensajes = [
            {
                "role": "user",
                "content": (
                    "Eres un agente experto de soporte técnico y comercial de GoToCloud. "
                    "Responde de forma concisa, amigable y usando emojis basándote ÚNICAMENTE en el siguiente contexto:\n"
                    f"{contexto}\n\n"
                    f"Pregunta del usuario: {pregunta}"
                )
            }
        ]

        # 4. Generar la respuesta usando la IA de tu equipo
        respuesta = ai_service.chat(mensajes)

        # 5. Enviar la respuesta a Telegram
        await update.message.reply_text(respuesta)

        # 6. (Fase 4) Guardar la interacción con su Lead Score real
        score_calculado = calcular_lead_score(pregunta)
        
        with Session(engine) as db_session:
            nuevo_log = ChatLog(
                user_message=pregunta,
                bot_response=respuesta,
                lead_score=score_calculado
            )
            db_session.add(nuevo_log)
            db_session.commit()
            print(f"💾 Guardado en DB | Usuario: {update.message.from_user.first_name} | Score: {score_calculado}")

    except Exception as e:
        print(f"❌ Error procesando mensaje de Telegram: {e}")
        await update.message.reply_text("⚠️ Lo siento, tuve un problema interno. Por favor, intenta de nuevo en unos segundos.")

if __name__ == '__main__':
    if not TELEGRAM_TOKEN:
        print("❌ Error: No se encontró TELEGRAM_TOKEN en el archivo .env")
        sys.exit(1)
        
    # Inicializar la aplicación de Telegram
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).build()

    # Configurar los "escuchadores" de eventos
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, responder_mensaje))

    print("🚀 ¡Bot de Telegram encendido y conectado a GoToCloud RAG!")
    print("📱 Ve a tu celular y envíale un mensaje...")
    
    # Mantener el bot encendido escuchando
    app.run_polling()