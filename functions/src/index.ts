import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import pdf from "pdf-parse";
import * as mammoth from "mammoth";
import axios from "axios";

admin.initializeApp();

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