import { useState } from 'react';
import './IssueReport.css';

const BACKEND_URL = 'http://localhost:5000';

function IssueReport({ issue, onDelete, onToggleStatus, onEditTitle, onResolve, isSelected, onToggleSelect }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(issue.title);

  const statusClass = `status-${issue.status || 'open'}`;
  const isMerged = issue.status === 'merged';

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
  
  const handleStatusClick = () => {
    if (isMerged) return; // Disabled for merged
    if (issue.status === 'open' || issue.status === 'pending') {
      onResolve(); 
    }
  };

  const userImageUrl = `${BACKEND_URL}${issue.imageUrl}`;
  const resolvedImageUrl = issue.resolvedImageUrl ? `${BACKEND_URL}${issue.resolvedImageUrl}` : null;
  const userEmail = issue.submittedBy ? issue.submittedBy.email : 'Anonymous';

  return (
    <div className={`issue-report ${statusClass} relative ${isMerged ? 'opacity-70 grayscale-[30%] bg-gray-100' : ''}`} id={`issue-${issue._id}`}>
      
      {/* SELECTION CHECKBOX */}
      {!isMerged && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 p-1 rounded-md shadow-sm backdrop-blur-sm">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-6 h-6 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
            title="Select for merging"
          />
        </div>
      )}

      {isMerged && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Merged
          </span>
        </div>
      )}

      <div className="issue-images-grid pt-10">
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
        <span className="issue-category">{issue.description || issue.category || "Issue"}</span>
        
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
            className={`status-badge ${isMerged ? 'cursor-not-allowed' : ''}`}
            onClick={handleStatusClick}
            title={isMerged ? "Merged Issue" : issue.status === 'resolved' ? "Resolved (User must rate)" : "Click to Mark as Resolved"}
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
        
        {issue.resolvedNotes && <p className="issue-notes"><b>Admin Notes:</b> {issue.resolvedNotes}</p>}
        {issue.rating && <p className="issue-rating"><b>User Rating:</b> {issue.rating} / 5 ★</p>}
        {isMerged && issue.mergedInto && <p className="text-sm text-gray-500 mt-2"><b>Merged Into:</b> {issue.mergedInto}</p>}
        {issue.linkedReporters?.length > 0 && <p className="text-sm text-purple-600 mt-2"><b>Linked Duplicates:</b> {issue.linkedReporters.length}</p>}

        {issue.address && <p className="issue-address">{issue.address}</p>}
        {issue.location?.coordinates && (
          <p className="issue-coords">
            Coords: {issue.location.coordinates[1].toFixed(4)}, {issue.location.coordinates[0].toFixed(4)}
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
              {!isMerged && <button className="control-button edit" onClick={() => setIsEditing(true)}>Edit</button>}
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