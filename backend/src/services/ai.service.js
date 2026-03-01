const fs = require('fs');
const path = require('path');
const groq = require('../config/groq');
const { parseGeminiResponse } = require('../utils/jsonParser.util');

const extractionPrompt = `
You are a medical prescription parser for Indian handwritten prescriptions.
Carefully read this handwritten prescription image.
Extract ALL visible information and medicines.

Return ONLY this exact JSON — no markdown, no explanation, nothing else:
{
  "patientName": "",
  "doctorName": "",
  "date": "",
  "diagnosis": "",
  "medicines": [
    {
      "name": "",
      "type": "tablet | capsule | syrup | injection | drops | cream | other",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "timing": "",
      "confidence": "high | medium | low"
    }
  ],
  "doctorNotes": "",
  "warnings": []
}

Field rules:
- patientName: Patient's full name ONLY if clearly visible. If not present, leave as "". Do NOT invent or make up names.
- doctorName: Doctor's name and qualifications ONLY if clearly visible. If not present, leave as "". Do NOT invent names.
- date: Prescription date ONLY if visible.
- diagnosis: Any diagnosis or chief complaint written.
- type: What kind of medicine (tablet, capsule, syrup, etc.)
- dosage: Look extremely closely for dose amount, e.g., "500mg", "100mg", or "10ml". Extract exactly what is written. If dosage is truly omitted or unclear, leave as "". Do NOT guess a dosage.
- frequency: Look extremely closely for when to take. Extract exactly what is written or convert Indian shorthand if present:
    "1-0-1" → "Morning and Night"
    "1-1-1" → "Morning, Afternoon and Night"
    "0-0-1" → "Night only"
    "1-0-0" → "Morning only"
    "SOS" → "As needed"
    If frequency is truly NOT written anywhere, leave as "". Do NOT guess a schedule.
- timing: Before/after food. Convert: "PC" or "AC" → "After food" or "Before food". Leave as "" if not written.
- duration: Look closely for how many days, e.g., "5 days", "1 month". Leave as "" if truly not written.
- confidence: high=clearly legible, medium=partial/guess, low=unclear

CRITICAL STRICT INSTRUCTIONS:
1. YOU MUST LOOK EXTREMELY CLOSELY. Do NOT miss extracting dosage, frequency, timing or duration if it is written anywhere near the medicine.
2. NEVER invent, hallucinate, or assume any missing data. If a name or number is not physically written, do not guess.
3. If ANY field (patientName, doctorName, dosage, frequency, duration, etc.) is strictly absent in the image, you MUST leave it as an empty string "". 
4. Your job is ONLY to extract exactly what is physically written on the paper. Do NOT fill in "standard" values or use your own AI preference.
5. Do NOT add or change any medical information.
6. Return ONLY the JSON object, nothing else.
`;

const buildSimplificationPrompt = (extractedData, language) => `
You are a patient communication assistant.
Translate this prescription data into simple patient instructions.
Target language: ${language}

Prescription data:
${JSON.stringify(extractedData, null, 2)}

Rules for Translation:
1. "instructions": Write a simple, reassuring paragraph per medicine in ${language}. Use simple everyday words, no medical jargon. End with a short general medication safety reminder.
2. "translatedData": Translate the patientName, doctorName, diagnosis, doctorNotes, and ALL medicine fields (type, dosage, frequency, duration, timing) to ${language}. 
3. IMPORTANT for Medicine Names: Convert medicine names to the script of the target language (e.g., Devanagari for Hindi/Marathi), but KEEP the exact phonetic pronunciation. Do NOT translate the meaning of the name.
4. IMPORTANT for confidence: DO NOT translate the "confidence" field. Leave it exactly as "high", "medium", or "low" in English.

Return ONLY this exact JSON — no markdown, no explanation, nothing else:
{
  "instructions": "translated instructions here",
  "patientName": "translated",
  "doctorName": "translated",
  "diagnosis": "translated",
  "doctorNotes": "translated",
  "medicines": [
    {
      "name": "phonetic translation",
      "type": "translated",
      "dosage": "translated",
      "frequency": "translated",
      "duration": "translated",
      "timing": "translated",
      "confidence": "high | medium | low"
    }
  ]
}
`;

// ── FUNCTION 1: Extract from image ────────────────────
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
    max_tokens: 1500
  });

  const rawResponse = response.choices[0].message.content;
  console.log('Groq raw response:', rawResponse);

  const extractedData = parseGeminiResponse(rawResponse);

  // Ensure all fields exist
  if (!extractedData.patientName) extractedData.patientName = '';
  if (!extractedData.doctorName) extractedData.doctorName = '';
  if (!extractedData.date) extractedData.date = '';
  if (!extractedData.diagnosis) extractedData.diagnosis = '';
  if (!extractedData.medicines) extractedData.medicines = [];
  if (!extractedData.doctorNotes) extractedData.doctorNotes = '';
  if (!extractedData.warnings) extractedData.warnings = [];

  // Ensure each medicine has all required fields
  extractedData.medicines = extractedData.medicines.map(med => ({
    name: med.name || '',
    type: med.type || 'tablet',
    dosage: med.dosage || '',
    frequency: med.frequency || '',
    duration: med.duration || '',
    timing: med.timing || '',
    confidence: med.confidence || 'medium'
  }));

  return { extractedData, rawText: rawResponse };
};

// ── FUNCTION 2: Simplify for patient ──────────────────
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
    max_tokens: 1500
  });

  const rawText = response.choices[0].message.content;

  if (!rawText || rawText.trim() === '') {
    throw new Error('SIMPLIFY_EMPTY: Groq returned empty response');
  }

  const result = parseGeminiResponse(rawText);

  if (!result || !result.instructions) {
    throw new Error('SIMPLIFY_PARSE_ERROR: Could not parse instructions from JSON');
  }

  // Support both flattened and nested JSON (if the AI disobeys prompt structure)
  const tData = result.translatedData || result;
  const finalTranslatedData = tData.medicines ? tData : extractedData;

  return {
    simplifiedText: result.instructions,
    translatedData: finalTranslatedData
  };
};

// ── FUNCTION 3: Generate structured summary (pure JS, no AI) ──
const generateSummary = (extractedData, safetyAnalysis) => {
  const { safetyScore, overallRisk, flags } = safetyAnalysis;

  const riskEmoji = overallRisk === 'low' ? '✅'
    : overallRisk === 'medium' ? '⚠️'
      : '🔴';

  const criticalCount = flags.filter(f => f.severity === 'CRITICAL').length;
  const warningCount = flags.filter(f => f.severity === 'WARNING').length;

  const confEmoji = (c) => c === 'high' ? '✅' : c === 'medium' ? '⚠️' : '🔴';

  const medicines = (extractedData.medicines || []).map((med, i) => ({
    index: i + 1,
    display: `${med.name || 'Unknown'} (${med.type || 'tablet'})`,
    dose: `${med.dosage || 'not specified'} | ${med.frequency || 'not specified'}`,
    timing: med.timing || 'Any time',
    duration: med.duration || 'As directed',
    confidence: `${med.confidence || 'medium'} ${confEmoji(med.confidence)}`
  }));

  return {
    header: {
      patientName: extractedData.patientName || '',
      doctorName: extractedData.doctorName || '',
      date: extractedData.date || '',
      diagnosis: extractedData.diagnosis || ''
    },
    safety: {
      score: safetyScore,
      risk: overallRisk,
      riskEmoji,
      display: `${safetyScore}/100 ${riskEmoji} ${overallRisk.toUpperCase()} RISK`,
      criticalCount,
      warningCount,
      flags
    },
    medicines,
    totalMedicines: medicines.length,
    generatedAt: new Date().toISOString()
  };
};

module.exports = { extractPrescription, simplifyPrescription, generateSummary };