import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveProject, saveBid } from '../services/db';

// Move steps array outside the component to prevent recreation on each render
const steps = [
  {
    question: "What's your name?",
    type: 'text',
    key: 'name'
  },
  {
    question: "What type of project are you working on?",
    type: 'choice',
    options: ['Install outdoor holiday lights'],
    key: 'projectType'
  },
  {
    question: "Is your home a single story or 2-story?",
    type: 'choice',
    options: ['Single Story', '2-Story'],
    key: 'homeType'
  },
  {
    question: "What's your email address?",
    type: 'email',
    key: 'email'
  },
  {
    question: "What's your phone number?",
    type: 'tel',
    key: 'phone'
  },
  {
    question: "What's your address?",
    type: 'text',
    key: 'address'
  },
  {
    question: "When do you need this project completed by?",
    type: 'date',
    key: 'dueDate'
  },
  {
    question: "What's your budget for this project?",
    type: 'number',
    key: 'budget'
  },
  {
    question: "Any additional details about your project?",
    type: 'textarea',
    key: 'description'
  }
];

const ChatBot = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [projectData, setProjectData] = useState({
    projectName: '',
    startDate: '',
    endDate: '',
    location: {
      city: '',
      state: '',
      zipCode: ''
    },
    projectType: '',
    homeType: '',
    climbingLadder: null,
    equipmentNeeded: []
  });
  const [createdProjectId, setCreatedProjectId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { type: 'bot', content: text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', content: text }]);
  };

  const handleLocationInput = (input) => {
    const [city, state, zipCode] = input.split(',').map(item => item.trim());
    setProjectData(prev => ({
      ...prev,
      location: {
        city: city || '',
        state: state || '',
        zipCode: zipCode || ''
      }
    }));
  };

  const handleProjectCreation = async () => {
    try {
      if (!currentUser) {
        throw new Error('User must be signed in to create a project');
      }

      // Create project in IndexedDB
      const project = {
        id: Date.now().toString(),
        userId: currentUser.uid,
        projectName: projectData.projectName,
        projectType: projectData.projectType,
        location: projectData.location,
        timeline: {
          startDate: projectData.startDate,
          endDate: projectData.endDate
        },
        homeType: projectData.homeType,
        climbingLadder: projectData.climbingLadder,
        equipmentNeeded: projectData.equipmentNeeded,
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      const savedProject = await saveProject(project);
      setCreatedProjectId(savedProject.id);

      // Create bid in IndexedDB
      const bid = {
        id: Date.now().toString(),
        projectId: savedProject.id,
        userId: currentUser.uid,
        status: 'draft',
        createdAt: new Date().toISOString(),
        projectDetails: savedProject
      };

      await saveBid(bid);

      addBotMessage("Great! I've created your project and bid. You can now view it or manage it in your dashboard.");
      setMessages(prev => [...prev, {
        type: 'action',
        content: (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => navigate(`/bids/${bid.id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              View Bid
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Create an Account or Login
            </button>
          </div>
        )
      }]);
    } catch (error) {
      console.error('Error creating project:', error);
      addBotMessage("I'm sorry, there was an error creating your project. Please try again later.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    addUserMessage(userInput);
    const currentQuestion = steps[currentStep];

    switch (currentQuestion.type) {
      case 'text':
        setProjectData(prev => ({ ...prev, projectName: userInput }));
        break;
      case 'date':
        if (currentStep === 1) {
          setProjectData(prev => ({ ...prev, startDate: userInput }));
        } else {
          setProjectData(prev => ({ ...prev, endDate: userInput }));
        }
        break;
      case 'location':
        handleLocationInput(userInput);
        break;
      case 'choice':
        if (currentStep === 4) {
          setProjectData(prev => ({ ...prev, projectType: userInput }));
        } else if (currentStep === 5) {
          setProjectData(prev => ({ ...prev, homeType: userInput }));
        } else if (currentStep === 6) {
          setProjectData(prev => ({ ...prev, climbingLadder: userInput === 'Yes' }));
          handleProjectCreation();
        }
        break;
      default:
        break;
    }

    setUserInput('');
    setCurrentStep(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex flex-col h-[600px]">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Project Assistant</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {currentStep < steps.length && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900">
                  {steps[currentStep].question}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 