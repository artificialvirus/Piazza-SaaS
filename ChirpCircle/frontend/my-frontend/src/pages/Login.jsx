// File: ChirpCircle/frontend/my-frontend/src/pages/Login.jsx
import { useState } from 'react';

function LoginPage() {
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/local-test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (data.success) {
        // Save token (e.g., localStorage)
        localStorage.setItem('accessToken', data.data.accessToken);
        // Redirect or show main feed
        window.location.href = '/feed';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Error logging in');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Login</h1>
      <input
        className="border border-gray-300 p-2 mb-4"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2"
        onClick={handleLogin}
      >
        Local Test Login
      </button>

      {/* Or Google OAuth */}
      <div className="mt-4">
        <a
          className="bg-green-500 text-white px-4 py-2 inline-block"
          href="/api/v1/auth/oauth/login"
        >
          Google OAuth Login
        </a>
      </div>
    </div>
  );
}

export default LoginPage;

