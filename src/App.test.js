import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';

// Wrap the component with necessary providers
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  test('renders landing page at root path', () => {
    renderWithRouter(<LandingPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent).toBe('Bids in Minutes');
  });

  test('renders login page when navigating to /login', () => {
    window.history.pushState({}, '', '/login');
    renderWithRouter(<App />);
    expect(screen.getByText(/Welcome to BidIQ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
