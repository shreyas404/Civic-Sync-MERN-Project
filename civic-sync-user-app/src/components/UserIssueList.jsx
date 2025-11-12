import React from 'react';
import './UserIssueList.css';
import MyIssueItem from './MyIssueItem.jsx';

function UserIssueList({ issues, onRateIssue }) {
  if (issues.length === 0) {
    return <p className="no-issues">You haven't submitted any issues yet.</p>;
  }

  return (
    <div className="user-issue-list">
      {issues.map(issue => (
        <MyIssueItem 
          key={issue._id} 
          issue={issue} 
          onIssueUpdate={onRateIssue} // Pass handler down
        />
      ))}
    </div>
  );
}

export default UserIssueList;