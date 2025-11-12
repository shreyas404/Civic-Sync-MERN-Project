import React from 'react';
import './Nav.css';

function Nav({ currentView, onViewChange }) {
  const views = ['dashboard', 'feed', 'leaderboard', 'rewards'];

  const getDisplayName = (view) => {
    switch (view) {
      case 'dashboard': return 'My Dashboard';
      case 'feed': return 'Public Feed';
      case 'leaderboard': return 'Leaderboard';
      case 'rewards': return 'Reward Store';
      default: return '';
    }
  };

  return (
    <nav className="app-nav">
      {views.map(view => (
        <button
          key={view}
          className={`nav-button ${currentView === view ? 'active' : ''}`}
          onClick={() => onViewChange(view)}
        >
          {getDisplayName(view)}
        </button>
      ))}
    </nav>
  );
}

export default Nav;