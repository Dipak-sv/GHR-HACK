# 🏥 MediScript AI
### Intelligent Doctor Handwriting Interpretation & Patient-Friendly Prescription System

> Built at **GHRHack 2.0** — 30-Hour National Hackathon | Jalgaon, Maharashtra | Feb 28 – Mar 1, 2026

---

## 🎯 Problem

Every year, **1.5 lakh deaths** occur in India due to medication errors.

The root cause? Illegible doctor handwriting.

- Patients cannot read their own prescriptions
- Pharmacists misinterpret dosage and frequency
- No system validates what was extracted
- No patient-friendly explanation exists in local languages

Existing OCR tools simply extract raw text. They do **not** validate safety, flag errors, or explain instructions to patients.

**MediScript AI solves this.**

---

## 💡 What Makes This Different

This is **not** a simple AI wrapper. Four layers differentiate this system:

| Layer | What It Does |
|---|---|
| 🤖 AI Vision Layer | Reads handwritten image → structured JSON |
| 🛡️ Safety Intelligence Engine | Rule-based validation → safetyScore + risk flags |
| ✅ Human Verification Gate | No prescription confirmed without human review |
| 🌐 Multi-Language Simplification | Patient instructions in English, Hindi, Marathi |

---

## 🏗️ System Architecture

```
User uploads prescription image
            ↓
    React Frontend (Vite)
            ↓  POST /api/upload
    Express Backend API
            ↓
    Multer — file validation
            ↓
    AI Service Layer (Groq Llama 4 Scout Vision)
    → reads handwriting → returns structured JSON
            ↓
    Safety Intelligence Engine (rule-based, manual logic)
    → safetyScore → risk flags → overallRisk
            ↓
    MongoDB Atlas — session + prescription storage
            ↓
    Results returned to frontend
            ↓
    User selects language → POST /api/simplify
    → Groq LLaMA 3.3 70B → patient-friendly text
            ↓
    Human reviews + edits all fields
            ↓
    POST /api/confirm → humanVerified: true
            ↓
    GET /api/prescription/:sessionId → print view
```

---

## 🧱 Layered Architecture

### Layer 1 — Presentation
**React 18 + Tailwind CSS + Vite**
- Upload Page: drag-drop image, language selector
- Results Page: medicine cards with confidence badges, editable fields
- Verify Page: human review + confirm gate
- Print Page: clean printable summary

### Layer 2 — API
**Node.js 20 + Express 4**
- 4 REST endpoints
- Multer file validation
- Session management
- Global error handler

### Layer 3 — AI
**Groq Llama 4 Scout Vision + Llama 3.3 70B**
- Call 1: image → structured JSON extraction
- Call 2: JSON + language → patient-friendly text
- Strict JSON enforcement in prompts
- Regex-based fence stripping + fallback error handling

### Layer 4 — Safety Engine ⭐
**Pure Node.js — zero AI, zero libraries**
- Rule-based deterministic validation
- 5 rules with CRITICAL and WARNING severity
- safetyScore calculation (0–100)
- Cannot hallucinate — same input always gives same output

### Layer 5 — Data
**MongoDB Atlas + Mongoose**
- Session-based, no user accounts
- Images deleted immediately after processing
- TTL index: auto-delete after 24 hours
- humanVerified gate on print view

---

## 📡 API Contracts

### POST /api/upload
```json
Request: multipart/form-data { image: File }

Response 200:
{
  "success": true,
  "sessionId": "uuid-v4",
  "extractedData": {
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "Twice daily",
        "duration": "5 days",
        "confidence": "high"
      }
    ],
    "doctorNotes": "",
    "warnings": []
  },
  "safetyAnalysis": {
    "safetyScore": 92,
    "flags": [],
    "overallRisk": "low"
  }
}
```

### POST /api/simplify
```json
Request: { "sessionId": "uuid", "language": "english | hindi | marathi" }

Response 200:
{
  "sessionId": "uuid",
  "simplifiedText": "Patient instructions in selected language...",
  "language": "marathi",
  "cached": false
}
```

### POST /api/confirm
```json
Request: { "sessionId": "uuid", "verifiedMedicines": [...], "language": "hindi" }

Response 200:
{
  "status": "confirmed",
  "prescriptionId": "mongo-object-id",
  "sessionId": "uuid"
}
```

### GET /api/prescription/:sessionId
```json
Response 200 (only if humanVerified: true):
{
  "sessionId": "uuid",
  "extractedData": { ... },
  "safetyAnalysis": { ... },
  "simplifiedOutput": {
    "english": "...",
    "hindi": "...",
    "marathi": "..."
  },
  "confirmedAt": "2026-02-28T12:00:00Z"
}
```

---

## 🛡️ Safety Intelligence Engine

The core differentiator. Written entirely in Node.js — no AI, no external libraries.

| Rule | Trigger | Severity | Score Impact |
|---|---|---|---|
| EMPTY_EXTRACTION | No medicines found | CRITICAL | -30 |
| MISSING_NAME | Medicine name empty | CRITICAL | -30 |
| MISSING_DOSAGE | Dosage field empty | CRITICAL | -30 |
| LOW_CONFIDENCE | Confidence = low | WARNING | -10 |
| SUSPICIOUS_DOSAGE | Value > 2000 or < 0 | WARNING | -10 |

```
safetyScore = 100 - (criticalCount × 30) - (warningCount × 10)
minimum score = 0

score ≥ 80 → overallRisk = low   (green)
score ≥ 50 → overallRisk = medium (amber)
score < 50  → overallRisk = high  (red)
```

---

## 🗄️ Database Schema

### prescriptions collection
```javascript
{
  sessionId:      String,    // unique, links all API calls
  extractedData: {
    medicines:   [{ name, dosage, frequency, duration, confidence }],
    doctorNotes:  String,
    warnings:    [String]
  },
  safetyAnalysis: {
    safetyScore:  Number,
    flags:       [{ field, rule, severity, message }],
    overallRisk:  String
  },
  simplifiedOutput: {
    english:  String,
    hindi:    String,
    marathi:  String
  },
  humanVerified:  Boolean,   // default: false
  confirmedAt:    Date,
  createdAt:      Date       // TTL: auto-delete after 24hrs
}
```

---

## 🔒 Privacy & Safety Design

- ✅ Images deleted immediately after AI processing
- ✅ Sessions auto-expire after 24 hours (MongoDB TTL)
- ✅ No user accounts — fully anonymous, session-based
- ✅ Print view gated behind `humanVerified: true`
- ✅ AI output never directly confirmed — human must verify
- ✅ No permanent image storage anywhere in the system

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB Atlas, Mongoose |
| AI — Vision | Groq Llama 4 Scout Vision |
| AI — Text | Groq LLaMA 3.3 70B Versatile |
| File Upload | Multer |
| Deployment | Vercel (FE) + Render (BE) |

---

## ⚙️ Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-team/ghrhack-2026.git
cd ghrhack-2026
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
GROQ_API_KEY=your_groq_api_key
FRONTEND_URL=http://localhost:5173
```

Run backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

Run frontend:
```bash
npm run dev
```

### 4. Verify Setup
```
Backend:  http://localhost:5000/api/health  → { status: "ok" }
Frontend: http://localhost:5173
```

---

## 👥 Team

| Name | Role |
|---|---|
| Dipak | System Architect & AI Layer |
| Purva | Backend Development |
| Nihar | Frontend Development |
| Aakanksha | Product Strategy & Pitch |

---

## 🏆 Built At

**GHRHack 2.0** — G H Raisoni College of Engineering  
Jalgaon, Maharashtra | February 28 – March 1, 2026  
Theme: HealthTech | Prize Pool: ₹1,10,000+