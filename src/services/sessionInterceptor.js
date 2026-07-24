import axios from 'axios';

function clearClientSession() {
  localStorage.removeItem('sessionId');
  localStorage.removeItem('user');
  localStorage.removeItem('auth');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('sessionId');
  delete axios.defaults.headers.common.Authorization;
  delete axios.defaults.headers.common['x-session-id'];
}

/**
 * Installs a global axios interceptor that redirects to /adminlogin on 401.
 * Only fires when the user is currently authenticated (guards against login-page 401s).
 *
 * @param {() => boolean} getIsAuthenticated - live getter for current auth state
 * @param {(v: boolean) => void} setisauthenticated - App-level auth setter
 * @returns cleanup function that ejects the interceptor
 */
export function setupSessionInterceptor(getIsAuthenticated, setisauthenticated) {
  const id = axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const alreadyOnLogin = window.location.pathname === '/adminlogin';

      if (status === 401 && getIsAuthenticated() && !alreadyOnLogin) {
        clearClientSession();
        setisauthenticated(false);
        window.location.replace('/adminlogin');
      }

      return Promise.reject(error);
    }
  );

  return () => axios.interceptors.response.eject(id);
}
