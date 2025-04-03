/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const cors = require("cors")({ 
  origin: ['https://67ee000573287e0008357415--bidiq.netlify.app', 'http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  credentials: true
});
const admin = require("firebase-admin");
const { Storage } = require("@google-cloud/storage");
const { PDFDocument } = require("pdf-lib");
const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");
const fetch = require('node-fetch');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

admin.initializeApp();

const storage = new Storage();
const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// Initialize Cloud Functions
exports.processSolicitation = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const { fileUrl, filename, fileType, userId } = request.body;

      // Download the file from Firebase Storage
      const bucket = storage.bucket("bidiq-8a697.appspot.com");
      const file = bucket.file(`solicitations/${userId}/${filename}`);
      const [buffer] = await file.download();

      let text;
      if (fileType === "application/pdf") {
        // Process PDF
        const pdfDoc = await PDFDocument.load(buffer);
        text = "";
        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
          const page = pdfDoc.getPage(i);
          const { width, height } = page.getSize();
          const textContent = await page.getTextContent();
          text += textContent + "\n";
        }
      } else {
        // Process other document types using AWS Textract
        const command = new AnalyzeDocumentCommand({
          Document: {
            Bytes: buffer,
          },
        });
        const result = await textract.send(command);
        text = result.Blocks
          .filter(block => block.BlockType === "LINE")
          .map(block => block.Text)
          .join("\n");
      }

      // Store the processed text in Firestore
      await admin.firestore().collection("solicitations").add({
        userId,
        filename,
        fileType,
        text,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "processed",
      });

      response.json({ success: true, text });
    } catch (error) {
      console.error("Error processing solicitation:", error);
      response.status(500).json({ error: "Failed to process solicitation" });
    }
  });
});

exports.processSolicitationLink = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      const { link, userId } = request.body;

      // Process the link and store in Firestore
      await admin.firestore().collection("solicitations").add({
        userId,
        link,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "processed",
      });

      response.json({ success: true });
    } catch (error) {
      console.error("Error processing solicitation link:", error);
      response.status(500).json({ error: "Failed to process solicitation link" });
    }
  });
});

exports.processDocument = functions.https.onRequest((request, response) => {
  cors(request, response, async () => {
    try {
      if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
      }

      if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
      }

      // Handle file upload using multer
      upload.single('file')(request, response, async (err) => {
        if (err) {
          console.error('Error processing file upload:', err);
          response.status(400).json({ error: 'Error processing file upload' });
          return;
        }

        if (!request.file) {
          response.status(400).json({ error: 'No file provided' });
          return;
        }

        try {
          const formData = new FormData();
          formData.append('file', new Blob([request.file.buffer]), request.file.originalname);
          formData.append('options', JSON.stringify({
            extractText: true,
            extractMetadata: true,
            extractTables: true,
            extractForms: true
          }));

          const docupandaResponse = await fetch('https://api.docupanda.ai/v1/process', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${functions.config().docupanda.api_key}`,
              'Accept': 'application/json'
            },
            body: formData
          });

          if (!docupandaResponse.ok) {
            const errorData = await docupandaResponse.json();
            throw new Error(errorData.message || 'Failed to process document with Docupanda');
          }

          const result = await docupandaResponse.json();
          response.status(200).json(result);
        } catch (error) {
          console.error('Error processing document:', error);
          response.status(500).json({ error: error.message });
        }
      });
    } catch (error) {
      console.error('Error in CORS handler:', error);
      response.status(500).json({ error: error.message });
    }
  });
});
