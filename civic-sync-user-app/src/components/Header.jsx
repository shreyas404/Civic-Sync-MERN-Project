import './Header.css';

function Header({ onLogout, user }) {
  return (
    <header className="user-header">
      <div className="header-content">
        <h1>Civic-Sync</h1>
        {user && (
          <div className="user-info">
            <span className="user-email-header">{user.email}</span>
            <span className="user-points-header">{user.points || 0} PTS</span>
          </div>
        )}
      </div>
      
      <button onClick={onLogout} className="logout-button">
        Logout
      </button>
    </header>
  )
}

export default Header