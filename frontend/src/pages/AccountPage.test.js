import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AccountPage from './AccountPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockStartGoogleLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    startGoogleLogin: mockStartGoogleLogin,
    loading: false,
  }),
}));

jest.mock(
  'react-router-dom',
  () => ({
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

const renderAccountPage = async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(<AccountPage />);
  });

  return { container, root };
};

describe('AccountPage Google login', () => {
  beforeEach(() => {
    mockStartGoogleLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('calls startGoogleLogin when the Google button is clicked', async () => {
    const { container, root } = await renderAccountPage();

    const googleButton = container.querySelector('[data-testid="google-login-btn"]');

    await act(async () => {
      googleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockStartGoogleLogin).toHaveBeenCalledTimes(1);
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
