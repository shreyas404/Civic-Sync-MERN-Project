import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPage.css';
import api from '../api.js';

function AuthPage({ onLogin, initialView = 'login' }) {
  const [isLoginView, setIsLoginView] = useState(initialView === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
        await api.post(url, authData);
        setMessage('Registration successful! Please log in.');
        setIsLoginView(true);
        navigate('/login', { replace: true });
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

  const toggleView = () => {
    const switching = !isLoginView;
    setIsLoginView(switching);
    setError(null);
    setMessage(null);
    navigate(switching ? '/login' : '/register', { replace: true });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="auth-back-link">
          &larr; Back to Home
        </Link>
        <h1>{isLoginView ? 'Welcome Back' : 'Create Account'}</h1>
        <p>{isLoginView ? 'Log in to your Civic-Sync account' : 'Join Civic-Sync and start improving your city'}</p>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <form onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="auth-email">Email</label>
            <input
              type="email"
              id="auth-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
            />
          </div>
          <div className="auth-group">
            <label htmlFor="auth-password">Password</label>
            <input
              type="password"
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="auth-button" id="auth-submit-btn" disabled={isLoading}>
            {isLoading
              ? 'Loading...'
              : (isLoginView ? 'Log In' : 'Create Account')
            }
          </button>
        </form>

        <p className="auth-toggle">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={toggleView} disabled={isLoading}>
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;