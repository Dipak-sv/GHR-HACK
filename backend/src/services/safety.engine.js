const analyzeSafety = (extractedData) => {
  const flags = [];
  const medicines = extractedData.medicines || [];

  // RULE 1 — Empty extraction
  if (medicines.length === 0) {
    flags.push({
      field: 'medicines',
      rule: 'EMPTY_EXTRACTION',
      severity: 'CRITICAL',
      message: 'No medicines could be extracted from image'
    });
  }

  medicines.forEach((med, i) => {

    // RULE 2 — Missing medicine name
    if (!med.name || med.name.trim() === '') {
      flags.push({
        field: `medicines[${i}].name`,
        rule: 'MISSING_NAME',
        severity: 'CRITICAL',
        message: `Medicine at position ${i + 1} has no name`
      });
    }

    // RULE 3 — Missing dosage
    if (!med.dosage || med.dosage.trim() === '') {
      flags.push({
        field: `medicines[${i}].dosage`,
        rule: 'MISSING_DOSAGE',
        severity: 'CRITICAL',
        message: `Medicine "${med.name || 'unknown'}" has no dosage`
      });
    }

    // RULE 4 — Low confidence
    if (med.confidence === 'low') {
      flags.push({
        field: `medicines[${i}]`,
        rule: 'LOW_CONFIDENCE',
        severity: 'WARNING',
        message: `Medicine "${med.name || 'unknown'}" has low OCR confidence`
      });
    }

    // RULE 5 — Suspicious dosage value
    const numericDosage = parseFloat(med.dosage);
    if (!isNaN(numericDosage) && (numericDosage > 2000 || numericDosage < 0)) {
      flags.push({
        field: `medicines[${i}].dosage`,
        rule: 'SUSPICIOUS_DOSAGE',
        severity: 'WARNING',
        message: `Medicine "${med.name}" has unusual dosage: ${med.dosage}`
      });
    }

  });

  // SCORE CALCULATION
  const criticalCount = flags.filter(f => f.severity === 'CRITICAL').length;
  const warningCount  = flags.filter(f => f.severity === 'WARNING').length;

  const safetyScore = Math.max(
    0,
    100 - (criticalCount * 30) - (warningCount * 10)
  );

  const overallRisk = safetyScore >= 80 ? 'low'
    : safetyScore >= 50 ? 'medium'
    : 'high';

  return { safetyScore, flags, overallRisk };
};

module.exports = { analyzeSafety };