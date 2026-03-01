const fs = require('fs');
const path = require('path');
const groq = require('../config/groq');
const { parseGeminiResponse } = require('../utils/jsonParser.util');

// ── SMART FREQUENCY PARSER ─────────────────────────────
const parseFrequency = (raw) => {
  if (!raw) return '';
  const s = raw.toString().trim();
  const u = s.toUpperCase().replace(/\./g, '');

  // 1. Exact abbreviation matches
  const exactMap = {
    'OD': 'Morning',
    'QD': 'Morning',
    'BD': 'Morning and Night',
    'BID': 'Morning and Night',
    'TDS': 'Morning, Afternoon and Night',
    'TID': 'Morning, Afternoon and Night',
    'QID': 'Morning, Afternoon, Evening and Night',
    'SOS': 'Take whenever needed',
    'PRN': 'Take whenever needed',
    'HS': 'Night only (at bedtime)',
    'STAT': 'Immediately (one time)',
    'NOCTE': 'Night only',
    'MANE': 'Morning only',
    'ONCE DAILY': 'Morning',
    'TWICE DAILY': 'Morning and Night',
    'THRICE DAILY': 'Morning, Afternoon and Night',
  };
  if (exactMap[u]) return exactMap[u];

  // 2. 1-0-1 numeric notation — handle any separator (dash, space, slash, dot, 'to')
  const tokens = s.split(/[\-\s\/\.]+|\bto\b/i)
    .map(t => t.trim())
    .filter(t => /^[012]$/.test(t));

  if (tokens.length === 3) {
    const [m, a, n] = tokens.map(Number);
    const slots = [];
    if (m > 0) slots.push('Morning');
    if (a > 0) slots.push('Afternoon');
    if (n > 0) slots.push('Night');
    if (slots.length === 0) return 'As directed';
    return slots.join(' and ');
  }

  // 3. Pure numeric 3-digit pattern: 101, 111, 001 etc.
  if (/^[01]{3}$/.test(s)) {
    const slots = [];
    if (s[0] === '1') slots.push('Morning');
    if (s[1] === '1') slots.push('Afternoon');
    if (s[2] === '1') slots.push('Night');
    return slots.length ? slots.join(' and ') : 'As directed';
  }

  // 4. Fuzzy text matches
  if (/\b(sos|as needed|whenever|required|prn)\b/i.test(s)) return 'Take whenever needed';
  if (/\b(four|4)\s*time/i.test(s)) return 'Morning, Afternoon, Evening and Night';
  if (/\b(thrice|3)\s*time|tds|tid/i.test(s)) return 'Morning, Afternoon and Night';
  if (/\b(twice|2)\s*time|bd|bid/i.test(s)) return 'Morning and Night';
  if (/\b(once|1)\s*time|od\b/i.test(s)) return 'Morning';
  if (/bedtime|at night|night only|nocte/i.test(s)) return 'Night only';
  if (/morning only|mane/i.test(s)) return 'Morning only';

  // 5. Fallback — return as directed, not the raw garbled text
  return 'As directed';
};

// ── TIMING MAP ─────────────────────────────────────────
const timingMap = {
  'AC': 'Before food',
  'PC': 'After food',
  'CC': 'With food',
  'HS': 'At bedtime'
};

// ── EXTRACTION PROMPT ──────────────────────────────────
const extractionPrompt = `
You are the world's most experienced medical prescription reader 
specializing in Indian doctor handwriting. You have read over 
1 million Indian prescriptions. Your job is critical — a patient's 
safety depends on accurate extraction.

INDIAN PRESCRIPTION ABBREVIATIONS YOU MUST RECOGNIZE:
Frequency:
  OD = Once Daily
  BD or BID = Twice Daily
  TDS or TID = Thrice Daily
  QID = Four times daily
  SOS or PRN = As needed
  HS = At bedtime

IMPORTANT — 1-0-1 NOTATION:
  Doctors write three numbers separated by dashes or spaces
  Position 1 = Morning, Position 2 = Afternoon, Position 3 = Night
  1 = Take medicine at that time, 0 = Skip that time
  Examples:
    1-0-1 = Take morning AND night, skip afternoon
    1-1-1 = Take all three times
    0-0-1 = Take at night only
    1-0-0 = Take morning only
  Extract this notation exactly as written in the frequency field

Timing:
  AC = Before food
  PC = After food
  CC = With food

Medicine Types:
  TAB = Tablet, CAP = Capsule, SYR = Syrup
  INJ = Injection, OIN = Ointment
  EYE DRP = Eye drops, EAR DRP = Ear drops
  SUSP = Suspension, CREAM = Cream

COMMON INDIAN MEDICINES:
Paracetamol, Dolo, Calpol, Metformin, Glycomet,
Amlodipine, Amlong, Atorvastatin, Lipitor, Storvas,
Pantoprazole, Pan, Azithromycin, Azee, Amoxicillin,
Augmentin, Cetirizine, Bilastine, Etizolam, Etizola,
Cilorite, Magdep, Telma, Telmisartan, Ecosprin,
Clopidogrel, Ramipril, Aspirin, Ibuprofen, Diclofenac,
Omeprazole, Ranitidine, Metronidazole, Ciprofloxacin,
Levofloxacin, Ondansetron, Domperidone, Montelukast

EXTRACTION RULES:
1. Read EVERY word top to bottom left to right
2. Doctor name: top of page with Dr/MD/MBBS prefix
3. Patient name: after "Name:" or top right area
4. Date: after "Date:" or "Dt:" format DD/MM/YYYY
5. Medicines: numbered or bulleted list — extract ALL
6. Each medicine line: name → dosage → frequency → duration
7. If type not written → assume tablet
8. If dosage unclear → write best medical guess with low confidence
9. NEVER skip medicine because handwriting is unclear
10. Partial name is better than no name
11. Look for diagnosis or chief complaint at top
12. Extract any special instructions as doctorNotes

CONFIDENCE RULES:
high   = name AND dosage clearly readable, certain
medium = name readable, dosage guessed from context
low    = name partially readable, best educated guess

RETURN ONLY THIS EXACT JSON — NO MARKDOWN — NO TEXT BEFORE OR AFTER:
{
  "patientName": "",
  "doctorName": "",
  "date": "",
  "diagnosis": "",
  "medicines": [
    {
      "name": "",
      "type": "tablet",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "timing": "",
      "confidence": "high"
    }
  ],
  "doctorNotes": "",
  "warnings": []
}

ABSOLUTE FINAL RULES:
- Return ONLY the JSON — nothing before, nothing after
- medicines array must NEVER be empty if any text is visible
- Wrong guess with low confidence is better than empty field
- This system protects patient lives — extract everything visible
`;

// ── SIMPLIFICATION PROMPT ──────────────────────────────
const buildSimplificationPrompt = (extractedData, language) => `
You are a patient communication assistant helping patients in India 
understand their prescriptions. Many patients are elderly or have 
low medical literacy.

Target language: ${language}
${language === 'hindi' ? 'Write in simple Hindi using Devanagari script.' : ''}
${language === 'marathi' ? 'Write in simple Marathi using Devanagari script.' : ''}
${language === 'english' ? 'Write in simple everyday English.' : ''}

Prescription data:
${JSON.stringify(extractedData, null, 2)}

INSTRUCTIONS:
- Write a warm greeting first
- One clear paragraph per medicine
- For each medicine explain:
  * What it is for (general, not diagnosis specific)
  * How many to take and when (morning/afternoon/night)
  * Before or after food
  * For how many days
- Use simple words — no medical jargon
- Be warm and reassuring — patient may be anxious
- Do NOT add or change any medical information
- End with these reminders:
  * Complete the full course
  * Do not skip doses
  * Contact doctor if side effects occur
  * Keep medicines away from children

Write ENTIRELY in ${language}. No mixing of languages.
`;

// ── FUNCTION 1: Extract from image ─────────────────────
const extractPrescription = async (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp'
  };
  const mimeType = mimeTypes[ext] || 'image/jpeg';

  const response = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          },
          {
            type: 'text',
            text: extractionPrompt
          }
        ]
      }
    ],
    temperature: 0.1,
    max_tokens: 2048
  });

  const rawResponse = response.choices[0].message.content;
  console.log('Groq raw response:', rawResponse);

  const extractedData = parseGeminiResponse(rawResponse);

  // ── Ensure all fields exist ────────────────────────────
  if (!extractedData.patientName) extractedData.patientName = '';
  if (!extractedData.doctorName) extractedData.doctorName = '';
  if (!extractedData.date) extractedData.date = '';
  if (!extractedData.doctorNotes) extractedData.doctorNotes = '';
  if (!extractedData.warnings) extractedData.warnings = [];
  if (!extractedData.medicines) extractedData.medicines = [];

  // ── Clean diagnosis ────────────────────────────────────
  if (extractedData.diagnosis && extractedData.diagnosis.length > 80) {
    extractedData.diagnosis = extractedData.diagnosis.split('.')[0].trim();
  }
  if (!extractedData.diagnosis) extractedData.diagnosis = '';

  // ── Post-process each medicine ─────────────────────────
  extractedData.medicines = extractedData.medicines.map(med => {
    const timingKey = (med.timing || '').toUpperCase().trim();

    const frequency = parseFrequency(med.frequency);
    const timing = timingMap[timingKey] || med.timing || '';

    const medType = (med.type || 'tablet').toLowerCase();

    // ── Smart dosage unit assignment ───────────────────────
    let dosage = med.dosage || '';
    if (dosage) {
      const numericOnly = /^\d+(\.\d+)?$/.test(dosage.trim());
      const alreadyHasUnit = /[a-zA-Z]/.test(dosage);

      if (numericOnly || !alreadyHasUnit) {
        // Syrup / Suspension → ml
        if (medType === 'syrup' || medType === 'suspension' || medType === 'susp') {
          dosage = dosage.trim() + 'ml';
        }
        // Tablet / Capsule → mg (default for solid oral forms)
        else if (medType === 'tablet' || medType === 'capsule' || medType === 'cap' || medType === 'tab') {
          dosage = dosage.trim() + 'mg';
        }
        // Cream / Ointment → gm
        else if (medType === 'cream' || medType === 'ointment' || medType === 'oin') {
          dosage = dosage.trim() + 'gm';
        }
        // Default fallback → mg
        else {
          dosage = dosage.trim() + 'mg';
        }
      }
    }

    return {
      name: med.name || '',
      type: medType,
      dosage,
      frequency,
      duration: med.duration || '',
      timing,
      confidence: med.confidence || 'low'
    };
  });

  return { extractedData, rawText: rawResponse };
};

// ── FUNCTION 2: Simplify for patient ───────────────────
const simplifyPrescription = async (extractedData, language) => {
  const prompt = buildSimplificationPrompt(extractedData, language);

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 2048
  });

  const simplifiedText = response.choices[0].message.content;

  if (!simplifiedText || simplifiedText.trim() === '') {
    throw new Error('SIMPLIFY_EMPTY: Groq returned empty response');
  }

  return { simplifiedText };
};

// ── FUNCTION 3: Generate Summary ───────────────────────
const generateSummary = (extractedData, safetyAnalysis) => {
  const {
    patientName, doctorName,
    date, diagnosis, medicines
  } = extractedData;

  const { safetyScore, overallRisk, flags } = safetyAnalysis;

  const riskEmoji = overallRisk === 'low' ? '✅'
    : overallRisk === 'medium' ? '⚠️' : '🔴';

  const medicineList = medicines.map((med, i) => {
    const confidenceEmoji = med.confidence === 'high' ? '✅'
      : med.confidence === 'medium' ? '⚠️' : '🔴';

    return {
      index: i + 1,
      display: `${med.name} (${med.type})`,
      dose: `${med.dosage || 'not specified'} | ${med.frequency || 'not specified'}`,
      timing: med.timing || 'Any time',
      duration: med.duration || 'As directed',
      confidence: `${med.confidence} ${confidenceEmoji}`
    };
  });

  const criticalFlags = flags.filter(f => f.severity === 'CRITICAL');
  const warningFlags = flags.filter(f => f.severity === 'WARNING');

  return {
    header: {
      patientName: patientName || 'Not specified',
      doctorName: doctorName || 'Not specified',
      date: date || 'Not specified',
      diagnosis: diagnosis || 'Not specified'
    },
    safety: {
      score: safetyScore,
      risk: overallRisk,
      riskEmoji,
      display: `${safetyScore}/100 ${riskEmoji} ${overallRisk.toUpperCase()} RISK`,
      criticalCount: criticalFlags.length,
      warningCount: warningFlags.length,
      flags
    },
    medicines: medicineList,
    totalMedicines: medicines.length,
    generatedAt: new Date().toISOString()
  };
};

module.exports = {
  extractPrescription,
  simplifyPrescription,
  generateSummary
};