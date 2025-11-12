import { useState, useEffect } from 'react';
import api from '../api';
import './RewardStore.css';

function RewardStore({ user, onRedeem }) {
  const [rewards, setRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redeemingId, setRedeemingId] = useState(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        setIsLoading(true);
        // --- THIS IS FIX #1 ---
        const res = await api.get('/rewards');
        // ----------------------
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
    setRedeemingId(reward._id);
    setError(null);

    if (!window.confirm(`Are you sure you want to spend ${reward.cost} points on a ${reward.name}?`)) {
      setRedeemingId(null);
      return;
    }

    try {
      // --- THIS IS FIX #2 ---
      const res = await api.post(`/rewards/${reward._id}/redeem`);
      // ----------------------
      
      onRedeem(res.data); 
      alert("Reward claimed successfully!");

    } catch (err) {
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
    return <div className="page-container"><h2>Reward Store</h2><p>Loading rewards...</p></div>;
  }

  return (
    <div className="page-container">
      <h2>Reward Store</h2>
      {error && <p className="reward-error">{error}</p>}
      <div className="reward-list">
        {rewards.map((reward) => {
          const canAfford = user.points >= reward.cost;
          const isRedeeming = redeemingId === reward._id;
          
          return (
            <div key={reward._id} className={`reward-item ${!canAfford ? 'disabled' : ''}`}>
              <img 
                src={reward.imageUrl} 
                alt={reward.name} 
                className="reward-image" 
                onError={(e) => e.target.src='https://placehold.co/300x200/94a3b8/white?text=Reward'}
              />
              <div className="reward-info">
                <h4>{reward.name}</h4>
                <p>{reward.description}</p>
              </div>
              <button 
                className="reward-claim-button"
                onClick={() => handleClaim(reward)}
                disabled={!canAfford || isRedeeming}
              >
                {isRedeeming ? 'Claiming...' : `Claim (${reward.cost} pts)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RewardStore;