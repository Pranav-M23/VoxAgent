import google.generativeai as genai
from app.config import settings

# Configure Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Model
model = genai.GenerativeModel("gemini-2.5-flash")


# ── Purpose-specific prompt templates ─────────────────────────────────────────

_PURPOSE_TEMPLATES: dict[str, dict] = {
    "feedback": {
        "role": "customer feedback agent",
        "goal": "collect detailed feedback about the customer's recent experience",
        "topics": [
            "overall satisfaction",
            "service quality",
            "staff behaviour",
            "waiting time",
            "value for money",
        ],
        "greeting": "Hi! I'm calling from {company} to collect your feedback about your recent experience with us. Could you share how it went?",
    },
    "sales": {
        "role": "sales representative",
        "goal": "understand the customer's needs and present relevant products or offers",
        "topics": [
            "current needs or pain points",
            "budget range",
            "preferred products or plans",
            "timeline to purchase",
            "any questions about offers",
        ],
        "greeting": "Hi! I'm calling from {company} to share some exciting offers that might be a great fit for you. Do you have a moment to chat?",
    },
    "bill_payment": {
        "role": "billing support agent",
        "goal": "assist the customer in understanding and completing their pending bill payment",
        "topics": [
            "outstanding bill amount",
            "payment methods available",
            "any billing disputes",
            "payment confirmation",
        ],
        "greeting": "Hello! I'm calling from {company} regarding your recent bill. I'd like to help you with your payment — could you confirm your account details?",
    },
    "bill_due": {
        "role": "billing reminder agent",
        "goal": "inform the customer about their upcoming or overdue bill and encourage timely payment",
        "topics": [
            "bill due date",
            "amount due",
            "payment options",
            "any difficulties in paying",
        ],
        "greeting": "Hi, I'm reaching out from {company} because your bill is due soon. I wanted to give you a heads-up and help with any questions about payment.",
    },
    "autopay_reminder": {
        "role": "account services agent",
        "goal": "remind the customer about autopay setup or an upcoming autopay deduction",
        "topics": [
            "autopay schedule and amount",
            "preferred payment method",
            "any changes needed to autopay settings",
            "confirmation of understanding",
        ],
        "greeting": "Hi! I'm calling from {company} to let you know that your autopay is scheduled soon. I just wanted to make sure everything looks good on your end.",
    },
    "support": {
        "role": "customer support agent",
        "goal": "resolve the customer's issue or query as efficiently as possible",
        "topics": [
            "nature of the issue",
            "steps already taken",
            "urgency and impact",
            "resolution steps",
        ],
        "greeting": "Hello! I'm from {company}'s support team. I'm here to help resolve any issues you might be facing. Could you describe what's going on?",
    },
}

_DEFAULT_PURPOSE = "feedback"


def _build_context(company_name: str, purpose: str) -> tuple[str, str]:
    """Returns (system_context, greeting_text) for the given company and purpose."""
    template = _PURPOSE_TEMPLATES.get(purpose.lower(), _PURPOSE_TEMPLATES[_DEFAULT_PURPOSE])

    greeting = template["greeting"].format(company=company_name)

    topics_str = "\n".join(f"- {t}" for t in template["topics"])

    context = f"""\
You are a {template["role"]} working for {company_name}.

Your goal is to {template["goal"]}.

Focus your conversation on:
{topics_str}

Guidelines:
- Keep responses short and natural (2-3 sentences max).
- Ask only ONE question at a time.
- Be warm, professional, and empathetic.
- Do NOT mention competitor companies.
- Address the customer by name if you know it.

When you have gathered sufficient information (typically after 4-6 exchanges,
or when the customer signals they are done), wrap up warmly and append
[END_CALL] at the very end of your final message — on the same line, after a space.
Example closing: "Thank you so much for your time! We really appreciate it. [END_CALL]"
Do NOT include [END_CALL] in any other message.
"""
    return context, greeting


def generate_reply(
    message: str,
    history: list[dict] | None = None,
    company_name: str = "our company",
    purpose: str = "feedback",
) -> tuple[str, bool]:
    """Returns (reply_text, end_call).

    Args:
        message:      The latest customer message.
        history:      Prior turns, each a dict with 'role' and 'message'. Oldest first.
        company_name: The company the agent represents (e.g. "Samsung", "Toyota").
        purpose:      The call purpose (e.g. "feedback", "sales", "bill_payment").
    """
    history = history or []

    context, _ = _build_context(company_name, purpose)

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

        # Detect and strip the end-call signal
        end_call = "[END_CALL]" in raw
        clean_reply = raw.replace("[END_CALL]", "").strip()

        return clean_reply, end_call

    except Exception as e:
        print("Gemini error:", str(e))
        return (
            "I'm sorry, I'm having trouble processing that right now. Could you repeat that?"
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