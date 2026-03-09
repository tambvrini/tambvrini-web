import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './LoginPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockStartGoogleLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
    startGoogleLogin: mockStartGoogleLogin,
  }),
}));

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => mockNavigate,
  }),
  { virtual: true }
);

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderLoginPage = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <LoginPage />
    );
  });

  return { container, root };
};

describe('LoginPage Google login', () => {
  beforeEach(() => {
    mockStartGoogleLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('calls startGoogleLogin with /account when the Google button is clicked', async () => {
    const { container, root } = await renderLoginPage();

    const googleButton = container.querySelector('[data-testid="google-login-btn"]');

    await act(async () => {
      googleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockStartGoogleLogin).toHaveBeenCalledWith('/account');
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
