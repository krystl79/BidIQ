"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processSolicitationLink = exports.processSolicitation = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth = __importStar(require("mammoth"));
const axios_1 = __importDefault(require("axios"));
admin.initializeApp();
exports.processSolicitation = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    try {
        // Download the file
        const response = await axios_1.default.get(data.fileUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data);
        let text = "";
        // Process based on file type
        if (data.fileType === "application/pdf") {
            const pdfData = await (0, pdf_parse_1.default)(buffer);
            text = pdfData.text;
        }
        else if (data.fileType.includes("word")) {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        }
        // Extract project information from the text
        const projectData = extractProjectData(text);
        // Create a new project in Firestore
        const projectRef = await admin.firestore().collection("projects").add(Object.assign(Object.assign({}, projectData), { userId: data.userId, originalFile: data.fileUrl, createdAt: admin.firestore.FieldValue.serverTimestamp(), status: "draft" }));
        return {
            projectId: projectRef.id,
            projectData,
        };
    }
    catch (error) {
        console.error("Error processing solicitation:", error);
        throw new functions.https.HttpsError("internal", "Failed to process solicitation");
    }
});
exports.processSolicitationLink = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    try {
        // Fetch the content from the link
        const response = await axios_1.default.get(data.link);
        const html = response.data;
        // Extract text from HTML (you might want to use a more sophisticated HTML parser)
        const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        // Extract project information from the text
        const projectData = extractProjectData(text);
        // Create a new project in Firestore
        const projectRef = await admin.firestore().collection("projects").add(Object.assign(Object.assign({}, projectData), { userId: data.userId, originalLink: data.link, createdAt: admin.firestore.FieldValue.serverTimestamp(), status: "draft" }));
        return {
            projectId: projectRef.id,
            projectData,
        };
    }
    catch (error) {
        console.error("Error processing solicitation link:", error);
        throw new functions.https.HttpsError("internal", "Failed to process solicitation link");
    }
});
function extractProjectData(text) {
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
//# sourceMappingURL=index.js.map