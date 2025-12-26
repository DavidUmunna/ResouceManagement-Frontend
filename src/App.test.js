import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders the login page when not authenticated', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const loadingElement = screen.getByText(/Loading.../i); // Check for the loading state
  expect(loadingElement).toBeInTheDocument();
});
