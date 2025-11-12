import React from 'react'; // <-- Import React
import AddIssueForm from './AddIssueForm.jsx';
import UserIssueList from './UserIssueList.jsx';
import './Dashboard.css';

// 1. Accept 'myIssues' and 'onRateIssue' as props
function Dashboard({ user, myIssues, onIssueSubmit, onRateIssue }) {
  
  // 2. No loading state needed
  const isLoading = false;

  // 3. This is the issue submit handler
  const handleAddIssue = (responseData) => {
    // Pass the data up to App.jsx
    onIssueSubmit(responseData);
  };

  return (
    <div className="dashboard-layout">
      {/* Column 1: Submit Form */}
      <div className="page-container">
        <h2>Report a New Issue</h2>
        <AddIssueForm onIssueSubmitted={handleAddIssue} />
      </div>

      {/* Column 2: My Issues */}
      <div className="page-container my-issues-container">
        <h2>My Submitted Issues</h2>
        {isLoading ? (
          <p>Loading my issues...</p>
        ) : (
          // 4. Pass the props down to the list
          <UserIssueList 
            issues={myIssues} 
            onRateIssue={onRateIssue} 
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;