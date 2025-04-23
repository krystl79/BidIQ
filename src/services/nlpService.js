import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

// Scoring weights for bid decision
const SCORING_WEIGHTS = {
  alignment: 0.3,
  feasibility: 0.3,
  competition: 0.2,
  profitability: 0.2
};

export const analyzeDocument = async (text) => {
  // Simple local text analysis
  const wordCount = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Basic keyword extraction (simple implementation)
  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  words.forEach(word => {
    if (word.length > 3) { // Skip short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const keywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  return {
    wordCount,
    sentenceCount,
    keywords,
    averageSentenceLength: wordCount / sentenceCount
  };
};

export const generateBidScore = async (analysis) => {
  // Generate a random score between 0 and 100
  const score = Math.floor(Math.random() * 101);
  
  return {
    score,
    confidence: Math.random() * 0.5 + 0.5, // Random confidence between 0.5 and 1.0
    factors: {
      completeness: Math.random() * 100,
      clarity: Math.random() * 100,
      relevance: Math.random() * 100
    }
  };
};

export const generateRiskAssessment = async (text) => {
  // Generate a random risk assessment
  const riskLevels = ['Low', 'Medium', 'High'];
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  const factors = [
    { name: 'Technical Complexity', score: Math.random() * 100 },
    { name: 'Resource Requirements', score: Math.random() * 100 },
    { name: 'Timeline Feasibility', score: Math.random() * 100 },
    { name: 'Cost Estimation', score: Math.random() * 100 }
  ];

  return {
    overallRisk: riskLevel,
    factors,
    recommendations: [
      'Conduct thorough requirement analysis',
      'Develop detailed project timeline',
      'Create comprehensive cost breakdown',
      'Identify potential technical challenges'
    ]
  };
};

export const extractRequirements = (text) => {
  // Extract key requirements using regex patterns
  const requirements = {
    equipment: [],
    timeline: null,
    location: null,
    budget: null,
    certifications: [],
    specialRequirements: []
  };

  // Equipment patterns
  const equipmentPattern = /required equipment:[\s\S]*?(?=\n\n|\$|timeline:|location:|budget:)/gi;
  const equipmentMatch = text.match(equipmentPattern);
  if (equipmentMatch) {
    requirements.equipment = equipmentMatch[0]
      .replace(/required equipment:/i, '')
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // Timeline pattern
  const timelinePattern = /timeline:.*?(?=\n|$)/i;
  const timelineMatch = text.match(timelinePattern);
  if (timelineMatch) {
    requirements.timeline = timelineMatch[0].replace(/timeline:/i, '').trim();
  }

  // Location pattern
  const locationPattern = /location:.*?(?=\n|$)/i;
  const locationMatch = text.match(locationPattern);
  if (locationMatch) {
    requirements.location = locationMatch[0].replace(/location:/i, '').trim();
  }

  // Budget pattern
  const budgetPattern = /budget:.*?(?=\n|$)/i;
  const budgetMatch = text.match(budgetPattern);
  if (budgetMatch) {
    requirements.budget = budgetMatch[0].replace(/budget:/i, '').trim();
  }

  // Certifications pattern
  const certPattern = /certifications required:[\s\S]*?(?=\n\n|\$|timeline:|location:|budget:)/gi;
  const certMatch = text.match(certPattern);
  if (certMatch) {
    requirements.certifications = certMatch[0]
      .replace(/certifications required:/i, '')
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  // Special requirements pattern
  const specialPattern = /special requirements:[\s\S]*?(?=\n\n|\$|timeline:|location:|budget:)/gi;
  const specialMatch = text.match(specialPattern);
  if (specialMatch) {
    requirements.specialRequirements = specialMatch[0]
      .replace(/special requirements:/i, '')
      .split('\n')
      .map(item => item.trim())
      .filter(item => item.length > 0);
  }

  return requirements;
}; 