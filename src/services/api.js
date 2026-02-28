const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Helper ───────────────────────────────────────────────
const handleResponse = async (res) => {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
};

// ── 1. Upload prescription image ─────────────────────────
export const uploadPrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
    // NOTE: do NOT set Content-Type — browser sets it with boundary for multipart
  });
  return handleResponse(res);
};

// ── 2. Simplify for patient in chosen language ───────────
export const simplifyPrescription = async (sessionId, language) => {
  const res = await fetch(`${BASE_URL}/api/simplify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, language }),
  });
  return handleResponse(res);
};

// ── 3. Human confirm with verified medicines ─────────────
export const confirmPrescription = async (sessionId, verifiedMedicines, language) => {
  const res = await fetch(`${BASE_URL}/api/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, verifiedMedicines, language }),
  });
  return handleResponse(res);
};

// ── 4. Get confirmed prescription (403 if unverified) ────
export const getPrescription = async (sessionId) => {
  const res = await fetch(`${BASE_URL}/api/prescription/${sessionId}`);
  return handleResponse(res);
};
