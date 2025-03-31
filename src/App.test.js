import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock localStorage
beforeAll(() => {
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
});

// Mock IndexedDB operations
jest.mock('./services/db', () => ({
  getUserProfile: jest.fn().mockResolvedValue(null),
  saveUserProfile: jest.fn().mockResolvedValue(true),
}));

// Mock useNavigate and other router functions
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

// Wrap the component with necessary providers
const renderWithProviders = (initialEntries = ['/', '/login']) => {
  return act(async () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );
  });
};

describe('App Component', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders landing page when not authenticated', async () => {
    await renderWithProviders(['/']);
    await waitFor(() => {
      expect(screen.getByText(/Equipment Rental Bids in Minutes with AI/i)).toBeInTheDocument();
    });
  });

  test('renders login form elements', async () => {
    await renderWithProviders(['/login']);
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });
  });

  test('displays error message for invalid login', async () => {
    await renderWithProviders(['/login']);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    await act(async () => {
      await userEvent.type(emailInput, 'invalid@email.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
    });
  });

  test('navigates to registration page when clicking sign up link', async () => {
    await renderWithProviders(['/login']);
    
    await waitFor(() => {
      expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    });

    const signUpLink = screen.getByText(/Sign up/i);
    await act(async () => {
      await userEvent.click(signUpLink);
    });

    await waitFor(() => {
      expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    });
  });
});
