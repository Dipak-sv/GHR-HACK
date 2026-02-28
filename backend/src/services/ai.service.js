const fs     = require('fs');
const path   = require('path');
const groq   = require('../config/groq');
const { parseGeminiResponse } = require('../utils/jsonParser.util');

const extractionPrompt = `
You are a medical prescription parser.
Carefully read this handwritten prescription image.
Extract ALL visible medicines and instructions.

Return ONLY this exact JSON — no markdown, no explanation, nothing else:
{
  "medicines": [
    {
      "name": "",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "confidence": "high | medium | low"
    }
  ],
  "doctorNotes": "",
  "warnings": []
}

Confidence rules:
high   = clearly legible, you are certain
medium = partially legible, reasonable guess
low    = unclear, you are uncertain

CRITICAL:
- Do NOT add or change any medical information
- Leave field as empty string if unreadable
- Return ONLY the JSON object, nothing else
`;

const buildSimplificationPrompt = (extractedData, language) => `
You are a patient communication assistant.
Convert this prescription data into simple patient instructions.
Target language: ${language}

Prescription data:
${JSON.stringify(extractedData, null, 2)}

Rules:
- Simple everyday words, no medical jargon
- Warm and reassuring tone
- One clear paragraph per medicine
- Do NOT add or change any medical information
- Write the ENTIRE response in ${language} only
- End with a short general medication safety reminder
`;

// ── FUNCTION 1: Extract from image ────────────────────
const extractPrescription = async (imagePath) => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  const ext = path.extname(imagePath).toLowerCase();
  const mimeTypes = {
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png':  'image/png',
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
    max_tokens: 1024
  });

  const rawResponse = response.choices[0].message.content;
  console.log('Groq raw response:', rawResponse);

  const extractedData = parseGeminiResponse(rawResponse);

  if (!extractedData.medicines)   extractedData.medicines   = [];
  if (!extractedData.doctorNotes) extractedData.doctorNotes = '';
  if (!extractedData.warnings)    extractedData.warnings    = [];

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
    max_tokens: 1024
  });

  const simplifiedText = response.choices[0].message.content;

  if (!simplifiedText || simplifiedText.trim() === '') {
    throw new Error('SIMPLIFY_EMPTY: Groq returned empty response');
  }

  return { simplifiedText };
};

module.exports = { extractPrescription, simplifyPrescription };