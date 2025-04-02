import React, { useState } from 'react';
import { uploadSolicitation, processSolicitationLink } from '../services/solicitationService';
import { analyzeDocument, generateBidScore, generateRiskAssessment } from '../services/nlpService';
import { useAuth } from '../contexts/AuthContext';

export default function SolicitationUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/msword' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload a PDF or Word document');
        setFile(null);
      }
    }
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
    setError('');
  };

  const handleUpload = async () => {
    if (!user) {
      setError('Please sign in to upload solicitations or RFPs');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setAnalysisResults(null);

      let text;
      if (file) {
        const uploadResult = await uploadSolicitation(file, user.uid);
        text = uploadResult.text;
      } else if (link) {
        const linkResult = await processSolicitationLink(link, user.uid);
        text = linkResult.text;
      } else {
        throw new Error('Please provide a file or link');
      }

      // Perform NLP analysis
      const analysis = await analyzeDocument(text);
      
      // Generate bid score and risk assessment
      const bidScore = generateBidScore(analysis);
      const risks = generateRiskAssessment(analysis);

      // Combine all results
      const results = {
        ...analysis,
        bidScore,
        risks,
        source: file ? 'upload' : 'link',
        timestamp: new Date().toISOString()
      };

      setAnalysisResults(results);
      setSuccess('Solicitation processed successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResults) return null;

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
        
        {/* Bid Score */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-blue-600 mb-2">
            Bid Score: {analysisResults.bidScore.score}/100
          </h3>
          <p className="text-gray-600 text-sm">
            Based on alignment, feasibility, competition, and profitability
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Timeline</h3>
          <p className="text-gray-700">
            Start: {analysisResults.requirements.timeline.start || 'Not specified'}<br />
            End: {analysisResults.requirements.timeline.end || 'Not specified'}
          </p>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Budget</h3>
          <p className="text-gray-700">
            Estimated: {analysisResults.requirements.budget.text || 'Not specified'}
          </p>
        </div>

        {/* Key Requirements */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Key Requirements</h3>
          <p className="text-gray-700">
            {analysisResults.requirements.keyPhrases.join(', ')}
          </p>
        </div>

        {/* Risk Assessment */}
        <div>
          <h3 className="text-lg font-medium mb-2">Risk Assessment</h3>
          {analysisResults.risks.map((risk, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg mb-2 ${
                risk.severity === 'high' ? 'bg-red-50 text-red-700' :
                risk.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                'bg-green-50 text-green-700'
              }`}
            >
              {risk.description}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        Upload Solicitation or RFP
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors duration-200"
        onClick={() => document.getElementById('solicitation-file').click()}
      >
        <input
          type="file"
          id="solicitation-file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
        />
        <svg
          className="w-12 h-12 text-blue-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2">
          {file ? file.name : 'Drop a file here or click to upload'}
        </h3>
        <p className="text-gray-500 text-sm">
          Supported formats: PDF, DOC, DOCX
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 mt-6">
        <div className="text-lg font-medium text-gray-500">
          Or
        </div>

        <input
          type="text"
          placeholder="Paste solicitation link"
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={link}
          onChange={handleLinkChange}
        />

        <button
          className={`w-full max-w-md px-4 py-2 rounded-lg text-white font-medium ${
            loading || (!file && !link)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          } transition-colors duration-200 flex items-center justify-center gap-2`}
          onClick={handleUpload}
          disabled={loading || (!file && !link)}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Process Solicitation'
          )}
        </button>
      </div>

      {renderAnalysisResults()}
    </div>
  );
} 