import { useState } from 'react';
import './AdminLogin.css'; // We'll create this next
import api from '../api.js';

function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Log in to the backend
      const res = await api.post('/auth/login', { email, password });
      
      // 2. Check if the user is an Admin
      if (res.data.user.isAdmin) {
        // 3. Pass the token up to App.jsx
        onLogin(res.data.token);
      } else {
        setError('Access Denied: This account is not an admin.');
      }

    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('An unknown error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Admin Dashboard</h1>
        <p>Please log in to continue</p>
        
        {error && <p className="form-error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="auth-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;