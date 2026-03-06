import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import AccountPage from './AccountPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockLoginWithGoogle = jest.fn();
const mockNavigate = jest.fn();
let mockPathname = '/cuenta';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    loginWithGoogle: mockLoginWithGoogle,
    loading: false,
  }),
}));

jest.mock(
  'react-router-dom',
  () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname, search: '', hash: '' }),
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
    mockLoginWithGoogle.mockReset();
    mockNavigate.mockReset();
    mockPathname = '/cuenta';
  });

  it('triggers Google login and navigates to account', async () => {
    mockLoginWithGoogle.mockResolvedValue({});
    mockPathname = '/login';
    const { container, root } = await renderAccountPage();

    const googleButton = container.querySelector('[data-testid="google-login-btn"]');

    await act(async () => {
      googleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockLoginWithGoogle).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/cuenta');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
