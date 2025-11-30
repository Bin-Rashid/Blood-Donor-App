import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DonorProvider } from './context/DonorContext';
import App from './App';

test('renders LifeShare app without crashing', () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <DonorProvider>
          <App />
        </DonorProvider>
      </AuthProvider>
    </BrowserRouter>
  );
  // Check for loading spinner initially
  const loadingElement = screen.getByText(/Loading LifeShare/i);
  expect(loadingElement).toBeInTheDocument();
});
