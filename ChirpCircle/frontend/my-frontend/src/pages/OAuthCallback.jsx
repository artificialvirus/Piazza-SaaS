// File: ChirpCircle/frontend/my-frontend/src/pages/OAuthCallback.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function OAuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the query params from location.search
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store them (example: localStorage)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect to feed or somewhere
      navigate('/feed');
    } else {
      // If no tokens found, redirect to error or login
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div>
      <p>Processing OAuth Callback...</p>
    </div>
  );
}

export default OAuthCallback;

