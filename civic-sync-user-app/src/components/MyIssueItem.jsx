import React, { useState } from 'react';
import './MyIssueItem.css';
import StarRating from './StarRating.jsx';
import api from '../api.js';

const BACKEND_URL = 'http://localhost:5000';

function MyIssueItem({ issue, onIssueUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRatingSubmit = async (rating) => {
    setIsLoading(true);
    setError(null);
    
    let status = issue.status;
    
    if (rating <= 2) {
      if (!window.confirm("This low rating will re-open the issue for admin review. Are you sure?")) {
        setIsLoading(false);
        return;
      }
      status = 'open';
    }

    try {
      const res = await api.put(`/issues/${issue._id}/rate`, { rating, status });
      onIssueUpdate(res.data);
      
      if (status === 'open') {
        alert("Issue has been re-opened and sent back to the admin.");
      } else {
        alert("Thank you for your rating!");
      }

    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit rating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const userImageUrl = `${BACKEND_URL}${issue.imageUrl}`;
  const adminImageUrl = issue.resolvedImageUrl ? `${BACKEND_URL}${issue.resolvedImageUrl}` : null;

  return (
    <div className="my-issue-item">
      
      <div className="submission-section user-submission">
        <div className="submission-header">
          <h4>Your Submission</h4>
          <span className={`status-badge status-${issue.status || 'open'}`}>
            {issue.status || 'open'}
          </span>
        </div>
        {issue.imageUrl && (
          <a href={userImageUrl} target="_blank" rel="noopener noreferrer" className="issue-image-link">
            <img 
              src={userImageUrl} 
              alt={issue.title}
              className="issue-thumb"
              onError={(e) => e.target.src='https://placehold.co/100x100/e2e8f0/9ca3af?text=Image'} 
            />
          </a>
        )}
        <div className="issue-details">
          <span className="issue-category">{issue.category}</span>
          <h3>{issue.title}</h3>
          {issue.address && <p>{issue.address}</p>}
        </div>
      </div>

      {issue.status === 'resolved' && (
        <div className="submission-section admin-proof">
          <div className="submission-header">
            <h4>Admin's Proof of Action</h4>
          </div>
          {adminImageUrl ? (
            <a href={adminImageUrl} target="_blank" rel="noopener noreferrer" className="issue-image-link">
              <img 
                src={adminImageUrl} 
                alt="Admin's proof"
                className="issue-thumb"
              />
            </a>
          ) : (
            <p className="no-proof">Admin did not upload a proof image.</p>
          )}
          {issue.resolvedNotes && (
            <p className="admin-notes"><b>Admin Notes:</b> {issue.resolvedNotes}</p>
          )}

          <div className="rating-section">
            {!issue.rating ? (
              <>
                <label>Please rate the admin's work:</label>
                <StarRating onRate={handleRatingSubmit} disabled={isLoading} />
              </>
            ) : (
              <div className="final-rating">
                <label>Your Rating:</label>
                <StarRating rating={issue.rating} disabled={true} />
              </div>
            )}
            {error && <p className="form-error">{error}</p>}
          </div>
        </div>
      )}

      {issue.status === 'open' && issue.rating && (
         <div className="submission-section admin-proof re-opened">
            <label>You rated this {issue.rating} star(s) and re-opened the issue.</label>
         </div>
      )}
    </div>
  );
}

export default MyIssueItem;