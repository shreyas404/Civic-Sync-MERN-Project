import { useState } from 'react';
import './AuthPage.css';
import api from '../api.js';

function AuthPage({ onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter all fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);

    const authData = { email, password };
    const url = isLoginView ? '/auth/login' : '/auth/register';

    try {
      if (isLoginView) {
        const res = await api.post(url, authData);
        onLogin(res.data.token, res.data.user); 
      } else {
        const res = await api.post(url, authData);
        setMessage('Registration successful! Please log in.');
        setIsLoginView(true);
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
        <h1>{isLoginView ? 'Login' : 'Register'}</h1>
        <p>Welcome to Civic-Sync</p>
        
        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            {isLoading 
              ? 'Loading...' 
              : (isLoginView ? 'Login' : 'Create Account')
            }
          </button>
        </form>

        <p className="auth-toggle">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLoginView(!isLoginView)} disabled={isLoading}>
            {isLoginView ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;