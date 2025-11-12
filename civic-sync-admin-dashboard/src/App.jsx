import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import IssueReport from './components/IssueReport.jsx';
import FilterControls from './components/FilterControls.jsx';
import MapDisplay from './components/MapDisplay.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import ResolveModal from './components/ResolveModal.jsx'; // <-- NEW
import api from './api.js';

const issueCategories = [
  "Dead animal(s)", "Dustbins not cleaned", "Garbage dump", 
  "Garbage vehicle not arrived", "Sweeping not done", 
  "No electricity in public toilet(s)", "No water supply in public toilet(s)", 
  "Public toilet(s) blockage", "Public toilet(s) cleaning",
  "Open Manholes or Drains", "Sewerage or Storm water Overflow", 
  "Stagnant Water on the Road", "Improper Disposal of Faecal Waste/ Septage", 
  "Debris Removal/Construction Material", "Burning of Garbage in Open Spaces", 
  "Urination in Public/Open Defecation (OD)", "Other"
];

function App() {
  
  const [issues, setIssues] = useState([]); 
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: State for the modal ---
  const [resolvingIssue, setResolvingIssue] = useState(null); // This will hold the issue to be resolved

  useEffect(() => {
    const fetchAllIssues = async () => {
      if (token) {
        try {
          const res = await api.get('/issues');
          setIssues(res.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching all issues:', err.response.data);
          if (err.response.status === 403) {
            setError("Access Denied: You are not an admin.");
            handleLogout();
          } else if (err.response.status === 401 || err.response.status === 400) {
            handleLogout();
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchAllIssues();
  }, [token]);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsLoading(true);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIssues([]);
  };

  // --- NEW: Handle opening the modal ---
  const handleOpenResolveModal = (issue) => {
    setResolvingIssue(issue);
  };

  // --- NEW: Handle submitting the proof ---
  const handleResolveIssue = async (issueId, formData) => {
    try {
      const res = await api.post(`/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Update the issue in our state
      setIssues(prevIssues => prevIssues.map(issue => 
        issue._id === issueId ? { ...issue, ...res.data } : issue
      ));
      
      console.log('Issue resolved:', res.data);
    } catch(e) {
      console.error("Error resolving issue:", e);
      throw e;
    }
  };

  // --- UPDATED: This function is now just for 'pending' or 'open' ---
  const toggleIssueStatus = async (id, currentStatus) => {
    if (currentStatus === 'resolved') {
      alert("This issue is resolved. You cannot change its status until the user rates it and re-opens it.");
      return;
    }

    let newStatus = currentStatus === 'open' ? 'pending' : 'open';
    
    try {
      await api.put(`/issues/${id}`, { status: newStatus });
      setIssues(prevIssues => prevIssues.map(issue => 
        issue._id === id ? { ...issue, status: newStatus } : issue
      ));
    } catch (e) { console.error("Error updating doc:", e); }
  };

  const deleteIssue = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/issues/${id}`);
      setIssues(prevIssues => prevIssues.filter(issue => issue._id !== id));
    } catch (e) { console.error("Error deleting doc:", e); }
  };
  
  const editIssueTitle = async (id, newTitle) => {
    try {
      await api.put(`/issues/${id}`, { title: newTitle });
      setIssues(prevIssues => prevIssues.map(issue => 
        issue._id === id ? { ...issue, title: newTitle } : issue
      ));
    } catch (e) { console.error("Error editing doc:", e); }
  };
  
  const filteredIssues = issues.filter(issue => {
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || issue.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <>
      <Header onLogout={handleLogout} />
      
      {/* --- NEW: Render the modal if an issue is selected --- */}
      {resolvingIssue && (
        <ResolveModal 
          issue={resolvingIssue}
          onClose={() => setResolvingIssue(null)}
          onSubmit={handleResolveIssue}
        />
      )}
      
      {error && <p className="form-error" style={{maxWidth: '800px', margin: '1rem auto'}}>{error}</p>}

      <MapDisplay issues={filteredIssues} />

      <div className="app-container">
        <h2>Active Issues ({filteredIssues.length})</h2>

        <div className="filter-bar">
          <FilterControls 
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
          <div className="category-filter">
            <label htmlFor="admin-category-filter">Filter by Category:</label>
            <select
              id="admin-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {issueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="issue-list">
          
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <IssueReport 
                key={issue._id} 
                issue={issue} 
                onDelete={() => deleteIssue(issue._id)}
                // --- UPDATED: Pass the new functions ---
                onToggleStatus={() => toggleIssueStatus(issue._id, issue.status)}
                onEditTitle={(newTitle) => editIssueTitle(issue._id, newTitle)}
                onResolve={() => handleOpenResolveModal(issue)} // <-- NEW
              />
            ))
          ) : (
            <p className="empty-state-message">
              No issues match your filter.
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default App