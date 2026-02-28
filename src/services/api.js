// eslint-disable-next-line no-unused-vars
export const analyzePrescription = async (_file) => {
  // If no backend is available, simulate a delay and return mock data.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        patient_name: "John Doe",
        patient_name_confidence: 0.95,
        medicines: [
          {
            id: 1,
            name: "Paracetamol",
            dosage: "500mg",
            frequency: "Twice daily",
            duration: "5 days",
            confidence: 0.82
          },
          {
            id: 2,
            name: "Amoxicillin",
            dosage: "250mg",
            frequency: "Thrice daily",
            duration: "7 days",
            confidence: 0.65 // Low confidence < 70%
          }
        ],
        notes: "Take after food.",
        notes_confidence: 0.94
      });
    }, 2000);
  });
};
