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

When you have collected sufficient feedback (typically after 4-6 exchanges,
or when the customer signals they are done), wrap up warmly and append
[END_CALL] at the very end of your message — on the same line, after a space.
Example closing: "Thank you so much for sharing your experience with us! "
                 "Your feedback really helps us improve. [END_CALL]"
Do NOT include [END_CALL] in any other message.
"""

def generate_reply(
    message: str,
    history: list[dict] | None = None,
) -> tuple[str, bool]:
    """Returns (reply_text, end_call) where end_call is True when Gemini
    decides the feedback session is complete.

    Args:
        message:  The latest customer message (not yet in history).
        history:  List of previous turns, each a dict with 'role' ('customer'
                  or 'ai') and 'message'. Oldest first.
    """
    history = history or []

    # Build a readable transcript of prior turns
    history_lines: list[str] = []
    for turn in history:
        label = "Customer" if turn["role"] == "customer" else "Agent"
        history_lines.append(f"{label}: {turn['message']}")
    history_text = "\n".join(history_lines)

    try:
        history_section = (
            f"\n\nConversation so far:\n{history_text}\n"
            if history_text else ""
        )

        prompt = f"""\
{BUSINESS_CONTEXT}{history_section}
Customer: {message}

Continue the conversation naturally. Ask only ONE follow-up question.
Do not repeat questions already asked above.
"""

        response = model.generate_content(prompt)
        raw = response.text

        # Detect and strip the end-call signal
        end_call = "[END_CALL]" in raw
        clean_reply = raw.replace("[END_CALL]", "").strip()

        return clean_reply, end_call

    except Exception as e:
        print("Gemini error:", str(e))

        return (
            "Thank you for your feedback. "
            "Could you tell me a little more about your service experience?"
        ), False


def analyze_transcript(transcript: str) -> dict:
    """Analyze a completed conversation transcript using Gemini.

    Returns a dict with keys:
        sentiment           : "positive" | "neutral" | "negative"
        satisfaction_score  : int 1-10
        summary             : str  (2-3 sentence human-readable summary)
        complaint_category  : str | None  (e.g. "waiting_time", "staff_behaviour")
        escalation_required : bool
    """
    prompt = f"""\
You are a customer-experience analyst. Read the following call transcript between
a feedback agent and a customer, then respond with ONLY a valid JSON object
(no markdown, no code fences, no explanation) using this exact schema:

{{
  "sentiment": "<positive|neutral|negative>",
  "satisfaction_score": <integer 1-10>,
  "summary": "<2-3 sentence summary of the customer's feedback>",
  "complaint_category": "<one of: waiting_time, repair_quality, staff_behaviour, service_advisor, vehicle_cleanliness, pricing, other — or null if no complaint>",
  "escalation_required": <true|false>
}}

Rules:
- satisfaction_score 8-10 = happy, 5-7 = neutral, 1-4 = unhappy.
- escalation_required = true only if the customer expressed a serious complaint,
  safety concern, or explicit dissatisfaction that needs human follow-up.
- summary must be in third-person, e.g. "The customer was satisfied with…"

Transcript:
{transcript}
"""

    try:
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Strip accidental markdown fences if Gemini adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        import json
        data = json.loads(raw)

        return {
            "sentiment": data.get("sentiment", "neutral"),
            "satisfaction_score": data.get("satisfaction_score", 5),
            "summary": data.get("summary", ""),
            "complaint_category": data.get("complaint_category"),
            "escalation_required": bool(data.get("escalation_required", False)),
        }

    except Exception as e:
        print(f"[analyze_transcript] Gemini analysis failed: {e}")
        return {
            "sentiment": "neutral",
            "satisfaction_score": 5,
            "summary": "Analysis unavailable.",
            "complaint_category": None,
            "escalation_required": False,
        }