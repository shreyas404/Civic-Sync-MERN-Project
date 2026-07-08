import React from 'react';
import MyIssueItem from './MyIssueItem.jsx';

function UserIssueList({ issues, onRateIssue, onViewMasterIssue }) {
  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-50 rounded-full p-4 mb-3">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">You haven't submitted any issues yet.</p>
        <p className="text-sm text-gray-400 mt-1">Your reports will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map(issue => (
        <MyIssueItem 
          key={issue._id} 
          issue={issue} 
          onIssueUpdate={onRateIssue}
          onViewMasterIssue={onViewMasterIssue}
        />
      ))}
    </div>
  );
}

export default UserIssueList;