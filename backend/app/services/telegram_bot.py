import sys
import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Truco de rutas apuntando solo a la carpeta 'app'
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Importamos con la misma estructura que usa el resto del proyecto
from rag_pipeline.chat import buscar_contexto, ai_service
from models.schemas import ChatLog
from core.config_db import settings
from sqlmodel import Session, create_engine

# Cargar el Token de forma segura
load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

# Conexión a DB para guardar los logs (Fase 4)
engine = create_engine(settings.POSTGRES_URL)

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
    await context.bot.send_chat_action(chat_id=chat_id, action='typing')

    try:
        # 2. Buscar contexto en PostgreSQL (tu RAG)
        contexto = buscar_contexto(pregunta)

        # 3. Armar los mensajes para Azure GPT-4o
        mensajes = [
            {
                "role": "system",
                "content": (
                    "Eres un agente experto de soporte técnico y comercial de GoToCloud. "
                    "Responde de forma concisa, amigable y usando emojis basándote ÚNICAMENTE en el siguiente contexto:\n"
                    f"{contexto}\n"
                )
            },
            {"role": "user", "content": pregunta}
        ]

        # 4. Generar la respuesta usando la IA de tu equipo
        respuesta = ai_service.chat(mensajes)

        # 5. Enviar la respuesta a Telegram
        await update.message.reply_text(respuesta)

        # 6. (Fase 4) Guardar la interacción en la base de datos
        with Session(engine) as db_session:
            nuevo_log = ChatLog(
                user_message=pregunta,
                bot_response=respuesta,
                lead_score=0 
            )
            db_session.add(nuevo_log)
            db_session.commit()
            print(f"💾 Log guardado en DB desde Telegram: {update.message.from_user.first_name}")

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