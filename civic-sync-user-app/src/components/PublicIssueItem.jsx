import React from 'react';
import './PublicIssueItem.css';

const BACKEND_URL = 'http://localhost:5000';

function PublicIssueItem({ issue, currentUserId, hasUpvoted, onUpvote }) {

  const handleUpvote = () => {
    if (!hasUpvoted) {
      onUpvote(issue._id);
    }
  };

  const fullImageUrl = `${BACKEND_URL}${issue.imageUrl}`;
  const userEmail = issue.submittedBy ? issue.submittedBy.email : 'Anonymous';
  
  return (
    <div className="public-issue-item">
      <div className="issue-user-info">
        <span className="user-email">{userEmail}</span>
        <span className={`status-badge status-${issue.status || 'open'}`}>
          {issue.status || 'open'}
        </span>
      </div>
      
      <div className="issue-content">
        {issue.imageUrl && (
          <div className="issue-thumb-wrapper">
            {issue.fileType && issue.fileType.startsWith('video/') ? (
              <video src={fullImageUrl} className="issue-thumb" muted playsInline />
            ) : (
              <img 
                src={fullImageUrl} 
                alt={issue.title}
                className="issue-thumb"
                onError={(e) => e.target.src='https://placehold.co/100x100/e2e8f0/9ca3af?text=Image'} 
              />
            )}
          </div>
        )}
        <div className="issue-details">
          <span className="issue-category">{issue.category}</span>
          <h3>{issue.title}</h3>
          {issue.address && <p>{issue.address}</p>}
        </div>
      </div>

      <div className="issue-actions">
        <button 
          className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={hasUpvoted}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.72 9.14a.75.75 0 11-1.06-1.06l2.5-2.5a.75.75 0 011.06 0l2.5 2.5a.75.75 0 11-1.06 1.06l-1.47-1.528V14.25A.75.75 0 0110 15z" />
          </svg>
          Upvote ({issue.upvotes.length})
        </button>
      </div>
    </div>
  );
}

export default PublicIssueItem;