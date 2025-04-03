import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { extractProposalInfo } from '../services/pdfService';

const SolicitationUploadScreen = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const result = await extractProposalInfo(file, currentUser.uid);
      setAnalysisResult(result);
      setSuccess('Solicitation processed successfully!');
      
      // Navigate to the proposal view after a short delay
      setTimeout(() => {
        navigate(`/rfp-responses/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing PDF:', error);
      setError('Error processing PDF. Please try again or contact support if the issue persists.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Solicitation or RFP</h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <span>{isUploading ? 'Uploading...' : 'Upload a file'}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                      accept=".pdf"
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF files only</p>
              </div>
            </div>
          </div>

          {analysisResult && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Extracted Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.dueDate || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Due Time</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.dueTime || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Solicitation Number</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.solicitationNumber || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Project Number</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.projectNumber || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Project Name</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.projectName || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Project Description</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.projectDescription || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Project Schedule</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.projectSchedule || 'Not found'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">SOQ Requirements</h4>
                    <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                      <li>Length Limit: {analysisResult.soqRequirements.lengthLimit || 'Not specified'}</li>
                      <li>Font Size: {analysisResult.soqRequirements.fontSize || 'Not specified'}</li>
                      <li>Font Type: {analysisResult.soqRequirements.fontType || 'Not specified'}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Content Requirements</h4>
                    <p className="mt-1 text-sm text-gray-900">{analysisResult.contentRequirements || 'Not found'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SolicitationUploadScreen; 