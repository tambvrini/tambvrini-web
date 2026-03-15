import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider, useAuth } from './AuthContext';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const TriggerGoogleLogin = () => {
  const { startGoogleLogin } = useAuth();
  return (
    <button type="button" data-testid="start-google-login" onClick={() => startGoogleLogin()}>
      Start Google Login
    </button>
  );
};

describe('AuthContext startGoogleLogin', () => {
  beforeEach(() => {
    window.google = {
      accounts: {
        id: {
          prompt: jest.fn(),
        },
      },
    };
  });

  it('triggers Google Identity Services prompt', async () => {
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

    expect(window.google.accounts.id.prompt).toHaveBeenCalled();

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
