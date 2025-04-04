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

  const handleViewBid = useCallback(() => {
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
          },
          isTemporary: createdProjectId === 'temp-id'
        }
      });
    }
  }, [createdProjectId, projectData, navigate]);

  const handleCreateProject = useCallback(async () => {
    try {
      if (currentUser) {
        // Create project in Firestore only if user is signed in
        const projectRef = await addDoc(collection(db, 'projects'), {
          ...projectData,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          status: 'active'
        });

        // Create bid in Firestore
        await addDoc(collection(db, 'bids'), {
          projectId: projectRef.id,
          userId: currentUser.uid,
          status: 'draft',
          createdAt: serverTimestamp(),
          projectDetails: projectData
        });

        // Update createdProjectId with actual project ID
        setCreatedProjectId(projectRef.id);
      } else {
        // For non-signed in users, just set a temporary ID
        setCreatedProjectId('temp-id');
      }

      // Add success message
      addBotMessage('Great! I\'ve prepared your bid.');
      
      // Navigate to bid view after a short delay
      setTimeout(() => {
        handleViewBid();
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      addBotMessage(`I'm sorry, there was an error preparing your bid: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }, [projectData, currentUser, handleViewBid]);

  const handleUserInput = useCallback(async (input) => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput(''); // Clear the input field

    try {
      switch (currentStep) {
        case 0:
          setProjectData(prev => ({ ...prev, projectName: input }));
          setCurrentStep(1);
          addBotMessage(steps[1].question);
          break;
        case 1:
          setProjectData(prev => ({ ...prev, startDate: input }));
          setCurrentStep(2);
          addBotMessage(steps[2].question);
          break;
        case 2:
          setProjectData(prev => ({ ...prev, endDate: input }));
          setCurrentStep(3);
          addBotMessage(steps[3].question);
          break;
        case 3:
          setProjectData(prev => ({ ...prev, location: input }));
          setCurrentStep(4);
          addBotMessage(steps[4].question);
          break;
        case 4:
          setProjectData(prev => ({ ...prev, projectType: input }));
          setCurrentStep(5);
          addBotMessage(steps[5].question);
          break;
        case 5:
          setProjectData(prev => ({ ...prev, homeType: input }));
          setCurrentStep(6);
          addBotMessage(steps[6].question);
          break;
        case 6:
          setProjectData(prev => ({ ...prev, climbingLadder: input }));
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
                type={steps[currentStep]?.type === 'date' ? 'date' : 'text'}
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