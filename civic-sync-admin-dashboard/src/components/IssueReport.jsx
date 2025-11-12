import { useState } from 'react';
import './IssueReport.css';

const BACKEND_URL = 'http://localhost:5000';

// --- NEW: Added 'onResolve' prop ---
function IssueReport({ issue, onDelete, onToggleStatus, onEditTitle, onResolve }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(issue.title);

  const statusClass = `status-${issue.status || 'open'}`;

  const handleSave = () => {
    if (editTitle.trim() && editTitle.trim() !== issue.title) {
      onEditTitle(editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(issue.title);
  };
  
  // --- NEW: Handle clicking the status badge ---
  const handleStatusClick = () => {
    if (issue.status === 'open') {
      // If 'open', open the "Resolve" modal
      onResolve(); 
    } else if (issue.status === 'pending') {
      // If 'pending', also open "Resolve" modal
      onResolve();
    }
    // If it's 'resolved', do nothing (user must rate/re-open)
  };

  // Build URLs for both the user's image and the admin's proof image
  const userImageUrl = `${BACKEND_URL}${issue.imageUrl}`;
  const resolvedImageUrl = issue.resolvedImageUrl ? `${BACKEND_URL}${issue.resolvedImageUrl}` : null;
  
  const userEmail = issue.submittedBy ? issue.submittedBy.email : 'Anonymous';

  return (
    <div className={`issue-report ${statusClass}`} id={`issue-${issue._id}`}>
      
      {/* --- This section now shows TWO images --- */}
      <div className="issue-images-grid">
        <div className="issue-image-wrapper">
          <label>User's Proof</label>
          {issue.fileType && issue.fileType.startsWith('video/') ? (
            <video src={userImageUrl} className="issue-media" controls />
          ) : (
            <a href={userImageUrl} target="_blank" rel="noopener noreferrer">
              <img 
                src={userImageUrl} 
                alt="User's submission"
                className="issue-media"
                onError={(e) => e.target.src='https://placehold.co/150x100/e2e8f0/9ca3af?text=Image'} 
              />
            </a>
          )}
        </div>
        
        {/* --- NEW: Show Admin's Proof --- */}
        {resolvedImageUrl && (
          <div className="issue-image-wrapper proof-image">
            <label>Admin's Proof</label>
            <a href={resolvedImageUrl} target="_blank" rel="noopener noreferrer">
              <img 
                src={resolvedImageUrl} 
                alt="Admin's resolution proof"
                className="issue-media"
              />
            </a>
          </div>
        )}
      </div>
      
      <div className="issue-details">
        <span className="issue-category">{issue.category}</span>
        
        <div className="issue-info">
          {isEditing ? (
            <input 
              type="text" 
              className="edit-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <h3>{issue.title}</h3>
          )}
          
          <span 
            className="status-badge"
            onClick={handleStatusClick} // <-- UPDATED
            title={issue.status === 'resolved' ? "Resolved (User must rate)" : "Click to Mark as Resolved"}
          >
            {issue.status || 'open'}
          </span>
        </div>
        
        <div className="issue-metadata">
          <span className="upvote-display">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 15a.75.75 0 01-.75-.75V7.612L7.72 9.14a.75.75 0 11-1.06-1.06l2.5-2.5a.75.75 0 011.06 0l2.5 2.5a.75.75 0 11-1.06 1.06l-1.47-1.528V14.25A.75.75 0 0110 15z" />
            </svg>
            {issue.upvoteCount} Upvotes
          </span>
          <span className="user-email-admin">by: {userEmail}</span>
        </div>
        
        {/* --- NEW: Show admin notes if they exist --- */}
        {issue.resolvedNotes && <p className="issue-notes"><b>Admin Notes:</b> {issue.resolvedNotes}</p>}
        {/* --- NEW: Show user rating if it exists --- */}
        {issue.rating && <p className="issue-rating"><b>User Rating:</b> {issue.rating} / 5 ★</p>}

        {issue.address && <p className="issue-address">{issue.address}</p>}
        {issue.lat && issue.lng && (
          <p className="issue-coords">
            Coords: {issue.lat.toFixed(4)}, {issue.lng.toFixed(4)}
          </p>
        )}

        <div className="issue-controls">
          {isEditing ? (
            <>
              <button className="control-button save" onClick={handleSave}>Save</button>
              <button className="control-button cancel" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <>
              <button className="control-button edit" onClick={() => setIsEditing(true)}>Edit</button>
              <button 
                className="control-button delete" 
                onClick={onDelete}
              >
                &times;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default IssueReport;