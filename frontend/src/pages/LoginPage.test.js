import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import LoginPage from './LoginPage';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
const mockInitialize = jest.fn();
const mockPrompt = jest.fn();

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(),
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
  const originalLocation = window.location;

  beforeEach(() => {
    mockNavigate.mockReset();
    mockInitialize.mockReset();
    mockPrompt.mockReset();
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-google-client-id';
    delete window.location;
    window.location = { ...originalLocation, href: 'http://localhost/' };
    window.google = {
      accounts: {
        id: {
          initialize: mockInitialize,
          prompt: mockPrompt,
        },
      },
    };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('initializes Google Identity Services on mount', async () => {
    const { root, container } = await renderLoginPage();

    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: expect.any(Function),
      })
    );

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('opens GIS prompt when the Google button is clicked', async () => {
    const { container, root } = await renderLoginPage();

    const googleButton = container.querySelector('[data-testid="google-login-btn"]');

    await act(async () => {
      googleButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(mockPrompt).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('stores decoded user and redirects when GIS callback returns credential', async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { root, container } = await renderLoginPage();
    const initializeConfig = mockInitialize.mock.calls[0][0];
    const payload = btoa(JSON.stringify({
      email: 'google-user@tambvrini.com',
      name: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    }));

    await act(async () => {
      initializeConfig.callback({ credential: `header.${payload}.signature` });
    });

    expect(setItemSpy).toHaveBeenCalledWith('user', JSON.stringify({
      email: 'google-user@tambvrini.com',
      name: 'Google User',
      picture: 'https://example.com/avatar.jpg',
    }));
    expect(window.location.href).toContain('/account');

    setItemSpy.mockRestore();
    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
