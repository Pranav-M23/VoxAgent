from sarvamai import SarvamAI
from dotenv import load_dotenv
import os
import base64

load_dotenv()

client = SarvamAI(
    api_subscription_key=os.getenv("SARVAM_API_KEY")
)

response = client.text_to_speech.convert(
    text="Hello from Sarvam",
    target_language_code="en-IN"
)

audio_b64 = response.audios[0]

with open("output.wav", "wb") as f:
    f.write(base64.b64decode(audio_b64))

print("Saved to output.wav")