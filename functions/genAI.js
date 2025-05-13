const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const OpenAI = require('openai');

// Initialize OpenAI client with error handling
let openai;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  // Log the first few characters of the API key to verify it's loaded
  const apiKeyPrefix = process.env.OPENAI_API_KEY.substring(0, 8);
  console.log('API Key prefix:', apiKeyPrefix);
  
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Test the API key with a simple request
  openai.models.list()
    .then(models => {
      console.log('Successfully connected to OpenAI API');
      console.log('Available models:', models.data.map(m => m.id).join(', '));
    })
    .catch(error => {
      console.error('Error testing OpenAI API connection:', error.message);
      if (error.response) {
        console.error('API Response:', error.response.data);
      }
    });
    
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error.message);
}

// Helper function to chunk text into smaller pieces
function chunkText(text, maxChunkSize = 2000) {
  const chunks = [];
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
      // If a single paragraph is longer than maxChunkSize, split it by sentences
      if (paragraph.length > maxChunkSize) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          if ((currentChunk + sentence).length > maxChunkSize) {
            if (currentChunk) {
              chunks.push(currentChunk.trim());
              currentChunk = '';
            }
            // If a single sentence is still too long, split it by words
            if (sentence.length > maxChunkSize) {
              const words = sentence.split(/\s+/);
              let tempChunk = '';
              for (const word of words) {
                if ((tempChunk + word).length > maxChunkSize) {
                  chunks.push(tempChunk.trim());
                  tempChunk = word;
                } else {
                  tempChunk += (tempChunk ? ' ' : '') + word;
                }
              }
              if (tempChunk) {
                currentChunk = tempChunk;
              }
            } else {
              currentChunk = sentence;
            }
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
      } else {
        currentChunk = paragraph;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Helper function for exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && retries < maxRetries) {
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        retries++;
        continue;
      }
      throw error;
    }
  }
}

// Helper function to perform basic text analysis without using OpenAI
function performBasicAnalysis(text) {
  const lines = text.split('\n');
  const analysis = {
    projectOverview: '',
    keyRequirements: [],
    timeline: '',
    budgetInformation: '',
    evaluationCriteria: [],
    requiredItems: []
  };

  // Extract project overview from the first few paragraphs
  const overviewLines = lines.slice(0, 10).join(' ');
  analysis.projectOverview = overviewLines;

  // Look for common patterns to identify required items
  const patterns = [
    {
      regex: /(?:completed|included|submit|provide|attach)\s+([^?.]+)(?:\s*\([^)]+\))?/gi,
      type: 'form'
    },
    {
      regex: /(?:form|document|checklist)\s+(?:on|at|from)?\s*(?:page|pages)?\s*([A-Za-z0-9.-]+)/gi,
      type: 'form'
    },
    {
      regex: /(?:must|shall|should|need to)\s+(?:complete|submit|provide|include)\s+([^?.]+)/gi,
      type: 'information'
    },
    {
      regex: /(?:page|pages)\s+([A-Za-z0-9.-]+)(?:\s+to\s+[A-Za-z0-9.-]+)?/gi,
      type: 'form'
    }
  ];

  // Look for required items
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      const item = match[1].trim();
      if (item && !analysis.requiredItems.some(i => i.item === item)) {
        analysis.requiredItems.push({
          item: item,
          page: 'Not specified',
          requirements: 'Found in document requirements',
          type: pattern.type,
          isRequired: true,
          format: 'As specified in the RFP document'
        });
      }
    }
  }

  // Look for timeline information
  const timelineKeywords = ['deadline', 'due date', 'timeline', 'schedule', 'duration'];
  lines.forEach(line => {
    if (timelineKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      analysis.timeline += line.trim() + ' ';
    }
  });

  // Look for budget information
  const budgetKeywords = ['budget', 'cost', 'price', 'funding', '$', 'dollar'];
  lines.forEach(line => {
    if (budgetKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      analysis.budgetInformation += line.trim() + ' ';
    }
  });

  // Look for evaluation criteria
  const criteriaKeywords = ['evaluation', 'criteria', 'scoring', 'assessment'];
  lines.forEach(line => {
    if (criteriaKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      analysis.evaluationCriteria.push(line.trim());
    }
  });

  // If no required items were found, try to extract them from key requirements
  if (analysis.requiredItems.length === 0) {
    const requirementKeywords = ['required', 'must', 'shall', 'should', 'need'];
    lines.forEach(line => {
      if (requirementKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        analysis.requiredItems.push({
          item: line.trim(),
          page: 'Not specified',
          requirements: 'Found in document requirements',
          type: 'information',
          isRequired: true,
          format: 'As specified in the RFP document'
        });
      }
    });
  }

  return analysis;
}

async function analyzeRFP(pdfText) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      // First attempt with OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert RFP analyst. Your task is to analyze RFP documents and extract ALL requirements that must be included in the bid proposal. Focus on identifying forms, documents, and information that the bidder must provide to complete their proposal submission."
          },
          {
            role: "user",
            content: `Please analyze this RFP document and extract ALL requirements that must be included in the bid proposal. Look specifically for:\n1. Required forms that must be completed (e.g., "Bid Proposal forms", "SBE Utilization form", "List of Major Subcontractors form")\n2. Required documents that must be attached (e.g., "Bid Bond", "Cashier's Check", "Letter of Intent")\n3. Information that must be provided (e.g., company details, project experience, pricing information)\n4. Page numbers or references for each required item\n5. Specific requirements for each item (e.g., "rated A- or better for the prior four quarters")\n\nHere's the text to analyze:\n\n${pdfText}\n\nPlease provide a structured analysis with the following sections:\n1. Project Overview\n2. Key Requirements\n3. Timeline\n4. Budget Information\n5. Evaluation Criteria\n6. Required Items (list each required item with this structure):\n{\n  "item": "Name of the required item/form/document/information",\n  "page": "Page number or reference (e.g., 'Pages P-1 to P-2', 'Page S.B.-1')",\n  "requirements": "Specific requirements or conditions (e.g., 'rated A- or better', 'must be completed')",\n  "type": "form/document/information",\n  "isRequired": true,\n  "format": "How the item should be formatted or provided"\n}\n\nFormat the response as a JSON object with these sections as keys. For the Required Items section, provide an array of objects with the structure shown above. Make sure to include ALL required items mentioned in the document, even if they are part of a checklist or list of requirements.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      let analysis;
      try {
        analysis = JSON.parse(response.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        analysis = {
          projectOverview: '',
          keyRequirements: [],
          timeline: '',
          budgetInformation: '',
          evaluationCriteria: [],
          requiredItems: []
        };
      }

      // If no required items were found in the AI response, try to extract them using basic text analysis
      if (!analysis.requiredItems || analysis.requiredItems.length === 0) {
        console.log('No required items found in initial analysis, trying basic text analysis');
        const requiredItems = [];
        
        // Look for common patterns in the text
        const patterns = [
          {
            regex: /(?:completed|included|submit|provide|attach)\s+([^?.]+)(?:\s*\([^)]+\))?/gi,
            type: 'form'
          },
          {
            regex: /(?:form|document|checklist)\s+(?:on|at|from)?\s*(?:page|pages)?\s*([A-Za-z0-9.-]+)/gi,
            type: 'form'
          },
          {
            regex: /(?:must|shall|should|need to)\s+(?:complete|submit|provide|include)\s+([^?.]+)/gi,
            type: 'information'
          },
          {
            regex: /(?:page|pages)\s+([A-Za-z0-9.-]+)(?:\s+to\s+[A-Za-z0-9.-]+)?/gi,
            type: 'form'
          }
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.regex.exec(pdfText)) !== null) {
            const item = match[1].trim();
            if (item && !requiredItems.some(i => i.item === item)) {
              requiredItems.push({
                item: item,
                page: 'Not specified',
                requirements: 'Found in document requirements',
                type: pattern.type,
                isRequired: true,
                format: 'As specified in the RFP document'
              });
            }
          }
        }

        if (requiredItems.length > 0) {
          analysis.requiredItems = requiredItems;
        } else {
          // If still no items found, try one more approach with a different prompt
          const retryResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: "You are an expert RFP analyst. Extract ALL required forms, documents, and information that must be included in the bid proposal."
              },
              {
                role: "user",
                content: `Extract ALL required items from this RFP document that must be included in the bid proposal. Look for any forms, documents, or information that must be provided. Include page numbers and specific requirements.\n\nDocument text:\n${pdfText}\n\nReturn ONLY a JSON array of required items in this format:\n[{"item": "name", "page": "page reference", "requirements": "specific requirements", "type": "form/document/information", "isRequired": true, "format": "how to provide this item"}]`
              }
            ],
            temperature: 0.3,
            max_tokens: 1000
          });

          try {
            const retryItems = JSON.parse(retryResponse.choices[0].message.content);
            if (Array.isArray(retryItems) && retryItems.length > 0) {
              analysis.requiredItems = retryItems;
            }
          } catch (retryError) {
            console.error('Error parsing retry response:', retryError);
          }
        }
      }

      // Ensure required items are properly formatted
      if (Array.isArray(analysis.requiredItems)) {
        analysis.requiredItems = analysis.requiredItems.map(item => {
          if (typeof item === 'string') {
            return {
              item: item,
              page: 'Not specified',
              requirements: 'No specific requirements mentioned',
              type: 'information',
              isRequired: true,
              format: 'As specified in the RFP document'
            };
          }
          return {
            item: item.item || 'Item not specified',
            page: item.page || 'Not specified',
            requirements: item.requirements || 'No specific requirements mentioned',
            type: item.type || 'information',
            isRequired: item.isRequired !== false,
            format: item.format || 'As specified in the RFP document'
          };
        });
      } else {
        analysis.requiredItems = [];
      }

      return analysis;
    } catch (error) {
      if (error.message.includes('429')) {
        console.log('OpenAI quota exceeded, falling back to basic analysis');
        const basicAnalysis = performBasicAnalysis(pdfText);
        basicAnalysis.note = "Note: This is a basic analysis due to OpenAI API quota limitations. For a more detailed analysis, please try again later or contact support.";
        return basicAnalysis;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error analyzing RFP:', error);
    throw new Error(error.message || 'Failed to analyze RFP document');
  }
}

async function generateClarificationQuestions(rfpAnalysis) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    console.log('Starting question generation from analysis');

    // Convert required items into questions
    const questions = [];

    // Add questions for required items
    if (Array.isArray(rfpAnalysis.requiredItems)) {
      rfpAnalysis.requiredItems.forEach(item => {
        let question;
        let section;

        // Clean up the item name
        const cleanItem = item.item.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');

        switch (item.type) {
          case 'form':
            question = `Please complete and provide the ${cleanItem}`;
            section = 'Required Forms';
            break;
          case 'document':
            question = `Please provide the ${cleanItem}`;
            section = 'Required Documents';
            break;
          case 'information':
            question = `Please provide the following information: ${cleanItem}`;
            section = 'Required Information';
            break;
          default:
            question = `Please provide the ${cleanItem}`;
            section = 'Required Items';
        }

        // Add page reference if available
        if (item.page && item.page !== 'Not specified') {
          question += ` (${item.page})`;
        }

        // Add requirements if available
        if (item.requirements && item.requirements !== 'No specific requirements mentioned' && item.requirements !== 'Found in document requirements') {
          question += `. Requirements: ${item.requirements}`;
        }

        // Add format information if available
        if (item.format && item.format !== 'As specified in the RFP document') {
          question += `. Format: ${item.format}`;
        }

        questions.push({
          question: question,
          section: section,
          importance: item.requirements || 'Required for proposal submission',
          format: item.format || 'As specified in the RFP document'
        });
      });
    }

    if (questions.length === 0) {
      return [{
        question: "No specific requirements were found in the RFP document. Would you like to add your own requirements?",
        section: "General",
        importance: "To ensure all requirements are clear",
        format: "Please specify how you would like to provide this information"
      }];
    }

    // Sort questions by section
    questions.sort((a, b) => {
      const sectionOrder = {
        'Required Forms': 1,
        'Required Documents': 2,
        'Required Information': 3,
        'Required Items': 4,
        'General': 5
      };
      return (sectionOrder[a.section] || 99) - (sectionOrder[b.section] || 99);
    });

    return questions;
  } catch (error) {
    console.error('Error in generateClarificationQuestions:', error);
    return [{
      question: "An error occurred while processing the document. Would you like to add your own requirements?",
      section: "General",
      importance: "To ensure all requirements are clear",
      format: "Please specify how you would like to provide this information"
    }];
  }
}

async function generateResponseOutline(rfpAnalysis, answers) {
  try {
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert proposal writer. Your task is to create detailed response outlines for RFPs."
        },
        {
          role: "user",
          content: `Based on this RFP analysis and the provided answers to clarification questions, generate a detailed response outline:\n\nRFP Analysis:\n${JSON.stringify(rfpAnalysis, null, 2)}\n\nClarification Answers:\n${JSON.stringify(answers, null, 2)}\n\nPlease provide a structured response outline in JSON format with the following sections:\n1. Executive Summary\n2. Technical Approach\n3. Project Management\n4. Team Qualifications\n5. Past Performance\n6. Pricing Strategy\n7. Risk Management\n8. Compliance Matrix\n\nFor each section, include:\n- Key points to address\n- Required information\n- Suggested content structure`
        }
      ],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error generating response outline:', error);
    throw new Error(error.message || 'Failed to generate response outline');
  }
}

module.exports = {
  analyzeRFP,
  generateClarificationQuestions,
  generateResponseOutline
}; 