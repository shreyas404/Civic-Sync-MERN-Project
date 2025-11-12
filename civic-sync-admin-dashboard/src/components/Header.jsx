import './Header.css';

function Header({ title, onLogout }) { // Added onLogout prop
  return (
    <header className="main-header">
      <h2>{title || 'Civic-Sync Admin Dashboard'}</h2>
      <nav>
        {/* You could add more links here later */}
        <button onClick={onLogout} className="logout-button-admin">
          Logout
        </button>
      </nav>
    </header>
  )
}

export default Header