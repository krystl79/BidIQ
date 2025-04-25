import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveProject, saveBid } from '../services/db';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';

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

const equipmentCosts = {
  'Basic Tools': {
    daily: 50,
    weekly: 300,
    monthly: 1000
  },
  'Storage Bins': {
    daily: 30,
    weekly: 180,
    monthly: 600
  },
  'Safety Harness': {
    daily: 40,
    weekly: 240,
    monthly: 800
  },
  'Safety Rope': {
    daily: 35,
    weekly: 210,
    monthly: 700
  },
  'Boom Lift': {
    daily: 200,
    weekly: 1200,
    monthly: 4000
  },
  'Extension Ladder': {
    daily: 45,
    weekly: 270,
    monthly: 900
  },
  'Step Ladder': {
    daily: 25,
    weekly: 150,
    monthly: 500
  },
  'LED Christmas Lights': {
    daily: 100,
    weekly: 600,
    monthly: 2000
  },
  'Extension Cords': {
    daily: 20,
    weekly: 120,
    monthly: 400
  },
  'Zip Ties': {
    daily: 15,
    weekly: 90,
    monthly: 300
  },
  'Light Clips': {
    daily: 25,
    weekly: 150,
    monthly: 500
  },
  'Timer': {
    daily: 30,
    weekly: 180,
    monthly: 600
  },
  'Work Gloves': {
    daily: 10,
    weekly: 60,
    monthly: 200
  },
  'Safety Glasses': {
    daily: 15,
    weekly: 90,
    monthly: 300
  }
};

const ChatBot = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
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
  const [bidData, setBidData] = useState(null);
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

  const handleCreateProject = useCallback(async () => {
    try {
      // Determine equipment needed based on project details
      const equipmentNeeded = [];
      
      // Add basic equipment for all projects
      equipmentNeeded.push('Basic Tools');
      equipmentNeeded.push('Storage Bins');
      
      // Add safety equipment based on home type and ladder comfort
      if (projectData.homeType === '2-Story' || projectData.climbingLadder === 'No') {
        equipmentNeeded.push('Safety Harness');
        equipmentNeeded.push('Safety Rope');
      }
      
      // Add ladders based on home type and ladder comfort
      if (projectData.homeType === '2-Story') {
        if (projectData.climbingLadder === 'No') {
          equipmentNeeded.push('Boom Lift');
        } else {
          equipmentNeeded.push('Extension Ladder');
        }
      } else {
        equipmentNeeded.push('Step Ladder');
      }
      
      // Add project-specific equipment
      if (projectData.projectType === 'Install Holiday Decorations') {
        equipmentNeeded.push('LED Christmas Lights');
        equipmentNeeded.push('Extension Cords');
        equipmentNeeded.push('Zip Ties');
        equipmentNeeded.push('Light Clips');
        equipmentNeeded.push('Timer');
      }
      
      // Add safety gear
      equipmentNeeded.push('Work Gloves');
      equipmentNeeded.push('Safety Glasses');
      
      // Update project data with equipment
      setProjectData(prev => ({ ...prev, equipmentNeeded }));
      
      // Create project
      const project = {
        id: Date.now().toString(),
        projectName: projectData.projectName,
        projectType: projectData.projectType,
        location: {
          city: projectData.location.split(',')[0].trim(),
          state: projectData.location.split(',')[1].trim(),
          zipCode: projectData.location.split(',')[2].trim()
        },
        timeline: {
          startDate: projectData.startDate,
          endDate: projectData.endDate
        },
        homeType: projectData.homeType,
        climbingLadder: projectData.climbingLadder,
        equipmentNeeded: equipmentNeeded,
        userId: 'anonymous',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      const projectId = await saveProject(project);
      
      // Calculate project duration and determine rate type
      const startDate = new Date(projectData.startDate);
      const endDate = new Date(projectData.endDate);
      const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const rateType = duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily';
      
      // Calculate total cost
      const totalCost = equipmentNeeded.reduce((total, equipment) => {
        return total + equipmentCosts[equipment][rateType];
      }, 0);
      
      // Update UI to show project details and recommendations
      addBotMessage("Great! I've created your project and recommended equipment based on your needs.");
      addBotMessage("Project Details:");
      addBotMessage(`- Project Name: ${projectData.projectName}`);
      addBotMessage(`- Project Type: ${projectData.projectType}`);
      addBotMessage(`- Location: ${projectData.location}`);
      addBotMessage(`- Duration: ${duration} days`);
      addBotMessage(`- Home Type: ${projectData.homeType}`);
      addBotMessage(`- Ladder Comfort: ${projectData.climbingLadder}`);
      
      addBotMessage("\nRecommended Equipment:");
      equipmentNeeded.forEach(equipment => {
        const rate = equipmentCosts[equipment][rateType];
        addBotMessage(`- ${equipment}: $${rate} ${rateType}`);
      });

      addBotMessage(`\nTotal Cost: $${totalCost}`);
      
      // Add action button to view project
      setMessages(prev => [...prev, {
        type: 'action',
        content: (
          <div className="flex space-x-2 mt-2">
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              View Project
            </button>
          </div>
        )
      }]);
      
      setCreatedProjectId(projectId);

    } catch (error) {
      console.error('Error creating project:', error);
      addBotMessage(`I'm sorry, there was an error creating your project: ${error.message}. Please try again or contact support if the issue persists.`);
    }
  }, [projectData, currentUser, navigate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toISOString().split('T')[0];
      handleUserInput(formattedDate);
    }
  };

  const handleUserInput = useCallback(async (input) => {
    // For text inputs, validate that input exists and is a string
    if (typeof input !== 'string' || !input.trim()) {
      return;
    }

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setUserInput(''); // Clear the input after sending
    setSelectedDate(null); // Clear the selected date

    try {
      switch (currentStep) {
        case 0:
          setProjectData(prev => ({ ...prev, projectName: input }));
          setCurrentStep(1);
          addBotMessage(steps[1].question);
          break;
        case 1:
          if (!input) {
            addBotMessage("Please select a start date.");
            return;
          }
          setProjectData(prev => ({ ...prev, startDate: input }));
          setCurrentStep(2);
          addBotMessage(steps[2].question);
          break;
        case 2:
          if (!input) {
            addBotMessage("Please select an end date.");
            return;
          }
          
          // Validate that end date is after start date
          const projectStartDate = new Date(projectData.startDate);
          const projectEndDate = new Date(input);
          if (projectEndDate <= projectStartDate) {
            addBotMessage("End date must be after start date. Please select a valid end date.");
            return;
          }
          
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
          
          // Calculate project duration
          const startDate = new Date(projectData.startDate);
          const endDate = new Date(projectData.endDate);
          const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          // Determine equipment needed based on project details
          const equipmentNeeded = [];
          
          // Add basic equipment for all projects
          equipmentNeeded.push('Basic Tools');
          equipmentNeeded.push('Storage Bins');
          
          // Add safety equipment based on home type and ladder comfort
          if (projectData.homeType === '2-Story' || input === 'No') {
            equipmentNeeded.push('Safety Harness');
            equipmentNeeded.push('Safety Rope');
          }
          
          // Add ladders based on home type and ladder comfort
          if (projectData.homeType === '2-Story') {
            if (input === 'No') {
              equipmentNeeded.push('Boom Lift');
            } else {
              equipmentNeeded.push('Extension Ladder');
            }
          } else {
            equipmentNeeded.push('Step Ladder');
          }
          
          // Add project-specific equipment
          if (projectData.projectType === 'Install Holiday Decorations') {
            equipmentNeeded.push('LED Christmas Lights');
            equipmentNeeded.push('Extension Cords');
            equipmentNeeded.push('Zip Ties');
            equipmentNeeded.push('Light Clips');
            equipmentNeeded.push('Timer');
          }
          
          // Add safety gear
          equipmentNeeded.push('Work Gloves');
          equipmentNeeded.push('Safety Glasses');
          
          // Update project data with equipment
          setProjectData(prev => ({ ...prev, equipmentNeeded }));
          
          // Calculate total cost
          const totalCost = equipmentNeeded.reduce((total, equipment) => {
            const rate = equipmentCosts[equipment][duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily'];
            return total + rate;
          }, 0);

          // Create bid object
          const bid = {
            id: Date.now().toString(),
            projectId: Date.now().toString(),
            userId: 'anonymous',
            selectedEquipment: equipmentNeeded.map(equipment => ({
              id: equipment,
              name: equipment,
              description: `${equipment} for holiday decoration installation`,
              selectedRate: {
                type: duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily',
                rate: equipmentCosts[equipment][duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily']
              }
            })),
            totalCost: totalCost,
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          
          // Store the bid data for display
          setBidData(bid);
          
          // Update UI to show project details and recommendations
          addBotMessage("Great! I've prepared a bid proposal based on your needs.");
          addBotMessage("Project Details:");
          addBotMessage(`- Project Name: ${projectData.projectName}`);
          addBotMessage(`- Project Type: ${projectData.projectType}`);
          addBotMessage(`- Location: ${projectData.location}`);
          addBotMessage(`- Duration: ${duration} days`);
          addBotMessage(`- Home Type: ${projectData.homeType}`);
          addBotMessage(`- Ladder Comfort: ${projectData.climbingLadder}`);
          
          addBotMessage("\nRecommended Equipment:");
          equipmentNeeded.forEach(equipment => {
            const rate = equipmentCosts[equipment][duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily'];
            addBotMessage(`- ${equipment}: $${rate} ${duration >= 30 ? 'monthly' : duration >= 7 ? 'weekly' : 'daily'}`);
          });

          addBotMessage(`\nTotal Cost: $${totalCost}`);
          
          // Add action buttons
          setMessages(prev => [...prev, {
            type: 'action',
            content: (
              <div className="flex flex-col space-y-2 mt-2">
                <button
                  onClick={() => handleViewBid(projectData, bid)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View Bid Proposal
                </button>
                <button
                  onClick={() => navigate('/login?mode=signup')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Create Account to Save Project
                </button>
              </div>
            )
          }]);
          
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
  }, [currentStep, projectData, navigate]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserInput(userInput);
    }
  };

  const handleViewBid = (project, bid) => {
    const bidData = {
      project,
      bid,
      isAnonymous: true
    };
    navigate('/view-bid', { state: { bidData } });
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
                onClick={() => handleUserInput("Install Holiday Decorations")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Install Holiday Decorations
              </button>
            </div>
          )}
          
          {currentStep === 5 && !createdProjectId && (
            <div className="mb-4 space-y-2">
              <button
                onClick={() => handleUserInput("Single Story")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Single Story
              </button>
              <button
                onClick={() => handleUserInput("2-Story")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                2-Story
              </button>
            </div>
          )}
          
          {currentStep === 6 && !createdProjectId && (
            <div className="mb-4 space-y-2">
              <button
                onClick={() => handleUserInput("Yes")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => handleUserInput("No")}
                className="w-full p-2 text-left hover:bg-gray-100 rounded"
              >
                No
              </button>
            </div>
          )}
          
          {!createdProjectId && (
            <div className="flex flex-col gap-2">
              {currentStep === 1 && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Start Date"
                    value={projectData.startDate ? new Date(projectData.startDate) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const formattedDate = newValue.toISOString();
                        setProjectData(prev => ({ ...prev, startDate: formattedDate }));
                        setCurrentStep(prev => prev + 1);
                        addBotMessage(steps[2].question);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !projectData.startDate,
                        helperText: !projectData.startDate ? 'Start date is required' : ''
                      }
                    }}
                  />
                </LocalizationProvider>
              )}
              
              {currentStep === 2 && (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="End Date"
                    value={projectData.endDate ? new Date(projectData.endDate) : null}
                    onChange={(newValue) => {
                      if (newValue) {
                        const formattedDate = newValue.toISOString();
                        const startDate = new Date(projectData.startDate);
                        const endDate = new Date(formattedDate);
                        
                        if (endDate <= startDate) {
                          addBotMessage("End date must be after start date. Please select a valid end date.");
                          return;
                        }
                        
                        setProjectData(prev => ({ ...prev, endDate: formattedDate }));
                        setCurrentStep(prev => prev + 1);
                        addBotMessage(steps[3].question);
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !projectData.endDate,
                        helperText: !projectData.endDate ? 'End date is required' : ''
                      }
                    }}
                  />
                </LocalizationProvider>
              )}

              {(currentStep === 0 || currentStep >= 3) && (
                <div className="flex">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer..."
                  />
                  <button
                    onClick={() => handleUserInput(userInput)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot; 