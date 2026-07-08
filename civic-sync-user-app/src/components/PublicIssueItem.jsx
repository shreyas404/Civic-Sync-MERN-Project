import React from 'react';
import { ArrowUp, MapPin, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

function PublicIssueItem({ issue, currentUserId, hasUpvoted, onUpvote }) {

  const handleUpvote = () => {
    if (!hasUpvoted) {
      onUpvote(issue._id);
    }
  };

  const fullImageUrl = `${BACKEND_URL}${issue.imageUrl}`;
  const userEmail = issue.submittedBy ? issue.submittedBy.email : 'Anonymous';
  const isResolved = issue.status === 'resolved';
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Image Header */}
      {issue.imageUrl && (
        <div className="w-full h-48 relative overflow-hidden bg-gray-100">
          {issue.fileType && issue.fileType.startsWith('video/') ? (
            <video src={fullImageUrl} className="w-full h-full object-cover" muted playsInline />
          ) : (
            <img 
              src={fullImageUrl} 
              alt={issue.title}
              className="w-full h-full object-cover"
              onError={(e) => e.target.src='https://placehold.co/400x300/e2e8f0/9ca3af?text=Image'} 
            />
          )}
          <div className="absolute top-3 right-3">
             <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm backdrop-blur-sm
              ${isResolved ? 'bg-green-100/90 text-green-700 border border-green-200/50' : 'bg-orange-100/90 text-orange-700 border border-orange-200/50'}`}>
              {isResolved ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
              {issue.status || 'open'}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">{issue.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">{issue.description}</p>
        
        <div className="mt-auto space-y-2">
          {issue.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <MapPin size={14} className="shrink-0 mt-0.5" />
              <span className="line-clamp-2">{issue.address}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span className="truncate max-w-[120px]" title={userEmail}>By {userEmail.split('@')[0]}</span>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(issue.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-50 border-t border-gray-100">
        <button 
          onClick={handleUpvote}
          disabled={hasUpvoted}
          className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold transition-all
            ${hasUpvoted 
              ? 'bg-purple-100 text-purple-700 cursor-default' 
              : 'bg-white border border-gray-200 text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 shadow-sm'
            }`}
        >
          <ArrowUp size={18} className={hasUpvoted ? 'text-purple-600' : ''} />
          {hasUpvoted ? 'Upvoted' : 'Upvote'}
          <span className="ml-1 bg-white/50 px-2 py-0.5 rounded-full text-xs border border-purple-200/50">
            {issue.upvotes.length}
          </span>
        </button>
      </div>
    </div>
  );
}

export default PublicIssueItem;