import React from 'react';
import { ArrowLeft, Info, MapPin, Clock } from 'lucide-react';

function MasterIssueDetail({ issue, onBack }) {
  if (!issue) return <div className="p-8 text-center text-gray-500">Issue not found.</div>;

  const imageUrl = `http://localhost:5000${issue.imageUrl}`;
  const adminImageUrl = issue.resolvedImageUrl ? `http://localhost:5000${issue.resolvedImageUrl}` : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-purple-700 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm inline-flex"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Transparency Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex gap-3 shadow-sm">
        <Info className="text-purple-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="font-bold text-purple-900">Merged Community Issue</h4>
          <p className="text-sm text-purple-800 mt-1">
            Your report was merged with this master community issue. You will still receive points when this is resolved!
          </p>
        </div>
      </div>

      {/* Main Issue Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
              issue.status === 'resolved' ? 'bg-green-100 text-green-700' : 
              issue.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
              'bg-blue-100 text-blue-700'
            }`}>
              {issue.status}
            </span>
          </div>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock size={14} />
            {new Date(issue.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">{issue.description}</p>
          
          {issue.address && (
            <div className="flex items-start gap-2 text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 mb-8 inline-flex">
              <MapPin size={18} className="shrink-0 mt-0.5 text-gray-400" />
              <span>{issue.address}</span>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg border-b pb-2">Community Evidence</h3>
            {issue.imageUrl ? (
              <img 
                src={imageUrl} 
                alt="Issue evidence" 
                className="w-full max-h-[400px] object-cover rounded-xl border border-gray-200 shadow-sm"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 border border-dashed border-gray-300">
                No image provided
              </div>
            )}
          </div>

          {issue.status === 'resolved' && (
            <div className="mt-10 bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-bold text-green-900 text-lg mb-4 flex items-center gap-2">
                Admin Resolution
              </h3>
              <div className="flex flex-col md:flex-row gap-6">
                {adminImageUrl && (
                  <img 
                    src={adminImageUrl} 
                    alt="Resolution proof" 
                    className="w-full md:w-1/3 h-48 object-cover rounded-lg border border-green-200 shadow-sm"
                  />
                )}
                <div className="flex-1">
                  {issue.resolvedNotes && (
                    <div className="bg-white p-4 rounded-lg border border-green-100 text-gray-800 shadow-sm">
                      <p className="font-semibold text-green-800 mb-1">Notes from Admin:</p>
                      {issue.resolvedNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MasterIssueDetail;
