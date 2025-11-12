import { useState } from 'react';
import './ResolveModal.css';

function ResolveModal({ issue, onClose, onSubmit }) {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !notes) {
      setError("Please provide notes and a proof image/video.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Create FormData to send file and text
    const formData = new FormData();
    formData.append('notes', notes);
    formData.append('proof', file); // 'proof' must match server.js

    try {
      // Pass the form data up to App.jsx to handle the API call
      await onSubmit(issue._id, formData);
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Error submitting proof:", err);
      setError(err.response?.data?.msg || "Submission failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Resolve Issue: {issue.title}</h3>
        <p>Upload proof of action and add notes for the user.</p>
        
        {error && <p className="modal-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="modal-form-group">
            <label htmlFor="notes">Resolution Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'Pothole has been filled and road is now clear.'"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="modal-form-group">
            <label htmlFor="proof-file">Proof (Image/Video)</label>
            <input
              type="file"
              id="proof-file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="modal-button cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="modal-button submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Mark as Resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResolveModal;