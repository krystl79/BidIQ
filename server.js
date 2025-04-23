const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');
const { Storage } = require('@google-cloud/storage');
const genAI = require('./functions/genAI');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// CORS configuration
app.use(cors({
  origin: ['https://67ee000573287e0008357415--bidiq.netlify.app', 'http://localhost:3000'],
  methods: ['POST', 'OPTIONS'],
  credentials: true
}));

app.use(express.json());

// Initialize AWS Textract
const textract = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Initialize Google Cloud Storage
const storage = new Storage();

// Process solicitation document
app.post('/api/process-solicitation', async (req, res) => {
  try {
    const { fileUrl, filename, fileType, userId } = req.body;

    // Download the PDF file
    const pdfResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const pdfBytes = pdfResponse.data;

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();
    let extractedText = '';

    // Extract text from each page
    for (const page of pages) {
      const { width, height } = page.getSize();
      const textContent = await page.getTextContent();
      extractedText += textContent + '\n';
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt = `Analyze this RFP document and extract the following information in JSON format:
    {
      "title": "RFP title",
      "description": "Brief description",
      "dueDate": "Due date if mentioned",
      "requirements": ["List of key requirements"],
      "budget": "Budget information if mentioned",
      "contactInfo": "Contact information if available"
    }

    Document content:
    ${extractedText}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const text = geminiResponse.text();
    const parsedData = JSON.parse(text);

    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error processing solicitation:", error);
    res.status(500).json({ error: "Failed to process solicitation" });
  }
});

// Process solicitation link
app.post('/api/process-solicitation-link', async (req, res) => {
  try {
    const { link, userId } = req.body;

    // Fetch the webpage content
    const webpageResponse = await axios.get(link);
    const html = webpageResponse.data;
    const $ = cheerio.load(html);

    // Extract text content
    const textContent = $('body').text().trim();

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Prepare the prompt
    const prompt = `Analyze this RFP webpage and extract the following information in JSON format:
    {
      "title": "RFP title",
      "description": "Brief description",
      "dueDate": "Due date if mentioned",
      "requirements": ["List of key requirements"],
      "budget": "Budget information if mentioned",
      "contactInfo": "Contact information if available"
    }

    Webpage content:
    ${textContent}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const geminiResponse = await result.response;
    const text = geminiResponse.text();
    const parsedData = JSON.parse(text);

    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("Error processing solicitation link:", error);
    res.status(500).json({ error: "Failed to process solicitation link" });
  }
});

// Process document
app.post('/api/process-document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const formData = new FormData();
    formData.append('file', new Blob([req.file.buffer]), req.file.originalname);
    formData.append('options', JSON.stringify({
      extractText: true,
      extractMetadata: true,
      extractTables: true,
      extractForms: true
    }));

    const docupandaResponse = await fetch('https://api.docupanda.ai/v1/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DOCUPANDA_API_KEY}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    const data = await docupandaResponse.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document' });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 