const vision = require('@google-cloud/vision');

const visionClient = new vision.ImageAnnotatorClient({
  apiKey: process.env.GOOGLE_VISION_API_KEY
});

module.exports = visionClient;