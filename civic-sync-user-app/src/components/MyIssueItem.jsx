import React, { useState } from 'react';
import StarRating from './StarRating.jsx';
import api from '../api.js';
import { MapPin, Clock, AlertCircle, CheckCircle, RotateCcw } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

function MyIssueItem({ issue, onIssueUpdate, onViewMasterIssue }) {
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
  const isResolved = issue.status === 'resolved';
  const isMerged = issue.status === 'merged';

  const handleClick = (e) => {
    if (isMerged && issue.isDuplicate && issue.mergedInto) {
      e.preventDefault();
      if (typeof onViewMasterIssue === 'function') {
        onViewMasterIssue(issue.mergedInto);
      }
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white border shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md ${isMerged ? 'border-gray-200 cursor-pointer hover:border-gray-300 opacity-90' : 'border-gray-100'}`}
    >
      {/* Header Area */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${isResolved ? 'bg-green-50/50 border-green-100' : isMerged ? 'bg-gray-100/70 border-gray-200' : 'bg-gray-50/50 border-gray-100'}`}>
        <div className="flex items-center gap-2">
          {isResolved ? <CheckCircle size={16} className="text-green-600" /> : isMerged ? <AlertCircle size={16} className="text-gray-500" /> : <AlertCircle size={16} className="text-orange-500" />}
          <span className={`text-xs font-bold uppercase tracking-wider ${isResolved ? 'text-green-700' : isMerged ? 'text-gray-600' : 'text-orange-600'}`}>
            {issue.status}
          </span>
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <Clock size={14} />
          {new Date(issue.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {/* Image */}
        {issue.imageUrl && (
          <a href={userImageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 group relative rounded-lg overflow-hidden h-24 w-24 sm:h-32 sm:w-32 block">
            <img 
              src={userImageUrl} 
              alt={issue.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => e.target.src='https://placehold.co/100x100/e2e8f0/9ca3af?text=Image'} 
            />
          </a>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate mb-1">{issue.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{issue.description}</p>
          
          {issue.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span className="truncate">{issue.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Details */}
      {isResolved && (
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600" />
            Admin's Proof of Action
          </h4>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {adminImageUrl ? (
               <a href={adminImageUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg overflow-hidden h-20 w-20 block border border-gray-200">
                 <img 
                   src={adminImageUrl} 
                   alt="Admin's proof"
                   className="h-full w-full object-cover"
                 />
               </a>
            ) : (
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-xs text-gray-400 text-center p-2 border border-dashed border-gray-300">
                No Photo
              </div>
            )}
            
            <div className="flex-1">
              {issue.resolvedNotes && (
                <div className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-100 mb-3">
                  <span className="font-semibold text-gray-900 block mb-1">Admin Notes:</span>
                  {issue.resolvedNotes}
                </div>
              )}
              
              <div className="mt-2">
                {!issue.rating ? (
                  <div className="bg-white p-3 rounded-lg border border-purple-100 inline-block">
                    <label className="text-xs font-semibold text-purple-900 block mb-1">Rate Resolution:</label>
                    <StarRating onRate={handleRatingSubmit} disabled={isLoading} />
                    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Your Rating:</span>
                    <StarRating rating={issue.rating} disabled={true} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopened state */}
      {issue.status === 'open' && issue.rating && (
        <div className="bg-orange-50 p-3 border-t border-orange-100 flex items-center gap-2 text-sm text-orange-800">
          <RotateCcw size={16} />
          You rated this {issue.rating} star(s) and re-opened the issue.
        </div>
      )}
    </div>
  );
}

export default MyIssueItem;