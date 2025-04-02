import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Move steps array outside the component to prevent recreation on each render
const steps = [
  { type: 'text', question: "What is the name of your project?" },
  { type: 'date', question: "What is the start date of your project?" },
  { type: 'date', question: "When do you need your project completed by?" },
  { type: 'location', question: "Where will your project be taking place? (Please enter City, State, Zip Code)" },
  {
    type: 'choice',
    question: "What type of project are you working on?",
    options: ["Install Holiday Decorations"]
  },
  {
    type: 'choice',
    question: "Is your home a single story or 2-story?",
    options: ["Single Story", "2-Story"]
  },
  {
    type: 'choice',
    question: "Are you comfortable climbing a ladder?",
    options: ["Yes", "No"]
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
  const chatEndRef = useRef(null);
  const hasShownInitialMessages = useRef(false);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only show initial messages once
    if (!hasShownInitialMessages.current) {
      addBotMessage("👋 Hi! I'm here to help you get started with your project.");
      addBotMessage(steps[0].question);
      hasShownInitialMessages.current = true;
    }
  }, []); // Empty dependency array since we only want this to run once

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { type: 'bot', text }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { type: 'user', text }]);
  };

  const validateLocation = (input) => {
    const parts = input.split(',').map(part => part.trim());
    return parts.length === 3;
  };

  const handleLocationInput = (input) => {
    const parts = input.split(',').map(part => part.trim());
    if (parts.length !== 3) {
      addBotMessage("Please enter the location in the format: City, State, Zip Code");
      return false;
    }
    
    const [city, state, zipCode] = parts;
    setProjectData(prev => ({
      ...prev,
      location: { city, state, zipCode }
    }));
    return true;
  };

  const handleCreateProject = useCallback(async () => {
    try {
      // Create project in Firestore
      const projectRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId: currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        status: 'active'
      });

      // Create bid in Firestore
      await addDoc(collection(db, 'bids'), {
        projectId: projectRef.id,
        userId: currentUser?.uid || 'anonymous',
        status: 'draft',
        createdAt: serverTimestamp(),
        projectDetails: projectData
      });

      // Update createdProjectId with actual project ID
      setCreatedProjectId(projectRef.id);

      // Add success message
      addBotMessage('Great! I\'ve created your project and bid.');
      
      if (!currentUser) {
        addBotMessage('To save your project and bid, or to download the bid details, please create an account or log in.');
        addBotMessage('Would you like to create an account or log in now? (Yes/No)');
      } else {
        // Navigate to project details after a short delay
        setTimeout(() => {
          navigate(`/projects/${projectRef.id}`);
        }, 2000);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      addBotMessage(`I'm sorry, there was an error creating your project: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }, [projectData, currentUser, navigate]);

  const handleUserInput = useCallback(async (input) => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    try {
      switch (currentStep) {
        case 'project_type':
          if (input.toLowerCase() === 'yes') {
            setProjectData(prev => ({ ...prev, projectType: 'RFP' }));
            setCurrentStep('solicitation_upload');
            setMessages(prev => [...prev, {
              text: "Great! Please upload your solicitation document.",
              sender: 'bot'
            }]);
          } else {
            setProjectData(prev => ({ ...prev, projectType: 'Standard' }));
            setCurrentStep('project_name');
            setMessages(prev => [...prev, {
              text: "What would you like to name this project?",
              sender: 'bot'
            }]);
          }
          break;
        case 'solicitation_upload':
          // Handle file upload
          setCurrentStep('project_name');
          setMessages(prev => [...prev, {
            text: "What would you like to name this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_name':
          setProjectData(prev => ({ ...prev, name: input }));
          setCurrentStep('project_description');
          setMessages(prev => [...prev, {
            text: "Please describe your project in detail.",
            sender: 'bot'
          }]);
          break;
        case 'project_description':
          setProjectData(prev => ({ ...prev, description: input }));
          setCurrentStep('project_location');
          setMessages(prev => [...prev, {
            text: "Where is the project located?",
            sender: 'bot'
          }]);
          break;
        case 'project_location':
          setProjectData(prev => ({ ...prev, location: input }));
          setCurrentStep('project_start_date');
          setMessages(prev => [...prev, {
            text: "When would you like the project to start?",
            sender: 'bot'
          }]);
          break;
        case 'project_start_date':
          setProjectData(prev => ({ ...prev, startDate: input }));
          setCurrentStep('project_end_date');
          setMessages(prev => [...prev, {
            text: "When would you like the project to be completed?",
            sender: 'bot'
          }]);
          break;
        case 'project_end_date':
          setProjectData(prev => ({ ...prev, endDate: input }));
          setCurrentStep('project_budget');
          setMessages(prev => [...prev, {
            text: "What is your budget for this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_budget':
          setProjectData(prev => ({ ...prev, budget: input }));
          setCurrentStep('project_scope');
          setMessages(prev => [...prev, {
            text: "What is the scope of work for this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_scope':
          setProjectData(prev => ({ ...prev, scope: input }));
          setCurrentStep('project_requirements');
          setMessages(prev => [...prev, {
            text: "What are the specific requirements for this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_requirements':
          setProjectData(prev => ({ ...prev, requirements: input }));
          setCurrentStep('project_timeline');
          setMessages(prev => [...prev, {
            text: "What is the timeline for this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_timeline':
          setProjectData(prev => ({ ...prev, timeline: input }));
          setCurrentStep('project_equipment');
          setMessages(prev => [...prev, {
            text: "What equipment will be needed for this project?",
            sender: 'bot'
          }]);
          break;
        case 'project_equipment':
          setProjectData(prev => ({ ...prev, equipment: input }));
          setCurrentStep('project_ladder_comfort');
          setMessages(prev => [...prev, {
            text: "Are you comfortable working on a ladder?",
            sender: 'bot'
          }]);
          break;
        case 'project_ladder_comfort':
          setProjectData(prev => ({ ...prev, ladderComfort: input }));
          setCreatedProjectId('temp-id'); // Set temporary ID to trigger View Bid button
          handleCreateProject();
          break;
        default:
          console.warn('Unknown step:', currentStep);
          break;
      }
    } catch (error) {
      console.error('Error handling user input:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I encountered an error. Please try again.",
        sender: 'bot'
      }]);
    }
  }, [currentStep, handleCreateProject]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserInput(userInput);
    }
  };

  const handleViewBid = () => {
    if (createdProjectId) {
      navigate(`/projects/${createdProjectId}/bid`, {
        state: {
          projectData: {
            projectName: projectData.projectName,
            projectType: projectData.projectType,
            startDate: projectData.startDate,
            endDate: projectData.endDate,
            location: projectData.location,
            homeType: projectData.homeType,
            climbingLadder: projectData.climbingLadder,
            equipmentNeeded: projectData.equipmentNeeded
          }
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Project Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t">
          {currentStep === 4 && !createdProjectId && (
            <div className="mb-4">
              <button
                onClick={() => setUserInput("Install Holiday Decorations")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Install Holiday Decorations
              </button>
            </div>
          )}
          
          {currentStep === 5 && !createdProjectId && (
            <div className="mb-4 space-y-2">
              <button
                onClick={() => setUserInput("Single Story")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Single Story
              </button>
              <button
                onClick={() => setUserInput("2-Story")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                2-Story
              </button>
            </div>
          )}
          
          {currentStep === 6 && !createdProjectId && (
            <div className="mb-4 space-y-2">
              <button
                onClick={() => setUserInput("Yes")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setUserInput("No")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                No
              </button>
            </div>
          )}
          
          {!createdProjectId ? (
            <div className="flex space-x-2">
              <input
                type={steps[currentStep].type === 'date' ? 'date' : 'text'}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => handleUserInput(userInput)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleViewBid}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg font-medium"
              >
                View Bid
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 