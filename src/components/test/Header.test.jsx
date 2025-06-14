import React from 'react';
import { render, screen, fireEvent, waitFor} from '@testing-library/react';
import Header from '../Header';
import { BrowserRouter } from 'react-router-dom';

jest.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: null }),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({
      user: { uid: '123', email: 'test@example.com' },
    })
  ),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

const customRender = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Header component', () => {

  it('should display the login form on the desktop', async () => {
    customRender(<Header />);

    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    const emailInput = await screen.findByPlaceholderText(/email/i);
    const passwordInput = await screen.findByPlaceholderText(/password/i);

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });

  it('should simulate login with email and password', async () => {
    customRender(<Header />);
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);
  
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByTestId('submit-login'));
    await waitFor(() =>
      expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument()
    );
  });

  it('should show error if fields are empty', async () => {
    customRender(<Header />);
    const loginBtn = screen.getByTestId('login-btn');
    fireEvent.click(loginBtn);

    fireEvent.click(screen.getByTestId('submit-login'));
    await waitFor(() =>
      expect(screen.getByText(/todos los campos son obligatorios/i)).toBeInTheDocument()
    );
  });

});