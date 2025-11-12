import { useState, useEffect } from 'react';
import api from '../api';
import './Leaderboard.css';

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        // --- THIS IS THE FIX ---
        const res = await api.get('/users/leaderboard');
        // -----------------------
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
    return <div className="page-container"><h2>Top Users</h2><p>Loading leaderboard...</p></div>;
  }

  return (
    <div className="page-container">
      <h2>Top Users</h2>
      <ol className="leaderboard-list">
        {users.map((user, index) => (
          <li key={user._id} className="leaderboard-item">
            <span className="leaderboard-rank">{index + 1}</span>
            <span className="leaderboard-email">
              {user.email.replace(/(?<=.{2}).*(?=@)/, '****')}
            </span>
            <span className="leaderboard-points">{user.points} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default Leaderboard;