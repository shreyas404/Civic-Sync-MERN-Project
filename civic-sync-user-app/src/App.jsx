import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import AuthPage from './components/AuthPage.jsx';
import Nav from './components/Nav.jsx';
import Dashboard from './components/Dashboard.jsx';
import PublicFeed from './components/PublicFeed.jsx';
import Leaderboard from './components/Leaderboard.jsx';
import RewardStore from './components/RewardStore.jsx';
import api from './api.js';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null); 
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [view, setView] = useState('dashboard');
  const [allIssues, setAllIssues] = useState([]);

  // This effect loads user info and all issues on startup
  useEffect(() => {
    const loadUserAndIssues = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const payload = JSON.parse(atob(savedToken.split('.')[1]));
          const userData = { id: payload.id, email: payload.email, isAdmin: payload.isAdmin, points: payload.points };
          
          // Re-fetch user to get latest points
          const loginRes = await api.post('/auth/login', { 
            email: userData.email, 
            isToken: true 
          });
          
          if (!loginRes.data.user) throw new Error("Token invalid.");
          setUser(loginRes.data.user);
          localStorage.setItem('token', loginRes.data.token);
          setToken(loginRes.data.token);

          // Fetch all issues
          const issuesRes = await api.get('/issues/all');
          setAllIssues(issuesRes.data);

        } catch (e) {
          console.error("Invalid token", e);
          handleLogout();
        }
      }
      setIsLoadingAuth(false);
    };
    loadUserAndIssues();
  }, []); // <-- Run only on first load

  // --- ALL LOGIC IS IN APP.JSX ---

  // Called by PublicFeed
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

  // Called by Dashboard -> AddIssueForm
  const handleIssueSubmit = (responseData) => {
    const { newIssue, updatedUser } = responseData;
    setAllIssues([newIssue, ...allIssues]);
    setUser(updatedUser);
  };
  
  // Called by Dashboard -> UserIssueList -> MyIssueItem
  const handleRateIssue = (updatedIssue) => {
    setAllIssues(prevIssues => 
      prevIssues.map(issue => 
        issue._id === updatedIssue._id ? updatedIssue : issue
      )
    );
  };

  // Called by RewardStore
  const handleRedeem = (updatedUser) => {
    setUser(updatedUser);
  };

  // Called by AuthPage
  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken); // This will trigger the useEffect
    setUser(userData);
    setView('dashboard');
  };

  // Called by Header
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (isLoadingAuth) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!token || !user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // Filter "My Issues" from the allIssues state
  const myIssues = allIssues.filter(
    (issue) => issue.submittedBy?._id === user.id
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <>
      <Header onLogout={handleLogout} user={user} />
      <Nav currentView={view} onViewChange={setView} />

      <div className="main-content">
        {view === 'dashboard' && (
          <Dashboard 
            user={user} 
            myIssues={myIssues}
            onIssueSubmit={handleIssueSubmit} 
            onRateIssue={handleRateIssue}
          />
        )}
        {view === 'feed' && (
          <PublicFeed 
            user={user} 
            allIssues={allIssues}
            onUpvote={handleUpvote}
          />
        )}
        {view === 'leaderboard' && <Leaderboard />}
        {view === 'rewards' && <RewardStore user={user} onRedeem={handleRedeem} />}
      </div>
    </>
  )
}

export default App