import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadSolicitation, processSolicitationLink } from '../services/solicitationService';
import { useAuth } from '../contexts/AuthContext';

const SolicitationUpload = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
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
    if (!currentUser) {
      setError('Please log in to upload a solicitation');
      return;
    }
    
    setIsUploading(true);
    setError('');
    setProgress(0);

    try {
      let result;
      if (uploadType === 'file' && file) {
        result = await uploadSolicitation(file, currentUser.uid);
      } else if (uploadType === 'link' && link) {
        result = await processSolicitationLink(link, currentUser.uid);
      }

      // Navigate to create-project with the processed data
      navigate('/create-project', { 
        state: { 
          message: 'Solicitation processed successfully. Please review and complete the project details.',
          projectData: result.projectData
        }
      });
    } catch (err) {
      setError(err.message || 'Failed to process solicitation. Please try again.');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Solicitation/RFP</h3>
          
          <div className="mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setUploadType('file')}
                className={`px-4 py-2 rounded-md ${
                  uploadType === 'file'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => setUploadType('link')}
                className={`px-4 py-2 rounded-md ${
                  uploadType === 'link'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Provide Link
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {uploadType === 'file' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Document (PDF or Word)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Solicitation/RFP Link
                </label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/solicitation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
              </div>
            )}

            {isUploading && (
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Processing your solicitation...</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || (!file && !link)}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isUploading || (!file && !link)
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isUploading ? 'Processing...' : 'Upload & Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SolicitationUpload; 