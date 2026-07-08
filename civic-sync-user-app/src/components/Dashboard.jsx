import React from 'react';
import AddIssueForm from './AddIssueForm.jsx';
import UserIssueList from './UserIssueList.jsx';

function Dashboard({ user, myIssues, onIssueSubmit, onRateIssue, onViewMasterIssue }) {
  const isLoading = false;

  const handleAddIssue = (responseData) => {
    onIssueSubmit(responseData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-7 lg:order-1 order-2 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Report a New Issue</h2>
          <p className="text-gray-500 mt-1">Help improve your city by submitting detailed reports.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <AddIssueForm onIssueSubmitted={handleAddIssue} />
        </div>
      </div>

      {/* Right Column: My Issues */}
      <div className="lg:col-span-5 lg:order-2 order-1 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">My Submissions</h2>
          <p className="text-gray-500 mt-1">Track the status of your reports.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
            </div>
          ) : (
            <UserIssueList 
              issues={myIssues} 
              onRateIssue={onRateIssue} 
              onViewMasterIssue={onViewMasterIssue}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;