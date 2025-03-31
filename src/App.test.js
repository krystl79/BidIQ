import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

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
    renderWithRouter(<App />);
    expect(screen.getByText(/Equipment Rental Bids in Minutes with AI/i)).toBeInTheDocument();
  });

  test('renders login page when navigating to /login', () => {
    window.history.pushState({}, '', '/login');
    renderWithRouter(<App />);
    expect(screen.getByText(/Welcome to BidIQ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
