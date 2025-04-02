import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import axios from "axios";
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import fetch from 'node-fetch';
import * as natural from 'natural';

admin.initializeApp();

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

interface ProcessSolicitationData {
  fileUrl: string;
  filename: string;
  fileType: string;
  userId: string;
}

interface ProcessSolicitationLinkData {
  link: string;
  userId: string;
}

interface Entity {
  text: string;
  label: string;
  start: number;
  end: number;
}

interface Keyword {
  term: string;
  tfidf: number;
}

interface AnalysisData {
  entities: Entity[];
  keywords: string[];
  dates: Entity[];
  money: Entity[];
  organizations: Entity[];
  sentiment: number;
  requirements: {
    timeline: {
      start: string | undefined;
      end: string | undefined;
      milestones: string[];
    };
    budget: {
      amount: number;
      text: string;
    };
    stakeholders: Entity[];
    keyPhrases: string[];
  };
}

export const processSolicitation = functions.https.onCall(async (data: ProcessSolicitationData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Download the file
    const response = await axios.get(data.fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    let text = "";
    // Process based on file type
    if (data.fileType === "application/pdf") {
      const pdfData = await pdf(buffer);
      text = pdfData.text;
    } else if (data.fileType.includes("word")) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }

    // Extract project information from the text
    const projectData = extractProjectData(text);

    // Create a new project in Firestore
    const projectRef = await admin.firestore().collection("projects").add({
      ...projectData,
      userId: data.userId,
      originalFile: data.fileUrl,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "draft",
    });

    return {
      projectId: projectRef.id,
      projectData,
    };
  } catch (error) {
    console.error("Error processing solicitation:", error);
    throw new functions.https.HttpsError("internal", "Failed to process solicitation");
  }
});

export const processSolicitationLink = functions.https.onCall(async (data: ProcessSolicitationLinkData, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  try {
    // Fetch the content from the link
    const response = await axios.get(data.link);
    const html = response.data;

    // Extract text from HTML (you might want to use a more sophisticated HTML parser)
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    // Extract project information from the text
    const projectData = extractProjectData(text);

    // Create a new project in Firestore
    const projectRef = await admin.firestore().collection("projects").add({
      ...projectData,
      userId: data.userId,
      originalLink: data.link,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "draft",
    });

    return {
      projectId: projectRef.id,
      projectData,
    };
  } catch (error) {
    console.error("Error processing solicitation link:", error);
    throw new functions.https.HttpsError("internal", "Failed to process solicitation link");
  }
});

function extractProjectData(text: string) {
  // This is a simple example. You might want to use more sophisticated NLP techniques
  // or AI models to extract information from the text.
  
  // Extract project name (assuming it's in the first line or after "Project Name:")
  const projectNameMatch = text.match(/Project Name:\s*([^\n]+)/i) || text.split("\n")[0];
  const projectName = projectNameMatch[1] || projectNameMatch;

  // Extract project description (first paragraph)
  const description = text.split("\n\n")[0];

  // Extract required items (looking for lists or bullet points)
  const requiredItems = text
    .split("\n")
    .filter(line => line.trim().match(/^[-•*]\s+/))
    .map(line => line.replace(/^[-•*]\s+/, "").trim());

  // Extract due date (looking for common date formats)
  const dueDateMatch = text.match(/(?:due date|deadline|submission date):\s*(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i);
  const dueDate = dueDateMatch ? dueDateMatch[1] : null;

  return {
    name: projectName,
    description,
    requiredItems,
    dueDate,
    type: "solicitation",
    source: "upload",
  };
}

export const processNLP = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { text } = data;
  
  try {
    // Extract entities using natural's NER
    const entities: Entity[] = [];
    const tokens = tokenizer.tokenize(text);
    
    // Use natural's built-in NER
    const language = "EN";
    const classifier = new natural.BayesClassifier();
    
    // Train classifier with some basic patterns
    classifier.addDocument('deadline', 'DATE');
    classifier.addDocument('due date', 'DATE');
    classifier.addDocument('budget', 'MONEY');
    classifier.addDocument('cost', 'MONEY');
    classifier.addDocument('company', 'ORG');
    classifier.addDocument('corporation', 'ORG');
    classifier.train();

    // Process tokens
    tokens.forEach((token, index) => {
      const label = classifier.classify(token.toLowerCase());
      if (label) {
        entities.push({
          text: token,
          label,
          start: text.indexOf(token),
          end: text.indexOf(token) + token.length
        });
      }
    });

    // Extract key phrases using TF-IDF
    tfidf.addDocument(tokens);
    const keywords: Keyword[] = tfidf.listTerms(0).slice(0, 10);

    // Filter entities by type
    const dates = entities.filter(ent => ent.label === 'DATE');
    const money = entities.filter(ent => ent.label === 'MONEY');
    const organizations = entities.filter(ent => ent.label === 'ORG');

    // Analyze sentiment
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const sentiment = analyzer.getSentiment(tokens);

    // Generate analysis data
    const analysisData: AnalysisData = {
      entities,
      keywords: keywords.map(k => k.term),
      dates,
      money,
      organizations,
      sentiment,
      requirements: {
        timeline: extractTimeline(dates),
        budget: extractBudget(money),
        stakeholders: organizations,
        keyPhrases: keywords.map(k => k.term)
      }
    };

    // Store analysis results
    await admin.firestore()
      .collection('solicitations')
      .doc(context.auth.uid)
      .collection('analyses')
      .add({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        analysis: analysisData
      });

    return analysisData;

  } catch (error) {
    console.error('Error in NLP processing:', error);
    throw new functions.https.HttpsError('internal', 'Error processing document');
  }
});

function extractTimeline(dates: Entity[]): { start: string | undefined; end: string | undefined; milestones: string[] } {
  // Sort dates chronologically
  const sortedDates = dates.sort((a, b) => {
    const dateA = new Date(a.text);
    const dateB = new Date(b.text);
    return dateA.getTime() - dateB.getTime();
  });

  return {
    start: sortedDates[0]?.text,
    end: sortedDates[sortedDates.length - 1]?.text,
    milestones: sortedDates.slice(1, -1).map(d => d.text)
  };
}

function extractBudget(money: Entity[]): { amount: number; text: string } {
  // Find the largest monetary value as the likely budget
  const amounts = money.map(m => {
    const amount = parseFloat(m.text.replace(/[^0-9.]/g, ''));
    return { amount, text: m.text };
  });

  return amounts.reduce((max, current) => 
    current.amount > max.amount ? current : max
  , { amount: 0, text: '' });
} 