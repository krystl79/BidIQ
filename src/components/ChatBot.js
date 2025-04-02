import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  const handleUserInput = () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    addUserMessage(input);
    setUserInput('');

    // Handle login prompt response
    if (createdProjectId && !currentUser) {
      if (input.toLowerCase() === 'yes') {
        navigate('/login?mode=signup');
        return;
      } else if (input.toLowerCase() === 'no') {
        addBotMessage('You can continue using the app without an account. Your project and bid will be available for 24 hours.');
        addBotMessage('You can create an account or log in later to save your work permanently.');
        return;
      }
    }

    let isValid = true;
    let errorMessage = '';

    // Validate input based on current step
    switch (currentStep) {
      case 0: // Project Name
        if (input.length < 3) {
          isValid = false;
          errorMessage = 'Project name must be at least 3 characters long';
        }
        break;
      case 1: // Start Date
      case 2: // End Date
        const date = new Date(input);
        if (isNaN(date.getTime())) {
          isValid = false;
          errorMessage = 'Please enter a valid date (YYYY-MM-DD)';
        }
        break;
      case 3: // Location
        if (!validateLocation(input)) {
          isValid = false;
          errorMessage = 'Please enter a valid location (City, State, Zip Code)';
        }
        break;
      case 4: // Project Type
        if (input.toLowerCase() !== 'install holiday decorations') {
          isValid = false;
          errorMessage = 'Please enter "Install Holiday Decorations"';
        }
        break;
      case 5: // Home Type
        if (!['single story', '2-story'].includes(input.toLowerCase())) {
          isValid = false;
          errorMessage = 'Please select either "Single Story" or "2-Story"';
        }
        break;
      case 6: // Ladder Comfort
        if (!['yes', 'no'].includes(input.toLowerCase())) {
          isValid = false;
          errorMessage = 'Please answer "Yes" or "No"';
        }
        break;
      default:
        isValid = false;
        errorMessage = 'Invalid step';
    }

    if (!isValid) {
      addBotMessage(errorMessage);
      return;
    }

    // Update project data based on current step
    switch (currentStep) {
      case 0: // Project Name
        setProjectData(prev => ({ ...prev, projectName: input }));
        addBotMessage(steps[1].question);
        break;

      case 1: // Start Date
        setProjectData(prev => ({ ...prev, startDate: input }));
        addBotMessage(steps[2].question);
        break;

      case 2: // End Date
        setProjectData(prev => ({ ...prev, endDate: input }));
        addBotMessage(steps[3].question);
        break;

      case 3: // Location
        if (handleLocationInput(input)) {
          addBotMessage(steps[4].question);
          addBotMessage("Currently, we only support 'Install Holiday Decorations'");
        } else {
          addBotMessage("Please enter the location in the format: City, State, Zip Code");
        }
        break;

      case 4: // Project Type
        if (input === "Install Holiday Decorations") {
          setProjectData(prev => ({ ...prev, projectType: input }));
          addBotMessage(steps[5].question);
        } else {
          addBotMessage("Currently, we only support 'Install Holiday Decorations'. Please select this option.");
        }
        break;

      case 5: // Home Type
        if (input === "Single Story" || input === "2-Story") {
          setProjectData(prev => ({ ...prev, homeType: input }));
          addBotMessage(steps[6].question);
        } else {
          addBotMessage("Please select either 'Single Story' or '2-Story'");
        }
        break;

      case 6: // Ladder Comfort
        setProjectData(prev => ({ 
          ...prev, 
          climbingLadder: input.toLowerCase() === 'yes',
          equipmentNeeded: input.toLowerCase() === 'yes' ? 
            ["20 ft. ladder", "20 ft. ladder"] : 
            ["25' boom lift", "19' scissor lift"]
        }));
        // Set createdProjectId to trigger View Bid button
        setCreatedProjectId('temp-id');
        // Create project immediately after last question
        handleCreateProject();
        return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
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

  const handleCreateProject = async () => {
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
                onClick={handleUserInput}
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