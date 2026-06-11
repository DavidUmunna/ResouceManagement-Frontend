import React from 'react';
import { render } from '@testing-library/react';

// Stub out all page components so we don't render the whole app tree
jest.mock('./ProtectedLayout',                    () => () => <div>Protected Area</div>);
jest.mock('./pages/landinpage/Resourcelanding',   () => () => <div>Landing Page</div>);
jest.mock('./pages/landinpage/Aboutus/main',      () => () => <div>About</div>);
jest.mock('./pages/landinpage/layout/Layout',     () => ({ children }) => <div>{children}</div>);
jest.mock('./pages/admin_login',                  () => () => <div>Login Page</div>);
jest.mock('./pages/forgotpassword',               () => () => <div>Forgot Password</div>);
jest.mock('./pages/ResetPassword',                () => () => <div>Reset Password</div>);
jest.mock('./pages/landinpage/CompanyData',       () => () => <div>Company Data</div>);
jest.mock('./pages/landinpage/Subscription',      () => () => <div>Subscription</div>);
jest.mock('./pages/PrivateRoute',                 () => ({ children }) => <>{children}</>);
jest.mock('./components/logout',                  () => () => <div>Logout</div>);
jest.mock('./components/env',                     () => ({ isProd: false }));
jest.mock('@sentry/react', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

import App from './App';

test('renders the app without crashing', () => {
  const { container } = render(<App />);
  expect(container.firstChild).toBeTruthy();
});
