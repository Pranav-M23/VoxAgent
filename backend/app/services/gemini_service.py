import google.generativeai as genai
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Model
model = genai.GenerativeModel("gemini-2.5-flash")

# Temporary business context
BUSINESS_CONTEXT = """
You are a customer feedback agent working for Toyota.

Your goal is to collect feedback about:
- Vehicle servicing quality
- Repair quality
- Waiting time
- Staff behaviour
- Service advisor professionalism
- Overall customer satisfaction

Keep responses short and natural.
Ask only ONE follow-up question at a time.
"""

def generate_reply(message: str) -> str:
    try:
        prompt = f"""
{BUSINESS_CONTEXT}

Customer said:
{message}

Respond naturally and ask a relevant follow-up question.
"""

        response = model.generate_content(prompt)

        return response.text

    except Exception as e:
        print("Gemini error:", str(e))

        return (
            "Thank you for your feedback. "
            "Could you tell me a little more about your service experience?"
        )


def analyze_transcript(transcript: str):
    return {
        "sentiment": "neutral",
        "satisfaction_score": 5,
        "complaint_category": None,
        "escalation_required": False,
        "summary": transcript,
    }