import React from 'react';
import PublicIssueItem from './PublicIssueItem.jsx';

function PublicFeed({ user, allIssues, onUpvote }) {
  
  const isLoading = !allIssues; // Simple loading check

  if (isLoading) {
    return <div className="page-container"><p>Loading feed...</p></div>;
  }

  return (
    <div className="page-container">
      <h2>Public Feed</h2>
      <div className="public-feed-list">
        {allIssues.length > 0 ? (
          allIssues.map(issue => (
            <PublicIssueItem 
              key={issue._id} 
              issue={issue} 
              currentUserId={user.id}
              hasUpvoted={issue.upvotes.includes(user.id)}
              onUpvote={onUpvote} // Pass the handler down
            />
          ))
        ) : (
          <p className="no-issues">No issues have been submitted yet.</p>
        )}
      </div>
    </div>
  );
}

export default PublicFeed;