import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage.jsx';
import AuthPage from './components/AuthPage.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import PublicFeed from './components/PublicFeed.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import RewardStore from './components/RewardStore.jsx';
import MasterIssueDetail from './components/MasterIssueDetail.jsx';
import api from './api.js';

// Protected dashboard component
function AuthenticatedApp({ user, setUser, allIssues, setAllIssues, handleLogout }) {
  const [view, setView] = useState('dashboard');
  const [selectedMasterId, setSelectedMasterId] = useState(null);

  const handleUpvote = async (issueId) => {
    if (!user) return;
    try {
      const res = await api.put(`/issues/${issueId}/upvote`);
      const updatedIssue = res.data;
      setAllIssues(prevIssues =>
        prevIssues.map(issue =>
          issue._id === issueId ? updatedIssue : issue
        )
      );
    } catch (err) {
      console.error("Upvote failed:", err);
    }
  };

  const handleIssueSubmit = (responseData) => {
    const { newIssue, updatedUser } = responseData;
    setAllIssues(prev => [newIssue, ...prev]);
    setUser(updatedUser);
  };

  const handleRateIssue = (updatedIssue) => {
    setAllIssues(prevIssues =>
      prevIssues.map(issue =>
        issue._id === updatedIssue._id ? updatedIssue : issue
      )
    );
  };

  const handleRedeem = (updatedUser) => {
    setUser(updatedUser);
  };

  const myIssues = allIssues.filter(
    (issue) => issue.submittedBy?._id === user.id
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        onLogout={handleLogout} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 mb-16 md:mb-0">
        <Header user={user} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
        {view === 'dashboard' && (
          <Dashboard
            user={user}
            myIssues={myIssues}
            onIssueSubmit={handleIssueSubmit}
            onRateIssue={handleRateIssue}
            onViewMasterIssue={(masterId) => {
              setSelectedMasterId(masterId);
              setView('masterIssueDetail');
            }}
          />
        )}
        {view === 'masterIssueDetail' && (
          <MasterIssueDetail 
            issue={allIssues.find(i => i._id === selectedMasterId)} 
            onBack={() => {
              setSelectedMasterId(null);
              setView('dashboard');
            }}
          />
        )}
        {view === 'feed' && (
          <PublicFeed
            user={user}
            allIssues={allIssues}
            onUpvote={handleUpvote}
          />
        )}
          {view === 'leaderboard' && <Leaderboard user={user} />}
          {view === 'rewards' && <RewardStore user={user} onRedeem={handleRedeem} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// Inner app component that has access to router context
function AppRoutes() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [allIssues, setAllIssues] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    const loadUserAndIssues = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          const userData = { id: payload.id, email: payload.email, isAdmin: payload.isAdmin, points: payload.points };

          const loginRes = await api.post('/auth/login', {
            email: userData.email,
            isToken: true
          });

          if (!loginRes.data.user) throw new Error("Token invalid.");
          setUser(loginRes.data.user);
          localStorage.setItem('token', loginRes.data.token);
          setToken(loginRes.data.token);

          const issuesRes = await api.get('/issues/all');
          setAllIssues(issuesRes.data);

        } catch (e) {
          console.error("Invalid token, logging out.", e);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoadingAuth(false);
    };
    loadUserAndIssues();
  }, []);

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    navigate('/app');
  };

  if (isLoadingAuth) {
    return <div className="loading-screen">Loading...</div>;
  }

  const isAuthenticated = token && user;

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/app" replace />
            : <AuthPage onLogin={handleLogin} initialView="login" />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/app" replace />
            : <AuthPage onLogin={handleLogin} initialView="register" />
        }
      />
      <Route
        path="/app"
        element={
          isAuthenticated
            ? <AuthenticatedApp
                user={user}
                setUser={setUser}
                allIssues={allIssues}
                setAllIssues={setAllIssues}
                handleLogout={handleLogout}
              />
            : <Navigate to="/login" replace />
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Root App wraps everything in BrowserRouter
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;