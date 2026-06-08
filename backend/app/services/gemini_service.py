import google.generativeai as genai
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Model
model = genai.GenerativeModel("gemini-2.5-flash")


def _build_context(company_name: str, purpose: str) -> str:
    """Build a dynamic system prompt from any free-form company + purpose string."""
    return f"""\
You are a professional AI voice agent calling on behalf of {company_name}.

The purpose of this call is: {purpose}

Your job is to have a natural, focused conversation to fulfil this purpose.

Guidelines:
- Keep responses short and conversational (2-3 sentences max).
- Ask only ONE question at a time.
- Be warm, professional, and empathetic.
- Stay strictly on topic — the call is about: {purpose}
- Do NOT mention competitor companies.
- Address the customer by name if you know it.

When the conversation is complete (typically after 4-6 exchanges, or when the
customer signals they are done), wrap up warmly and append [END_CALL] at the
very end of your final message — on the same line, after a space.
Example: "Thank you so much for your time! We really appreciate it. [END_CALL]"
Do NOT include [END_CALL] in any other message.
"""


def generate_reply(
    message: str,
    history: list[dict] | None = None,
    company_name: str = "our company",
    purpose: str = "assist the customer",
) -> tuple[str, bool]:
    """Returns (reply_text, end_call).

    Args:
        message:      The latest customer message.
        history:      Prior turns, each a dict with 'role' and 'message'. Oldest first.
        company_name: The company the agent represents (e.g. "Samsung", "Youtube").
        purpose:      Free-form call purpose — any text (e.g. "Youtube Premium Experience").
    """
    history = history or []

    context = _build_context(company_name, purpose)

    # Build readable transcript of prior turns
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
{context}{history_section}
Customer: {message}

Continue the conversation naturally. Ask only ONE follow-up question.
Do not repeat questions already asked above.
"""

        response = model.generate_content(prompt)
        raw = response.text

        end_call = "[END_CALL]" in raw
        clean_reply = raw.replace("[END_CALL]", "").strip()

        return clean_reply, end_call

    except Exception as e:
        print("Gemini error:", str(e))
        return "I'm sorry, I'm having trouble processing that right now. Could you repeat that?", False


def analyze_transcript(transcript: str) -> dict:
    """Analyze a completed conversation transcript using Gemini.

    Returns a dict with keys:
        sentiment           : "positive" | "neutral" | "negative"
        satisfaction_score  : int 1-10
        summary             : str  (2-3 sentence human-readable summary)
        complaint_category  : str | None
        escalation_required : bool
    """
    prompt = f"""\
You are a customer-experience analyst. Read the following call transcript between
an AI agent and a customer, then respond with ONLY a valid JSON object
(no markdown, no code fences, no explanation) using this exact schema:

{{
  "sentiment": "<positive|neutral|negative>",
  "satisfaction_score": <integer 1-10>,
  "summary": "<2-3 sentence summary of the customer's experience>",
  "complaint_category": "<one of: waiting_time, quality, staff_behaviour, pricing, other — or null if no complaint>",
  "escalation_required": <true|false>
}}

Rules:
- satisfaction_score 8-10 = happy, 5-7 = neutral, 1-4 = unhappy.
- escalation_required = true only if the customer expressed a serious complaint
  or explicit dissatisfaction that needs human follow-up.
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