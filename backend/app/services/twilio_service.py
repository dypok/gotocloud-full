from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse
from app.core.config import settings

class TwilioService:
    def __init__(self):
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self.phone_number = settings.twilio_phone_number
        self.whatsapp_number = settings.twilio_whatsapp_number

    def send_whatsapp(self, to: str, message: str):
        """Send a WhatsApp message."""
        try:
            self.client.messages.create(
                body=message,
                from_=f"whatsapp:{self.whatsapp_number}",
                to=f"whatsapp:{to}"
            )
            return True
        except Exception as e:
            print(f"Error sending WhatsApp: {e}")
            return False

    def initiate_call(self, to: str, callback_url: str):
        """Initiate an outbound PSTN call."""
        try:
            self.client.calls.create(
                to=to,
                from_=self.phone_number,
                url=callback_url
            )
            return True
        except Exception as e:
            print(f"Error initiating call: {e}")
            return False

    def generate_twiml_response(self, text: str, voice: str = "Polly.Enrique") -> str:
        """Generate TwiML for a voice response."""
        response = VoiceResponse()
        response.say(text, voice=voice, language="es-MX")
        return str(response)

    def generate_twiml_gather(self, text: str, action_url: str, voice: str = "Polly.Enrique") -> str:
        """Generate TwiML to gather speech from the user."""
        response = VoiceResponse()
        gather = response.gather(
            input="speech",
            action=action_url,
            speech_timeout="auto",
            language="es-MX"
        )
        gather.say(text, voice=voice, language="es-MX")
        return str(response)
