import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Avatar,
  Divider,
  AppBar,
  Toolbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Chip,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  ContentCopy as ContentCopyIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Build as BuildIcon,
  LocalOffer as LocalOfferIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import apiService from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'project_form' | 'equipment_list' | 'bid_preview' | 'lead_confirmation';
  data?: any;
}

interface ProjectInfo {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  projectType: string;
  requirements: string[];
  equipmentSuggestions: string[];
  size?: string;
  notes?: string;
  leadConsent?: boolean;
}

const ProjectChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    projectType: '',
    requirements: [],
    equipmentSuggestions: [],
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if we're editing an existing quote
    const quoteId = new URLSearchParams(location.search).get('quoteId');
    if (quoteId) {
      loadExistingQuote(quoteId);
    }
  }, [location]);

  const loadExistingQuote = async (quoteId: string) => {
    try {
      const quote = await apiService.getQuote(quoteId);
      setProjectInfo({
        name: quote.projectName,
        description: quote.description,
        startDate: quote.startDate,
        endDate: quote.endDate,
        location: quote.location,
        projectType: quote.projectType,
        requirements: quote.requirements,
        equipmentSuggestions: quote.equipmentSuggestions,
        size: quote.size,
        notes: quote.notes,
        leadConsent: quote.leadConsent,
      });
      // Add initial messages to show existing project info
      setMessages([
        {
          id: '1',
          text: `Editing existing project: ${quote.projectName}`,
          sender: 'ai',
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error loading quote:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load quote',
        severity: 'error',
      });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const quote = {
        id: Date.now().toString(), // Generate a temporary ID
        projectName: projectInfo.name,
        description: projectInfo.description,
        startDate: projectInfo.startDate,
        endDate: projectInfo.endDate,
        location: projectInfo.location,
        projectType: projectInfo.projectType,
        requirements: projectInfo.requirements,
        equipmentSuggestions: projectInfo.equipmentSuggestions,
        size: projectInfo.size,
        notes: projectInfo.notes,
        leadConsent: projectInfo.leadConsent,
        totalCost: 0, // This will be calculated later
        createdAt: new Date().toISOString(),
        status: 'draft' as const
      };
      await apiService.saveQuote(quote);
      setSnackbar({
        open: true,
        message: 'Project saved successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to save project',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handleDuplicate = async () => {
    try {
      setIsLoading(true);
      const newQuote = {
        id: Date.now().toString(), // Generate a temporary ID
        projectName: `${projectInfo.name} (Copy)`,
        description: projectInfo.description,
        startDate: projectInfo.startDate,
        endDate: projectInfo.endDate,
        location: projectInfo.location,
        projectType: projectInfo.projectType,
        requirements: projectInfo.requirements,
        equipmentSuggestions: projectInfo.equipmentSuggestions,
        size: projectInfo.size,
        notes: projectInfo.notes,
        leadConsent: projectInfo.leadConsent,
        totalCost: 0, // This will be calculated later
        createdAt: new Date().toISOString(),
        status: 'draft' as const
      };
      await apiService.saveQuote(newQuote);
      setSnackbar({
        open: true,
        message: 'Project duplicated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to duplicate project',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handlePrint = async () => {
    try {
      setIsLoading(true);
      const quote = {
        id: Date.now().toString(), // Generate a temporary ID
        projectName: projectInfo.name,
        description: projectInfo.description,
        startDate: projectInfo.startDate,
        endDate: projectInfo.endDate,
        location: projectInfo.location,
        projectType: projectInfo.projectType,
        requirements: projectInfo.requirements,
        equipmentSuggestions: projectInfo.equipmentSuggestions,
        size: projectInfo.size,
        notes: projectInfo.notes,
        leadConsent: projectInfo.leadConsent,
        totalCost: 0, // This will be calculated later
        createdAt: new Date().toISOString(),
        status: 'draft' as const
      };
      const pdfBlob = await apiService.generatePdf(quote);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectInfo.name}_quote.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to generate PDF',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const handleShare = async () => {
    try {
      setIsLoading(true);
      const quoteId = Date.now().toString(); // Generate a temporary ID
      await apiService.shareQuote(quoteId, '', '');
      setSnackbar({
        open: true,
        message: 'Project shared successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to share project',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
      handleMenuClose();
    }
  };

  const processUserInput = async (input: string): Promise<string> => {
    const lowerInput = input.toLowerCase();
    
    // Step 1: Project Input Form
    if (!projectInfo.name) {
      if (lowerInput.includes('project name') || lowerInput.includes('called') || lowerInput.includes('named')) {
        const name = input.split(/is|called|named/)[1]?.trim() || input;
        setProjectInfo(prev => ({ ...prev, name }));
        return `Great! I've noted that your project is called "${name}". What type of project is this? (e.g., commercial build, site prep, road work)`;
      }
      return 'Let\'s start by giving your project a name. What would you like to call it?';
    }

    if (!projectInfo.projectType) {
      const projectTypes = {
        'commercial build': 'Commercial Construction',
        'site prep': 'Site Preparation',
        'road work': 'Road Construction',
        'renovation': 'Building Renovation',
        'demolition': 'Demolition',
        'maintenance': 'Maintenance',
        'landscaping': 'Landscaping',
        'event': 'Event Setup'
      };

      const detectedType = Object.entries(projectTypes).find(([key]) => 
        lowerInput.includes(key)
      );

      if (detectedType) {
        setProjectInfo(prev => ({ ...prev, projectType: detectedType[1] }));
        return `I've set this as a ${detectedType[1]} project. What's the approximate size or scope of the project?`;
      }

      return 'What type of project is this? Here are some common options:\n' +
             Object.entries(projectTypes)
               .map(([key, value]) => `- ${value}`)
               .join('\n');
    }

    if (!projectInfo.size) {
      setProjectInfo(prev => ({ ...prev, size: input }));
      return 'Where is this project located? (City, State)';
    }

    if (!projectInfo.location) {
      setProjectInfo(prev => ({ ...prev, location: input }));
      return "What's the expected duration of the project? (e.g., \"2 weeks\", \"3 months\")";
    }

    // Step 2: Timeline Detection
    if (!projectInfo.startDate || !projectInfo.endDate) {
      if (lowerInput.includes('start') || lowerInput.includes('begin') || lowerInput.includes('timeline')) {
        setProjectInfo(prev => ({ ...prev, startDate: input }));
        return 'And when do you expect the project to be completed?';
      }
      
      if (lowerInput.includes('end') || lowerInput.includes('complete') || lowerInput.includes('finish')) {
        setProjectInfo(prev => ({ ...prev, endDate: input }));
        
        // Once we have all basic info, show equipment suggestions
        const suggestions = generateEquipmentSuggestions(projectInfo.projectType, []);
        setProjectInfo(prev => ({ ...prev, equipmentSuggestions: suggestions }));
        
        return `Based on your ${projectInfo.projectType} project, I recommend the following equipment:\n\n` +
               suggestions.map((item: string) => `- ${item}`).join('\n') +
               '\n\nWould you like to see rental costs for these items?';
      }
    }

    // Step 3: Equipment List & Costs
    if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('rental')) {
      const equipmentCosts = projectInfo.equipmentSuggestions.map(equipment => {
        const basePrice = Math.floor(Math.random() * 500) + 100; // Mock price generation
        return {
          name: equipment,
          daily: basePrice,
          weekly: basePrice * 6,
          monthly: basePrice * 25
        };
      });

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Here are the estimated rental costs:',
        sender: 'ai',
        timestamp: new Date(),
        type: 'equipment_list',
        data: equipmentCosts
      }]);

      return 'Would you like to see a preview of your bid?';
    }

    // Step 4: Bid Preview
    if (lowerInput.includes('preview') || lowerInput.includes('bid') || lowerInput.includes('quote')) {
      const bidPreview = {
        projectName: projectInfo.name,
        projectType: projectInfo.projectType,
        size: projectInfo.size,
        location: projectInfo.location,
        duration: `${projectInfo.startDate} to ${projectInfo.endDate}`,
        equipment: projectInfo.equipmentSuggestions,
        totalCost: projectInfo.equipmentSuggestions.length * 300 // Mock total cost
      };

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Here\'s a preview of your bid:',
        sender: 'ai',
        timestamp: new Date(),
        type: 'bid_preview',
        data: bidPreview
      }]);

      return 'Would you like to save this bid? You can also share it with rental companies for better pricing.';
    }

    // Step 5: Lead Confirmation
    if (lowerInput.includes('share') || lowerInput.includes('rental companies')) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Would you like to share your project details with rental companies? This can help you get better pricing offers.',
        sender: 'ai',
        timestamp: new Date(),
        type: 'lead_confirmation',
        data: {
          projectInfo,
          leadConsent: false
        }
      }]);

      return 'Please confirm if you\'d like to share your project details with rental companies for better pricing offers.';
    }

    // Handle vague or unclear responses
    if (lowerInput.includes('not sure') || lowerInput.includes('don\'t know') || lowerInput.includes('unsure')) {
      return 'No problem! I can help guide you. Let me ask some specific questions:\n\n' +
             '1. What kind of work needs to be done? (e.g., building, repairing, maintaining)\n' +
             '2. What is the size or scale of the project?\n' +
             '3. Are there any specific challenges or requirements?\n\n' +
             'Feel free to describe it in your own words, and I\'ll help identify the right equipment.';
    }

    // Handle confirmation
    if (lowerInput.includes('yes') || lowerInput.includes('okay') || lowerInput.includes('sure')) {
      if (isProjectInfoComplete()) {
        return 'Perfect! I have all the information I need. Let me prepare your equipment recommendations.';
      }
    }

    return 'I\'m not sure I understood that. Could you please rephrase or provide more specific information?';
  };

  const generateEquipmentSuggestions = (projectType: string, requirements: string[]): string[] => {
    const suggestions: string[] = [];
    
    // Common equipment by project type
    const equipmentByType: Record<string, string[]> = {
      'Construction': [
        'Excavator',
        'Bulldozer',
        'Crane',
        'Concrete Mixer',
        'Scaffolding',
        'Power Tools',
        'Safety Equipment'
      ],
      'Renovation': [
        'Demolition Tools',
        'Power Tools',
        'Scaffolding',
        'Ladders',
        'Safety Equipment',
        'Dumpster',
        'Air Compressor'
      ],
      'Maintenance': [
        'Power Tools',
        'Safety Equipment',
        'Pressure Washer',
        'Generator',
        'Air Compressor',
        'Ladders',
        'Cleaning Equipment'
      ],
      'Repair': [
        'Power Tools',
        'Safety Equipment',
        'Generator',
        'Air Compressor',
        'Welding Equipment',
        'Scaffolding',
        'Ladders'
      ],
      'Demolition': [
        'Excavator',
        'Bulldozer',
        'Demolition Tools',
        'Safety Equipment',
        'Dumpster',
        'Air Compressor',
        'Generator'
      ]
    };

    // Add equipment based on project type
    if (projectType && equipmentByType[projectType]) {
      suggestions.push(...equipmentByType[projectType]);
    }

    // Add equipment based on specific requirements
    requirements.forEach(req => {
      const lowerReq = req.toLowerCase();
      if (lowerReq.includes('dig') || lowerReq.includes('excavate')) {
        suggestions.push('Excavator', 'Bulldozer');
      }
      if (lowerReq.includes('lift') || lowerReq.includes('hoist')) {
        suggestions.push('Crane', 'Forklift');
      }
      if (lowerReq.includes('concrete') || lowerReq.includes('cement')) {
        suggestions.push('Concrete Mixer', 'Concrete Pump');
      }
      if (lowerReq.includes('demolish') || lowerReq.includes('break')) {
        suggestions.push('Demolition Tools', 'Jackhammer');
      }
      if (lowerReq.includes('clean') || lowerReq.includes('wash')) {
        suggestions.push('Pressure Washer', 'Cleaning Equipment');
      }
    });

    // Remove duplicates and return
    return Array.from(new Set(suggestions));
  };

  const isProjectInfoComplete = (): boolean => {
    return !!(
      projectInfo.name &&
      projectInfo.description &&
      projectInfo.startDate &&
      projectInfo.endDate &&
      projectInfo.location &&
      projectInfo.projectType
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await processUserInput(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing input:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process your input',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project Chat
          </Typography>
          <IconButton color="inherit" onClick={handleMenuClick}>
            <BuildIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flexGrow: 1, py: 4, overflow: 'auto' }}>
        <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    maxWidth: '80%',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                      mr: message.sender === 'user' ? 0 : 1,
                      ml: message.sender === 'user' ? 1 : 0,
                    }}
                  >
                    {message.sender === 'user' ? 'U' : 'AI'}
                  </Avatar>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: message.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body1">{message.text}</Typography>
                    {message.type === 'equipment_list' && message.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommended Equipment:
                        </Typography>
                        <Grid container spacing={1}>
                          {message.data.map((item: any, index: number) => (
                            <Grid item key={index}>
                              <Card variant="outlined" sx={{ mb: 1 }}>
                                <CardContent>
                                  <Typography variant="subtitle1">{item.name}</Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Daily: ${item.daily} | Weekly: ${item.weekly} | Monthly: ${item.monthly}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    {message.type === 'bid_preview' && message.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          Bid Preview
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Project Details</Typography>
                            <Typography variant="body2">Name: {message.data.projectName}</Typography>
                            <Typography variant="body2">Type: {message.data.projectType}</Typography>
                            <Typography variant="body2">Size: {message.data.size}</Typography>
                            <Typography variant="body2">Location: {message.data.location}</Typography>
                            <Typography variant="body2">Duration: {message.data.duration}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="subtitle1">Equipment List</Typography>
                            {message.data.equipment.map((item: string, index: number) => (
                              <Typography key={index} variant="body2">• {item}</Typography>
                            ))}
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="h6" color="primary">
                              Total Estimated Cost: ${message.data.totalCost}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    )}
                    {message.type === 'lead_confirmation' && message.data && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Share with Rental Companies
                        </Typography>
                        <Typography variant="body2" paragraph>
                          By sharing your project details, rental companies can provide you with competitive pricing offers.
                          Your information will be anonymized and only shared with companies in your area.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            setProjectInfo(prev => ({ ...prev, leadConsent: true }));
                            setSnackbar({
                              open: true,
                              message: 'Project details will be shared with rental companies',
                              severity: 'success',
                            });
                          }}
                        >
                          Share Project Details
                        </Button>
                      </Box>
                    )}
                  </Paper>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <IconButton type="submit" color="primary" disabled={isLoading}>
                {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSave}>
          <SaveIcon sx={{ mr: 1 }} /> Save Project
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ContentCopyIcon sx={{ mr: 1 }} /> Duplicate Project
        </MenuItem>
        <MenuItem onClick={handlePrint}>
          <PrintIcon sx={{ mr: 1 }} /> Print Quote
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <ShareIcon sx={{ mr: 1 }} /> Share Quote
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectChat; 