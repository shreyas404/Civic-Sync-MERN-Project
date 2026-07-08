import React from 'react';
import PublicIssueItem from './PublicIssueItem.jsx';

function PublicFeed({ user, allIssues, onUpvote }) {
  const isLoading = !allIssues; 

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Public Feed</h2>
        <p className="text-gray-500 mt-1">Discover and support issues reported by your community.</p>
      </div>
      
      {allIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allIssues.map(issue => (
            <div key={issue._id} className="w-full">
              <PublicIssueItem 
                issue={issue} 
                currentUserId={user.id}
                hasUpvoted={issue.upvotes.includes(user.id)}
                onUpvote={onUpvote}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 font-medium">No issues have been submitted yet.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to report an issue in your city!</p>
        </div>
      )}
    </div>
  );
}

export default PublicFeed;