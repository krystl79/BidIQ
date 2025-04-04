import React, { useState } from 'react';
import { extractProposalInfo } from '../services/pdfService';
import { analyzeDocument, generateBidScore, generateRiskAssessment } from '../services/nlpService';
import { useAuth } from '../contexts/AuthContext';

export default function SolicitationUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Process the document with Docupanda
      const proposalInfo = await extractProposalInfo(file, user.uid);
      
      // Analyze the extracted text
      const analysis = await analyzeDocument(proposalInfo.projectDescription || '');
      const bidScore = await generateBidScore(proposalInfo);
      const riskAssessment = await generateRiskAssessment(proposalInfo);

      setAnalysisResults({
        proposalInfo,
        analysis,
        bidScore,
        riskAssessment
      });
      setSuccess('Document processed successfully!');
    } catch (error) {
      console.error('Error processing document:', error);
      setError('Failed to process document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Solicitation</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Document
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="mt-1 block w-full"
            disabled={loading}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            !file || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : 'Upload and Process'}
        </button>
      </form>

      {success && (
        <div className="mt-4 p-4 bg-green-50 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {analysisResults && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-semibold">Analysis Results</h3>
          
          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="font-medium mb-2">Proposal Information</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(analysisResults.proposalInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="font-medium mb-2">NLP Analysis</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(analysisResults.analysis, null, 2)}
            </pre>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="font-medium mb-2">Bid Score</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(analysisResults.bidScore, null, 2)}
            </pre>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h4 className="font-medium mb-2">Risk Assessment</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(analysisResults.riskAssessment, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
} 