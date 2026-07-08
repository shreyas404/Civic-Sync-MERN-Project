import React from 'react';

function IssueTable({ issues, selectedIssueIds, onToggleSelect, onResolve, onDelete, onEditTitle }) {
  
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
          <tr>
            <th className="px-4 py-3 w-12 text-center">
              <span className="sr-only">Select</span>
            </th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Category/Desc</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {issues.map(issue => {
            const isMerged = issue.status === 'merged';
            const isSelected = selectedIssueIds.includes(issue._id);

            return (
              <tr 
                key={issue._id} 
                className={`hover:bg-gray-50 transition-colors ${isMerged ? 'bg-gray-50 opacity-70' : ''} ${isSelected ? 'bg-purple-50' : ''}`}
              >
                <td className="px-4 py-3 text-center">
                  {!isMerged && (
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggleSelect(issue._id)}
                      className="w-5 h-5 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
                    issue.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    issue.status === 'merged' ? 'bg-gray-200 text-gray-600' :
                    issue.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                  {issue.title}
                </td>
                <td className="px-4 py-3 max-w-[250px] truncate">
                  {issue.description || issue.category}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {new Date(issue.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {!isMerged && (
                      <button 
                        onClick={() => onResolve(issue)}
                        className="px-3 py-1.5 min-h-[44px] sm:min-h-0 bg-green-50 text-green-700 hover:bg-green-100 rounded-md font-semibold text-xs transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                    <button 
                      onClick={() => onDelete(issue._id)}
                      className="px-3 py-1.5 min-h-[44px] sm:min-h-0 bg-red-50 text-red-700 hover:bg-red-100 rounded-md font-semibold text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {issues.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No issues found.
        </div>
      )}
    </div>
  );
}

export default IssueTable;
