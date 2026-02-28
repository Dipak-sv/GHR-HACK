const parseGeminiResponse = (rawText) => {
  // Step 1: strip ```json opening fence
  let cleaned = rawText.replace(/```json/gi, '');
  
  // Step 2: strip ``` closing fence
  cleaned = cleaned.replace(/```/g, '');
  
  // Step 3: trim whitespace
  cleaned = cleaned.trim();
  
  // Step 4: parse
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error('PARSE_FAILED: ' + rawText);
  }
};

module.exports = { parseGeminiResponse };