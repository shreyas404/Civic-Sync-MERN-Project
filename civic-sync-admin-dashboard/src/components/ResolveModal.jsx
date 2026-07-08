import { useState } from 'react';

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white md:rounded-2xl shadow-xl w-full h-full md:h-auto md:max-w-xl overflow-hidden flex flex-col md:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Resolve Issue: {issue.title}</h3>
            <p className="text-sm text-gray-500 mt-1">Upload proof of action and add notes for the user.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col">
          {error && <p className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 mb-4 font-medium">{error}</p>}

          <div className="space-y-5">
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1.5">Resolution Notes</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., 'Pothole has been filled and road is now clear.'"
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-colors resize-none"
                rows="4"
              />
            </div>
            
            <div>
              <label htmlFor="proof-file" className="block text-sm font-semibold text-gray-700 mb-1.5">Proof (Image/Video)</label>
              <input
                type="file"
                id="proof-file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 min-h-[44px]"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Submitting...
              </>
            ) : 'Mark as Resolved'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResolveModal;