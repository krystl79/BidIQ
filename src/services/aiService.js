const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export async function analyzeRFP(pdfText) {
  try {
    console.log('Sending analyze-rfp request with text length:', pdfText.length);
    const response = await fetch(`${API_BASE_URL}/api/analyze-rfp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ pdfText })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Analyze RFP error response:', errorData);
      
      if (response.status === 503) {
        throw new Error('AI service is currently unavailable. Please check your environment configuration.');
      }
      
      throw new Error(`Failed to analyze RFP: ${response.status} ${errorData.details || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing RFP:', error);
    throw error;
  }
}

export async function generateClarificationQuestions(rfpAnalysis) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ rfpAnalysis })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 503) {
        throw new Error('AI service is currently unavailable. Please check your environment configuration.');
      }
      
      throw new Error(`Failed to generate questions: ${response.status} ${errorData.details || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating clarification questions:', error);
    throw error;
  }
}

export async function generateResponseOutline(rfpAnalysis, answers) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ rfpAnalysis, answers })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 503) {
        throw new Error('AI service is currently unavailable. Please check your environment configuration.');
      }
      
      throw new Error(`Failed to generate outline: ${response.status} ${errorData.details || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating response outline:', error);
    throw error;
  }
} 