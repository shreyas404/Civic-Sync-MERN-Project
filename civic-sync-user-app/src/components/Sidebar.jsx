import { LayoutDashboard, Globe, Trophy, Gift, LogOut } from 'lucide-react';

function Sidebar({ currentView, onViewChange, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'feed', label: 'Public Feed', icon: Globe },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'rewards', label: 'Reward Store', icon: Gift },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-purple-700 tracking-tight flex items-center gap-2">
            <span className="bg-purple-700 text-white p-1 rounded-lg">
              <Globe size={24} />
            </span>
            Civic-Sync
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium
                  ${isActive 
                    ? 'bg-purple-50 text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={20} className={isActive ? 'text-purple-600' : 'text-gray-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 pb-safe pt-2">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1
                  ${isActive ? 'text-purple-700' : 'text-gray-500'}`}
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-purple-100' : ''}`}>
                  <Icon size={22} className={isActive ? 'text-purple-700' : 'text-gray-500'} />
                </div>
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
