import React, { useState } from 'react';

function MergeModal({ issues, onClose, onConfirm, isMerging }) {
  const [masterId, setMasterId] = useState(issues[0]._id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const duplicateIds = issues.map(i => i._id).filter(id => id !== masterId);
    onConfirm(masterId, duplicateIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Merge Duplicate Issues</h2>
            <p className="text-sm text-gray-500 mt-1">Select one issue to serve as the Master. The others will be merged into it.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {issues.map(issue => (
              <label 
                key={issue._id} 
                className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${masterId === issue._id 
                    ? 'border-purple-600 bg-purple-50 shadow-sm' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
              >
                <div className="pt-1">
                  <input 
                    type="radio" 
                    name="masterIssue" 
                    value={issue._id}
                    checked={masterId === issue._id}
                    onChange={() => setMasterId(issue._id)}
                    className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-purple-600"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${masterId === issue._id ? 'text-purple-900' : 'text-gray-900'}`}>
                      {issue.title}
                    </h3>
                    <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-100">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">{issue.description || issue.category}</p>
                  
                  {issue.imageUrl && (
                    <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-200/60 mt-3">
                      <img 
                        src={`http://localhost:5000${issue.imageUrl}`} 
                        alt="Issue thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isMerging}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isMerging}
            className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-700 hover:bg-purple-800 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isMerging && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>}
            Merge {issues.length} Issues
          </button>
        </div>

      </div>
    </div>
  );
}

export default MergeModal;
