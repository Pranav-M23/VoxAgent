# VoxAgent 🎙️

AI-Powered Voice Customer Feedback Platform

VoxAgent is an intelligent voice-based customer feedback system that enables businesses to conduct natural, AI-driven conversations with customers instead of relying on traditional survey forms.

The platform combines speech recognition, generative AI, and text-to-speech technologies to create a seamless feedback collection experience across desktop and mobile devices.

---

## ✨ Features

### 🎤 Voice-Based Customer Interaction
- Record customer responses directly from the browser
- Works on desktop and mobile devices
- Real-time microphone access and audio capture

### 🧠 AI Conversation Engine
- Powered by Google Gemini
- Context-aware follow-up questions
- Natural conversational flow
- Dynamic response generation
- Intelligent conversation completion

### 🔊 Text-to-Speech Responses
- Powered by Sarvam AI
- Human-like AI voice responses
- Automatic audio playback
- Introductory greeting on session start
- End-of-conversation voice messages

### 📝 Speech-to-Text
- Browser speech recognition support
- Sarvam STT fallback for mobile reliability
- Accurate transcription of customer responses

### 📊 Feedback Collection
- Stores customer responses
- Stores AI-generated replies
- Session-based conversation history
- Structured feedback gathering

### 📱 Mobile Friendly
- Optimized for smartphones and tablets
- Supports voice interactions through mobile browsers
- Public deployment through cloud hosting

---

# 🏗️ Architecture

```text
Customer
    │
    ▼
Frontend (Next.js)
    │
    ├── Records Voice
    ├── Speech-to-Text
    ├── Displays Messages
    └── Plays AI Audio
    │
    ▼
FastAPI Backend
    │
    ├── Gemini AI
    │      └── Generates Replies
    │
    ├── Sarvam AI
    │      ├── Text-to-Speech
    │      └── Speech-to-Text
    │
    └── Database
           └── Stores Conversations
```

---

# 🚀 Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Web Audio API
- MediaRecorder API

## Backend
- FastAPI
- Python
- SQLAlchemy
- Pydantic

## AI Services
- Google Gemini 2.5 Flash
- Sarvam AI

## Database
- SQLite

## Deployment
- Vercel (Frontend)
- Render (Backend)

---

# 📂 Project Structure

```text
VoxAgent/
│
├── frontend/
│   ├── app/
│   ├── components/
│   └── voice-feedback-portal.tsx
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database.py
│   │
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

# ⚙️ Backend Endpoints

## Start Conversation

### POST `/api/conversation`

Request

```json
{
  "session_id": 1,
  "session_token": "abc123",
  "message": "The service was good"
}
```

Response

```json
{
  "reply": "Thank you for your feedback. Could you tell me more about your experience?",
  "audio": "<base64_wav>",
  "end_call": false
}
```

---

## Text-to-Speech

### POST `/api/tts`

Request

```json
{
  "text": "Hello and welcome to Toyota Customer Feedback."
}
```

Response

```json
{
  "audio": "<base64_wav>"
}
```

---

# 🔄 Conversation Flow

1. Customer opens feedback link
2. Introductory voice message plays
3. Customer speaks
4. Audio is transcribed
5. Gemini generates a contextual response
6. Sarvam converts the response into speech
7. AI voice is played back
8. Conversation continues automatically
9. AI decides when sufficient feedback has been collected
10. Session ends with a thank-you message

---

# 💾 Environment Variables

Create a `.env` file in the backend directory:

```env
GEMINI_API_KEY=your_gemini_key
SARVAM_API_KEY=your_sarvam_key
DATABASE_URL=sqlite:///voxagent.db
```

---

# 🛠️ Installation

## Backend

```bash
cd backend

pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

## Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

# 📈 Business Benefits

- Higher survey completion rates
- Better customer engagement
- Reduced operational costs
- Automated feedback collection
- Real-time insights
- Scalable cloud architecture
- Improved customer experience

---

# 🎯 Use Cases

- Automotive Service Feedback
- Customer Satisfaction Surveys
- Hospitality Feedback Collection
- Healthcare Follow-Ups
- Banking Customer Reviews
- Telecom Customer Experience Programs
- E-Commerce Post-Purchase Feedback

---

# 🔮 Future Enhancements

- PostgreSQL support
- Analytics Dashboard
- Sentiment Analysis
- Multi-language conversations
- WhatsApp Integration
- Automated Reporting
- CRM Integration
- Voice Cloning Support

---

# 👨‍💻 Author

**Pranav M & Jithin Jeevan**

VoxAgent was built as an AI-powered voice feedback platform demonstrating the integration of Generative AI, Speech-to-Text, Text-to-Speech, and modern web technologies to create intelligent customer interaction systems.

---
