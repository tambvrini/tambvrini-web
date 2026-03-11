import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const axios = require('axios');

const TriggerGoogleLogin = () => {
  const { startGoogleLogin } = useAuth();
  return (
    <button type="button" data-testid="start-google-login" onClick={() => startGoogleLogin('/account')}>
      Start Google Login
    </button>
  );
};

describe('AuthContext startGoogleLogin', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    axios.get.mockRejectedValue(new Error('No active session'));
  });

  it('starts OAuth through backend login endpoint with /account callback path', async () => {
    delete window.location;
    window.location = { ...originalLocation, assign: jest.fn() };
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <AuthProvider>
          <TriggerGoogleLogin />
        </AuthProvider>
      );
    });

    const button = container.querySelector('[data-testid="start-google-login"]');

    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(window.location.assign).toHaveBeenCalledWith(
      '/api/login/google?next=/account'
    );

    act(() => {
      root.unmount();
    });
    container.remove();
    window.location = originalLocation;
  });
});
