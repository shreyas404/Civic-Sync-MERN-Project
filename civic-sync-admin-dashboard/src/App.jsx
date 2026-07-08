import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import IssueReport from './components/IssueReport.jsx';
import FilterControls from './components/FilterControls.jsx';
import MapDisplay from './components/MapDisplay.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import ResolveModal from './components/ResolveModal.jsx';
import MergeModal from './components/MergeModal.jsx';
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

  const [resolvingIssue, setResolvingIssue] = useState(null); 
  
  // MERGE FEATURE STATE
  const [selectedIssueIds, setSelectedIssueIds] = useState([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    const fetchAllIssues = async () => {
      if (token) {
        try {
          const res = await api.get('/issues');
          setIssues(res.data);
          setError(null);
        } catch (err) {
          console.error('Error fetching all issues:', err.response?.data);
          if (err.response?.status === 403) {
            setError("Access Denied: You are not an admin.");
            handleLogout();
          } else if (err.response?.status === 401 || err.response?.status === 400) {
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
    setSelectedIssueIds([]);
  };

  const handleOpenResolveModal = (issue) => {
    setResolvingIssue(issue);
  };

  const handleResolveIssue = async (issueId, formData) => {
    try {
      const res = await api.post(`/issues/${issueId}/resolve`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIssues(prevIssues => prevIssues.map(issue => 
        issue._id === issueId ? { ...issue, ...res.data } : issue
      ));
    } catch(e) {
      console.error("Error resolving issue:", e);
      throw e;
    }
  };

  const toggleIssueStatus = async (id, currentStatus) => {
    if (currentStatus === 'resolved') {
      alert("This issue is resolved. You cannot change its status until the user rates it and re-opens it.");
      return;
    }
    if (currentStatus === 'merged') {
      alert("This issue is merged into another issue and cannot be modified directly.");
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
      setSelectedIssueIds(prev => prev.filter(selectedId => selectedId !== id));
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

  // MERGE HANDLERS
  const toggleSelection = (id) => {
    setSelectedIssueIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMergeSubmit = async (masterIssueId, duplicateIssueIds) => {
    setIsMerging(true);
    try {
      const res = await api.post('/admin/issues/merge', { masterIssueId, duplicateIssueIds });
      
      // Update UI: Master gets updated, duplicates get marked as merged
      setIssues(prevIssues => prevIssues.map(issue => {
        if (issue._id === masterIssueId) {
          return { ...issue, ...res.data.masterIssue };
        }
        if (duplicateIssueIds.includes(issue._id)) {
          return { ...issue, status: 'merged', isDuplicate: true, mergedInto: masterIssueId };
        }
        return issue;
      }));

      setIsMergeModalOpen(false);
      setSelectedIssueIds([]);
      alert("Issues merged successfully!");
    } catch (err) {
      console.error("Error merging issues:", err);
      alert(err.response?.data?.msg || "Failed to merge issues.");
    } finally {
      setIsMerging(false);
    }
  };
  
  const filteredIssues = issues.filter(issue => {
    const statusMatch = statusFilter === 'all' || issue.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || (issue.category === categoryFilter || issue.description); // Simplified for new schema
    return statusMatch && categoryMatch;
  });

  const selectedIssuesObjects = issues.filter(issue => selectedIssueIds.includes(issue._id));

  if (isLoading) return <div>Loading...</div>;
  if (!token) return <AdminLogin onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header onLogout={handleLogout} />
      
      {resolvingIssue && (
        <ResolveModal 
          issue={resolvingIssue}
          onClose={() => setResolvingIssue(null)}
          onSubmit={handleResolveIssue}
        />
      )}

      {isMergeModalOpen && (
        <MergeModal 
          issues={selectedIssuesObjects}
          onClose={() => setIsMergeModalOpen(false)}
          onConfirm={handleMergeSubmit}
          isMerging={isMerging}
        />
      )}
      
      {error && <p className="form-error" style={{maxWidth: '800px', margin: '1rem auto'}}>{error}</p>}

      <MapDisplay issues={filteredIssues} />

      <div className="app-container relative">
        <h2>Active Issues ({filteredIssues.length})</h2>

        <div className="filter-bar">
          <FilterControls 
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
          />
        </div>
        
        <div className="issue-list">
          {filteredIssues.length > 0 ? (
            filteredIssues.map(issue => (
              <IssueReport 
                key={issue._id} 
                issue={issue} 
                onDelete={() => deleteIssue(issue._id)}
                onToggleStatus={() => toggleIssueStatus(issue._id, issue.status)}
                onEditTitle={(newTitle) => editIssueTitle(issue._id, newTitle)}
                onResolve={() => handleOpenResolveModal(issue)}
                isSelected={selectedIssueIds.includes(issue._id)}
                onToggleSelect={() => toggleSelection(issue._id)}
              />
            ))
          ) : (
            <p className="empty-state-message">
              No issues match your filter.
            </p>
          )}
        </div>
      </div>

      {/* STICKY MERGE ACTION BAR */}
      {selectedIssueIds.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] p-4 z-40 transform transition-transform">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 text-purple-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {selectedIssueIds.length}
              </div>
              <div>
                <p className="font-bold text-gray-900">Issues Selected</p>
                <p className="text-sm text-gray-500">Merge duplicates into a single master issue.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedIssueIds([])}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button 
                onClick={() => setIsMergeModalOpen(true)}
                className="px-6 py-2 font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
              >
                Merge Issues
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App