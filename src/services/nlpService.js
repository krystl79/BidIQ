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
  try {
    const processNLP = httpsCallable(functions, 'processNLP');
    const result = await processNLP({ text });
    return result.data;
  } catch (error) {
    console.error('Error in NLP analysis:', error);
    throw error;
  }
};

export const generateBidScore = (analysisData) => {
  const {
    alignment,     // 0-100 score based on company capabilities match
    feasibility,   // 0-100 score based on timeline and resources
    competition,   // 0-100 score based on competitive analysis
    profitability  // 0-100 score based on estimated costs vs. budget
  } = analysisData;

  // Calculate weighted score
  const totalScore = (
    alignment * SCORING_WEIGHTS.alignment +
    feasibility * SCORING_WEIGHTS.feasibility +
    competition * SCORING_WEIGHTS.competition +
    profitability * SCORING_WEIGHTS.profitability
  );

  return {
    score: Math.round(totalScore),
    details: {
      alignment: {
        score: alignment,
        weight: SCORING_WEIGHTS.alignment
      },
      feasibility: {
        score: feasibility,
        weight: SCORING_WEIGHTS.feasibility
      },
      competition: {
        score: competition,
        weight: SCORING_WEIGHTS.competition
      },
      profitability: {
        score: profitability,
        weight: SCORING_WEIGHTS.profitability
      }
    }
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

export const generateRiskAssessment = (analysisData) => {
  const risks = [];

  // Timeline risks
  if (analysisData.timeline && analysisData.timeline < 30) {
    risks.push({
      type: 'timeline',
      severity: 'high',
      description: 'Extremely tight timeline may impact quality and resource allocation'
    });
  }

  // Budget risks
  if (analysisData.estimatedCosts > analysisData.budget) {
    risks.push({
      type: 'budget',
      severity: 'high',
      description: 'Estimated costs exceed the provided budget'
    });
  }

  // Resource risks
  if (analysisData.resourceAvailability < 70) {
    risks.push({
      type: 'resources',
      severity: 'medium',
      description: 'Limited resource availability may affect project execution'
    });
  }

  // Competition risks
  if (analysisData.competitorCount > 5) {
    risks.push({
      type: 'competition',
      severity: 'medium',
      description: 'High competition in the bidding process'
    });
  }

  return risks;
}; 