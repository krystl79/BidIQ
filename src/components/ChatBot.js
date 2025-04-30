import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { saveProject, saveBid } from '../services/db';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import BidTemplate from './BidTemplate';
import html2pdf from 'html2pdf.js';

// Define the chat steps
const steps = [
  {
    message: "Let's start with your project name. What would you like to call it?",
    options: []
  },
  {
    message: "What type of project is this?",
    options: ["Install Holiday Decorations"]
  },
  {
    message: "What's the location of your project?",
    options: []
  },
  {
    message: "When would you like to start the project?",
    type: 'date',
    options: []
  },
  {
    message: "When would you like to end the project?",
    type: 'date',
    options: []
  },
  {
    message: "What type of home is it?",
    options: ["Single Story", "2-Story"]
  },
  {
    message: "Are you comfortable climbing a ladder?",
    options: ["Yes", "No"]
  }
];

// Add equipment costs
const equipmentCosts = {
  'Basic Tools': { daily: 50, weekly: 200, monthly: 600 },
  'Storage Bins': { daily: 30, weekly: 120, monthly: 360 },
  'Safety Harness': { daily: 40, weekly: 160, monthly: 480 },
  'Safety Rope': { daily: 35, weekly: 140, monthly: 420 },
  'Boom Lift': { daily: 300, weekly: 1200, monthly: 3600 },
  'Extension Ladder': { daily: 45, weekly: 180, monthly: 540 },
  'Step Ladder': { daily: 35, weekly: 140, monthly: 420 },
  'LED Christmas Lights': { daily: 75, weekly: 300, monthly: 900 },
  'Extension Cords': { daily: 25, weekly: 100, monthly: 300 },
  'Zip Ties': { daily: 15, weekly: 60, monthly: 180 },
  'Light Clips': { daily: 20, weekly: 80, monthly: 240 },
  'Timer': { daily: 25, weekly: 100, monthly: 300 },
  'Work Gloves': { daily: 15, weekly: 60, monthly: 180 },
  'Safety Glasses': { daily: 20, weekly: 80, monthly: 240 }
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
  const [showViewBid, setShowViewBid] = useState(false);

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
      addBotMessage(steps[0].message);
      hasShownInitialMessages.current = true;
    }
  }, []); // Empty dependency array since we only want this to run once

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content: text,
      timestamp: new Date().toISOString()
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleCreateProject = async () => {
    try {
      // Determine equipment needed based on project details
      const equipmentNeeded = [];
      
      // Basic tools for all projects
      equipmentNeeded.push('Basic Tools');
      equipmentNeeded.push('Storage Bins');
      
      // Safety equipment based on home type and ladder comfort
      if (projectData.homeType === '2-Story' || projectData.climbingLadder === 'No') {
        equipmentNeeded.push('Safety Harness');
        equipmentNeeded.push('Safety Rope');
      }
      
      // Ladder or lift based on home type and comfort level
      if (projectData.homeType === '2-Story') {
        if (projectData.climbingLadder === 'No') {
          equipmentNeeded.push('Boom Lift');
        } else {
          equipmentNeeded.push('Extension Ladder');
        }
      } else {
        equipmentNeeded.push('Step Ladder');
      }
      
      // Project specific equipment
      if (projectData.projectType === 'Install Holiday Decorations') {
        equipmentNeeded.push('LED Christmas Lights');
        equipmentNeeded.push('Extension Cords');
        equipmentNeeded.push('Zip Ties');
        equipmentNeeded.push('Light Clips');
        equipmentNeeded.push('Timer');
      }
      
      // Personal protective equipment
      equipmentNeeded.push('Work Gloves');
      equipmentNeeded.push('Safety Glasses');

      // Update project data with equipment
      const updatedProjectData = {
        ...projectData,
        equipmentNeeded
      };
      setProjectData(updatedProjectData);

    } catch (error) {
      console.error('Error creating project:', error);
      addBotMessage("I'm sorry, there was an error creating your project. Please try again.");
    }
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    const formattedDate = date.toISOString().split('T')[0];
    if (currentStep === 3) { // Start date
      if (projectData.endDate && new Date(formattedDate) >= new Date(projectData.endDate)) {
        addBotMessage("Start date must be before end date. Please select a valid date.");
        return;
      }
      setProjectData(prev => ({ ...prev, startDate: formattedDate }));
      addUserMessage(formattedDate);
      setCurrentStep(prev => prev + 1);
      addBotMessage(steps[4].message);
    } else if (currentStep === 4) { // End date
      if (new Date(formattedDate) <= new Date(projectData.startDate)) {
        addBotMessage("End date must be after start date. Please select a valid date.");
        return;
      }
      setProjectData(prev => ({ ...prev, endDate: formattedDate }));
      addUserMessage(formattedDate);
      setCurrentStep(prev => prev + 1);
      addBotMessage(steps[5].message);
    }
  };

  const handleUserInput = useCallback(async (input) => {
    if (!input) return;

    addUserMessage(input);
    setUserInput('');

    try {
      const updatedData = { ...projectData };
      switch (currentStep) {
        case 0:
          updatedData.projectName = input;
          break;
        case 1:
          updatedData.projectType = input;
          break;
        case 2:
          updatedData.location = input;
          break;
        case 5:
          updatedData.homeType = input;
          break;
        case 6:
          // Store the actual "Yes" or "No" value for ladder comfort
          updatedData.climbingLadder = input;
          // Calculate duration
          const startDate = new Date(projectData.startDate);
          const endDate = new Date(projectData.endDate);
          updatedData.duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
          // This is the last step
          setProjectData(updatedData);
          addBotMessage("Great! I've prepared your bid.");
          await handleCreateProject();
          setShowViewBid(true);
          return;
        default:
          break;
      }
      setProjectData(updatedData);

      // Move to next step
      setCurrentStep(prev => prev + 1);
      addBotMessage(steps[currentStep + 1].message);
    } catch (error) {
      console.error('Error handling user input:', error);
      addBotMessage("I'm sorry, there was an error processing your input. Please try again.");
    }
  }, [projectData, currentStep]);

  const handleViewBid = async () => {
    try {
      // Determine rate type based on duration
      const rateType = projectData.duration >= 30 ? 'monthly' : projectData.duration >= 7 ? 'weekly' : 'daily';

      // Calculate total cost and create equipment array
      const selectedEquipment = projectData.equipmentNeeded?.map(equipment => ({
        id: equipment,
        name: equipment,
        description: `${equipment} for ${projectData.projectType}`,
        selectedRate: {
          type: rateType,
          rate: equipmentCosts[equipment][rateType]
        }
      })) || [];

      // Calculate total cost
      const totalCost = selectedEquipment.reduce((total, equipment) => {
        return total + equipment.selectedRate.rate;
      }, 0);

      const bid = {
        id: Date.now().toString(),
        projectId: Date.now().toString(),
        userId: 'anonymous',
        projectDetails: {
          projectName: projectData.projectName,
          projectType: projectData.projectType,
          location: projectData.location,
          duration: projectData.duration,
          homeType: projectData.homeType,
          climbingLadder: projectData.climbingLadder, // Pass the actual "Yes" or "No" value
          startDate: projectData.startDate,
          endDate: projectData.endDate
        },
        selectedEquipment,
        totalCost,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save bid and get the ID
      const savedBid = await saveBid(bid);
      
      // Navigate using only the ID
      if (savedBid && savedBid.id) {
        navigate(`/view-bid/${savedBid.id}`);
      } else {
        throw new Error('Failed to save bid');
      }
    } catch (error) {
      console.error('Error handling view bid:', error);
      addBotMessage("I'm sorry, there was an error viewing your bid. Please try again.");
    }
  };

  const handleDownloadBid = () => {
    const element = document.getElementById('bid-content');
    const opt = {
      margin: 1,
      filename: `${projectData.projectName}-bid.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
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
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.type === 'user' ? (
                  <div className="font-medium">You: {msg.content}</div>
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t">
          {!showViewBid ? (
            <div className="space-y-4">
              {currentStep === 3 || currentStep === 4 ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={currentStep === 3 ? "Start Date" : "End Date"}
                    minDate={currentStep === 4 && projectData.startDate ? new Date(projectData.startDate) : new Date()}
                    onChange={handleDateSelect}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    className="w-full"
                  />
                </LocalizationProvider>
              ) : (
                <>
                  {steps[currentStep]?.options.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {steps[currentStep].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleUserInput(option)}
                          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUserInput(userInput)}
                      placeholder="Type your answer..."
                      className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleUserInput(userInput)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={handleViewBid}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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