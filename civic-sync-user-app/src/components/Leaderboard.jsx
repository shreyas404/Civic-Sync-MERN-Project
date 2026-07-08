import { useState, useEffect } from 'react';
import api from '../api';
import { Trophy, Medal } from 'lucide-react';

function Leaderboard({ user }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/users/leaderboard');
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const getRankStyle = (index) => {
    if (index === 0) return 'bg-yellow-100 text-yellow-700 border-yellow-200'; // Gold
    if (index === 1) return 'bg-slate-200 text-slate-700 border-slate-300'; // Silver
    if (index === 2) return 'bg-orange-100 text-orange-800 border-orange-200'; // Bronze
    return 'bg-gray-100 text-gray-500 border-gray-200'; // Standard
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy size={20} className="text-yellow-600" />;
    if (index === 1) return <Medal size={20} className="text-slate-500" />;
    if (index === 2) return <Medal size={20} className="text-orange-700" />;
    return <span className="text-sm font-bold w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-3">
          <Trophy className="text-purple-600" size={32} />
          Community Leaderboard
        </h2>
        <p className="text-gray-500 mt-2">See who is making the biggest impact in your city.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {users.map((leader, index) => {
            const isCurrentUser = user && leader.email === user.email;
            
            return (
              <li 
                key={leader._id} 
                className={`flex items-center justify-between p-4 sm:px-6 transition-colors hover:bg-gray-50
                  ${isCurrentUser ? 'bg-purple-50/50' : ''}`}
              >
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Rank Badge */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border shadow-sm shrink-0 ${getRankStyle(index)}`}>
                    {getRankIcon(index)}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-base sm:text-lg">
                      {isCurrentUser ? 'You' : leader.email.replace(/(?<=.{2}).*(?=@)/, '****')}
                    </span>
                    {isCurrentUser && (
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Current User</span>
                    )}
                  </div>
                </div>
                
                {/* Points */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-purple-700">{leader.points}</span>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">PTS</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Leaderboard;