import { useState, useEffect } from 'react';
import api from '../api';
import { Gift, Lock, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

function RewardStore({ user, onRedeem }) {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/rewards');
        setRewards(res.data);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError("Could not load rewards.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const handleClaim = async (reward) => {
    if (!window.confirm(`Are you sure you want to spend ${reward.cost} points on a ${reward.name}?`)) {
      return;
    }

    setRedeemingId(reward._id);
    setError(null);

    // Optimistic Update
    const previousUserPoints = user.points;
    onRedeem({ ...user, points: user.points - reward.cost });

    try {
      const res = await api.post(`/rewards/${reward._id}/redeem`);
      onRedeem(res.data); // Confirmed backend state
      // Show success toast or alert
    } catch (err) {
      // Rollback Optimistic Update
      onRedeem({ ...user, points: previousUserPoints });
      
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError("Redemption failed. Please try again.");
      }
    } finally {
      setRedeemingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  const currentPoints = user.points || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Gift className="text-purple-600" size={32} />
            Reward Store
          </h2>
          <p className="text-gray-500 mt-2">Redeem your hard-earned points for exclusive community rewards.</p>
        </div>
        
        <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm flex items-center gap-3 shrink-0">
          <div className="bg-green-100 p-2 rounded-full">
            <ShoppingBag size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available Balance</p>
            <p className="text-xl font-black text-green-600 leading-none mt-0.5">{currentPoints} PTS</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rewards.map((reward) => {
          const canAfford = currentPoints >= reward.cost;
          const isRedeeming = redeemingId === reward._id;
          const progressPercent = Math.min((currentPoints / reward.cost) * 100, 100);
          
          return (
            <div 
              key={reward._id} 
              className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col
                ${canAfford ? 'border-gray-200 shadow-sm hover:shadow-md hover:border-purple-200' : 'border-gray-200 opacity-80'}`}
            >
              <div className="relative h-48 bg-gray-100 overflow-hidden group">
                <img 
                  src={reward.imageUrl} 
                  alt={reward.name} 
                  className={`w-full h-full object-cover transition-transform duration-500 ${canAfford ? 'group-hover:scale-105' : 'grayscale'}`}
                  onError={(e) => e.target.src='https://placehold.co/300x200/94a3b8/white?text=Reward'}
                />
                {!canAfford && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                    <div className="bg-white/90 p-3 rounded-full shadow-sm text-gray-500">
                      <Lock size={24} />
                    </div>
                  </div>
                )}
                
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm font-bold text-sm text-gray-900 border border-gray-200/50">
                  {reward.cost} pts
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 mb-1 leading-tight">{reward.name}</h4>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{reward.description}</p>
                
                <div className="mt-auto">
                  {!canAfford ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-gray-500">
                        <span>{currentPoints}</span>
                        <span>{reward.cost} pts</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <button disabled className="w-full mt-3 py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold text-sm cursor-not-allowed">
                        Not enough points
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleClaim(reward)}
                      disabled={isRedeeming}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
                    >
                      {isRedeeming ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                      ) : (
                        <>
                          <CheckCircle size={18} />
                          Claim Reward
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RewardStore;