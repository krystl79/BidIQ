require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PDFDocument } = require('pdf-lib');
const { TextractClient, AnalyzeDocumentCommand } = require('@aws-sdk/client-textract');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');
const { Storage } = require('@google-cloud/storage');
const { analyzeRFP, generateClarificationQuestions, generateResponseOutline } = require('./functions/genAI');
const path = require('path');
const OpenAI = require('openai');
const fs = require('fs');

// Debug: Log the current working directory and .env file path
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.resolve(process.cwd(), '.env'));
console.log('.env file exists:', fs.existsSync(path.resolve(process.cwd(), '.env')));

// Log environment variables (for debugging)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' : 'not set',
  CORS_ORIGIN: process.env.CORS_ORIGIN
});

const app = express();
const upload = multer({ dest: 'uploads/' });

// Configure CORS with more permissive settings for development
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

// Increase JSON payload size limit to 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body ? 'Body present' : 'No body',
    query: req.query
  });
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

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

// Initialize OpenAI client with error handling
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set. Some features may not work.');
  } else {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

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

// AI endpoints
app.post('/api/analyze-rfp', async (req, res) => {
  try {
    console.log('Received analyze-rfp request:', {
      body: req.body,
      headers: req.headers
    });

    if (!openai) {
      return res.status(503).json({
        error: 'Service temporarily unavailable',
        details: 'OpenAI service is not configured. Please check your environment variables.'
      });
    }

    if (!req.body.pdfText) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'pdfText is required in the request body'
      });
    }

    const analysis = await analyzeRFP(req.body.pdfText);
    console.log('Analysis completed successfully');
    res.json(analysis);
  } catch (error) {
    console.error('Error in /api/analyze-rfp:', error);
    res.status(500).json({
      error: 'Failed to analyze RFP',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/api/generate-questions', async (req, res) => {
  try {
    const { rfpAnalysis } = req.body;
    const questions = await generateClarificationQuestions(rfpAnalysis);
    res.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

app.post('/api/generate-outline', async (req, res) => {
  try {
    const { rfpAnalysis, answers } = req.body;
    const outline = await generateResponseOutline(rfpAnalysis, answers);
    res.json(outline);
  } catch (error) {
    console.error('Error generating outline:', error);
    res.status(500).json({ error: 'Failed to generate outline' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Override PORT from .env to avoid conflicts
process.env.PORT = '5002';
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS configuration:', {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    credentials: true
  });
}); 