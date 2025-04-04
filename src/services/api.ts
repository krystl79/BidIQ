import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category_id: string;
  rental_price: number;
  specifications: Record<string, string>;
  availability: boolean;
  location: string;
  images: string[];
}

export interface EquipmentDetails extends Equipment {
  maintenance_history: {
    last_service: string;
    next_service: string;
    status: string;
  }[];
  rental_history: {
    start_date: string;
    end_date: string;
    customer: string;
    project: string;
  }[];
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Quote {
  id: string;
  projectName: string;
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
  totalCost: number;
  createdAt: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

// Mock data for equipment categories
const mockCategories: EquipmentCategory[] = [
  {
    id: '1',
    name: 'Earthmoving',
    description: 'Heavy equipment for earthmoving operations',
  },
  {
    id: '2',
    name: 'Lifting & Access',
    description: 'Equipment for lifting and accessing elevated areas',
  },
  {
    id: '3',
    name: 'Power & Lighting',
    description: 'Power generation and lighting equipment',
  },
];

// Mock data for equipment
const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Excavator - 50,000 lbs',
    description: 'Heavy-duty excavator suitable for most construction projects',
    category_id: '1',
    rental_price: 500,
    specifications: {
      'Operating Weight': '50,000 lbs',
      'Engine Power': '300 HP',
      'Bucket Capacity': '2.5 cu yd',
    },
    availability: true,
    location: 'Orlando, FL',
    images: ['excavator.jpg'],
  },
  {
    id: '2',
    name: 'Boom Lift - 60ft',
    description: 'Articulating boom lift for high-reach work',
    category_id: '2',
    rental_price: 200,
    specifications: {
      'Platform Height': '60 ft',
      'Platform Capacity': '500 lbs',
      'Power Source': 'Diesel',
    },
    availability: true,
    location: 'Orlando, FL',
    images: ['boom-lift.jpg'],
  },
  {
    id: '3',
    name: 'Generator - 100kW',
    description: 'Diesel generator for primary power supply',
    category_id: '3',
    rental_price: 300,
    specifications: {
      'Power Output': '100 kW',
      'Fuel Type': 'Diesel',
      'Tank Capacity': '100 gal',
    },
    availability: true,
    location: 'Orlando, FL',
    images: ['generator.jpg'],
  },
];

export const apiService = {
  // Authentication
  register: async (data: RegisterData): Promise<void> => {
    try {
      const response = await api.post('/auth/register', data);
      if (response.status !== 201) {
        throw new Error('Registration failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error(error.response.data.error || 'Registration failed. Please check your input.');
        } else if (error.response?.status === 409) {
          throw new Error('An account with this email already exists.');
        } else {
          throw new Error('Server error. Please try again later.');
        }
      }
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid email or password.');
        } else {
          throw new Error('Server error. Please try again later.');
        }
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  // Equipment categories
  getCategories: async (): Promise<EquipmentCategory[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  },

  // Equipment by category
  getEquipmentByCategory: async (categoryId: string): Promise<Equipment[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEquipment.filter(equipment => equipment.category_id === categoryId);
  },

  // Search equipment
  searchEquipment: async (query: string): Promise<Equipment[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const searchTerm = query.toLowerCase();
    return mockEquipment.filter(equipment =>
      equipment.name.toLowerCase().includes(searchTerm) ||
      equipment.description.toLowerCase().includes(searchTerm)
    );
  },

  // Equipment details
  getEquipmentDetails: async (equipmentId: string): Promise<EquipmentDetails> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const equipment = mockEquipment.find(e => e.id === equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return {
      ...equipment,
      maintenance_history: [
        {
          last_service: '2024-02-15',
          next_service: '2024-03-15',
          status: 'Good',
        },
      ],
      rental_history: [
        {
          start_date: '2024-01-01',
          end_date: '2024-01-15',
          customer: 'ABC Construction',
          project: 'Building Foundation',
        },
      ],
    };
  },

  // Check equipment availability
  checkAvailability: async (equipmentId: string, startDate: string, endDate: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // For demo purposes, always return true
  },

  // Get rental rates
  getRentalRates: async (equipmentId: string): Promise<{
    daily: number;
    weekly: number;
    monthly: number;
  }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const equipment = mockEquipment.find(e => e.id === equipmentId);
    if (!equipment) {
      throw new Error('Equipment not found');
    }
    return {
      daily: equipment.rental_price,
      weekly: equipment.rental_price * 7 * 0.9, // 10% discount for weekly
      monthly: equipment.rental_price * 30 * 0.8, // 20% discount for monthly
    };
  },

  // Create rental request
  createRentalRequest: async (data: {
    equipment_id: string;
    start_date: string;
    end_date: string;
    quantity: number;
    project_details: string;
    contact_info: {
      name: string;
      email: string;
      phone: string;
    };
  }): Promise<{ request_id: string; status: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      request_id: `REQ-${Date.now()}`,
      status: 'pending',
    };
  },

  // Quote Management
  getQuotes: async (): Promise<Quote[]> => {
    try {
      const response = await api.get('/quotes');
      return response.data;
    } catch (error) {
      console.error('Error fetching quotes:', error);
      throw new Error('Failed to fetch quotes');
    }
  },

  getQuote: async (quoteId: string): Promise<Quote> => {
    try {
      const response = await api.get(`/quotes/${quoteId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quote:', error);
      throw new Error('Failed to fetch quote');
    }
  },

  saveQuote: async (quote: Quote): Promise<void> => {
    try {
      const response = await api.post('/quotes', quote);
      if (response.status !== 201) {
        throw new Error('Failed to save quote');
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      throw new Error('Failed to save quote');
    }
  },

  generatePdf: async (quote: Quote): Promise<Blob> => {
    try {
      const response = await api.post(`/quotes/${quote.id}/pdf`, quote, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  },

  shareQuote: async (quoteId: string, email: string, message: string): Promise<void> => {
    try {
      const response = await api.post(`/quotes/${quoteId}/share`, { email, message });
      if (response.status !== 200) {
        throw new Error('Failed to share quote');
      }
    } catch (error) {
      console.error('Error sharing quote:', error);
      throw new Error('Failed to share quote');
    }
  },

  // Lead Generation
  submitLead: async (quote: Quote): Promise<void> => {
    await api.post('/api/leads', quote);
  },

  downloadQuote: async (quoteId: string): Promise<Blob> => {
    const response = await api.get(`/api/quotes/${quoteId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteQuote: async (quoteId: string): Promise<void> => {
    await api.delete(`/api/quotes/${quoteId}`);
  },
};

export default apiService; 