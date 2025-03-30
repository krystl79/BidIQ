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
  test('renders login page when not authenticated', () => {
    renderWithRouter(<App />);
    expect(screen.getByText(/Welcome to BidIQ/i)).toBeInTheDocument();
  });

  test('renders login form elements', () => {
    renderWithRouter(<App />);
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });
});
